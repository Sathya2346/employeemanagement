package com.example.employeemanagement.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.employeemanagement.model.Leave;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {
       
       void deleteByEmployeeId(Long employeeId);
       List<Leave> findByEmployeeId(Long employeeId);
    // flexible name search (contains, case-insensitive)
       List<Leave> findByEmployeeNameContainingIgnoreCase(String employeeName);
    // by status
       List<Leave> findByLeaveStatus(String leaveStatus);
    // date range (leaveFromDate between)
       List<Leave> findByLeaveFromDateBetween(LocalDate from, LocalDate to);
       List<Leave> findByEmployeeName(String employeeName);
    // combinations:
       List<Leave> findByEmployeeNameContainingIgnoreCaseAndLeaveStatus(String employeeName, String leaveStatus);
       List<Leave> findByEmployeeNameContainingIgnoreCaseAndLeaveFromDateBetween(String employeeName, LocalDate from, LocalDate to);
       List<Leave> findByLeaveStatusAndLeaveFromDateBetween(String leaveStatus, LocalDate from, LocalDate to);
       List<Leave> findByEmployeeNameContainingIgnoreCaseAndLeaveStatusAndLeaveFromDateBetween(String employeeName, String leaveStatus, LocalDate from, LocalDate to);
       List<Leave> findByEmployeeIdInAndLeaveFromDateBetween(List<Long> empIds, LocalDate from, LocalDate to);

       // ✅ Place the new flexible filter query here:
       @Query("SELECT l FROM Leave l " +
              "WHERE (:name IS NULL OR LOWER(l.employeeName) LIKE LOWER(CONCAT('%', :name, '%'))) " +
              "AND (:status IS NULL OR l.leaveStatus = :status) " +
              "AND (:from IS NULL OR l.leaveFromDate >= :from) " +
              "AND (:to IS NULL OR l.leaveToDate <= :to)")
       List<Leave> findLeavesFiltered(@Param("name") String name,
                                          @Param("status") String status,
                                          @Param("from") LocalDate from,
                                          @Param("to") LocalDate to);
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(l) > 0 FROM Leave l WHERE l.employee.id = :empId AND l.leaveStatus = 'Approved' AND :date BETWEEN l.leaveFromDate AND l.leaveToDate")
    boolean isEmployeeOnLeave(@Param("empId") Long empId, @Param("date") LocalDate date);
}
