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
    CommandLineRunner createDefaultAdmin(
            AdminRepository adminRepo, 
            BCryptPasswordEncoder encoder,
            com.example.employeemanagement.repository.ShiftTimingRepository shiftRepo) {
        return args -> {
            if (adminRepo.findByUsername("admin").isEmpty()) {
                Admin admin = new Admin();
                admin.setUsername("admin");
                admin.setEmail("ganesansathya2346@gmail.com");
                admin.setPassword(encoder.encode("admin123"));
                admin.setUserType("ROLE_ADMIN");
                adminRepo.save(admin);
                System.out.println("✅ Default Admin created successfully!");
            }

            if (shiftRepo.count() == 0) {
                shiftRepo.save(new com.example.employeemanagement.model.ShiftTiming("General Shift (09:00 AM - 06:00 PM)"));
                shiftRepo.save(new com.example.employeemanagement.model.ShiftTiming("Morning Shift (06:00 AM - 02:00 PM)"));
                shiftRepo.save(new com.example.employeemanagement.model.ShiftTiming("Night Shift (10:00 PM - 06:00 AM)"));
                System.out.println("✅ Default Shift Timings seeded successfully!");
            }
        };
    }
}
