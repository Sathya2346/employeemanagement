package com.example.employeemanagement.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.employeemanagement.model.Notification;
import com.example.employeemanagement.repository.NotificationRepository;
import com.example.employeemanagement.util.AppConstants;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private com.example.employeemanagement.repository.LeaveRepository leaveRepository;

    @Override
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<Notification> getNotificationsForUser(String username) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(username);
    }

    @Override
    public List<Notification> getNotificationsForAdmin() {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc("Admin");
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
        if ("Leave".equalsIgnoreCase(notification.getType()) && notification.getReferenceId() != null) {
            try {
                leaveRepository.findById(notification.getReferenceId()).ifPresent(leave -> {
                    notification.setEmployeeName(leave.getEmployeeName());
                    notification.setLeaveType(leave.getLeaveType());
                    if (leave.getLeaveFromDate() != null) {
                        notification.setLeaveFromDate(leave.getLeaveFromDate().toString());
                    }
                    if (leave.getLeaveToDate() != null) {
                        notification.setLeaveToDate(leave.getLeaveToDate().toString());
                    }
                    if (notification.getLeaveStatus() == null || notification.getLeaveStatus().isEmpty()) {
                        notification.setLeaveStatus(leave.getLeaveStatus());
                    }
                });
            } catch (Exception e) {
                System.err.println("Failed to enrich leave notification details: " + e.getMessage());
            }
        }

        if (notification.getCreatedAt() == null)
            notification.setCreatedAt(java.time.LocalDateTime.now(AppConstants.IST));
        notificationRepository.save(notification);
    }

    @Override
    public void sendNotification(String title, String message, String type, Long referenceId, String targetUsername) {
        Notification n = new Notification();
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setReferenceId(referenceId);
        n.setRecipient(targetUsername);
        sendNotification(n);
    }

    @Override
    public void sendAdminNotification(String title, String message, String type, Long referenceId) {
        Notification n = new Notification();
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setReferenceId(referenceId);
        n.setRecipient("Admin");
        sendNotification(n);
    }

    @Override
    public long countUnreadByUsername(String username) {
        return notificationRepository.countByRecipientAndReadStatusFalse(username);
    }

    @Override
    public long countUnreadForAdmin() {
        return notificationRepository.countByRecipientAndReadStatusFalse("Admin");
    }

    @Override
    @Transactional
    public void removePendingLeaveNotification(Long referenceId) {
        notificationRepository.deleteByReferenceIdAndReadStatusFalse(referenceId);
    }

    @Override
    @Transactional
    public void markNotificationsAsRead(String recipient, String type) {
        List<Notification> unread = notificationRepository.findByRecipientAndTypeAndReadStatusFalse(recipient, type);
        unread.forEach(n -> {
            n.setReadStatus(true);
            notificationRepository.save(n);
        });
    }

    @Override
    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public void updateLeaveStatusOfNotifications(Long referenceId, String status) {
        notificationRepository.updateLeaveStatusByReferenceId(referenceId, status);
    }
}