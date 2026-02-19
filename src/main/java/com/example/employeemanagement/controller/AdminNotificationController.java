package com.example.employeemanagement.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.employeemanagement.model.Notification;
import com.example.employeemanagement.service.NotificationService;

@Controller
@RequestMapping("/notification")
public class AdminNotificationController {

    @Autowired
    private NotificationService notificationService;

    // Get all notifications
    @GetMapping("/list")
    @ResponseBody
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    // Send new leave notification
    @PostMapping("/newLeave")
    @ResponseBody
    public ResponseEntity<String> newLeaveNotification(@RequestBody Notification notification) {
        notificationService.sendNotification(notification);
        return ResponseEntity.ok("Notification sent successfully!");
    }

    // Mark notification as read
    @PostMapping("/markRead/{id}")
    @ResponseBody
    public ResponseEntity<String> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok("Marked as read");
    }
}