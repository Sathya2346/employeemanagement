package com.example.employeemanagement.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import com.example.employeemanagement.model.Attendance;

public interface AttendanceService {

    Attendance saveAttendance(Long employeeId, Attendance attendanceData);

    List<Attendance> getAttendanceByEmployee(Long employeeId);

    List<Attendance> getAllAttendance();

    Optional<Attendance> getByDate(Long employeeId, LocalDate date);

    List<Attendance> getByDateRange(Long employeeId, LocalDate from, LocalDate to);
    // ✅ Add these two methods to match your implementation & controller
    List<Attendance> findByEmployeeId(Long employeeId);

    List<Attendance> findByEmployeeIdAndDateRange(Long employeeId, LocalDate fromDate, LocalDate toDate);
    List<Attendance> getAttendanceByDate(LocalDate date);
    
    // Optimized for Admin Dashboard
    List<Attendance> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate);
    
    void startIdle(String time);
    void endIdle(String time);
}
