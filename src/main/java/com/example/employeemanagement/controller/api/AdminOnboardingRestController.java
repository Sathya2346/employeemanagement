package com.example.employeemanagement.controller.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.EmployeeDetails;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.NotificationService;

@RestController
@RequestMapping("/api/admin/onboarding")
@CrossOrigin(origins = "*")
public class AdminOnboardingRestController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/pending")
    public ResponseEntity<List<Employee>> getPendingOnboardingEmployees() {
        List<Employee> all = employeeRepository.findAll();
        List<Employee> pending = all.stream()
                .filter(e -> "DETAILS_SUBMITTED".equalsIgnoreCase(e.getOverallStatus())
                          || "CHANGES_REQUESTED".equalsIgnoreCase(e.getOverallStatus()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(pending);
    }

    @PostMapping("/review/{employeeId}")
    public ResponseEntity<?> processReviewDecision(
            @PathVariable Long employeeId,
            @RequestBody Map<String, Object> decisions) {
        
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        if (emp == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Employee not found.");
            return ResponseEntity.badRequest().body(err);
        }

        EmployeeDetails details = emp.getEmployeeDetails();
        if (details == null) {
            details = new EmployeeDetails();
            details.setEmployee(emp);
            emp.setEmployeeDetails(details);
        }

        boolean hasRejection = false;

        for (Map.Entry<String, Object> entry : decisions.entrySet()) {
            String key = entry.getKey();
            String value = entry.getValue() != null ? entry.getValue().toString() : "";

            if (key.endsWith("Status") && "REJECTED".equalsIgnoreCase(value)) {
                hasRejection = true;
            }

            try {
                java.lang.reflect.Field field = EmployeeDetails.class.getDeclaredField(key);
                field.setAccessible(true);
                field.set(details, value);
            } catch (Exception ignored) {}
        }

        if (hasRejection) {
            emp.setOverallStatus("CHANGES_REQUESTED");
            if (notificationService != null) {
                notificationService.sendNotification(
                    "Onboarding Action Required",
                    "HR has reviewed your onboarding submission and requested changes for highlighted fields.",
                    "Onboarding",
                    emp.getId(),
                    emp.getUsername() != null ? emp.getUsername() : emp.getEmail()
                );
            }
        } else {
            emp.setOverallStatus("FULLY_APPROVED");
            if (notificationService != null) {
                notificationService.sendNotification(
                    "Onboarding Approved",
                    "Congratulations! Your onboarding documents have been fully verified and approved.",
                    "Onboarding",
                    emp.getId(),
                    emp.getUsername() != null ? emp.getUsername() : emp.getEmail()
                );
            }
        }

        Employee saved = employeeRepository.save(emp);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", hasRejection ? "Changes requested for employee onboarding." : "Onboarding fully approved!");
        response.put("employee", saved);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/approve/{employeeId}")
    public ResponseEntity<?> approveOnboarding(@PathVariable Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        if (emp == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Employee not found.");
            return ResponseEntity.badRequest().body(err);
        }

        emp.setOverallStatus("FULLY_APPROVED");
        Employee saved = employeeRepository.save(emp);

        if (notificationService != null) {
            notificationService.sendNotification(
                "Onboarding Approved",
                "Congratulations! Your onboarding documents have been fully verified and approved.",
                "Onboarding",
                emp.getId(),
                emp.getUsername() != null ? emp.getUsername() : emp.getEmail()
            );
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Employee onboarding fully approved!");
        response.put("employee", saved);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reject/{employeeId}")
    public ResponseEntity<?> rejectOnboarding(@PathVariable Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        if (emp == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Employee not found.");
            return ResponseEntity.badRequest().body(err);
        }

        emp.setOverallStatus("CHANGES_REQUESTED");
        Employee saved = employeeRepository.save(emp);

        if (notificationService != null) {
            notificationService.sendNotification(
                "Onboarding Action Required",
                "HR has reviewed your onboarding submission and requested changes.",
                "Onboarding",
                emp.getId(),
                emp.getUsername() != null ? emp.getUsername() : emp.getEmail()
            );
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Changes requested for employee onboarding.");
        response.put("employee", saved);
        return ResponseEntity.ok(response);
    }
}
