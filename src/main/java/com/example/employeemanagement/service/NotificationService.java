package com.example.employeemanagement.service;

import java.util.List;

import com.example.employeemanagement.model.Notification;

public interface NotificationService {
    List<Notification> getAllNotifications();
    void markAsRead(Long id);
    void sendNotification(Notification notification);
    void sendNotification(String title, String message, String type, Long referenceId, String targetUsername);
    void sendAdminNotification(String title, String message, String type, Long referenceId);
    List<Notification> getNotificationsForUser(String username);
    List<Notification> getNotificationsForAdmin();
    long countUnreadByUsername(String username);
    long countUnreadForAdmin();
    void removePendingLeaveNotification(Long referenceId);
    void markNotificationsAsRead(String recipient, String type);
    Notification getNotificationById(Long id);
}