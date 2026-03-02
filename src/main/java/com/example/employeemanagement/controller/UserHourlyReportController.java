package com.example.employeemanagement.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.HourlyReport;
import com.example.employeemanagement.service.EmployeeService;
import com.example.employeemanagement.service.HourlyReportService;

import jakarta.servlet.http.HttpSession;

@Controller
@RequestMapping("/user")
public class UserHourlyReportController {

    @Autowired
    private HourlyReportService hourlyReportService;

    @Autowired
    private EmployeeService employeeService;

    // ✅ Save reports (AJAX)
    @PostMapping("/submitHourlyReports")
    @ResponseBody
    public ResponseEntity<?> submitHourlyReports(@RequestBody List<HourlyReport> reports, java.security.Principal principal) {
        try {
            String username = principal.getName();
            Employee loggedInEmployee = employeeService.findByEmail(username); 
            // Handle if findByEmail returns null (lookup by username)
            if (loggedInEmployee == null) {
                 loggedInEmployee = employeeService.findByUsername(username);
            }
            if (loggedInEmployee == null) {
                 return ResponseEntity.status(401).body("User not found");
            }

            for (HourlyReport report : reports) {
                // FORCE OVERRIDE
                report.setEmployee(loggedInEmployee);
                report.setEmployeeName(loggedInEmployee.getFirstname() + " " + loggedInEmployee.getLastname());
                // We ignore the employeeId sent from frontend
            }

            hourlyReportService.saveAll(reports);
            return ResponseEntity.ok("Reports saved successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error saving reports");
        }
    }

    // ✅ View report page (for specific employee)
    @GetMapping("/hourlyReport/{id}")
    public String showHourlyReportPage(@PathVariable Long id, Model model, java.security.Principal principal) {
        Employee employee = employeeService.getEmployeeById(id);
        
        // IDOR Check: Ensure the logged-in user matches the requested employee ID
        if (employee == null || 
           (!employee.getEmail().equals(principal.getName()) && !employee.getUsername().equals(principal.getName()))) {
             return "redirect:/login?error=Unauthorized";
        }
        
        model.addAttribute("employee", employee);
        return "user/userHourlyReport";
    }

    // ✅ View report page (for logged-in user)
    @GetMapping("/hourlyReport")
    public String showHourlyReportForm(Model model, HttpSession session) {
        Integer employeeId = (Integer) session.getAttribute("employeeId");
        if (employeeId == null) {
            return "redirect:/login";
        }

        Employee employee = employeeService.getEmployeeById(employeeId.longValue());
        model.addAttribute("employee", employee);
        return "user/userHourlyReport";
    }

    // ✅ Global filter (not per employee)
    @GetMapping("/filter")
    @ResponseBody
    public List<HourlyReport> filterReports(
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String timeSlot,
            @RequestParam(required = false) String status,
            java.security.Principal principal) {
            
        // SECURITY: Normal users shouldn't access global filter. Redirect to their own filter.
        Employee loggedInEmployee = employeeService.findByEmail(principal.getName());
        if (loggedInEmployee != null) {
            return hourlyReportService.filterReportsForEmployee(loggedInEmployee.getId(), fromDate, toDate, timeSlot, status);
        }
        
        return new java.util.ArrayList<>();
    }

    // ✅ Per employee filter (used by user dashboard)
    @GetMapping("/hourlyReports/filter/{employeeId}")
    @ResponseBody
    public ResponseEntity<?> filterReportsForEmployee(
            @PathVariable Long employeeId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String timeSlot,
            @RequestParam(required = false) String status,
            org.springframework.security.core.Authentication authentication) {
            
        // IDOR Check
        boolean isAuthorized = false;
        if (authentication != null) {
            String loggedInUsername = authentication.getName();
            Employee emp = employeeService.getEmployeeById(employeeId);
            if (emp != null && (emp.getUsername().equals(loggedInUsername) || emp.getEmail().equals(loggedInUsername))) {
                isAuthorized = true;
            }
        }
        
        if (!isAuthorized) {
             return ResponseEntity.status(403).body("Unauthorized");
        }
        
        return ResponseEntity.ok(hourlyReportService.filterReportsForEmployee(employeeId, fromDate, toDate, timeSlot, status));
    }
}
