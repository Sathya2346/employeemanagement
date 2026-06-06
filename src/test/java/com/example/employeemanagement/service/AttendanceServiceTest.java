package com.example.employeemanagement.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.CompanyDetails;
import com.example.employeemanagement.repository.AttendanceRepository;
import com.example.employeemanagement.repository.EmployeeRepository;

import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.time.LocalTime;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AttendanceServiceTest {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    private Employee employee;

    @BeforeEach
    public void setup() {
        attendanceRepository.deleteAll();
        employeeRepository.deleteAll();

        employee = new Employee();
        employee.setUsername("testemp");
        employee.setEmail("emp@test.com");
        employee.setPassword("password");
        employee.setFirstname("Test");
        employee.setLastname("Employee");
        employee.setOverallStatus("FULLY_APPROVED");

        CompanyDetails company = new CompanyDetails();
        company.setShiftTiming("9:00 AM - 6:00 PM (Morning)");
        company.setEmployeeEmail("emp@test.com");
        company.setDesignation("Engineer");
        company.setJoiningDate(LocalDate.now());
        company.setStatus("Active");
        employee.setCompanyDetails(company);

        employee = employeeRepository.save(employee);

        // Bind Mock request/session to test thread
        org.springframework.mock.web.MockHttpServletRequest request = new org.springframework.mock.web.MockHttpServletRequest();
        org.springframework.mock.web.MockHttpSession mockSession = new org.springframework.mock.web.MockHttpSession();
        mockSession.setAttribute("employeeId", employee.getId());
        request.setSession(mockSession);
        org.springframework.web.context.request.RequestContextHolder.setRequestAttributes(
            new org.springframework.web.context.request.ServletRequestAttributes(request)
        );
    }

    @Test
    public void testCheckInLateNight() {
        Attendance data = new Attendance();
        data.setAttendanceDate(LocalDate.now());
        data.setCheckInTime(LocalTime.of(22, 57, 9)); // 10:57:09 PM
        
        Attendance saved = attendanceService.saveAttendance(employee.getId(), data);
        
        System.out.println("TEST_SAVED_ATTENDANCE: status=" + saved.getStatus() + ", lateMinutes=" + saved.getLateMinutes() + ", isLateIn=" + saved.getLateIn() + ", lateCheckIn=" + saved.getLateCheckIn());
    }

    @Test
    public void printAttendanceJson() throws Exception {
        Attendance data = new Attendance();
        data.setLateIn(true);
        data.setEarlyOut(true);
        data.setLateCheckIn(true);
        data.setEarlyCheckOut(true);
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        System.out.println("ATTENDANCE_JSON: " + mapper.writeValueAsString(data));
    }

    @Test
    public void testSaveAttendanceRegularShift() {
        Attendance data = new Attendance();
        data.setAttendanceDate(LocalDate.now());
        data.setCheckInTime(LocalTime.of(9, 0));
        data.setCheckOutTime(LocalTime.of(18, 0)); // 9 hours total duration

        Attendance saved = attendanceService.saveAttendance(employee.getId(), data);

        assertNotNull(saved.getId());
        assertEquals("Present", saved.getStatus());
        assertEquals(540, saved.getTotalWorkTime()); // 540 minutes = 9 hours
        assertFalse(saved.getLateCheckIn());
    }

    @Test
    public void testSaveAttendanceLateCheckIn() {
        Attendance data = new Attendance();
        data.setAttendanceDate(LocalDate.now());
        data.setCheckInTime(LocalTime.of(9, 15)); // Late by 15 minutes (> 10 mins grace)
        data.setCheckOutTime(LocalTime.of(18, 0));

        Attendance saved = attendanceService.saveAttendance(employee.getId(), data);

        assertTrue(saved.getLateCheckIn());
        assertTrue(saved.getLateIn());
        assertEquals(15, saved.getLateMinutes());
    }

    @Test
    public void testSaveAttendanceWithinGracePeriod() {
        Attendance data = new Attendance();
        data.setAttendanceDate(LocalDate.now());
        data.setCheckInTime(LocalTime.of(9, 5)); // Late by 5 minutes (within 10 mins grace)
        data.setCheckOutTime(LocalTime.of(18, 0));

        Attendance saved = attendanceService.saveAttendance(employee.getId(), data);

        assertTrue(saved.getLateCheckIn());
        assertFalse(saved.getLateIn()); // within 10 min grace
        assertEquals(5, saved.getLateMinutes());
    }

    @Test
    public void testSaveAttendanceNightShiftRollover() {
        // Change employee shift to night shift
        employee.getCompanyDetails().setShiftTiming("10:00 PM - 6:00 AM (Night)");
        employeeRepository.save(employee);

        Attendance data = new Attendance();
        data.setAttendanceDate(LocalDate.now());
        data.setCheckInTime(LocalTime.of(22, 0));
        data.setCheckOutTime(LocalTime.of(6, 0)); // Crosses midnight

        Attendance saved = attendanceService.saveAttendance(employee.getId(), data);

        assertEquals(480, saved.getTotalWorkTime()); // 8 hours = 480 mins
        assertEquals("Present", saved.getStatus());
    }

    @Test
    public void testSaveAttendanceLeaveClash() {
        Attendance data = new Attendance();
        data.setEmployee(employee);
        data.setUsername(employee.getUsername());
        data.setAttendanceDate(LocalDate.now());
        data.setLeaveApproved(true);
        data.setStatus("Leave");
        attendanceRepository.save(data);

        // Try checking in on a day with approved leave
        Attendance checkInData = new Attendance();
        checkInData.setAttendanceDate(LocalDate.now());
        checkInData.setCheckInTime(LocalTime.of(9, 0));

        assertThrows(RuntimeException.class, () -> {
            attendanceService.saveAttendance(employee.getId(), checkInData);
        });
    }

    @Test
    public void testSessionIdleAndBreakTracking() {
        // Setup current attendance checked in
        Attendance att = new Attendance();
        att.setEmployee(employee);
        att.setUsername(employee.getUsername());
        att.setAttendanceDate(LocalDate.now());
        att.setCheckInTime(LocalTime.of(9, 0));
        attendanceRepository.save(att);

        // Start & End Break
        attendanceService.startBreak(LocalTime.now().toString());
        Employee empBreak = employeeRepository.findById(employee.getId()).orElseThrow();
        assertEquals("Break", empBreak.getActivityStatus());

        attendanceService.endBreak(LocalTime.now().toString());
        Employee empWork = employeeRepository.findById(employee.getId()).orElseThrow();
        assertEquals("Working", empWork.getActivityStatus());
    }
}
