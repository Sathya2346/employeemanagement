package com.example.employeemanagement.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Notification;
import com.example.employeemanagement.service.EmployeeService;
import com.example.employeemanagement.service.NotificationService;

@Controller
@RequestMapping("/user/notification")
public class UserNotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmployeeService employeeService;

    // ✅ Show notifications page (only approved/rejected leave notifications)
    @GetMapping("/{id}")
    public String viewNotifications(@PathVariable Long id, Model model, java.security.Principal principal) {
        Employee emp = employeeService.getEmployeeById(id);
        
        // IDOR Check
        String loggedInUsername = principal.getName();
        if (emp == null || !(emp.getUsername().equals(loggedInUsername) || emp.getEmail().equals(loggedInUsername))) {
             return "redirect:/access-denied";
        }
        model.addAttribute("employee", emp);

        List<Notification> allNotifications = notificationService.getAllNotifications();

        // ✅ Filter only this employee’s approved/rejected notifications
        List<Notification> userNotifications = allNotifications.stream()
                .filter(n -> n.getEmployeeName().equalsIgnoreCase(emp.getFirstname() + " " + emp.getLastname()))
                .filter(n -> n.getLeaveStatus() != null && 
                            (n.getLeaveStatus().equalsIgnoreCase("Approved") ||
                            n.getLeaveStatus().equalsIgnoreCase("Rejected")))
                .collect(Collectors.toList());

        // ✅ Automatically mark unread notifications as read
        userNotifications.stream()
                .filter(n -> !n.isReadStatus())
                .forEach(n -> notificationService.markAsRead(n.getId()));

        model.addAttribute("notifications", userNotifications);
        return "user/userNotification";
    }

    // ✅ Mark one notification as read
    @PostMapping("/markRead/{id}")
    @ResponseBody
    public ResponseEntity<String> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Notification marked as read");
    }
}