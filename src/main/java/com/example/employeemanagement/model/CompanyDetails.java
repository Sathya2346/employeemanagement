package com.example.employeemanagement.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.io.Serializable;

@Embeddable
public class CompanyDetails implements Serializable {
    private static final long serialVersionUID = 1L;
    @NotBlank(message = "Employee company email is required")
    @Email(message = "Invalid company email format")
    private String employeeEmail;

    @NotBlank(message = "Designation is required")
    private String designation;

    @NotNull(message = "Joining date is required")
    @PastOrPresent(message = "Joining date cannot be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @org.springframework.format.annotation.DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate joiningDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @org.springframework.format.annotation.DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate leavingDate;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Shift timing is required")
    private String shiftTiming;

    public String getEmployeeEmail() {
        return employeeEmail;
    }
    public void setEmployeeEmail(String employeeEmail) {
        this.employeeEmail = employeeEmail;
    }

    public String getDesignation() {
        return designation;
    }
    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }
    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }

    public LocalDate getLeavingDate() {
        return leavingDate;
    }
    public void setLeavingDate(LocalDate leavingDate) {
        this.leavingDate = leavingDate;
    }

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }

    public String getShiftTiming() {
        return shiftTiming;
    }

    public void setShiftTiming(String shiftTiming) {
        this.shiftTiming = shiftTiming;
    }
}