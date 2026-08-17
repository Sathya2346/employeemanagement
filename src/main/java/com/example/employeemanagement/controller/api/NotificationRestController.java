package com.example.employeemanagement.controller.api;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Notification;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationRestController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmployeeRepository employeeRepository;

    // ===================== GET ADMIN NOTIFICATIONS =====================
    @GetMapping("/admin")
    public ResponseEntity<List<Notification>> getAdminNotifications() {
        List<Notification> list = notificationService.getNotificationsForAdmin();
        return ResponseEntity.ok(list);
    }

    // ===================== GET USER NOTIFICATIONS BY USER ID / USERNAME =====================
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        String recipient = userId;
        try {
            Long id = Long.valueOf(userId);
            Employee emp = employeeRepository.findById(id).orElse(null);
            if (emp != null) {
                recipient = emp.getUsername() != null ? emp.getUsername() : emp.getEmail();
            }
        } catch (NumberFormatException e) {
            // userId is already username/email
        }

        List<Notification> list = notificationService.getNotificationsForUser(recipient);
        // Fallback: if empty, search by email too
        if (list.isEmpty() && recipient.contains("@") == false) {
            Employee emp = employeeRepository.findByUsername(recipient).orElse(null);
            if (emp != null && emp.getEmail() != null) {
                List<Notification> byEmail = notificationService.getNotificationsForUser(emp.getEmail());
                if (!byEmail.isEmpty()) {
                    list = byEmail;
                }
            }
        }

        return ResponseEntity.ok(list);
    }

    // ===================== UNREAD COUNT API =====================
    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @RequestParam(required = false) String username,
            @RequestParam(required = false, defaultValue = "false") boolean isAdmin) {

        long count = 0;
        if (isAdmin) {
            count = notificationService.countUnreadForAdmin();
        } else if (username != null && !username.trim().isEmpty()) {
            count = notificationService.countUnreadByUsername(username.trim());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    // ===================== MARK AS READ =====================
    @PostMapping("/mark-read/{id}")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notification marked as read.");
        return ResponseEntity.ok(response);
    }

    // ===================== MARK ALL AS READ =====================
    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(@RequestBody Map<String, String> payload) {
        String recipient = payload.getOrDefault("recipient", "Admin");
        String type = payload.get("type");
        if (type != null && !type.trim().isEmpty()) {
            notificationService.markNotificationsAsRead(recipient, type);
        } else {
            List<Notification> list = "Admin".equalsIgnoreCase(recipient)
                    ? notificationService.getNotificationsForAdmin()
                    : notificationService.getNotificationsForUser(recipient);
            for (Notification n : list) {
                if (!n.isReadStatus()) {
                    notificationService.markAsRead(n.getId());
                }
            }
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "All notifications marked as read.");
        return ResponseEntity.ok(response);
    }
}
