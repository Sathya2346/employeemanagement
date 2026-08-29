package com.example.employeemanagement.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.MeetingSession;
import com.example.employeemanagement.repository.AttendanceRepository;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.MeetingSessionRepository;
import com.example.employeemanagement.repository.AuditRepository;
import com.example.employeemanagement.repository.NotificationRepository;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class Comprehensive100PercentVerificationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MeetingSessionRepository meetingSessionRepository;

    @Autowired
    private AuditRepository auditRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private Employee createTestEmployee(String username, String email) {
        Employee emp = new Employee();
        emp.setFirstname("Test");
        emp.setLastname("User");
        emp.setUsername(username);
        emp.setEmail(email);
        emp.setPassword("password");
        emp.setOverallStatus("ACTIVE");
        emp.setUserType("ROLE_USER");
        emp.setActivityStatus("Working");
        return employeeRepository.save(emp);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("TC-FINAL-01: Verified Meeting Link Platform Detection & Start")
    public void testMeetingLinkStartAndPlatformDetection() throws Exception {
        Employee emp = createTestEmployee("meetuser", "meetuser@example.com");

        // Start Check-in first
        mockMvc.perform(post("/api/attendance/check-in/" + emp.getId())
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());

        // Post Google Meet link
        String jsonPayload = "{\"platform\":\"Google Meet\",\"meetingLink\":\"https://meet.google.com/abc-defg-hij\"}";

        mockMvc.perform(post("/api/attendance/meetingin/" + emp.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Meeting Started"))
                .andExpect(jsonPath("$.platform").value("Google Meet"));

        // Verify MeetingSession created in DB
        Attendance att = attendanceRepository.findByEmployeeAndAttendanceDate(emp, LocalDate.now()).orElse(null);
        assertNotNull(att);

        MeetingSession session = meetingSessionRepository.findByAttendanceIdAndMeetingEndIsNull(att.getId()).orElse(null);
        assertNotNull(session);
        assertEquals("Google Meet", session.getMeetingPlatform());
        assertEquals("https://meet.google.com/abc-defg-hij", session.getMeetingLink());
        assertEquals("VERIFIED", session.getVerificationStatus());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("TC-FINAL-02: Live Proof Heartbeat Loop Processing")
    public void testMeetingHeartbeatProofLoop() throws Exception {
        Employee emp = createTestEmployee("heartbeatuser", "hbuser@example.com");

        mockMvc.perform(post("/api/attendance/check-in/" + emp.getId())
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/attendance/meetingin/" + emp.getId())
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());

        // Send 3 60-second proof pings
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/attendance/meeting-heartbeat/" + emp.getId())
                    .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("VERIFIED"));
        }

        // Verify heartbeat count incremented to 3 in DB
        Attendance att = attendanceRepository.findByEmployeeAndAttendanceDate(emp, LocalDate.now()).orElse(null);
        assertNotNull(att);

        MeetingSession session = meetingSessionRepository.findByAttendanceIdAndMeetingEndIsNull(att.getId()).orElse(null);
        assertNotNull(session);
        assertEquals(3, session.getHeartbeatCount());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("TC-FINAL-03: Anti-Forgery Duplicate Device Alarm Triggering")
    public void testAntiForgeryDuplicateDeviceDetection() throws Exception {
        Employee emp1 = createTestEmployee("emp1", "emp1@example.com");
        Employee emp2 = createTestEmployee("emp2", "emp2@example.com");

        // Emp 1 checks in from Device IP 192.168.1.50
        mockMvc.perform(post("/api/attendance/check-in/" + emp1.getId())
                .header("X-Device-Fingerprint", "DEVICE-MAC-999")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .with(req -> { req.setRemoteAddr("192.168.1.50"); return req; }))
                .andExpect(status().isOk());

        // Emp 2 checks in from SAME Device IP 192.168.1.50 within 2 mins (Proxy Forgery Attempt!)
        mockMvc.perform(post("/api/attendance/check-in/" + emp2.getId())
                .header("X-Device-Fingerprint", "DEVICE-MAC-999")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .with(req -> { req.setRemoteAddr("192.168.1.50"); return req; }))
                .andExpect(status().isOk());

        // Verify AuditLog contains FORGERY_ALERT
        assertTrue(auditRepository.findAll().stream()
                .anyMatch(log -> "FORGERY_ALERT".equals(log.getAction())));

        // Verify Admin Notification created
        assertTrue(notificationRepository.findAll().stream()
                .anyMatch(notif -> "FORGERY_ALERT".equals(notif.getType())));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("TC-FINAL-04: Admin Attendance Rectification Endpoint")
    public void testAdminRectification() throws Exception {
        Employee emp = createTestEmployee("forgeduser", "forged@example.com");

        mockMvc.perform(post("/api/attendance/check-in/" + emp.getId())
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());
        Attendance att = attendanceRepository.findByEmployeeAndAttendanceDate(emp, LocalDate.now()).orElse(null);
        assertNotNull(att);

        att.setTotalMeetingTime(120L); // 120 mins faked hours
        attendanceRepository.save(att);

        // Admin Rectifies attendance record
        mockMvc.perform(post("/api/attendance/admin/rectify/" + att.getId())
                .param("reason", "Proxy Forgery Detected")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RECTIFIED"));

        // Assert DB record reset
        Attendance rectified = attendanceRepository.findById(att.getId()).orElse(null);
        assertNotNull(rectified);
        assertEquals(0L, rectified.getTotalMeetingTime());
        assertEquals("FORGERY_REJECTED", rectified.getStatus());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("TC-FINAL-05: Multi-User Concurrent Meeting Execution")
    public void testMultiUserConcurrentMeetingIsolation() throws Exception {
        Employee empA = createTestEmployee("userA", "userA@example.com");
        Employee empB = createTestEmployee("userB", "userB@example.com");

        // User A Check-in & Start Google Meet
        mockMvc.perform(post("/api/attendance/check-in/" + empA.getId())
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/attendance/meetingin/" + empA.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"platform\":\"Google Meet\"}")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());

        // User B Check-in & Start MS Teams
        mockMvc.perform(post("/api/attendance/check-in/" + empB.getId())
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/attendance/meetingin/" + empB.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"platform\":\"MS Teams\"}")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());

        // Verify User A MeetingSession created in DB
        Attendance attA = attendanceRepository.findByEmployeeAndAttendanceDate(empA, LocalDate.now()).orElse(null);
        assertNotNull(attA);
        MeetingSession sessionA = meetingSessionRepository.findByAttendanceIdAndMeetingEndIsNull(attA.getId()).orElse(null);
        assertNotNull(sessionA);
        assertEquals("Google Meet", sessionA.getMeetingPlatform());

        // Verify User B MeetingSession created in DB
        Attendance attB = attendanceRepository.findByEmployeeAndAttendanceDate(empB, LocalDate.now()).orElse(null);
        assertNotNull(attB);
        MeetingSession sessionB = meetingSessionRepository.findByAttendanceIdAndMeetingEndIsNull(attB.getId()).orElse(null);
        assertNotNull(sessionB);
        assertEquals("MS Teams", sessionB.getMeetingPlatform());
    }
}
