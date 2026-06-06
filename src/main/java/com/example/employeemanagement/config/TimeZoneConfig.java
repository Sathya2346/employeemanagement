package com.example.employeemanagement.config;

import java.util.TimeZone;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class TimeZoneConfig {

    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        System.out.println("✔ Server Timezone set to IST (Asia/Kolkata)");
    }
}