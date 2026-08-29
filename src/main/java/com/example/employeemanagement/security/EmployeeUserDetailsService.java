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

        String search = usernameOrEmail != null ? usernameOrEmail.trim() : "";

        // Try Employee first
        Optional<Employee> empOpt = employeeRepo.findByUsername(search)
                .or(() -> employeeRepo.findByEmail(search))
                .or(() -> employeeRepo.findByUsername(search.toLowerCase()))
                .or(() -> employeeRepo.findByEmail(search.toLowerCase()));

        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            return new EmployeeUserDetails(emp);
        }

        // Try Admin next
        Optional<Admin> adminOpt = adminRepo.findByUsername(search)
                .or(() -> adminRepo.findByEmail(search))
                .or(() -> adminRepo.findByUsername(search.toLowerCase()))
                .or(() -> adminRepo.findByEmail(search.toLowerCase()));

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
