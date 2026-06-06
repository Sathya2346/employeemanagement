package com.example.employeemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.employeemanagement.model.ShiftTiming;

@Repository
public interface ShiftTimingRepository extends JpaRepository<ShiftTiming, Long> {
}
