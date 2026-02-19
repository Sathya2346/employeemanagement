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
    public String showUserDashboard(@PathVariable Long id, Model model, java.security.Principal principal) {
        Employee emp = employeeService.getEmployeeById(id);
        String loggedInUsername = principal.getName();
        
        // IDOR Check
        if (emp != null && (emp.getUsername().equals(loggedInUsername) || emp.getEmail().equals(loggedInUsername))) {
            model.addAttribute("employee", emp);
            model.addAttribute("companyDetails", emp.getCompanyDetails());
            return "user/userDashboard";
        }
        return "redirect:/access-denied"; // Or redirect to their own dashboard
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
        if (emp == null || !(emp.getUsername().equals(loggedInUsername) || emp.getEmail().equals(loggedInUsername))) {
             return "redirect:/access-denied";
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
        if (emp == null || !(emp.getUsername().equals(loggedInUsername) || emp.getEmail().equals(loggedInUsername))) {
             return "redirect:/access-denied";
        }
        model.addAttribute("employee", emp);
        return "user/userProfile";
    }
}
