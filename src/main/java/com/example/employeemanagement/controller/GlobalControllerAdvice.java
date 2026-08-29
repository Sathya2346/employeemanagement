package com.example.employeemanagement.controller;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.List;

@ControllerAdvice
public class GlobalControllerAdvice {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private com.example.employeemanagement.service.NotificationService notificationService;

    @ModelAttribute
    public void addAttributes(Model model) {
        try {
            List<Employee> employees = employeeService.getAllEmployees();
            long pendingOnboardingCount = employees.stream()
                    .filter(e -> "DETAILS_SUBMITTED".equals(e.getOverallStatus())
                            || "CHANGES_REQUESTED".equals(e.getOverallStatus()))
                    .count();
            model.addAttribute("pendingOnboardingCount", pendingOnboardingCount);
        } catch (Exception e) {
            model.addAttribute("pendingOnboardingCount", 0L);
        }

        try {
            model.addAttribute("adminUnreadCount", notificationService.countUnreadForAdmin());
        } catch (Exception e) {
            model.addAttribute("adminUnreadCount", 0L);
        }

        model.addAttribute("userUnreadCount", 0L);
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                model.addAttribute("userUnreadCount", notificationService.countUnreadByUsername(auth.getName()));
            }
        } catch (Exception e) {
            // Ignore - default value already set
        }
    }
}
