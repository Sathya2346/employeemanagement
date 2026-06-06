package com.example.employeemanagement.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.example.employeemanagement.repository.AdminRepository;
import com.example.employeemanagement.repository.EmployeeRepository;

@Configuration
public class DatabaseVerificationConfig {

    @Bean
    CommandLineRunner verifyDatabase(AdminRepository adminRepo, EmployeeRepository employeeRepo) {
        return args -> {
            System.out.println("--- DATABASE VERIFICATION ---");
            System.out.println("Admins:");
            adminRepo.findAll().forEach(admin -> {
                System.out.println("  User: " + admin.getUsername() + ", Email: " + admin.getEmail());
            });
            System.out.println("Employees:");
            employeeRepo.findAll().forEach(emp -> {
                System.out.println("  User: " + emp.getUsername() + ", Email: " + emp.getEmail());
            });
            System.out.println("-----------------------------");
        };
    }
}
