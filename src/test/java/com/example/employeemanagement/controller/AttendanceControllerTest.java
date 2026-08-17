package com.example.employeemanagement.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.AttendanceService;

import java.util.Optional;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
public class AttendanceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AttendanceService attendanceService;

    @MockBean
    private EmployeeRepository employeeRepository;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testSaveAttendanceAuthorized() throws Exception {
        Employee emp = new Employee();
        emp.setId(1L);
        emp.setUsername("admin");
        
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(emp));
        when(attendanceService.saveAttendance(eq(1L), any(Attendance.class))).thenReturn(new Attendance());

        mockMvc.perform(post("/attendance/save/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"attendanceDate\":\"2026-06-01\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    public void testSaveAttendanceUnauthorizedIdor() throws Exception {
        // Logged in as "user", trying to modify employee 2
        Employee emp = new Employee();
        emp.setId(2L);
        emp.setUsername("otheruser");

        when(employeeRepository.findById(2L)).thenReturn(Optional.of(emp));

        mockMvc.perform(post("/attendance/save/2")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"attendanceDate\":\"2026-06-01\"}"))
                .andExpect(status().isForbidden()); // IDOR prevention blocks this
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    public void testIdleStart() throws Exception {
        mockMvc.perform(post("/attendance/idle/start")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"time\":\"2026-06-01T10:00:00\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("Idle Start Recorded"));
    }
}
