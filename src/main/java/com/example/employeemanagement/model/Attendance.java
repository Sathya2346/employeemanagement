package com.example.employeemanagement.model;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate attendanceDate;

    private String status; // Present / Absent

    @JsonFormat(pattern = "hh:mm:ss a", timezone = "Asia/Kolkata")
    private LocalTime checkInTime;

    @JsonFormat(pattern = "hh:mm:ss a", timezone = "Asia/Kolkata")
    private LocalTime checkOutTime;

    @JsonFormat(pattern = "hh:mm:ss a", timezone = "Asia/Kolkata")
    private LocalTime breakStart;

    @JsonFormat(pattern = "hh:mm:ss a", timezone = "Asia/Kolkata")
    private LocalTime breakEnd;

    private String username;
    private Long totalWorkTime;
    private Long idleTime;
    private Long lateMinutes;
    private Long earlyLeaveMinutes;
    private Long totalBreakTime;
    private Boolean leaveApproved;
    private LocalTime idleStartTime;

    private Boolean isLateIn = false;
    private Boolean earlyOut = false;

    private Boolean earlyCheckIn = false;
    private Boolean lateCheckIn = false;
    private Boolean earlyCheckOut = false;
    private Boolean lateCheckOut = false;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalTime checkInTime) { this.checkInTime = checkInTime; }

    public LocalTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalTime checkOutTime) { this.checkOutTime = checkOutTime; }

    public LocalTime getBreakStart() { return breakStart; }
    public void setBreakStart(LocalTime breakStart) { this.breakStart = breakStart; }

    public LocalTime getBreakEnd() { return breakEnd; }
    public void setBreakEnd(LocalTime breakEnd) { this.breakEnd = breakEnd; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Long getTotalWorkTime() { return totalWorkTime; }
    public void setTotalWorkTime(Long totalWorkTime) { this.totalWorkTime = totalWorkTime; }

    public Long getIdleTime() { return idleTime; }
    public void setIdleTime(Long idleTime) { this.idleTime = idleTime; }

    public Long getLateMinutes() { return lateMinutes; }
    public void setLateMinutes(Long lateMinutes) { this.lateMinutes = lateMinutes; }

    public Long getEarlyLeaveMinutes() { return earlyLeaveMinutes; }
    public void setEarlyLeaveMinutes(Long earlyLeaveMinutes) { this.earlyLeaveMinutes = earlyLeaveMinutes; }

    public Long getTotalBreakTime() { return totalBreakTime; }
    public void setTotalBreakTime(Long totalBreakTime) { this.totalBreakTime = totalBreakTime; }

    public Boolean getLeaveApproved() { return leaveApproved; }
    public void setLeaveApproved(Boolean leaveApproved) { this.leaveApproved = leaveApproved; }

    public LocalTime getIdleStartTime() { return idleStartTime; }
    public void setIdleStartTime(LocalTime idleStartTime) { this.idleStartTime = idleStartTime; }

    public Boolean getLateIn() { return isLateIn; }
    public void setLateIn(Boolean isLateIn) { this.isLateIn = isLateIn; }

    public Boolean getEarlyOut() { return earlyOut; }
    public void setEarlyOut(Boolean earlyOut) { this.earlyOut = earlyOut; }
    
    public Boolean getEarlyCheckIn() { return earlyCheckIn; }
    public void setEarlyCheckIn(Boolean earlyCheckIn) { this.earlyCheckIn = earlyCheckIn; }

    public Boolean getLateCheckIn() { return lateCheckIn; }
    public void setLateCheckIn(Boolean lateCheckIn) { this.lateCheckIn = lateCheckIn; }

    public Boolean getEarlyCheckOut() { return earlyCheckOut; }
    public void setEarlyCheckOut(Boolean earlyCheckOut) { this.earlyCheckOut = earlyCheckOut; }

    public Boolean getLateCheckOut() { return lateCheckOut; }
    public void setLateCheckOut(Boolean lateCheckOut) { this.lateCheckOut = lateCheckOut; }
}