package com.example.employeemanagement.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Leave;
import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.model.CompanyDetails;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.LeaveRepository;
import com.example.employeemanagement.repository.AttendanceRepository;

import java.time.LocalDate;
import java.util.List;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class LeaveServiceTest {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    private Employee employee;

    @BeforeEach
    public void setup() {
        attendanceRepository.deleteAll();
        leaveRepository.deleteAll();
        employeeRepository.deleteAll();

        employee = new Employee();
        employee.setUsername("leavester");
        employee.setEmail("leave@test.com");
        employee.setPassword("pass");
        employee.setFirstname("Leave");
        employee.setLastname("User");
        employee.setPaidLeaveBalance(12);
        employee.setSickLeaveBalance(8);
        employee.setCasualLeaveBalance(5);
        employee.setTotalLeaves(25);
        
        CompanyDetails company = new CompanyDetails();
        company.setShiftTiming("9:00 AM - 6:00 PM");
        company.setEmployeeEmail("leave@test.com");
        company.setDesignation("Software Engineer");
        company.setJoiningDate(LocalDate.now());
        company.setStatus("Active");
        employee.setCompanyDetails(company);

        employee = employeeRepository.save(employee);
    }

    @Test
    public void testApplyLeaveSuccess() {
        Leave leave = new Leave();
        leave.setEmployee(employee);
        leave.setLeaveType("Paid Leave");
        leave.setLeaveFromDate(LocalDate.of(2026, 6, 1)); // Mon
        leave.setLeaveToDate(LocalDate.of(2026, 6, 3));   // Wed
        leave.setReason("Family function");

        Leave saved = leaveService.applyLeave(leave);

        assertNotNull(saved.getId());
        assertEquals("Pending", saved.getLeaveStatus());
        assertEquals(3, saved.getLeaveDays());

        // Verify balance is deducted
        Employee updated = employeeRepository.findById(employee.getId()).orElseThrow();
        assertEquals(9, updated.getPaidLeaveBalance()); // 12 - 3 = 9
        assertEquals(22, updated.getTotalLeaves());
    }

    @Test
    public void testApplyLeaveOverlapping() {
        // First leave
        Leave leave1 = new Leave();
        leave1.setEmployee(employee);
        leave1.setLeaveType("Sick Leave");
        leave1.setLeaveFromDate(LocalDate.of(2026, 6, 1));
        leave1.setLeaveToDate(LocalDate.of(2026, 6, 3));
        leave1.setReason("Sick");
        leaveService.applyLeave(leave1);

        // Overlapping second leave
        Leave leave2 = new Leave();
        leave2.setEmployee(employee);
        leave2.setLeaveType("Casual Leave");
        leave2.setLeaveFromDate(LocalDate.of(2026, 6, 2));
        leave2.setLeaveToDate(LocalDate.of(2026, 6, 4));
        leave2.setReason("Casual");

        assertThrows(RuntimeException.class, () -> {
            leaveService.applyLeave(leave2);
        });
    }

    @Test
    public void testApplyLeaveInsufficientBalance() {
        Leave leave = new Leave();
        leave.setEmployee(employee);
        leave.setLeaveType("Casual Leave");
        leave.setLeaveFromDate(LocalDate.of(2026, 6, 1));
        // Casual balance is 5 days. Trying to take 10 days.
        leave.setLeaveFromDate(LocalDate.of(2026, 6, 1));
        leave.setLeaveToDate(LocalDate.of(2026, 6, 12)); // 10 working days approx
        leave.setReason("Long vacation");

        assertThrows(RuntimeException.class, () -> {
            leaveService.applyLeave(leave);
        });
    }

    @Test
    public void testRejectLeaveRestoresBalanceAndResetsAttendance() {
        Leave leave = new Leave();
        leave.setEmployee(employee);
        leave.setLeaveType("Paid Leave");
        leave.setLeaveFromDate(LocalDate.of(2026, 6, 15));
        leave.setLeaveToDate(LocalDate.of(2026, 6, 15));
        leave.setReason("Reason");
        Leave saved = leaveService.applyLeave(leave);

        // Mark leave as approved in attendance for that day
        saved.setLeaveStatus("Approved");
        leaveRepository.save(saved);
        leaveService.markLeaveInAttendance(saved);

        // Verify attendance record shows leave approved
        Attendance attBefore = attendanceRepository
                .findByEmployeeAndAttendanceDate(employee, LocalDate.of(2026, 6, 15)).orElseThrow();
        assertEquals("Leave", attBefore.getStatus());
        assertTrue(attBefore.getLeaveApproved());

        // Reject leave
        leaveService.rejectLeave(saved.getId());

        // Check that balance is restored
        Employee updated = employeeRepository.findById(employee.getId()).orElseThrow();
        assertEquals(12, updated.getPaidLeaveBalance()); // Restored to 12

        // Check attendance record reset
        Attendance attAfter = attendanceRepository
                .findByEmployeeAndAttendanceDate(employee, LocalDate.of(2026, 6, 15)).orElseThrow();
        assertFalse(attAfter.getLeaveApproved());
        assertEquals("Absent", attAfter.getStatus()); // No check-in time
    }
}
