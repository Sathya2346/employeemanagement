package com.example.employeemanagement;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.example.employeemanagement.model.*;
import com.example.employeemanagement.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class CrudOperationsTest {

    @Autowired private AdminRepository adminRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private EmployeeDetailsRepository employeeDetailsRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private LeaveRepository leaveRepository;
    @Autowired private AuditRepository auditRepository;
    @Autowired private HolidayRepository holidayRepository;
    @Autowired private HourlyReportRepository hourlyReportRepository;
    @Autowired private NotificationRepository notificationRepository;

    @Test
    public void testAdminCrud() {
        // Create
        Admin admin = new Admin();
        admin.setUsername("testadmin");
        admin.setEmail("admin@test.com");
        admin.setPassword("adminpass");
        Admin saved = adminRepository.save(admin);
        assertNotNull(saved.getId());

        // Read
        Optional<Admin> read = adminRepository.findById(saved.getId());
        assertTrue(read.isPresent());
        assertEquals("testadmin", read.get().getUsername());

        // Update
        read.get().setUsername("updatedadmin");
        Admin updated = adminRepository.save(read.get());
        assertEquals("updatedadmin", updated.getUsername());

        // Delete
        adminRepository.deleteById(saved.getId());
        assertFalse(adminRepository.findById(saved.getId()).isPresent());
    }

    @Test
    public void testEmployeeAndEmbeddablesCrud() {
        // Create
        Employee emp = new Employee();
        emp.setUsername("crudemp");
        emp.setEmail("crud@test.com");
        emp.setPassword("emppass");
        emp.setFirstname("Crud");
        emp.setLastname("User");
        emp.setPhone("9988776655");

        CompanyDetails company = new CompanyDetails();
        company.setShiftTiming("9:00 AM - 6:00 PM (Morning)");
        company.setEmployeeEmail("crud@test.com");
        company.setDesignation("Developer");
        company.setJoiningDate(LocalDate.now());
        company.setStatus("Active");
        emp.setCompanyDetails(company);

        BankDetails bank = new BankDetails();
        bank.setAccHolderName("Crud User");
        bank.setBankName("Sbi Bank");
        bank.setIfscCode("SBIN0000001");
        bank.setBranchName("Main Branch");
        bank.setAccNumber("98765432101");
        bank.setPanCard("ABCDE1234E");
        emp.setBankDetails(bank);

        Employee saved = employeeRepository.save(emp);
        assertNotNull(saved.getId());

        // Read
        Optional<Employee> read = employeeRepository.findById(saved.getId());
        assertTrue(read.isPresent());
        assertEquals("crudemp", read.get().getUsername());
        assertEquals("Developer", read.get().getCompanyDetails().getDesignation());
        assertEquals("SBIN0000001", read.get().getBankDetails().getIfscCode());

        // Update
        read.get().setPhone("1122334455");
        read.get().getCompanyDetails().setDesignation("Senior Developer");
        Employee updated = employeeRepository.save(read.get());
        assertEquals("1122334455", updated.getPhone());
        assertEquals("Senior Developer", updated.getCompanyDetails().getDesignation());

        // Delete
        employeeRepository.deleteById(saved.getId());
        assertFalse(employeeRepository.findById(saved.getId()).isPresent());
    }

    @Test
    public void testEmployeeDetailsCrud() {
        // Setup Employee
        Employee emp = new Employee();
        emp.setUsername("details_emp");
        emp.setEmail("det@test.com");
        emp.setPassword("pass");
        emp.setFirstname("Details");
        emp.setLastname("Test");
        emp = employeeRepository.save(emp);

        // Create Details
        EmployeeDetails det = new EmployeeDetails();
        det.setEmployee(emp);
        det.setPersonalPhone("9876543210");
        det.setPersonalAddress("123 Street");
        det.setPersonalCity("Metropolis");
        det.setPersonalGender("Female");
        det.setPersonalDateOfBirth("1995-05-15");
        det.setAccountNumber("555444333");
        det.setBankName("Metro Bank");
        det.setIfscCode("METR0000001");
        EmployeeDetails savedDet = employeeDetailsRepository.save(det);
        assertNotNull(savedDet.getId());

        // Read
        Optional<EmployeeDetails> read = employeeDetailsRepository.findById(savedDet.getId());
        assertTrue(read.isPresent());
        assertEquals("Metropolis", read.get().getPersonalCity());
        assertEquals(emp.getId(), read.get().getEmployee().getId());

        // Update
        read.get().setPersonalCity("Gotham");
        EmployeeDetails updated = employeeDetailsRepository.save(read.get());
        assertEquals("Gotham", updated.getPersonalCity());

        // Delete
        employeeDetailsRepository.deleteById(savedDet.getId());
        assertFalse(employeeDetailsRepository.findById(savedDet.getId()).isPresent());
    }

    @Test
    public void testAttendanceCrud() {
        // Setup Employee
        Employee emp = new Employee();
        emp.setUsername("att_emp");
        emp.setEmail("att@test.com");
        emp.setPassword("pass");
        emp.setFirstname("Att");
        emp.setLastname("Test");
        emp = employeeRepository.save(emp);

        // Create Attendance
        Attendance att = new Attendance();
        att.setEmployee(emp);
        att.setUsername(emp.getUsername());
        att.setAttendanceDate(LocalDate.now());
        att.setCheckInTime(LocalTime.of(9, 0));
        att.setCheckOutTime(LocalTime.of(18, 0));
        att.setStatus("Present");
        att.setTotalWorkTime(540L);
        Attendance saved = attendanceRepository.save(att);
        assertNotNull(saved.getId());

        // Read
        Optional<Attendance> read = attendanceRepository.findById(saved.getId());
        assertTrue(read.isPresent());
        assertEquals("Present", read.get().getStatus());

        // Update
        read.get().setStatus("Partial");
        Attendance updated = attendanceRepository.save(read.get());
        assertEquals("Partial", updated.getStatus());

        // Delete
        attendanceRepository.deleteById(saved.getId());
        assertFalse(attendanceRepository.findById(saved.getId()).isPresent());
    }

    @Test
    public void testLeaveCrud() {
        // Setup Employee
        Employee emp = new Employee();
        emp.setUsername("leave_emp");
        emp.setEmail("leave@test.com");
        emp.setPassword("pass");
        emp.setFirstname("Leave");
        emp.setLastname("Test");
        emp = employeeRepository.save(emp);

        // Create Leave
        Leave lv = new Leave();
        lv.setEmployee(emp);
        lv.setEmployeeName(emp.getUsername());
        lv.setLeaveFromDate(LocalDate.now());
        lv.setLeaveToDate(LocalDate.now().plusDays(2));
        lv.setLeaveType("Sick Leave");
        lv.setLeaveStatus("PENDING");
        Leave saved = leaveRepository.save(lv);
        assertNotNull(saved.getId());

        // Read
        Optional<Leave> read = leaveRepository.findById(saved.getId());
        assertTrue(read.isPresent());
        assertEquals("Sick Leave", read.get().getLeaveType());

        // Update
        read.get().setLeaveStatus("APPROVED");
        Leave updated = leaveRepository.save(read.get());
        assertEquals("APPROVED", updated.getLeaveStatus());

        // Delete
        leaveRepository.deleteById(saved.getId());
        assertFalse(leaveRepository.findById(saved.getId()).isPresent());
    }

    @Test
    public void testAuditLogCrud() {
        // Create
        AuditLog log = new AuditLog();
        log.setEntityName("employees");
        log.setAction("CREATE");
        log.setEntityId("12");
        log.setPerformedBy("admin");
        log.setDetails("Created employee details");
        log.setTimestamp(LocalDateTime.now());
        AuditLog saved = auditRepository.save(log);
        assertNotNull(saved.getId());

        // Read
        Optional<AuditLog> read = auditRepository.findById(saved.getId());
        assertTrue(read.isPresent());
        assertEquals("employees", read.get().getEntityName());

        // Update
        read.get().setPerformedBy("system");
        AuditLog updated = auditRepository.save(read.get());
        assertEquals("system", updated.getPerformedBy());

        // Delete
        auditRepository.deleteById(saved.getId());
        assertFalse(auditRepository.findById(saved.getId()).isPresent());
    }

    @Test
    public void testHolidayCrud() {
        // Create
        Holiday hol = new Holiday();
        hol.setName("New Year");
        hol.setHolidayDate(LocalDate.of(2026, 1, 1));
        Holiday saved = holidayRepository.save(hol);
        assertNotNull(saved.getId());

        // Read
        Optional<Holiday> read = holidayRepository.findById(saved.getId());
        assertTrue(read.isPresent());
        assertEquals("New Year", read.get().getName());

        // Update
        read.get().setName("New Year's Day");
        Holiday updated = holidayRepository.save(read.get());
        assertEquals("New Year's Day", updated.getName());

        // Delete
        holidayRepository.deleteById(saved.getId());
        assertFalse(holidayRepository.findById(saved.getId()).isPresent());
    }

    @Test
    public void testHourlyReportCrud() {
        // Setup Employee
        Employee emp = new Employee();
        emp.setUsername("hr_emp");
        emp.setEmail("hr@test.com");
        emp.setPassword("pass");
        emp.setFirstname("Hr");
        emp.setLastname("Test");
        emp = employeeRepository.save(emp);

        // Create Report
        HourlyReport rep = new HourlyReport();
        rep.setEmployee(emp);
        rep.setEmployeeName(emp.getUsername());
        rep.setTimeSlot("09:00 AM - 10:00 AM");
        rep.setTaskDescription("Daily coding task completion");
        rep.setStatus("Completed");
        HourlyReport saved = hourlyReportRepository.save(rep);
        assertNotNull(saved.getId());

        // Read
        Optional<HourlyReport> read = hourlyReportRepository.findById(saved.getId());
        assertTrue(read.isPresent());
        assertEquals("09:00 AM - 10:00 AM", read.get().getTimeSlot());

        // Update
        read.get().setTimeSlot("10:00 AM - 11:00 AM");
        HourlyReport updated = hourlyReportRepository.save(read.get());
        assertEquals("10:00 AM - 11:00 AM", updated.getTimeSlot());

        // Delete
        hourlyReportRepository.deleteById(saved.getId());
        assertFalse(hourlyReportRepository.findById(saved.getId()).isPresent());
    }

    @Test
    public void testNotificationCrud() {
        // Setup Employee username (recipient)
        String employeeUsername = "notif_emp_user";

        // Create Notification
        Notification notif = new Notification();
        notif.setRecipient(employeeUsername);
        notif.setTitle("Attendance Registered");
        notif.setMessage("You checked in at 9:00 AM");
        notif.setType("Attendance");
        notif.setReadStatus(false);
        Notification saved = notificationRepository.save(notif);
        assertNotNull(saved.getId());

        // Read
        Optional<Notification> read = notificationRepository.findById(saved.getId());
        assertTrue(read.isPresent());
        assertEquals("Attendance Registered", read.get().getTitle());

        // Update
        read.get().setReadStatus(true);
        Notification updated = notificationRepository.save(read.get());
        assertTrue(updated.isReadStatus());

        // Delete
        notificationRepository.deleteById(saved.getId());
        assertFalse(notificationRepository.findById(saved.getId()).isPresent());
    }
}
