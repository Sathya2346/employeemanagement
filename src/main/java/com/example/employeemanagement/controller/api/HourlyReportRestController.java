package com.example.employeemanagement.controller.api;

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
import com.example.employeemanagement.model.HourlyReport;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.HourlyReportRepository;

@RestController
@RequestMapping("/api/hourly-reports")
@CrossOrigin(origins = "*")
public class HourlyReportRestController {

    @Autowired
    private HourlyReportRepository hourlyReportRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @PostMapping({"/submit", "/save"})
    public ResponseEntity<?> submitHourlyReports(@RequestBody Map<String, Object> payload) {
        try {
            Long employeeId = payload.get("employeeId") != null ? Long.valueOf(payload.get("employeeId").toString()) : null;
            @SuppressWarnings("unchecked")
            List<Map<String, String>> reportsList = (List<Map<String, String>>) payload.get("reports");

            Employee emp = null;
            if (employeeId != null) {
                emp = employeeRepository.findById(employeeId).orElse(null);
            }

            if (reportsList != null) {
                for (Map<String, String> item : reportsList) {
                    HourlyReport report = new HourlyReport();
                    report.setTimeSlot(item.get("timeSlot"));
                    report.setTaskDescription(item.get("taskDescription"));
                    report.setStatus(item.getOrDefault("status", "In Progress"));
                    if (emp != null) {
                        report.setEmployee(emp);
                        report.setEmployeeName(emp.getFirstname() + " " + emp.getLastname());
                    }
                    hourlyReportRepository.save(report);
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Hourly reports saved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Error saving hourly reports: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<HourlyReport>> getEmployeeReports(@PathVariable Long employeeId) {
        List<HourlyReport> list = hourlyReportRepository.findByEmployee_Id(employeeId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/all")
    public ResponseEntity<List<HourlyReport>> getAllReports() {
        List<HourlyReport> list = hourlyReportRepository.findAll();
        return ResponseEntity.ok(list);
    }
}
