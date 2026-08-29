package com.example.employeemanagement.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.example.employeemanagement.model.Admin;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.AdminRepository;
import com.example.employeemanagement.repository.EmployeeRepository;

@Configuration
public class DefaultEmployeeConfig {

    @Bean
    CommandLineRunner createDefaultAccounts(AdminRepository adminRepo, EmployeeRepository employeeRepo, BCryptPasswordEncoder encoder) {
        return args -> {
            // 1. Default Admin Account (admin / admin)
            Admin admin = adminRepo.findByUsername("admin").orElse(null);
            if (admin == null) {
                admin = new Admin();
                admin.setUsername("admin");
                admin.setEmail("ganesansathya2346@gmail.com");
                admin.setPassword(encoder.encode("admin"));
                admin.setUserType("ROLE_ADMIN");
                adminRepo.save(admin);
                System.out.println("✅ Default Admin (admin/admin) created!");
            } else {
                admin.setPassword(encoder.encode("admin"));
                adminRepo.save(admin);
                System.out.println("✅ Admin password verified!");
            }

            // 2. Default Employee Account (john / 12345)
            Employee emp = employeeRepo.findByUsername("john").orElse(null);
            if (emp == null) {
                emp = new Employee();
                emp.setUsername("john");
                emp.setFirstname("John");
                emp.setLastname("Doe");
                emp.setEmail("john@example.com");
                emp.setPassword(encoder.encode("12345"));
                emp.setOverallStatus("FULLY_APPROVED");
                emp.setUserType("ROLE_USER");
                employeeRepo.save(emp);
                System.out.println("✅ Default Employee (john/12345) created!");
            } else {
                emp.setPassword(encoder.encode("12345"));
                employeeRepo.save(emp);
                System.out.println("✅ Employee password verified!");
            }
        };
    }
}
