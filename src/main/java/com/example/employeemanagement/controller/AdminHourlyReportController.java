package com.example.employeemanagement.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.HourlyReport;
import com.example.employeemanagement.service.EmployeeService;
import com.example.employeemanagement.service.HourlyReportService;

@Controller
@RequestMapping("/admin")
public class AdminHourlyReportController {

    @Autowired
    private HourlyReportService hourlyReportService;

    @Autowired
    private EmployeeService employeeService;

    // ✅ Show all employees as cards
    @GetMapping("/hourlyReports")
    public String showEmployeeCards(Model model) {
        List<Employee> employees = employeeService.getAllEmployees();
        model.addAttribute("employees", employees);
        return "admin/adminHourlyReportCards";
    }

    // ✅ Show reports of one employee
    @GetMapping("/hourlyReports/{id}")
    public String viewUserReports(@PathVariable Long id, Model model) {
        Employee employee = employeeService.getEmployeeById(id);
        List<HourlyReport> reports = hourlyReportService.getReportsByEmployeeId(id);
        model.addAttribute("employee", employee);
        model.addAttribute("reports", reports);
        return "admin/adminHourlyReports";
    }

    // ✅ Download reports as PDF


    // ✅ Filter reports per employee (AJAX)
    @GetMapping("/hourlyReports/filter/{employeeId}")
    @ResponseBody
    public List<HourlyReport> filterReportsForEmployeeAdmin(
            @PathVariable Long employeeId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String timeSlot,
            @RequestParam(required = false) String status) {

        return hourlyReportService.filterReportsForEmployee(employeeId, fromDate, toDate, timeSlot, status);
    }
}
