package com.example.employeemanagement.controller.api;

import java.util.HashMap;
import java.util.Map;

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
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.EmployeeService;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthRestController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest, HttpSession session) {
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

        // 1. Try Employee first
        Employee emp = employeeRepository.findByUsername(input)
                .or(() -> employeeRepository.findByEmail(input))
                .orElse(null);

        if (emp != null && (passwordEncoder.matches(password, emp.getPassword()) || password.equals(emp.getPassword()))) {
            session.setAttribute("employeeId", emp.getId());
            session.setAttribute("username", emp.getUsername());
            session.setAttribute("role", "USER");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("employeeId", emp.getId());
            response.put("id", emp.getId());
            response.put("username", emp.getUsername());
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

        if (admin != null && (passwordEncoder.matches(password, admin.getPassword()) || password.equals(admin.getPassword()))) {
            session.setAttribute("adminId", admin.getId());
            session.setAttribute("username", admin.getUsername());
            session.setAttribute("role", "ADMIN");

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("employeeId", admin.getId());
            response.put("id", admin.getId());
            response.put("username", admin.getUsername());
            response.put("role", "ADMIN");
            response.put("overallStatus", "FULLY_APPROVED");
            response.put("firstname", "Admin");
            response.put("lastname", "User");
            return ResponseEntity.ok(response);
        }

        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", "Invalid username or password.");
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
                response.put("employeeId", admin.getId());
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
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        if (employeeService.verifyOtp(email, otp)) {
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
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");
        try {
            employeeService.changePassword(email, password);
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
