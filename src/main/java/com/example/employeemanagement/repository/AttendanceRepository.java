package com.example.employeemanagement.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.model.Employee;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    void deleteByEmployeeId(Long employeeId);
    List<Attendance> findByEmployee_Id(Long employeeId);
    Optional<Attendance> findByEmployee_IdAndAttendanceDate(Long employeeId, LocalDate attendanceDate);
    List<Attendance> findByEmployee_IdAndAttendanceDateBetween(Long employeeId, LocalDate fromDate, LocalDate toDate);
    List<Attendance> findByAttendanceDate(LocalDate date);
    Optional<Attendance> findByEmployeeAndAttendanceDate(Employee employee, LocalDate attendanceDate);
    boolean existsByEmployeeAndAttendanceDate(Employee employee, LocalDate attendanceDate);
    // ✅ Corrected Query
    @Query("SELECT a FROM Attendance a WHERE a.attendanceDate = :date")
    List<Attendance> getAttendanceByDate(@Param("date") LocalDate date);

    // ✅ Optimize Admin Dashboard N+1 Query
    List<Attendance> findByAttendanceDateBetween(LocalDate startDate, LocalDate endDate);
}