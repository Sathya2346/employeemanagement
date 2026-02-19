package com.example.employeemanagement.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "leaves") // optional: change table name as desired
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "employee_id", nullable = true)
    private Employee employee;
    
    @Column(name = "employee_name")
    private String employeeName;
    private String leaveType;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate leaveFromDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate leaveToDate;

    private int leaveDays;
    private String leaveApprovedBy;
    private String leaveStatus;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate leaveAppliedDate;

    public Leave() {}

    private String reason;

    // Getters and setters

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getLeaveType() { return leaveType; }
    public void setLeaveType(String leaveType) { this.leaveType = leaveType; }

    public LocalDate getLeaveFromDate() { return leaveFromDate; }
    public void setLeaveFromDate(LocalDate leaveFromDate) { this.leaveFromDate = leaveFromDate; }

    public LocalDate getLeaveToDate() { return leaveToDate; }
    public void setLeaveToDate(LocalDate leaveToDate) { this.leaveToDate = leaveToDate; }

    public int getLeaveDays() { return leaveDays; }
    public void setLeaveDays(int leaveDays) { this.leaveDays = leaveDays; }

    public String getLeaveApprovedBy() { return leaveApprovedBy; }
    public void setLeaveApprovedBy(String leaveApprovedBy) { this.leaveApprovedBy = leaveApprovedBy; }

    public String getLeaveStatus() { return leaveStatus; }
    public void setLeaveStatus(String leaveStatus) { this.leaveStatus = leaveStatus; }

    public LocalDate getLeaveAppliedDate() {
        return leaveAppliedDate;
    }

    public void setLeaveAppliedDate(LocalDate leaveAppliedDate) {
        this.leaveAppliedDate = leaveAppliedDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
