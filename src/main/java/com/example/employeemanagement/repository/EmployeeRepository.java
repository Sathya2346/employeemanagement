package com.example.employeemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.employeemanagement.model.Employee;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>{
    Employee findByUsernameAndPassword(String username, String password);
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByUsername(String username);
}