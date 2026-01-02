package com.example.employeemanagement.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;
import java.time.LocalDateTime;

import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.temporal.ChronoUnit;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Leave;
import com.example.employeemanagement.model.Notification;
import com.example.employeemanagement.service.EmployeeService;
import com.example.employeemanagement.service.LeaveService;
import com.example.employeemanagement.service.NotificationService;
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

import jakarta.servlet.http.HttpServletResponse;

@Controller
@RequestMapping("/leave")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/save")
    @ResponseBody
    public ResponseEntity<?> saveLeave(@RequestBody Leave leave) {
        try {
            Leave savedLeave = leaveService.saveLeave(leave);
            return ResponseEntity.ok(savedLeave);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("❌ Error saving leave: " + e.getMessage());
        }
    }

    @GetMapping("/user/{empId}")
    @ResponseBody
    public ResponseEntity<?> getLeavesByEmployee(@PathVariable Long empId) {
        try {
            List<Leave> leaves = leaveService.getLeavesByEmployeeId(empId);
            return ResponseEntity.ok(leaves);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error fetching leaves: " + e.getMessage());
        }
    }

    @GetMapping("/balance/{empId}")
    @ResponseBody
    public ResponseEntity<?> getLeaveBalance(@PathVariable Long empId) {
        try {
            Employee emp = leaveService.getLeaveBalance(empId);
            return ResponseEntity.ok(emp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error fetching balance: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    @ResponseBody
    public ResponseEntity<?> getAllLeaves() {
        try {
            List<Leave> allLeaves = leaveService.getAllLeaves();
            return ResponseEntity.ok(allLeaves);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error fetching all leaves: " + e.getMessage());
        }
    }

    @GetMapping("/userLeave/{empId}")
    public String showUserLeavePage(@PathVariable Long empId, Model model) {
        Employee emp = employeeService.getEmployeeById(empId);
        List<Leave> leaves = leaveService.getLeavesByEmployeeId(empId);

        model.addAttribute("employee", emp);
        model.addAttribute("leaves", leaves);
        model.addAttribute("companyDetails", emp.getCompanyDetails());
        model.addAttribute("totalLeaves", emp.getTotalLeaves());
        model.addAttribute("paidLeaves", emp.getPaidLeaveBalance());
        model.addAttribute("sickLeaves", emp.getSickLeaveBalance());
        model.addAttribute("casualLeaves", emp.getCasualLeaveBalance());

        return "user/userLeave";
    }

    @GetMapping("/filter")
    @ResponseBody
    public List<Leave> filterLeaves(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        if ((from == null) ^ (to == null)) {
            from = null;
            to = null;
        }

        if (status == null || status.isEmpty() || status.equalsIgnoreCase("All")) {
            status = null;
        }

        return leaveService.filterLeaves(name, status, from, to);
    }

    @GetMapping("/download/{empId}")
    public ResponseEntity<byte[]> downloadLeaveReport(
            @PathVariable Long empId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        Employee employee = employeeService.getEmployeeById(empId);
        List<Leave> leaves = leaveService.getLeavesByMultipleEmployeesAndDateRange(
                Collections.singletonList(empId), from, to);

        byte[] pdfBytes = leaveService.generatePdfReport(leaves, employee, from, to);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=Leave_Report_" + employee.getFirstname() + ".pdf")
                .header("Content-Type", "application/pdf")
                .body(pdfBytes);
    }

    @PostMapping("/applyLeave")
    @ResponseBody
    public ResponseEntity<?> applyLeave(@RequestBody Map<String, Object> payload) {
        try {
            // Extract employeeId correctly
            Map<String, Object> empMap = (Map<String, Object>) payload.get("employee");
            if (empMap == null || empMap.get("id") == null)
                return ResponseEntity.badRequest().body("❌ Employee ID is missing");

            Long empId = Long.valueOf(empMap.get("id").toString());
            Employee employee = employeeService.getEmployeeById(empId);
            if (employee == null) {
                return ResponseEntity.badRequest().body("❌ Employee not found with ID: " + empId);
            }

            Leave leave = new Leave();
            leave.setEmployee(employee);
            leave.setEmployeeName(employee.getFirstname());
            leave.setLeaveType(payload.get("leaveType").toString());
            leave.setLeaveFromDate(LocalDate.parse(payload.get("leaveFromDate").toString()));
            leave.setLeaveToDate(LocalDate.parse(payload.get("leaveToDate").toString()));
            leave.setLeaveAppliedDate(LocalDate.now());
            leave.setLeaveStatus("Pending");
            leave.setReason(payload.get("reason") != null ? payload.get("reason").toString() : "");

            Leave savedLeave = leaveService.applyLeave(leave);

            // Calculate leave days
            long leaveDays = ChronoUnit.DAYS.between(savedLeave.getLeaveFromDate(), savedLeave.getLeaveToDate()) + 1;

            Map<String, Object> response = new HashMap<>();
            response.put("id", savedLeave.getId());
            response.put("employeeId", employee.getId());
            response.put("employeeName", employee.getFirstname());
            response.put("leaveType", savedLeave.getLeaveType());
            response.put("leaveFromDate", savedLeave.getLeaveFromDate());
            response.put("leaveToDate", savedLeave.getLeaveToDate());
            response.put("leaveDays", leaveDays);
            response.put("leaveApprovedBy", savedLeave.getLeaveApprovedBy());
            response.put("leaveStatus", savedLeave.getLeaveStatus());

            // Send notification
            Notification notification = new Notification();
            notification.setType("Leave");
            notification.setReferenceId(savedLeave.getId());
            notification.setReadStatus(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setEmployeeName(employee.getFirstname());
            notification.setLeaveType(savedLeave.getLeaveType());
            notification.setLeaveFromDate(savedLeave.getLeaveFromDate().toString());
            notification.setLeaveToDate(savedLeave.getLeaveToDate().toString());
            notification.setLeaveStatus(savedLeave.getLeaveStatus());
            notification.setMessage(employee.getFirstname() + " applied for " + savedLeave.getLeaveType());
            notificationService.sendNotification(notification);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("❌ Failed to apply leave: " + e.getMessage());
        }
    }
    @GetMapping("/download/pdf")
    public void downloadUserLeaveReport(
            @RequestParam("empId") Long empId,
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            HttpServletResponse response) {

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=MyLeaveReport.pdf");

        try (var outputStream = response.getOutputStream()) {
            List<Leave> leaves = leaveService.getLeavesByEmployeeAndDateRange(empId, fromDate, toDate);

            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, outputStream);
            document.open();

            // 🧠 Header info
            Leave firstLeave = leaves.isEmpty() ? null : leaves.get(0);
            String employeeName = (firstLeave != null && firstLeave.getEmployee() != null)
                ? firstLeave.getEmployee().getFirstname() + " " + firstLeave.getEmployee().getLastname()
                : "Employee";

            Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
            Paragraph title = new Paragraph("Leave Report for " + employeeName, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph("From: " + fromDate + "  To: " + toDate));
            document.add(new Paragraph("Generated On: " + LocalDate.now()));
            document.add(Chunk.NEWLINE);

            // 🧾 Simple table: Leave Type, From, To, Days, Status
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);

            Stream.of("Leave Type", "From Date", "To Date", "Days", "Status")
                    .forEach(header -> {
                        PdfPCell cell = new PdfPCell(new Phrase(header));
                        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
                        table.addCell(cell);
                    });

            for (Leave leave : leaves) {
                table.addCell(leave.getLeaveType() != null ? leave.getLeaveType() : "-");
                table.addCell(leave.getLeaveFromDate() != null ? leave.getLeaveFromDate().toString() : "-");
                table.addCell(leave.getLeaveToDate() != null ? leave.getLeaveToDate().toString() : "-");
                table.addCell(leave.getLeaveType() != null ? leave.getLeaveType() : "-");
                table.addCell(leave.getLeaveStatus() != null ? leave.getLeaveStatus() : "-");
            }

            document.add(table);
            document.close();

        } catch (Exception e) {
            e.printStackTrace();
            try {
                response.reset();
                response.setContentType("text/plain");
                response.getWriter().write("Failed to generate Leave PDF: " + e.getMessage());
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }
    @PostMapping("/admin/reject/{leaveId}")
    @ResponseBody
    public ResponseEntity<?> rejectLeave(@PathVariable Long leaveId) {
        try {
            leaveService.rejectLeave(leaveId);
            return ResponseEntity.ok("✅ Leave rejected and attendance fixed");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body("❌ Failed to reject leave: " + e.getMessage());
        }
    }
}
