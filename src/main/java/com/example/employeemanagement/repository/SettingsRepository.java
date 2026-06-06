package com.example.employeemanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.employeemanagement.model.Settings;

@Repository
public interface SettingsRepository extends JpaRepository<Settings, String> {
}
