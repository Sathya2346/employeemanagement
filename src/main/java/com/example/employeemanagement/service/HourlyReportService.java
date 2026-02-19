package com.example.employeemanagement.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.HourlyReport;
import com.example.employeemanagement.repository.HourlyReportRepository;
import com.example.employeemanagement.util.AppConstants;

@Service
public class HourlyReportService {

    @Autowired
    private HourlyReportRepository repository;

    @Autowired
    private EmployeeService employeeService;

    public List<HourlyReport> getReportsByEmployeeId(Long employeeId) {
        return repository.findByEmployee_Id(employeeId);
    }

    public void saveAll(List<HourlyReport> reports) {
        for (HourlyReport r : reports) {
            // Ensure proper Employee mapping
            if (r.getEmployee() == null && r.getEmployeeName() != null && r.getEmployeeName().trim().length() > 0) {
                // Optional: infer employee from name, but better if frontend sends employeeId
            }

            // 🔹 FIX: frontend sends employeeId in JSON, so we manually attach Employee
            if (r.getEmployee() == null && r.getEmployeeId() != null) {
                Employee emp = employeeService.getEmployeeById(Long.parseLong(r.getEmployeeId()));
                r.setEmployee(emp);
                r.setEmployeeName(emp.getFirstname() + " " + emp.getLastname());
            }

            if (r.getCreatedAt() == null) {
                r.setCreatedAt(LocalDateTime.now(AppConstants.IST));
            }
        }
        repository.saveAll(reports);
    }



    // ✅ Helper: String → LocalDateTime
    private LocalDateTime parseDate(String date, boolean endOfDay) {
        if (date == null || date.isEmpty()) return null;
        LocalDate d = LocalDate.parse(date);
        return endOfDay ? d.atTime(23, 59, 59) : d.atStartOfDay();
    }

    // ✅ Global filter
    public List<HourlyReport> filterReports(String fromDate, String toDate, String timeSlot, String status) {
        LocalDateTime from = parseDate(fromDate, false);
        LocalDateTime to = parseDate(toDate, true);
        return repository.filterReports(from, to, timeSlot, status);
    }

    // ✅ Per employee filter
    public List<HourlyReport> filterReportsForEmployee(Long employeeId, String fromDate, String toDate, String timeSlot, String status) {
        LocalDateTime from = parseDate(fromDate, false);
        LocalDateTime to = parseDate(toDate, true);
        List<HourlyReport> result = repository.filterReportsForEmployee(employeeId, from, to, timeSlot, status);

        System.out.println("🔍 Filter result for EmpID " + employeeId + " => " + result.size() + " records");
        return result;
    }
}
