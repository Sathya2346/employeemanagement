package com.example.employeemanagement.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.model.CompanyDetails;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Leave;
import com.example.employeemanagement.model.MeetingSession;
import com.example.employeemanagement.repository.AttendanceRepository;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.LeaveRepository;
import com.example.employeemanagement.repository.MeetingSessionRepository;
import com.example.employeemanagement.service.AttendanceService;
import com.example.employeemanagement.service.LeaveService;
import com.example.employeemanagement.util.AppConstants;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class ManualSoftwareTestingFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MeetingSessionRepository meetingSessionRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private LeaveService leaveService;

    private CompanyDetails createDefaultCompanyDetails(String email) {
        CompanyDetails cd = new CompanyDetails();
        cd.setEmployeeEmail(email);
        cd.setDesignation("Software Engineer");
        cd.setShiftTiming(AppConstants.SHIFT_MORNING);
        cd.setJoiningDate(LocalDate.now().minusMonths(3));
        cd.setStatus("ACTIVE");
        return cd;
    }

    // =========================================================================
    // TEST FLOW 1: Employee Registration & Creation (Positive & Negative)
    // =========================================================================
    @Test
    @DisplayName("TC-01: Create Employee - Positive & Negative Validation")
    public void testEmployeeCreationFlows() throws Exception {
        // POSITIVE TEST: Create valid employee
        Employee validEmp = new Employee();
        validEmp.setFirstname("Alex");
        validEmp.setLastname("Tester");
        validEmp.setUsername("alextester");
        validEmp.setEmail("alex.tester@example.com");
        validEmp.setPassword("Password@123");
        validEmp.setOverallStatus("ACTIVE");
        validEmp.setUserType("ROLE_USER");
        validEmp.setCompanyDetails(createDefaultCompanyDetails("alex.work@company.com"));

        Employee savedEmp = employeeRepository.save(validEmp);
        assertNotNull(savedEmp.getId(), "POS: Employee ID should be generated");
        assertEquals("alextester", savedEmp.getUsername());
        assertEquals("Software Engineer", savedEmp.getCompanyDetails().getDesignation());

        // NEGATIVE TEST 1: Retrieve non-existent employee ID
        Optional<Employee> nonExistent = employeeRepository.findById(999999L);
        assertTrue(nonExistent.isEmpty(), "NEG: Non-existent employee should return empty");
    }

    // =========================================================================
    // TEST FLOW 2: Attendance & Meeting Tracking (Positive & Negative)
    // =========================================================================
    @Test
    @DisplayName("TC-02: Attendance Check-In, Meeting Tracking, Check-Out Lifecycle")
    public void testAttendanceAndMeetingFlows() throws Exception {
        // Setup Employee
        Employee emp = new Employee();
        emp.setFirstname("John");
        emp.setLastname("Quality");
        emp.setUsername("johnquality");
        emp.setEmail("john.quality@example.com");
        emp.setUserType("ROLE_USER");
        emp.setCompanyDetails(createDefaultCompanyDetails("john.work@company.com"));
        emp = employeeRepository.save(emp);

        LocalDate today = LocalDate.now(AppConstants.IST);

        // POSITIVE STEP 1: Check-In
        Attendance attData = new Attendance();
        attData.setAttendanceDate(today);
        attData.setCheckInTime(LocalTime.of(9, 0));
        attData.setUsername(emp.getUsername());

        Attendance savedAtt = attendanceService.saveAttendance(emp.getId(), attData);
        assertNotNull(savedAtt.getId(), "POS: Attendance record created on Check-In");
        assertEquals(LocalTime.of(9, 0), savedAtt.getCheckInTime());
        assertNull(savedAtt.getCheckOutTime(), "Check-out time should be null after Check-In");

        // POSITIVE STEP 2: Set RequestContext session for attendanceService calls
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpSession session = new MockHttpSession();
        session.setAttribute("employeeId", emp.getId());
        request.setSession(session);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        // Start Meeting
        attendanceService.startMeeting();
        assertEquals("Meeting", employeeRepository.findById(emp.getId()).get().getActivityStatus(),
                "POS: Activity status should be 'Meeting'");

        // End Meeting
        attendanceService.endMeeting();
        assertEquals("Working", employeeRepository.findById(emp.getId()).get().getActivityStatus(),
                "POS: Activity status reverts to 'Working' after meeting end");

        // Verify Meeting Session record created
        List<MeetingSession> sessions = meetingSessionRepository.findByAttendanceId(savedAtt.getId());
        assertFalse(sessions.isEmpty(), "POS: MeetingSession record should be persisted");

        // POSITIVE STEP 3: Check-Out
        attData.setCheckOutTime(LocalTime.of(18, 0));
        Attendance checkedOutAtt = attendanceService.saveAttendance(emp.getId(), attData);
        assertNotNull(checkedOutAtt.getCheckOutTime(), "POS: Check-out time set");
        assertEquals("Idle", employeeRepository.findById(emp.getId()).get().getActivityStatus(),
                "POS: Activity status set to 'Idle' after Check-Out");

        RequestContextHolder.resetRequestAttributes();
    }

    // =========================================================================
    // TEST FLOW 3: Logout Restriction Guard (Positive & Negative)
    // =========================================================================
    @Test
    @DisplayName("TC-03: Logout Restriction - Blocked when Checked In, Allowed when Checked Out")
    public void testLogoutRestrictionGuard() throws Exception {
        Employee emp = new Employee();
        emp.setFirstname("Sarah");
        emp.setLastname("Tester");
        emp.setUsername("sarahtester");
        emp.setEmail("sarah.tester@example.com");
        emp.setUserType("ROLE_USER");
        emp.setCompanyDetails(createDefaultCompanyDetails("sarah.work@company.com"));
        emp = employeeRepository.save(emp);

        LocalDate today = LocalDate.now(AppConstants.IST);

        // TEST 1: Before Check-In -> checkedIn should be false
        mockMvc.perform(get("/attendance/checkin-status/" + emp.getId())
                .with(user(emp.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.checkedIn").value(false));

        // TEST 2: After Check-In (without Check-Out) -> checkedIn should be true (Logout Blocked)
        Attendance att = new Attendance();
        att.setAttendanceDate(today);
        att.setCheckInTime(LocalTime.of(9, 15));
        attendanceService.saveAttendance(emp.getId(), att);

        mockMvc.perform(get("/attendance/checkin-status/" + emp.getId())
                .with(user(emp.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.checkedIn").value(true));

        // TEST 3: After Check-Out -> checkedIn should revert to false (Logout Allowed)
        att.setCheckOutTime(LocalTime.of(17, 30));
        attendanceService.saveAttendance(emp.getId(), att);

        mockMvc.perform(get("/attendance/checkin-status/" + emp.getId())
                .with(user(emp.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.checkedIn").value(false));

        // NEGATIVE TEST: IDOR unauthorized access check
        mockMvc.perform(get("/attendance/checkin-status/" + emp.getId())
                .with(user("otheruser").roles("USER")))
                .andExpect(status().isForbidden());
    }

    // =========================================================================
    // TEST FLOW 4: Leave Management Lifecycle & Cancelled Re-Apply
    // =========================================================================
    @Test
    @DisplayName("TC-04: Leave Management - Apply, Cancel, Re-Apply Validation")
    public void testLeaveLifecycleAndReapply() throws Exception {
        Employee emp = new Employee();
        emp.setFirstname("Robert");
        emp.setLastname("Tester");
        emp.setUsername("roberttester");
        emp.setEmail("robert.tester@example.com");
        emp.setUserType("ROLE_USER");
        emp.setCompanyDetails(createDefaultCompanyDetails("robert.work@company.com"));
        emp = employeeRepository.save(emp);

        LocalDate startDate = LocalDate.now().plusDays(5);
        LocalDate endDate = LocalDate.now().plusDays(7);

        // POSITIVE STEP 1: Apply Leave
        Leave leave = new Leave();
        leave.setEmployee(emp);
        leave.setLeaveType("Casual Leave");
        leave.setLeaveFromDate(startDate);
        leave.setLeaveToDate(endDate);
        leave.setReason("Personal work");
        leave.setLeaveStatus("Pending");

        Leave savedLeave = leaveRepository.save(leave);
        assertNotNull(savedLeave.getId());
        assertEquals("Pending", savedLeave.getLeaveStatus());

        // POSITIVE STEP 2: Cancel Leave
        savedLeave.setLeaveStatus("Cancelled");
        leaveRepository.save(savedLeave);

        // POSITIVE STEP 3: Re-apply for same dates after cancellation
        boolean existsOverlapping = leaveRepository.existsOverlappingLeave(emp.getId(), startDate, endDate);
        assertFalse(existsOverlapping, "POS: Cancelled leave should NOT block re-applying for same dates!");

        // Apply new leave for same dates
        Leave reappliedLeave = new Leave();
        reappliedLeave.setEmployee(emp);
        reappliedLeave.setLeaveType("Sick Leave");
        reappliedLeave.setLeaveFromDate(startDate);
        reappliedLeave.setLeaveToDate(endDate);
        reappliedLeave.setReason("Feeling unwell");
        reappliedLeave.setLeaveStatus("Pending");

        Leave newLeave = leaveRepository.save(reappliedLeave);
        assertNotNull(newLeave.getId(), "POS: Re-applied leave request successfully created");
        assertEquals("Sick Leave", newLeave.getLeaveType());

        // NEGATIVE TEST: Try applying another active leave overlapping with newly applied pending leave
        boolean existsActive = leaveRepository.existsOverlappingLeave(emp.getId(), startDate, endDate);
        assertTrue(existsActive, "NEG: Overlapping active leave request should be detected as existing!");
    }
}
