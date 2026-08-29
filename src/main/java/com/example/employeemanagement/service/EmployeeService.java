package com.example.employeemanagement.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.employeemanagement.model.Admin;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.AdminRepository;
import com.example.employeemanagement.repository.AttendanceRepository;
import com.example.employeemanagement.model.Settings;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.LeaveRepository;
import com.example.employeemanagement.repository.SettingsRepository;
import com.example.employeemanagement.util.AppConstants;


@Service
public class EmployeeService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private com.example.employeemanagement.repository.HourlyReportRepository hourlyReportRepository;

    @Autowired
    private com.example.employeemanagement.repository.EmployeeDetailsRepository employeeDetailsRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private SettingsRepository settingsRepository;

    @Autowired
    private EmailTemplateService emailTemplateService;

    private static final int OTP_EXPIRATION_MINUTES = 5;

    // ------------------- EMPLOYEE OPERATIONS -------------------
    @Transactional
    public Employee registerEmployee(Employee employee) {
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        if (employee.getUserType() == null) {
            employee.setUserType("ROLE_USER");
        }
        return employeeRepository.save(employee);
    }
    
    public Employee saveEmployee(Employee employee) {
        if (employee.getPassword() != null && !employee.getPassword().startsWith("$2a$")) {
            employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        }
        return employeeRepository.save(employee);
    }

    @Transactional
    public void createEmployeeWithEmail(Employee employee, String rawPassword) {
        saveEmployee(employee);
        CompletableFuture.runAsync(() -> {
            try {
                sendWelcomeEmail(employee.getEmail(), employee.getUsername(), rawPassword);
            } catch (Exception e) {
                System.err.println("⚠️ Welcome email dispatch error: " + e.getMessage());
            }
        });
    }

    public boolean sendWelcomeEmail(String email, String username, String password) {
        System.out.println("\n========================================================================");
        System.out.println("📧 [WELCOME EMAIL DISPATCH]");
        System.out.println("   Recipient Email : " + email);
        System.out.println("   Username        : " + username);
        System.out.println("   Default Password: " + password);
        System.out.println("========================================================================\n");

        if (senderEmail == null || senderEmail.trim().isEmpty()) {
            System.err.println("⚠️ NOTICE: Gmail SMTP Username ('spring.mail.username') is not configured in application.properties.");
            System.err.println("   To receive actual emails in your inbox, set your Gmail address and 16-character App Password in application.properties or environment variables.");
            return false;
        }

        try {
            java.util.Map<String, String> vars = new java.util.HashMap<>();
            vars.put("username", username);
            vars.put("email", email);
            vars.put("password", password);

            String[] rendered = emailTemplateService.renderTemplate("WELCOME_EMAIL", vars,
                    "🎉 Welcome to Employee Management System — Your Login Credentials",
                    "Hello,\n\nYour employee account has been created successfully!\n\nLogin Details:\nUsername: " + username + "\nEmail: " + email + "\nPassword: " + password + "\n\nPlease login at http://localhost:8085 or http://localhost:8081.");

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(email);
            message.setSubject(rendered[0]);
            message.setText(rendered[1]);
            mailSender.send(message);
            System.out.println("✅ Welcome Email delivered live to " + email + "!");
            return true;
        } catch (Exception e) {
            System.err.println("❌ SMTP Delivery Exception: " + e.getMessage());
            System.err.println("   Please check your Gmail App Password and network internet connection.");
            return false;
        }
    }

    public boolean login(String email, String password) {
        Employee employee = employeeRepository.findByEmail(email).orElse(null);
        if (employee != null && passwordEncoder.matches(password, employee.getPassword())) {
            // Update Last Login Date
            employee.setLastLoginDate(LocalDateTime.now(AppConstants.IST));
            employeeRepository.save(employee);
            
            SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            return true;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        List<Employee> list = employeeRepository.findAll();
        for (Employee emp : list) {
            enrichLiveActivityStatus(emp);
        }
        return list;
    }

    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {
        Employee emp = employeeRepository.findById(id).orElse(null);
        enrichLiveActivityStatus(emp);
        return emp;
    }

    @Transactional
    public Employee updateEmployeeById(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Autowired
    private com.example.employeemanagement.repository.NotificationRepository notificationRepository;

    @Transactional
    public void deleteEmployee(Long id) {
        // Check if employee exists first
        if (!employeeRepository.existsById(id)) {
            throw new com.example.employeemanagement.exception.ResourceNotFoundException("Employee not found with id: " + id);
        }

        // 1. Delete Notifications tied to Leaves
        List<com.example.employeemanagement.model.Leave> leaves = leaveRepository.findByEmployeeId(id);
        if (leaves != null && !leaves.isEmpty()) {
            List<Long> leaveIds = leaves.stream()
                    .map(com.example.employeemanagement.model.Leave::getId)
                    .collect(java.util.stream.Collectors.toList());
            if (!leaveIds.isEmpty()) {
                notificationRepository.deleteByReferenceIdInAndType(leaveIds, "Leave");
            }
        }
        
        // 2. Delete Employee Details (Onboarding Info)
        employeeDetailsRepository.deleteByEmployeeId(id);
        
        // 3. Delete Leaves
        leaveRepository.deleteByEmployeeId(id);

        // 4. Delete Attendance
        attendanceRepository.deleteByEmployeeId(id);

        // 5. Delete Hourly Reports
        hourlyReportRepository.deleteByEmployee_Id(id);

        // 6. Finally, delete the Employee
        employeeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Employee findByEmail(String email) {
        Employee emp = employeeRepository.findByEmail(email).orElse(null);
        enrichLiveActivityStatus(emp);
        return emp;
    }

    @Transactional(readOnly = true)
    public Employee findByUsername(String username) {
        Employee emp = employeeRepository.findByUsername(username).orElse(null);
        enrichLiveActivityStatus(emp);
        return emp;
    }

    private void enrichLiveActivityStatus(Employee employee) {
        if (employee == null) return;
        java.time.LocalDate today = java.time.LocalDate.now(AppConstants.IST);

        // 1. Check if the employee is on approved leave today
        boolean onLeave = leaveRepository.isEmployeeOnLeave(employee.getId(), today);
        if (onLeave) {
            employee.setActivityStatus("Leave");
            return;
        }

        // 2. Check today's attendance record
        attendanceRepository.findByEmployee_IdAndAttendanceDate(employee.getId(), today)
            .ifPresentOrElse(attendance -> {
                if (attendance.getCheckInTime() != null) {
                    if (attendance.getCheckOutTime() != null) {
                        employee.setActivityStatus("Idle");
                    } else if (attendance.getBreakStart() != null && attendance.getBreakEnd() == null) {
                        employee.setActivityStatus("Break");
                    } else {
                        String currentStatus = employee.getActivityStatus();
                        if (!"Idle".equals(currentStatus) && !"Working".equals(currentStatus) 
                            && !"Break".equals(currentStatus) && !"On Break".equals(currentStatus) 
                            && !"Meeting".equals(currentStatus) && !"In Meeting".equals(currentStatus)) {
                            employee.setActivityStatus("Working");
                        }
                    }
                } else {
                    employee.setActivityStatus("Absent");
                }
            }, () -> {
                employee.setActivityStatus("Absent");
            });
    }

    // ------------------- FORGOT PASSWORD (WORKS FOR BOTH EMPLOYEE + ADMIN) -------------------

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:}")
    private String senderEmail;

    public void sendOtp(String email) {
        Employee employee = employeeRepository.findByEmail(email).orElse(null);
        Admin admin = adminRepository.findByEmail(email).orElse(null);

        if (employee == null && admin == null) {
            throw new RuntimeException("No user found with email: " + email);
        }

        String otp = generateOtp();
        LocalDateTime expiry = LocalDateTime.now(AppConstants.IST).plusMinutes(OTP_EXPIRATION_MINUTES);

        if (employee != null) {
            employee.setOtp(otp);
            employee.setOtpExpiry(expiry);
            employeeRepository.save(employee);
        } else {
            admin.setOtp(otp);
            admin.setOtpExpiry(expiry);
            adminRepository.save(admin);
        }

        try {
            java.util.Map<String, String> vars = new java.util.HashMap<>();
            vars.put("otp", otp);
            vars.put("expiry_minutes", String.valueOf(OTP_EXPIRATION_MINUTES));

            String[] rendered = emailTemplateService.renderTemplate("PASSWORD_RESET_OTP", vars,
                    "🔐 Employee Management - Password Reset OTP",
                    "Your password reset OTP is: " + otp + ". It is valid for " + OTP_EXPIRATION_MINUTES + " minutes.");

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail != null && !senderEmail.isEmpty() ? senderEmail : "noreply@company.com");
            message.setTo(email);
            message.setSubject(rendered[0]);
            message.setText(rendered[1]);

            CompletableFuture.runAsync(() -> {
                try {
                    mailSender.send(message);
                } catch (Exception e) {
                    System.err.println("Failed to send OTP email: " + e.getMessage());
                }
            });
        } catch (Exception e) {
            throw new RuntimeException("Failed to prepare OTP email: " + e.getMessage(), e);
        }
    }

    public boolean verifyOtp(String email, String otp) {
        Employee employee = employeeRepository.findByEmail(email).orElse(null);
        Admin admin = adminRepository.findByEmail(email).orElse(null);

        if (employee != null && employee.getOtp() != null) {
            if (employee.getOtp().equals(otp) && employee.getOtpExpiry().isAfter(LocalDateTime.now(AppConstants.IST))) {
                employee.setOtp(null);
                employee.setOtpExpiry(null);
                employeeRepository.save(employee);
                return true;
            }
        }

        if (admin != null && admin.getOtp() != null) {
            if (admin.getOtp().equals(otp) && admin.getOtpExpiry().isAfter(LocalDateTime.now(AppConstants.IST))) {
                admin.setOtp(null);
                admin.setOtpExpiry(null);
                adminRepository.save(admin);
                return true;
            }
        }

        return false;
    }

    public boolean changePassword(String email, String newPassword) {
        Employee employee = employeeRepository.findByEmail(email).orElse(null);
        Admin admin = adminRepository.findByEmail(email).orElse(null);

        if (employee != null) {
            employee.setPassword(passwordEncoder.encode(newPassword));
            employeeRepository.save(employee);
            return true;
        }

        if (admin != null) {
            admin.setPassword(passwordEncoder.encode(newPassword));
            adminRepository.save(admin);
            return true;
        }

        return false;
    }

    // ------------------- UTILITY -------------------
    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}