package com.example.employeemanagement.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

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
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.LeaveRepository;
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
    private BCryptPasswordEncoder passwordEncoder;

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
        return employeeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id).orElse(null);
    }

    @Transactional
    public Employee updateEmployeeById(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Autowired
    private com.example.employeemanagement.repository.NotificationRepository notificationRepository;

    @Transactional
    public void deleteEmployee(Long id) {
        // 1. Delete Notifications tied to Leaves
        List<com.example.employeemanagement.model.Leave> leaves = leaveRepository.findByEmployeeId(id);
        if (!leaves.isEmpty()) {
            List<Long> leaveIds = leaves.stream().map(com.example.employeemanagement.model.Leave::getId).collect(java.util.stream.Collectors.toList());
            if (!leaveIds.isEmpty()) {
                notificationRepository.deleteByReferenceIdInAndType(leaveIds, "Leave");
            }
        }
        
        // 2. Delete Leaves
        leaveRepository.deleteByEmployeeId(id);

        // 3. Delete Attendance
        attendanceRepository.deleteByEmployeeId(id);

        // 4. Delete Hourly Reports
        hourlyReportRepository.deleteByEmployee_Id(id);

        // 5. Finally, delete the Employee
        employeeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Employee findByEmail(String email) {
        return employeeRepository.findByEmail(email).orElse(null);
    }

    // ------------------- FORGOT PASSWORD (WORKS FOR BOTH EMPLOYEE + ADMIN) -------------------

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
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
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(email);
            message.setSubject("Employee Management - Password Reset OTP");
            message.setText("Your password reset OTP is: " + otp +
                    ". It is valid for " + OTP_EXPIRATION_MINUTES + " minutes.");

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
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