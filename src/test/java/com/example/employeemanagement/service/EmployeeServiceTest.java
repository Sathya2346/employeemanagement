package com.example.employeemanagement.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.example.employeemanagement.model.Admin;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.AdminRepository;
import com.example.employeemanagement.repository.EmployeeRepository;

import java.time.LocalDateTime;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class EmployeeServiceTest {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AdminRepository adminRepository;

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    @BeforeEach
    public void setup() {
        employeeRepository.deleteAll();
        adminRepository.deleteAll();
    }

    @Test
    public void testRegisterEmployee() {
        Employee emp = new Employee();
        emp.setUsername("janesmith");
        emp.setEmail("jane@example.com");
        emp.setPassword("secure123");
        emp.setFirstname("Jane");
        emp.setLastname("Smith");

        Employee registered = employeeService.registerEmployee(emp);

        assertNotNull(registered.getId());
        assertEquals("ROLE_USER", registered.getUserType());
        assertTrue(registered.getPassword().startsWith("$2a$")); // BCrypt prefix
    }

    @Test
    public void testLoginSuccessAndFailure() {
        Employee emp = new Employee();
        emp.setUsername("john_doe");
        emp.setEmail("john@example.com");
        emp.setPassword("mypassword");
        emp.setFirstname("John");
        emp.setLastname("Doe");
        employeeService.registerEmployee(emp);

        // Test successful login
        assertTrue(employeeService.login("john@example.com", "mypassword"));

        // Test login failure
        assertFalse(employeeService.login("john@example.com", "wrongpassword"));
        assertFalse(employeeService.login("unknown@example.com", "mypassword"));
    }

    @Test
    public void testSendAndVerifyOtpEmployee() {
        Employee emp = new Employee();
        emp.setUsername("otptest");
        emp.setEmail("otp@example.com");
        emp.setPassword("password");
        emp.setFirstname("OTP");
        emp.setLastname("User");
        employeeService.registerEmployee(emp);

        // Send OTP
        employeeService.sendOtp("otp@example.com");

        Employee updated = employeeRepository.findByEmail("otp@example.com").orElseThrow();
        assertNotNull(updated.getOtp());
        assertNotNull(updated.getOtpExpiry());
        assertTrue(updated.getOtpExpiry().isAfter(LocalDateTime.now()));

        // Verify correct OTP
        assertTrue(employeeService.verifyOtp("otp@example.com", updated.getOtp()));

        // Verify that OTP is cleared after verification
        Employee postVerify = employeeRepository.findByEmail("otp@example.com").orElseThrow();
        assertNull(postVerify.getOtp());
        assertNull(postVerify.getOtpExpiry());
    }

    @Test
    public void testVerifyOtpExpired() {
        Employee emp = new Employee();
        emp.setUsername("otpexp");
        emp.setEmail("otpexp@example.com");
        emp.setPassword("password");
        emp.setFirstname("Expired");
        emp.setLastname("OTP");
        employeeService.registerEmployee(emp);

        employeeService.sendOtp("otpexp@example.com");

        Employee updated = employeeRepository.findByEmail("otpexp@example.com").orElseThrow();
        // Manually expire OTP
        updated.setOtpExpiry(LocalDateTime.now().minusMinutes(1));
        employeeRepository.save(updated);

        // Verify correct OTP but expired
        assertFalse(employeeService.verifyOtp("otpexp@example.com", updated.getOtp()));
    }

    @Test
    public void testChangePassword() {
        Employee emp = new Employee();
        emp.setUsername("pwchange");
        emp.setEmail("pw@example.com");
        emp.setPassword("oldpass");
        emp.setFirstname("PW");
        emp.setLastname("User");
        employeeService.registerEmployee(emp);

        assertTrue(employeeService.changePassword("pw@example.com", "newpass"));

        // Verify login with new password
        assertTrue(employeeService.login("pw@example.com", "newpass"));
        assertFalse(employeeService.login("pw@example.com", "oldpass"));
    }

    @Test
    public void testOtpAndChangePasswordAdmin() {
        Admin admin = new Admin();
        admin.setUsername("admin_otp");
        admin.setEmail("admin_otp@example.com");
        admin.setPassword("adminpass");
        adminRepository.save(admin);

        employeeService.sendOtp("admin_otp@example.com");

        Admin updated = adminRepository.findByEmail("admin_otp@example.com").orElseThrow();
        assertNotNull(updated.getOtp());

        assertTrue(employeeService.verifyOtp("admin_otp@example.com", updated.getOtp()));
        assertTrue(employeeService.changePassword("admin_otp@example.com", "newadminpass"));
    }
}
