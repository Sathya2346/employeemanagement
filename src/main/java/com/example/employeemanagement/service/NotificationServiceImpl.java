package com.example.employeemanagement.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.employeemanagement.model.Notification;
import com.example.employeemanagement.repository.NotificationRepository;
import com.example.employeemanagement.util.AppConstants;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification != null) {
            notification.setReadStatus(true);
            notificationRepository.save(notification);
        }
    }

    @Override
    public void sendNotification(Notification notification) {
        if (notification.getCreatedAt() == null)
            notification.setCreatedAt(java.time.LocalDateTime.now(AppConstants.IST));
        notificationRepository.save(notification);
    }
    @Override
    public long countUnreadByUsername(String username) {
        return notificationRepository.countByEmployeeNameAndReadStatusFalse(username);
    }

    @Override
    public long countUnreadForAdmin() {
        // Example: assuming admin notifications have employeeName = "Admin"
        return notificationRepository.countByEmployeeNameAndReadStatusFalse("Admin");
    }
    @Override
    public void removePendingLeaveNotification(Long referenceId) {
        List<Notification> notifications = notificationRepository.findAllByOrderByCreatedAtDesc();
        notifications.stream()
            .filter(n -> n.getReferenceId() != null && n.getReferenceId().equals(referenceId) && !n.isReadStatus())
            .forEach(n -> notificationRepository.delete(n));
    }
}