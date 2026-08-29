package com.example.employeemanagement.controller.api;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.employeemanagement.model.Admin;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.AdminRepository;
import com.example.employeemanagement.repository.AuditRepository;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.NotificationRepository;
import com.example.employeemanagement.service.EmployeeService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthRestController {

    private static final Logger log = LoggerFactory.getLogger(AuthRestController.class);

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private AuditRepository auditRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // ═══ LOGIN FRAUD DETECTION ═══

    // Track successful logins: key = employeeId, value = last login info
    private static final ConcurrentHashMap<Long, LoginRecord> loginHistory = new ConcurrentHashMap<>();

    // Track failed login attempts: key = username, value = failure count + first failure time
    private static final ConcurrentHashMap<String, FailedLoginTracker> failedAttempts = new ConcurrentHashMap<>();

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
    private static final long CONSECUTIVE_LOGIN_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

    private static class LoginRecord {
        Long employeeId;
        String ip;
        String userAgent;
        long timestamp;
        String username;

        LoginRecord(Long employeeId, String ip, String userAgent, long timestamp, String username) {
            this.employeeId = employeeId;
            this.ip = ip;
            this.userAgent = userAgent;
            this.timestamp = timestamp;
            this.username = username;
        }
    }

    private static class FailedLoginTracker {
        int count;
        long firstFailureTime;
        boolean lockedOut;

        FailedLoginTracker(int count, long firstFailureTime) {
            this.count = count;
            this.firstFailureTime = firstFailureTime;
            this.lockedOut = false;
        }
    }

    /**
     * Check if this login is suspicious:
     * 1. Same user logging in from different IP within 5 minutes
     * 2. Multiple users sharing same IP/device within 2 minutes
     */
    private void checkLoginFraud(Long employeeId, String username, String ip, String userAgent, String deviceFingerprint) {
        long now = System.currentTimeMillis();
        String deviceKey = (ip != null ? ip : "unknown") + "|" + (deviceFingerprint != null ? deviceFingerprint : (userAgent != null ? userAgent : "unknown"));

        // CHECK 1: Same user, different IP within 5 minutes (possible account takeover)
        LoginRecord previous = loginHistory.get(employeeId);
        if (previous != null && !ip.equals(previous.ip) && (now - previous.timestamp) < CONSECUTIVE_LOGIN_WINDOW_MS) {
            String msg = "🚨 SUSPICIOUS LOGIN: User '" + username + "' (ID: " + employeeId + ") logged in from different IP within 5 minutes.\n"
                    + "Previous: IP=" + previous.ip + " at " + new java.util.Date(previous.timestamp) + "\n"
                    + "Current:  IP=" + ip + " at " + new java.util.Date(now);
            log.warn(msg);
            createLoginAuditLog("SUSPICIOUS_LOGIN", employeeId, username, msg);
            createLoginNotification("🚨 Suspicious Login Detected", msg, username);
        }

        // CHECK 2: Multiple different users from same IP/device within 2 minutes (shared device / proxy)
        for (Map.Entry<Long, LoginRecord> entry : loginHistory.entrySet()) {
            LoginRecord rec = entry.getValue();
            if (rec.employeeId != null && !rec.employeeId.equals(employeeId)
                    && deviceKey.equals((rec.ip != null ? rec.ip : "unknown") + "|" + (userAgent != null ? userAgent : "unknown"))
                    && (now - rec.timestamp) < 120000) {
                String msg = "🚨 SHARED DEVICE ALERT: Employee '" + username + "' (ID: " + employeeId + ") logged in from same device as employee '" + rec.username + "' (ID: " + rec.employeeId + ") within 2 minutes.\n"
                        + "IP: " + ip + ", Device: " + (userAgent != null ? userAgent.substring(0, Math.min(60, userAgent.length())) : "unknown");
                log.warn(msg);
                createLoginAuditLog("SHARED_DEVICE_ALERT", employeeId, username, msg);
                createLoginNotification("🚨 Shared Device Login Alert", msg, username);
                break;
            }
        }

        // Update history
        loginHistory.put(employeeId, new LoginRecord(employeeId, ip, userAgent, now, username));
    }

    /**
     * Check if the account is locked due to too many failed login attempts.
     */
    private String checkAccountLockout(String username) {
        FailedLoginTracker tracker = failedAttempts.get(username.toLowerCase());
        if (tracker == null) return null;

        long now = System.currentTimeMillis();

        // If lockout expired, reset
        if (tracker.lockedOut && (now - tracker.firstFailureTime) > LOCKOUT_DURATION_MS) {
            failedAttempts.remove(username.toLowerCase());
            return null;
        }

        if (tracker.lockedOut) {
            long remainingMin = (LOCKOUT_DURATION_MS - (now - tracker.firstFailureTime)) / 60000 + 1;
            return "Account locked due to too many failed attempts. Try again in " + remainingMin + " minutes.";
        }

        return null;
    }

    /**
     * Record a failed login attempt. Locks account after MAX_FAILED_ATTEMPTS.
     */
    private void recordFailedLogin(String username) {
        String key = username.toLowerCase();
        long now = System.currentTimeMillis();
        FailedLoginTracker tracker = failedAttempts.get(key);

        if (tracker == null || (now - tracker.firstFailureTime) > LOCKOUT_DURATION_MS) {
            tracker = new FailedLoginTracker(1, now);
        } else {
            tracker.count++;
        }

        if (tracker.count >= MAX_FAILED_ATTEMPTS) {
            tracker.lockedOut = true;
            String msg = "🔒 ACCOUNT LOCKED: '" + username + "' has been locked after " + MAX_FAILED_ATTEMPTS + " failed login attempts from various IPs.";
            log.warn(msg);
            createLoginAuditLog("ACCOUNT_LOCKED", null, username, msg);
            createLoginNotification("🔒 Account Locked", msg, username);
        }

        failedAttempts.put(key, tracker);
    }

    /**
     * Clear failed login attempts on successful login.
     */
    private void clearFailedLogins(String username) {
        failedAttempts.remove(username.toLowerCase());
    }

    private void createLoginAuditLog(String action, Long employeeId, String username, String details) {
        try {
            com.example.employeemanagement.model.AuditLog audit = new com.example.employeemanagement.model.AuditLog();
            audit.setEntityName("Auth");
            audit.setEntityId(employeeId != null ? String.valueOf(employeeId) : "N/A");
            audit.setAction(action);
            audit.setPerformedBy(username != null ? username : "Unknown");
            audit.setTimestamp(java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Kolkata")));
            audit.setDetails(details);
            auditRepository.save(audit);
        } catch (Exception e) {
            log.error("Failed to save login audit log: {}", e.getMessage());
        }
    }

    private void createLoginNotification(String title, String message, String username) {
        try {
            com.example.employeemanagement.model.Notification notif = new com.example.employeemanagement.model.Notification();
            notif.setType("LOGIN_SECURITY");
            notif.setRecipient("Admin");
            notif.setTitle(title);
            notif.setMessage(message);
            notif.setEmployeeName(username != null ? username : "Unknown");
            notificationRepository.save(notif);
        } catch (Exception e) {
            log.error("Failed to save login notification: {}", e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest, HttpSession session, HttpServletRequest request) {
        String rawUser = loginRequest != null ? (loginRequest.get("username") != null ? loginRequest.get("username") : loginRequest.get("email")) : null;
        String username = rawUser != null ? rawUser.trim() : null;
        String password = loginRequest != null ? loginRequest.get("password") : null;

        if (username == null || password == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Username and password are required.");
            return ResponseEntity.badRequest().body(error);
        }

        String input = username.trim();

        // ═══ CHECK ACCOUNT LOCKOUT ═══
        String lockoutMsg = checkAccountLockout(input);
        if (lockoutMsg != null) {
            log.warn("Login blocked for '{}' due to account lockout: {}", input, lockoutMsg);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", lockoutMsg);
            return ResponseEntity.status(429).body(error); // 429 Too Many Requests
        }

        // Get request info for fraud detection
        String ip = request != null ? request.getRemoteAddr() : "unknown";
        String userAgent = request != null ? request.getHeader("User-Agent") : null;
        String deviceFingerprint = request != null ? request.getHeader("X-Device-Fingerprint") : null;

        // 1. Try Employee first
        Employee emp = employeeRepository.findByUsername(input)
                .or(() -> employeeRepository.findByEmail(input))
                .orElse(null);

        if (emp != null && passwordEncoder.matches(password, emp.getPassword())) {
            // Successful employee login
            clearFailedLogins(input);
            checkLoginFraud(emp.getId(), emp.getUsername(), ip, userAgent, deviceFingerprint);
            log.info("Successful employee login: '{}' from IP={}", emp.getUsername(), ip);

            session.setAttribute("employeeId", emp.getId());
            session.setAttribute("username", emp.getUsername());
            session.setAttribute("role", "USER");

            // Persist SecurityContext so hasRole() works on subsequent REST calls
            var userAuthorities = java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"));
            var userAuth = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                    emp.getUsername(), null, userAuthorities);
            org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(userAuth);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("employeeId", emp.getId());
            response.put("id", emp.getId());
            response.put("username", emp.getUsername());
            response.put("email", emp.getEmail());
            response.put("role", "USER");
            response.put("overallStatus", emp.getOverallStatus());
            response.put("firstname", emp.getFirstname());
            response.put("lastname", emp.getLastname());
            return ResponseEntity.ok(response);
        }

        // 2. Try Admin next
        Admin admin = adminRepository.findByUsername(input)
                .or(() -> adminRepository.findByEmail(input))
                .orElse(null);

        if (admin != null && passwordEncoder.matches(password, admin.getPassword())) {
            // Successful admin login
            clearFailedLogins(input);
            log.info("Successful admin login: '{}' from IP={}", admin.getUsername(), ip);

            session.setAttribute("adminId", admin.getId());
            session.setAttribute("username", admin.getUsername());
            session.setAttribute("role", "ADMIN");

            // Persist SecurityContext so hasRole() works on subsequent REST calls
            var adminAuthorities = java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"));
            var adminAuth = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                    admin.getUsername(), null, adminAuthorities);
            org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(adminAuth);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("adminId", admin.getId());
            response.put("id", admin.getId());
            response.put("username", admin.getUsername());
            response.put("role", "ADMIN");
            response.put("overallStatus", "FULLY_APPROVED");
            response.put("firstname", "Admin");
            response.put("lastname", "User");
            return ResponseEntity.ok(response);
        }

        // ═══ FAILED LOGIN ═══
        recordFailedLogin(input);
        log.warn("Failed login attempt for '{}' from IP={}", input, ip);

        // Check remaining attempts
        FailedLoginTracker tracker = failedAttempts.get(input.toLowerCase());
        int remaining = tracker != null ? Math.max(0, MAX_FAILED_ATTEMPTS - tracker.count) : MAX_FAILED_ATTEMPTS;
        String failMsg = remaining > 0
                ? "Invalid username or password. " + remaining + " attempt(s) remaining before account lockout."
                : "Invalid username or password. Account has been locked.";

        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", failMsg);
        return ResponseEntity.status(401).body(error);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        Long employeeId = (Long) session.getAttribute("employeeId");
        Long adminId = (Long) session.getAttribute("adminId");

        if (employeeId != null) {
            Employee emp = employeeRepository.findById(employeeId).orElse(null);
            if (emp != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("employeeId", emp.getId());
                response.put("id", emp.getId());
                response.put("username", emp.getUsername());
                response.put("email", emp.getEmail());
                response.put("role", "USER");
                response.put("overallStatus", emp.getOverallStatus());
                response.put("firstname", emp.getFirstname());
                response.put("lastname", emp.getLastname());
                return ResponseEntity.ok(response);
            }
        }

        if (adminId != null) {
            Admin admin = adminRepository.findById(adminId).orElse(null);
            if (admin != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("adminId", admin.getId());
                response.put("id", admin.getId());
                response.put("username", admin.getUsername());
                response.put("role", "ADMIN");
                response.put("overallStatus", "FULLY_APPROVED");
                response.put("firstname", "Admin");
                response.put("lastname", "User");
                return ResponseEntity.ok(response);
            }
        }

        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", "Not authenticated.");
        return ResponseEntity.status(401).body(error);
    }

    /**
     * Returns the full Employee entity for the currently logged-in user.
     * Available to any authenticated user (not just ADMIN).
     * Used by mobile dashboard to get email, designation, shift, etc.
     */
    @GetMapping("/my-details")
    public ResponseEntity<?> getMyDetails(HttpSession session) {
        Long employeeId = (Long) session.getAttribute("employeeId");
        if (employeeId == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Not authenticated as employee.");
            return ResponseEntity.status(401).body(err);
        }
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        if (emp == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Employee not found.");
            return ResponseEntity.status(404).body(err);
        }
        return ResponseEntity.ok(emp);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        try {
            employeeService.sendOtp(email);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP sent to your email.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload, jakarta.servlet.http.HttpSession session) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        if (employeeService.verifyOtp(email, otp)) {
            // Store OTP verification status in session for password reset flow
            session.setAttribute("otpVerified_" + email, true);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "OTP verified successfully.");
            return ResponseEntity.ok(response);
        }
        Map<String, Object> err = new HashMap<>();
        err.put("success", false);
        err.put("message", "Invalid or expired OTP.");
        return ResponseEntity.badRequest().body(err);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload, jakarta.servlet.http.HttpSession session) {
        String email = payload.get("email");
        String password = payload.get("password");
        
        // Security: Require OTP verification before password reset
        Boolean otpVerified = (Boolean) session.getAttribute("otpVerified_" + email);
        if (otpVerified == null || !otpVerified) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "OTP verification required before password reset. Please verify OTP first.");
            return ResponseEntity.badRequest().body(err);
        }
        
        try {
            employeeService.changePassword(email, password);
            // Clear the OTP verified flag after successful password change
            session.removeAttribute("otpVerified_" + email);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Password changed successfully. Please login.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
