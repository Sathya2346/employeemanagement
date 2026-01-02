package com.example.employeemanagement.service;

import java.util.List;

import com.example.employeemanagement.model.Notification;

public interface NotificationService {
    List<Notification> getAllNotifications();
    void markAsRead(Long id);
    void sendNotification(Notification notification);
    long countUnreadByUsername(String username);
    long countUnreadForAdmin();
    void removePendingLeaveNotification(Long referenceId);
}