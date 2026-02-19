package com.example.employeemanagement.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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