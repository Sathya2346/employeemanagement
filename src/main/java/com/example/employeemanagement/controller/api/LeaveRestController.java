package com.example.employeemanagement.controller.api;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Leave;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.LeaveService;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "${app.cors.origins:http://localhost:*}")
public class LeaveRestController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping("/all")
    public ResponseEntity<List<Leave>> getAllLeaves() {
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    @GetMapping("/userLeave/{employeeId}")
    public ResponseEntity<List<Leave>> getUserLeaves(@PathVariable Long employeeId) {
        return ResponseEntity.ok(leaveService.getLeavesByEmployeeId(employeeId));
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyLeave(@RequestBody Map<String, Object> payload) {
        try {
            Long employeeId = payload.get("employeeId") != null ? Long.valueOf(payload.get("employeeId").toString()) : null;
            String leaveType = (String) payload.get("leaveType");
            String fromDateStr = (String) payload.get("fromDate");
            String toDateStr = (String) payload.get("toDate");
            String reason = (String) payload.get("reason");

            if (employeeId == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Employee ID is required."));
            }

            Employee emp = employeeRepository.findById(employeeId).orElse(null);
            if (emp == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Employee not found."));
            }

            Leave leave = new Leave();
            leave.setEmployee(emp);
            leave.setEmployeeName(emp.getFirstname() + " " + emp.getLastname());
            leave.setLeaveType(leaveType);
            if (fromDateStr != null) leave.setLeaveFromDate(LocalDate.parse(fromDateStr));
            if (toDateStr != null) leave.setLeaveToDate(LocalDate.parse(toDateStr));
            leave.setReason(reason);

            // Delegate to service — handles balance deduction, overlap check, working day calc, notifications
            Leave saved = leaveService.saveLeave(leave);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Leave application submitted successfully");
            response.put("leave", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Failed to apply leave: " + e.getMessage()));
        }
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<?> approveLeave(@PathVariable Long id) {
        try {
            Leave leave = leaveService.getLeaveById(id);
            leave.setLeaveStatus("Approved");
            leave.setLeaveApprovedBy("Admin");

            // Mark leave in attendance records
            leaveService.markLeaveInAttendance(leave);

            java.util.Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Leave approved successfully");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<?> rejectLeave(@PathVariable Long id) {
        try {
            leaveService.rejectLeave(id);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Leave rejected and balance restored");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/cancel/{id}")
    public ResponseEntity<?> cancelLeave(@PathVariable Long id) {
        try {
            leaveService.deleteLeave(id);
            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("message", "Leave cancelled and balance restored");
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
