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
            // Create/Update Admin Account (admin / admin)
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
        };
    }
}
