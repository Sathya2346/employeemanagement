package com.example.employeemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.employeemanagement.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    List<Notification> findByRecipientOrderByCreatedAtDesc(String recipient);
    long countByRecipientAndReadStatusFalse(String recipient);
    List<Notification> findByRecipientAndTypeAndReadStatusFalse(String recipient, String type);
    
    // For cascading deletion
    void deleteByReferenceIdInAndType(List<Long> referenceIds, String type);
    void deleteByReferenceIdAndReadStatusFalse(Long referenceId);
}