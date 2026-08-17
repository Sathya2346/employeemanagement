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
import com.example.employeemanagement.repository.LeaveRepository;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = "*")
public class LeaveRestController {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping("/all")
    public ResponseEntity<List<Leave>> getAllLeaves() {
        List<Leave> list = leaveRepository.findAll();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/userLeave/{employeeId}")
    public ResponseEntity<List<Leave>> getUserLeaves(@PathVariable Long employeeId) {
        List<Leave> list = leaveRepository.findByEmployeeId(employeeId);
        return ResponseEntity.ok(list);
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
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", "Employee ID is required.");
                return ResponseEntity.badRequest().body(err);
            }

            Employee emp = employeeRepository.findById(employeeId).orElse(null);
            if (emp == null) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", "Employee not found.");
                return ResponseEntity.badRequest().body(err);
            }

            Leave leave = new Leave();
            leave.setEmployee(emp);
            leave.setEmployeeName(emp.getFirstname() + " " + emp.getLastname());
            leave.setLeaveType(leaveType);
            if (fromDateStr != null) leave.setLeaveFromDate(LocalDate.parse(fromDateStr));
            if (toDateStr != null) leave.setLeaveToDate(LocalDate.parse(toDateStr));
            leave.setReason(reason);
            leave.setLeaveStatus("Pending");
            leave.setLeaveAppliedDate(LocalDate.now());

            Leave saved = leaveRepository.save(leave);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Leave application submitted successfully");
            response.put("leave", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Failed to apply leave: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<?> approveLeave(@PathVariable Long id) {
        Leave leave = leaveRepository.findById(id).orElse(null);
        if (leave == null) {
            return ResponseEntity.notFound().build();
        }
        leave.setLeaveStatus("Approved");
        leaveRepository.save(leave);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Leave approved successfully");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<?> rejectLeave(@PathVariable Long id) {
        Leave leave = leaveRepository.findById(id).orElse(null);
        if (leave == null) {
            return ResponseEntity.notFound().build();
        }
        leave.setLeaveStatus("Rejected");
        leaveRepository.save(leave);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Leave rejected successfully");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/cancel/{id}")
    public ResponseEntity<?> cancelLeave(@PathVariable Long id) {
        Leave leave = leaveRepository.findById(id).orElse(null);
        if (leave == null) {
            return ResponseEntity.notFound().build();
        }
        leave.setLeaveStatus("Cancelled");
        leaveRepository.save(leave);

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("message", "Leave cancelled successfully");
        return ResponseEntity.ok(res);
    }
}
