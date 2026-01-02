package com.example.employeemanagement.controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.employeemanagement.model.Leave;
import com.example.employeemanagement.model.Notification;
import com.example.employeemanagement.repository.LeaveRepository;
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
@RequestMapping("/admin/leave")
public class AdminLeaveController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private NotificationService notificationService;

    // ✅ Admin Leave Page
    @GetMapping
    public String showAdminLeavePage() {
        return "admin/leave";
    }

    // ✅ Filter Leaves (by name, employeeId, or date range)
    @GetMapping("/filter")
        @ResponseBody
        public List<Leave> filterLeaves(
                @RequestParam(required = false) String name,
                @RequestParam(required = false) Long employeeId,
                @RequestParam(required = false) String from,
                @RequestParam(required = false) String to) {

            if (employeeId != null && from != null && to != null) {
                return leaveService.getLeavesByMultipleEmployeesAndDateRange(
                        List.of(employeeId),
                        LocalDate.parse(from),
                        LocalDate.parse(to)
                );
            }
            if (name != null && !name.isEmpty()) {
                return leaveService.getLeavesByEmployeeName(name);
            }
            if (from != null && to != null) {
                return leaveService.getLeavesByDateRange(LocalDate.parse(from), LocalDate.parse(to));
            }
            return leaveService.getAllLeaves();
        }

        // ✅ Download PDF Report
        @GetMapping("/download/pdf")
        public void downloadLeaveReport(
                @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
                @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
                @RequestParam(value = "name", required = false) String name,
                @RequestParam(value = "status", required = false) String status,
                HttpServletResponse response) {

            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "attachment; filename=LeaveReport.pdf");

            try (var outputStream = response.getOutputStream()) {
                List<Leave> leaves = leaveService.filterLeaves(name, status, fromDate, toDate);

                Document document = new Document(PageSize.A4);
                PdfWriter.getInstance(document, outputStream);
                document.open();

                // ✅ Title
                Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
                Paragraph title = new Paragraph("Employee Leave Report", titleFont);
                title.setAlignment(Element.ALIGN_CENTER);
                document.add(title);
                document.add(new Paragraph(" "));
                document.add(new Paragraph("From: " + fromDate + "  To: " + toDate));
                document.add(new Paragraph("Generated On: " + LocalDate.now()));
                document.add(Chunk.NEWLINE);

                // ✅ Table Setup
                PdfPTable table = new PdfPTable(6);
                table.setWidthPercentage(100);
                table.setSpacingBefore(10f);
                table.setSpacingAfter(10f);

                Stream.of("Employee Name", "Leave Type", "From Date", "To Date", "Status", "Reason")
                        .forEach(headerTitle -> {
                            PdfPCell header = new PdfPCell();
                            header.setBackgroundColor(BaseColor.LIGHT_GRAY);
                            header.setBorderWidth(2);
                            header.setPhrase(new Phrase(headerTitle));
                            table.addCell(header);
                        });

                // ✅ Fill Table
                for (Leave leave : leaves) {
                    String empName = "N/A";
                    try {
                        if (leave.getEmployee() != null && leave.getEmployee().getFirstname() != null) {
                            empName = leave.getEmployee().getFirstname() + " " + 
                                    (leave.getEmployee().getLastname() != null ? leave.getEmployee().getLastname() : "");
                        } else if (leave.getEmployeeName() != null) {
                            empName = leave.getEmployeeName();
                        }
                    } catch (Exception e) {
                        empName = "N/A";
                    }

                    table.addCell(empName);
                    table.addCell(leave.getLeaveType() != null ? leave.getLeaveType() : "-");
                    table.addCell(leave.getLeaveFromDate() != null ? leave.getLeaveFromDate().toString() : "-");
                    table.addCell(leave.getLeaveToDate() != null ? leave.getLeaveToDate().toString() : "-");
                    table.addCell(leave.getLeaveStatus() != null ? leave.getLeaveStatus() : "-");
                    table.addCell(leave.getReason() != null ? leave.getReason() : "-");
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
    // ✅ Update Leave Status (Approve / Reject)
    @PostMapping("/update-status/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateLeaveStatus(
            @PathVariable Long id,
            @RequestParam String status,
            org.springframework.security.core.Authentication auth) {

        Optional<Leave> optionalLeave = leaveRepository.findById(id);

        if (optionalLeave.isPresent()) {
            Leave leave = optionalLeave.get();
            // ✅ Get logged-in admin/manager name
            String managerName = (auth != null) ? auth.getName() : "Manager";
            leave.setLeaveStatus(status);
            leave.setLeaveApprovedBy(managerName);
            leaveRepository.save(leave);

            // ✅ Return leave days when Rejected
            if ("Rejected".equalsIgnoreCase(status)) {
                leaveService.returnLeaveDaysToBalance(leave);
            }

            // ✅ REMOVE OLD PENDING NOTIFICATION
            notificationService.removePendingLeaveNotification(leave.getId());

            // ✅ CREATE NEW NOTIFICATION FOR APPROVED/REJECTED
            Notification notification = new Notification();
            notification.setType("Leave");
            notification.setReferenceId(leave.getId());
            notification.setEmployeeName(leave.getEmployeeName());
            notification.setLeaveType(leave.getLeaveType());
            notification.setLeaveFromDate(String.valueOf(leave.getLeaveFromDate()));
            notification.setLeaveToDate(String.valueOf(leave.getLeaveToDate()));
            notification.setLeaveStatus(leave.getLeaveStatus());
            notification.setReadStatus(false);
            notification.setCreatedAt(java.time.LocalDateTime.now());

            if ("Approved".equalsIgnoreCase(status)) {
                notification.setMessage("✅ Your leave from " + leave.getLeaveFromDate() + 
                                        " to " + leave.getLeaveToDate() +  " has been approved by " + managerName + ".");
            } else if ("Rejected".equalsIgnoreCase(status)) {
                notification.setMessage("❌ Your leave from " + leave.getLeaveFromDate() + 
                                        " to " + leave.getLeaveToDate() + " has been rejected by " + managerName + ".");
            }

            notificationService.sendNotification(notification);

            return ResponseEntity.ok(Map.of(
                    "message", "Leave status updated to " + status,
                    "leaveId", leave.getId(),
                    "employeeId", (leave.getEmployee() != null ? leave.getEmployee().getId() : null),
                    "leaveStatus", leave.getLeaveStatus(),
                    "leaveApprovedBy", leave.getLeaveApprovedBy(),
                    "leaveFromDate", String.valueOf(leave.getLeaveFromDate())
            ));
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Leave not found"));
}

    // ✅ Delete Leave
    @DeleteMapping("/delete/{id}")
    @ResponseBody
    public ResponseEntity<Map<String, String>> deleteLeave(@PathVariable Long id) {
    try{
        if (leaveRepository.existsById(id)) {
            Leave leave = leaveRepository.findById(id).orElse(null);
            if (leave != null) {
                leave.setEmployee(null); // ✅ detach to avoid FK constraint
                leaveRepository.save(leave);
                leaveRepository.delete(leave);
            }

            return ResponseEntity.ok(Map.of("message", "Leave deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Leave not found"));
    }
    catch (Exception e) {
        e.printStackTrace(); // debug cause
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "❌ Failed to delete leave: " + e.getMessage()));
    }
    }
    @GetMapping("/summary")
    @ResponseBody
    public Map<String, Long> getSummary() {
        long total = leaveRepository.count();
        long approved = leaveRepository.findByLeaveStatus("Approved").size();
        long pending = leaveRepository.findByLeaveStatus("Pending").size();
        long rejected = leaveRepository.findByLeaveStatus("Rejected").size();

        return Map.of(
            "total", total,
            "approved", approved,
            "pending", pending,
            "rejected", rejected
        );
    }
}