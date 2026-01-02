package com.example.employeemanagement.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.employeemanagement.model.HourlyReport;

@Repository
public interface HourlyReportRepository extends JpaRepository<HourlyReport, Long> {
    List<HourlyReport> findByEmployee_Id(Long employeeId);

    // ✅ Global filter (admin)
    @Query("""
        SELECT h FROM HourlyReport h
        WHERE (:fromDate IS NULL OR h.createdAt >= :fromDate)
          AND (:toDate IS NULL OR h.createdAt <= :toDate)
          AND (:timeSlot IS NULL OR h.timeSlot = :timeSlot)
          AND (:status IS NULL OR h.status = :status)
        ORDER BY h.createdAt DESC
    """)
    List<HourlyReport> filterReports(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("timeSlot") String timeSlot,
            @Param("status") String status
    );

    // ✅ Per employee filter
    @Query(value = """
        SELECT * FROM hourly_report
        WHERE employee_id = :empId
          AND (:fromDate IS NULL OR created_at >= :fromDate)
          AND (:toDate IS NULL OR created_at <= :toDate)
          AND (:timeSlot IS NULL OR time_slot = :timeSlot)
          AND (:status IS NULL OR status = :status)
        ORDER BY created_at DESC
    """, nativeQuery = true)
    List<HourlyReport> filterReportsForEmployee(
            @Param("empId") Long empId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("timeSlot") String timeSlot,
            @Param("status") String status
    );
}
