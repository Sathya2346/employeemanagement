package com.example.employeemanagement.controller.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.EmployeeService;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeRestController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @GetMapping("/all")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> list = employeeRepository.findAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Employee emp = employeeRepository.findById(id).orElse(null);
        if (emp == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(emp);
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveEmployee(@RequestBody Map<String, String> payload) {
        try {
            String firstname = payload.get("firstname");
            String lastname = payload.get("lastname");
            String email = payload.get("email");
            String username = payload.get("username");
            String userType = payload.getOrDefault("userType", "ROLE_USER");

            if (username == null || username.trim().isEmpty() || email == null || email.trim().isEmpty()) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", "Username and email are required.");
                return ResponseEntity.badRequest().body(err);
            }

            if (employeeRepository.findByUsername(username.trim()).isPresent()) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", "Username is already taken.");
                return ResponseEntity.badRequest().body(err);
            }

            if (employeeRepository.findByEmail(email.trim()).isPresent()) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", "Email is already registered.");
                return ResponseEntity.badRequest().body(err);
            }

            Employee emp = new Employee();
            emp.setFirstname(firstname);
            emp.setLastname(lastname);
            emp.setEmail(email);
            emp.setUsername(username);
            emp.setUserType(userType);
            emp.setOverallStatus("PENDING");
            emp.setActivityStatus("Idle");

            String rawPassword = username.trim() + "123";
            emp.setPassword(passwordEncoder.encode(rawPassword));

            Employee saved = employeeService.saveEmployee(emp);

            // Send Welcome Email with credentials and verify real send status
            boolean emailSent = false;
            String mailError = null;
            try {
                emailSent = employeeService.sendWelcomeEmail(saved.getEmail(), saved.getUsername(), rawPassword);
            } catch (Exception mailEx) {
                mailError = mailEx.getMessage();
                System.err.println("Welcome Email send error: " + mailError);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("emailSent", emailSent);
            if (emailSent) {
                response.put("message", "Employee account created and credentials sent via email!");
            } else {
                response.put("message", "Employee account created, but email could not be delivered. " + (mailError != null ? mailError : "Check recipient email or SMTP settings."));
            }
            response.put("employee", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Failed to create employee: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(@PathVariable Long id, @RequestBody Employee employeeRequest) {
        try {
            Employee existingEmployee = employeeRepository.findById(id).orElse(null);
            if (existingEmployee == null) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", "Employee not found");
                return ResponseEntity.status(404).body(err);
            }

            // Strictly update only Company Details just like the Thymeleaf controller
            if (employeeRequest.getCompanyDetails() != null) {
                com.example.employeemanagement.model.CompanyDetails cd = employeeRequest.getCompanyDetails();
                com.example.employeemanagement.model.CompanyDetails exCd = existingEmployee.getCompanyDetails();
                if (exCd == null) {
                    exCd = new com.example.employeemanagement.model.CompanyDetails();
                    existingEmployee.setCompanyDetails(exCd);
                }

                java.time.LocalDate dob = existingEmployee.getDateOfBirth();
                java.time.LocalDate doj = cd.getJoiningDate();
                if (dob != null && doj != null) {
                    if (doj.isBefore(dob.plusYears(18))) {
                        Map<String, Object> err = new HashMap<>();
                        err.put("success", false);
                        err.put("message", "Joining date must be at least 18 years after Date of Birth");
                        return ResponseEntity.badRequest().body(err);
                    }
                }

                exCd.setEmployeeEmail(cd.getEmployeeEmail());
                exCd.setDesignation(cd.getDesignation());
                exCd.setShiftTiming(cd.getShiftTiming());
                exCd.setJoiningDate(cd.getJoiningDate());
                exCd.setLeavingDate(cd.getLeavingDate());
                exCd.setStatus(cd.getStatus());
            }

            Employee saved = employeeService.saveEmployee(existingEmployee);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Failed to update employee: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {
        try {
            employeeService.deleteEmployee(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Employee deleted successfully");
            return ResponseEntity.ok(response);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Cannot delete employee. Existing records (e.g. attendance, hourly reports) depend on this employee.");
            return ResponseEntity.badRequest().body(err);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Failed to delete employee: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }
}
