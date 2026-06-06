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
        List<Employee> employees = employeeService.getAllEmployees();
        long pendingOnboardingCount = employees.stream()
                .filter(e -> "DETAILS_SUBMITTED".equals(e.getOverallStatus())
                        || "CHANGES_REQUESTED".equals(e.getOverallStatus()))
                .count();
        model.addAttribute("pendingOnboardingCount", pendingOnboardingCount);

        // ✅ Add Unread Notification Counts
        model.addAttribute("adminUnreadCount", notificationService.countUnreadForAdmin());

        // Default value to prevent SpelEvaluationException (null > 0) in template
        model.addAttribute("userUnreadCount", 0L);

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            model.addAttribute("userUnreadCount", notificationService.countUnreadByUsername(auth.getName()));
        }
    }
}
