package com.example.employeemanagement.security;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.employeemanagement.model.Admin;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.AdminRepository;
import com.example.employeemanagement.repository.EmployeeRepository;

@Service
public class EmployeeUserDetailsService implements UserDetailsService {

    @Autowired
    private EmployeeRepository employeeRepo;

    @Autowired
    private AdminRepository adminRepo;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {

        // Try Employee first
        Optional<Employee> empOpt = employeeRepo.findByUsername(usernameOrEmail)
                .or(() -> employeeRepo.findByEmail(usernameOrEmail));

        if (empOpt.isPresent()) {
            return new EmployeeUserDetails(empOpt.get());  // ✅ Use your custom EmployeeUserDetails
        }

        // Try Admin next
        Optional<Admin> adminOpt = adminRepo.findByUsername(usernameOrEmail)
                .or(() -> adminRepo.findByEmail(usernameOrEmail));

        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            return org.springframework.security.core.userdetails.User.builder()
                    .username(admin.getUsername())
                    .password(admin.getPassword())
                    .roles("ADMIN")
                    .build();
        }

        throw new UsernameNotFoundException("User not found: " + usernameOrEmail);
    }
}
