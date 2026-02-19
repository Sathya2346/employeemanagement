package com.example.employeemanagement.controller;

import java.time.LocalDate;
import java.util.List;
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
    public ResponseEntity<?> saveLeave(@RequestBody Leave leave, org.springframework.security.core.Authentication authentication) {
        // IDOR Check: Ensure logged-in user matches the leave employee
        if (authentication != null) {
             String loggedInUsername = authentication.getName();
             boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
             
             if (!isAdmin) {
                 // If user is not admin, we must force the employee to be the logged-in user
                 // Or verify the ID matches
                 Employee loggedInEmp = employeeService.findByEmail(loggedInUsername);
                 if (loggedInEmp != null) {
                     leave.setEmployee(loggedInEmp);
                     leave.setEmployeeName(loggedInEmp.getFirstname() + " " + loggedInEmp.getLastname());
                 }
             }
        }
        
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
    public ResponseEntity<?> getLeavesByEmployee(@PathVariable Long empId, 
            org.springframework.security.core.Authentication authentication) {
        if (!isAuthorized(empId, authentication)) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        try {
            List<Leave> leaves = leaveService.getLeavesByEmployeeId(empId);
            return ResponseEntity.ok(leaves);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error fetching leaves: " + e.getMessage());
        }
    }

    @GetMapping("/balance/{empId}")
    @ResponseBody
    public ResponseEntity<?> getLeaveBalance(@PathVariable Long empId, 
            org.springframework.security.core.Authentication authentication) {
        if (!isAuthorized(empId, authentication)) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
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
    public String showUserLeavePage(@PathVariable Long empId, Model model, 
            org.springframework.security.core.Authentication authentication) {
        
        if (!isAuthorized(empId, authentication)) {
            return "redirect:/login?error=Unauthorized"; // Or error page
        }
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

    @PostMapping("/applyLeave")
    @ResponseBody
    public ResponseEntity<?> applyLeave(@RequestBody Map<String, Object> payload) {
        try {
            // Securely get the logged-in employee
            String username = ((org.springframework.security.core.userdetails.UserDetails) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
            Employee employee = employeeService.findByEmail(username); 

            if (employee == null) {
                 return ResponseEntity.badRequest().body("❌ Logged-in employee not found.");
            }
            
            // Remove the insecure ID lookup from payload
            // Long empId = Long.valueOf(empMap.get("id").toString()); ...

            Leave leave = new Leave();
            leave.setEmployee(employee);
            leave.setEmployeeName(employee.getFirstname() + " " + employee.getLastname());
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
            response.put("employeeName", employee.getFirstname() + " " + employee.getLastname());
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
            notification.setEmployeeName(employee.getFirstname() + " " + employee.getLastname());
            notification.setLeaveType(savedLeave.getLeaveType());
            notification.setLeaveFromDate(savedLeave.getLeaveFromDate().toString());
            notification.setLeaveToDate(savedLeave.getLeaveToDate().toString());
            notification.setLeaveStatus(savedLeave.getLeaveStatus());
            notification.setMessage(employee.getFirstname() + " " + employee.getLastname() + " applied for " + savedLeave.getLeaveType());
            notificationService.sendNotification(notification);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("❌ Failed to apply leave: " + e.getMessage());
        }
    }

    @PostMapping("/admin/reject/{leaveId}")
    @ResponseBody
    public ResponseEntity<?> rejectLeave(@PathVariable Long leaveId, org.springframework.security.core.Authentication authentication) {
        // Explicit Admin Check
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        if (!isAdmin) {
             return ResponseEntity.status(403).body("❌ Unauthorized: Only Admins can reject leaves.");
        }

        try {
            leaveService.rejectLeave(leaveId);
            return ResponseEntity.ok("✅ Leave rejected and attendance fixed");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body("❌ Failed to reject leave: " + e.getMessage());
        }
    }

    // Helper method for IDOR protection
    private boolean isAuthorized(Long employeeId, org.springframework.security.core.Authentication authentication) {
        if (authentication == null) return false;
        
        // Admin can access everything
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return true;

        // User must match the requested employeeId
        String loggedInUsername = authentication.getName();
        Employee emp = employeeService.getEmployeeById(employeeId);
        if (emp == null) return false;

        return emp.getUsername().equals(loggedInUsername) || emp.getEmail().equals(loggedInUsername);
    }
}
