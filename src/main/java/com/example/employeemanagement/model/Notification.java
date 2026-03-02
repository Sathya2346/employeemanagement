package com.example.employeemanagement.model;

import java.time.LocalDateTime;
import java.time.ZoneId;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // Leave, Payroll, etc.
    private Long referenceId; // ID of the leave or entity
    private boolean readStatus = false;
    @JsonFormat(pattern = "yyyy-MM-dd hh:mm:ss a", timezone = "Asia/Kolkata")
    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));

    // Detailed fields
    private String employeeName;
    private String leaveType;
    private String leaveFromDate;
    private String leaveToDate;
    private String leaveStatus;
    private String message;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public boolean isReadStatus() { return readStatus; }
    public void setReadStatus(boolean readStatus) { this.readStatus = readStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getLeaveType() { return leaveType; }
    public void setLeaveType(String leaveType) { this.leaveType = leaveType; }

    public String getLeaveFromDate() { return leaveFromDate; }
    public void setLeaveFromDate(String leaveFromDate) { this.leaveFromDate = leaveFromDate; }

    public String getLeaveToDate() { return leaveToDate; }
    public void setLeaveToDate(String leaveToDate) { this.leaveToDate = leaveToDate; }

    public String getLeaveStatus() { return leaveStatus; }
    public void setLeaveStatus(String leaveStatus) { this.leaveStatus = leaveStatus; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}