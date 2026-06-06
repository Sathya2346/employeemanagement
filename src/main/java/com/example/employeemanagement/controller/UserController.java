package com.example.employeemanagement.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.service.AttendanceService;
import com.example.employeemanagement.service.EmployeeService;

@Controller
@RequestMapping("/user")
public class UserController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping("/userDashboard/{id}")
    public String showUserDashboard(@PathVariable Long id, Model model, org.springframework.security.core.Authentication authentication) {
        if (authentication == null) return "redirect:/login";
        
        Employee emp = employeeService.getEmployeeById(id);
        String loggedInName = authentication.getName();
        
        // IDOR Check: Authenticated user must match the requested Employee ID records
        if (emp != null && (loggedInName.equalsIgnoreCase(emp.getUsername()) || loggedInName.equalsIgnoreCase(emp.getEmail()))) {
            
            // Ensure embedded objects are initialized to prevent template errors
            if (emp.getCompanyDetails() == null) emp.setCompanyDetails(new com.example.employeemanagement.model.CompanyDetails());
            if (emp.getBankDetails() == null) emp.setBankDetails(new com.example.employeemanagement.model.BankDetails());
            
            boolean pendingCompanyDetails = (emp.getCompanyDetails().getDesignation() == null 
                || emp.getCompanyDetails().getDesignation().trim().isEmpty()
                || emp.getCompanyDetails().getJoiningDate() == null 
                || emp.getCompanyDetails().getShiftTiming() == null 
                || emp.getCompanyDetails().getShiftTiming().trim().isEmpty());
            
            model.addAttribute("employee", emp);
            model.addAttribute("companyDetails", emp.getCompanyDetails());
            model.addAttribute("pendingCompanyDetails", pendingCompanyDetails);
            return "user/userDashboard";
        }
        
        System.err.println("IDOR ACCESS DENIED: User [" + loggedInName + "] attempted to access ID [" + id + "]");
        return "redirect:/login?error=unauthorized";
    }

    @GetMapping("/userAttendance/{id}")
    public String showUserAttendance(
            @PathVariable Long id,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            Model model, java.security.Principal principal) {

        Employee emp = employeeService.getEmployeeById(id);
        String loggedInUsername = principal.getName();
        
        // IDOR Check
        if (emp == null || !(emp.getUsername().equalsIgnoreCase(loggedInUsername) || emp.getEmail().equalsIgnoreCase(loggedInUsername))) {
             System.err.println("Access Denied for user " + loggedInUsername + " trying to access attendance of " + (emp != null ? emp.getUsername() : "null"));
             return "redirect:/login?error=unauthorized";
        }

        // Check if Admin has added Company Details (Shift and Designation)
        if (emp.getCompanyDetails() == null 
                || emp.getCompanyDetails().getDesignation() == null 
                || emp.getCompanyDetails().getDesignation().trim().isEmpty()
                || emp.getCompanyDetails().getJoiningDate() == null 
                || emp.getCompanyDetails().getShiftTiming() == null 
                || emp.getCompanyDetails().getShiftTiming().trim().isEmpty()) {
             System.out.println("Company Details pending for employee " + id + ". Redirecting to dashboard.");
             return "redirect:/user/userDashboard/" + id + "?error=no_company_details";
        }

        model.addAttribute("employee", emp);
        model.addAttribute("companyDetails", emp.getCompanyDetails());

        List<Attendance> attendanceList;

        if (fromDate != null && toDate != null) {
            LocalDate start = LocalDate.parse(fromDate);
            LocalDate end = LocalDate.parse(toDate);
            attendanceList = attendanceService.findByEmployeeIdAndDateRange(id, start, end);
            model.addAttribute("fromDate", start);
            model.addAttribute("toDate", end);
        } else {
            attendanceList = attendanceService.findByEmployeeId(id);
        }

        model.addAttribute("attendanceList", attendanceList);
        return "user/userAttendance";
    }
    @GetMapping("/userProfile/{id}")
    public String showUserProfile(@PathVariable Long id, Model model, java.security.Principal principal) {
        Employee emp = employeeService.getEmployeeById(id);
        String loggedInUsername = principal.getName();
        
        // IDOR Check
        if (emp == null || !(emp.getUsername().equalsIgnoreCase(loggedInUsername) || emp.getEmail().equalsIgnoreCase(loggedInUsername))) {
             System.err.println("Access Denied for user " + loggedInUsername + " trying to access profile of " + (emp != null ? emp.getUsername() : "null"));
             return "redirect:/login?error=unauthorized";
        }

        // Check if Admin has added Company Details (Shift and Designation)
        if (emp.getCompanyDetails() == null 
                || emp.getCompanyDetails().getDesignation() == null 
                || emp.getCompanyDetails().getDesignation().trim().isEmpty()
                || emp.getCompanyDetails().getJoiningDate() == null 
                || emp.getCompanyDetails().getShiftTiming() == null 
                || emp.getCompanyDetails().getShiftTiming().trim().isEmpty()) {
             System.out.println("Company Details pending for employee " + id + ". Redirecting to dashboard.");
             return "redirect:/user/userDashboard/" + id + "?error=no_company_details";
        }

        // Ensure embedded objects are initialized for template safety
        if (emp.getBankDetails() == null) emp.setBankDetails(new com.example.employeemanagement.model.BankDetails());
        
        model.addAttribute("employee", emp);
        return "user/userProfile";
    }
}
