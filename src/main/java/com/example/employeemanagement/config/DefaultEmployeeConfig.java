package com.example.employeemanagement.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.example.employeemanagement.model.Admin;
import com.example.employeemanagement.repository.AdminRepository;

@Configuration
public class DefaultEmployeeConfig {

    @Bean
    CommandLineRunner createDefaultAdmin(AdminRepository adminRepo, BCryptPasswordEncoder encoder) {
        return args -> {
            if (adminRepo.findByUsername("admin").isEmpty()) {
                Admin admin = new Admin();
                admin.setUsername("admin");
                admin.setEmail("ganesansathya2346@gmail.com");
                admin.setPassword(encoder.encode("admin123"));
                admin.setUserType("ROLE_ADMIN");
                adminRepo.save(admin);
                System.out.println("✅ Default Admin created successfully!");
            } else {
                System.out.println("ℹ️ Admin already exists, skipping creation.");
            }
        };
    }
}
