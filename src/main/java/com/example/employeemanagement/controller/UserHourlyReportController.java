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
            // Handle if findByEmail returns null (maybe search by username)
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
    public String showHourlyReportPage(@PathVariable Long id, Model model) {
        Employee employee = employeeService.getEmployeeById(id);
        if (employee == null) {
            return "redirect:/error";
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
            @RequestParam(required = false) String status) {
        return hourlyReportService.filterReports(fromDate, toDate, timeSlot, status);
    }

    // ✅ Per employee filter (used by user dashboard)
    @GetMapping("/hourlyReports/filter/{employeeId}")
    @ResponseBody
    public List<HourlyReport> filterReportsForEmployee(
            @PathVariable Long employeeId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String timeSlot,
            @RequestParam(required = false) String status) {
        return hourlyReportService.filterReportsForEmployee(employeeId, fromDate, toDate, timeSlot, status);
    }
}
