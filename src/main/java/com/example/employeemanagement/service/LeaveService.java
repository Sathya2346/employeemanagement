package com.example.employeemanagement.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Leave;
import com.example.employeemanagement.repository.AttendanceRepository;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.LeaveRepository;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

@Service
public class LeaveService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    // ✅ Get all leaves
    public List<Leave> getAllLeaves() {
        return leaveRepository.findAll();
    }

    // ✅ Get leaves by employee name
    public List<Leave> getLeavesByEmployeeName(String name) {
        return leaveRepository.findByEmployeeName(name);
    }

    // ✅ Get leaves by date range
    public List<Leave> getLeavesByDateRange(LocalDate from, LocalDate to) {
        return leaveRepository.findByLeaveFromDateBetween(from, to);
    }

    // ✅ Get leaves by multiple employees and date range
    public List<Leave> getLeavesByMultipleEmployeesAndDateRange(List<Long> empIds, LocalDate from, LocalDate to) {
        return leaveRepository.findByEmployeeIdInAndLeaveFromDateBetween(empIds, from, to);
    }

    // ✅ Save Leave (used by /save and /applyLeave)
    public Leave saveLeave(Leave leave) {
        if (leave.getEmployee() == null || leave.getEmployee().getId() == null) {
            throw new RuntimeException("Employee ID missing in request!");
        }

        Employee emp = employeeRepository.findById(leave.getEmployee().getId())
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + leave.getEmployee().getId()));

        int days = (int) (leave.getLeaveToDate().toEpochDay() - leave.getLeaveFromDate().toEpochDay()) + 1;
        leave.setLeaveDays(days);
        leave.setLeaveAppliedDate(LocalDate.now());
        leave.setLeaveStatus("Pending");
        leave.setEmployee(emp);
        leave.setEmployeeName(emp.getUsername());

        // ✅ Deduct leave balance based on leave type
        switch (leave.getLeaveType()) {
            case "Paid Leave":
                if (emp.getPaidLeaveBalance() < days) throw new RuntimeException("Not enough Paid Leave balance!");
                emp.setPaidLeaveBalance(emp.getPaidLeaveBalance() - days);
                break;

            case "Sick Leave":
                if (emp.getSickLeaveBalance() < days) throw new RuntimeException("Not enough Sick Leave balance!");
                emp.setSickLeaveBalance(emp.getSickLeaveBalance() - days);
                break;

            case "Casual Leave":
                if (emp.getCasualLeaveBalance() < days) throw new RuntimeException("Not enough Casual Leave balance!");
                emp.setCasualLeaveBalance(emp.getCasualLeaveBalance() - days);
                break;

            default:
                throw new RuntimeException("Invalid leave type!");
        }

        emp.setTotalLeaves(emp.getPaidLeaveBalance() + emp.getSickLeaveBalance() + emp.getCasualLeaveBalance());
        employeeRepository.save(emp);

        Leave savedLeave = leaveRepository.save(leave);
        markLeaveInAttendance(savedLeave);

        return savedLeave; // ✅ Return once
    }

    // ✅ Apply leave (wrapper for controller)
    public Leave applyLeave(Leave leave) {
        return saveLeave(leave);
    }

    public List<Leave> getLeavesByEmployeeId(Long empId) {
        return leaveRepository.findByEmployeeId(empId);
    }

    public Employee getLeaveBalance(Long empId) {
        return employeeRepository.findById(empId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    private void markLeaveInAttendance(Leave leave) {
        LocalDate date = leave.getLeaveFromDate();
        LocalDate endDate = leave.getLeaveToDate();
        Employee employee = leave.getEmployee();

        while (!date.isAfter(endDate)) {
            final LocalDate currentDate = date;

            Attendance attendance = attendanceRepository
                    .findByEmployeeAndAttendanceDate(employee, currentDate)
                    .orElseGet(() -> {
                        Attendance newAttendance = new Attendance();
                        newAttendance.setEmployee(employee);
                        newAttendance.setAttendanceDate(currentDate);
                        return newAttendance;
                    });

            attendance.setUsername(employee.getUsername());
            attendance.setStatus("Leave");
            attendance.setCheckInTime(null);
            attendance.setCheckOutTime(null);
            attendance.setTotalWorkTime(0L);
            attendance.setTotalBreakTime(0L);
            attendanceRepository.save(attendance);

            date = date.plusDays(1);
        }
    }

    @Scheduled(cron = "0 59 23 * * *") // Every day 11:59 PM
    public void autoMarkDailyLeaves() {
        List<Leave> activeLeaves = leaveRepository.findByLeaveStatus("Approved");
        LocalDate today = LocalDate.now();

        for (Leave leave : activeLeaves) {
            if (!today.isBefore(leave.getLeaveFromDate()) && !today.isAfter(leave.getLeaveToDate())) {
                markLeaveInAttendance(leave);
            }
        }
    }

    public List<Leave> filterLeaves(String name, String status, LocalDate from, LocalDate to) {
        if (name != null && name.trim().isEmpty()) name = null;
        if (status != null && (status.trim().isEmpty() || status.equalsIgnoreCase("All"))) status = null;

        return leaveRepository.findLeavesFiltered(name, status, from, to);
    }

    // ✅ PDF Generation
    public byte[] generatePdfReport(List<Leave> leaves, Employee emp, LocalDate from, LocalDate to) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.BLUE);
            Paragraph title = new Paragraph("Leave Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Font dateFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
            Paragraph dateRange = new Paragraph("From: " + from + "  To: " + to, dateFont);
            dateRange.setAlignment(Element.ALIGN_CENTER);
            dateRange.setSpacingAfter(15);
            document.add(dateRange);

            Font infoFont = new Font(Font.FontFamily.HELVETICA, 12);
            document.add(new Paragraph("Employee ID: " + emp.getId(), infoFont));
            document.add(new Paragraph("Employee Name: " + emp.getFirstname(), infoFont));
            document.add(new Paragraph("Department: " + 
                (emp.getCompanyDetails() != null ? emp.getCompanyDetails().getDepartment() : "N/A"), infoFont));
            document.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            Font headerFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.WHITE);
            BaseColor headerColor = new BaseColor(0, 102, 204);

            String[] headers = {"Leave Type", "From", "To", "Days", "Approved By", "Status"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(headerColor);
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            Font cellFont = new Font(Font.FontFamily.HELVETICA, 11);
            for (Leave leave : leaves) {
                table.addCell(new Phrase(leave.getLeaveType(), cellFont));
                table.addCell(new Phrase(String.valueOf(leave.getLeaveFromDate()), cellFont));
                table.addCell(new Phrase(String.valueOf(leave.getLeaveToDate()), cellFont));
                table.addCell(new Phrase(String.valueOf(leave.getLeaveDays()), cellFont));
                table.addCell(new Phrase(leave.getLeaveApprovedBy(), cellFont));
                table.addCell(new Phrase(leave.getLeaveStatus(), cellFont));
            }

            document.add(table);

            document.add(Chunk.NEWLINE);
            Paragraph footer = new Paragraph("Generated on: " +LocalDate.now(ZoneId.of("Asia/Kolkata")),
                    new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC));
            footer.setAlignment(Element.ALIGN_RIGHT);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }
    }
    public Leave getLeaveById(Long id) {
        return leaveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave not found with ID: " + id));
    }
    // ✅ Get leaves for a single employee between two dates
    public List<Leave> getLeavesByEmployeeAndDateRange(Long empId, LocalDate from, LocalDate to) {
        return leaveRepository.findByEmployeeIdInAndLeaveFromDateBetween(
                Collections.singletonList(empId), from, to);
    }
    
    // ✅ Return leave days back to employee balance when rejected
    public void returnLeaveDaysToBalance(Leave leave) {
        if (leave == null || leave.getEmployee() == null) return;

        Employee emp = leave.getEmployee();
        int days = leave.getLeaveDays();

        switch (leave.getLeaveType()) {
            case "Paid Leave":
                emp.setPaidLeaveBalance(emp.getPaidLeaveBalance() + days);
                break;
            case "Sick Leave":
                emp.setSickLeaveBalance(emp.getSickLeaveBalance() + days);
                break;
            case "Casual Leave":
                emp.setCasualLeaveBalance(emp.getCasualLeaveBalance() + days);
                break;
            default:
                break;
        }

        // ✅ Update total leaves
        emp.setTotalLeaves(emp.getPaidLeaveBalance() + emp.getSickLeaveBalance() + emp.getCasualLeaveBalance());

        // ✅ Save updated employee balance
        employeeRepository.save(emp);
    }

    @Transactional
    public void rejectLeave(Long leaveId) {

        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        // 1️⃣ Mark leave as rejected
        leave.setLeaveStatus("Rejected");
        leaveRepository.save(leave);

        // 2️⃣ Return leave balance
        returnLeaveDaysToBalance(leave);

        // 3️⃣ FIX ATTENDANCE STATUS
        Employee employee = leave.getEmployee();
        LocalDate date = leave.getLeaveFromDate();
        LocalDate endDate = leave.getLeaveToDate();

        while (!date.isAfter(endDate)) {

            attendanceRepository
                .findByEmployeeAndAttendanceDate(employee, date)
                .ifPresent(attendance -> {

                    attendance.setLeaveApproved(false);

                    // 🔥 Decide correct status
                    if (attendance.getCheckInTime() != null) {
                        attendance.setStatus("Present");
                    } else {
                        attendance.setStatus("Absent");
                    }

                    attendanceRepository.save(attendance);
                });

            date = date.plusDays(1);
        }
    }
}