package com.example.employeemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.employeemanagement.model.EmployeeDetails;

@Repository
public interface EmployeeDetailsRepository extends JpaRepository<EmployeeDetails, Long> {
    EmployeeDetails findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
