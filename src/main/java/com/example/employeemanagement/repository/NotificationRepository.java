package com.example.employeemanagement.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.employeemanagement.model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    long countByEmployeeNameAndReadStatusFalse(String employeeName);
    
    // For cascading deletion
    void deleteByReferenceIdInAndType(List<Long> referenceIds, String type);
}