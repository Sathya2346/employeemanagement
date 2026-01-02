package com.example.employeemanagement.controller;

import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.AttendanceReportService;
import com.example.employeemanagement.service.AttendanceService;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*") // Allow all origins — safe for dev; restrict later for production
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AttendanceReportService attendanceReportService;

    @Autowired
    private EmployeeRepository employeeRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ✅ 1. Save or Update Attendance
    @PostMapping("/save/{employeeId}")
    public ResponseEntity<?> saveAttendance(
            @PathVariable Long employeeId,
            @RequestBody Attendance attendanceData) {
        try {
            // Default date if missing
            if (attendanceData.getAttendanceDate() == null) {
                attendanceData.setAttendanceDate(LocalDate.now());
            }

            // Ensure valid times (ignore "--:--" or nulls)
            if (attendanceData.getCheckInTime() != null && attendanceData.getCheckInTime().toString().equals("--:--")) {
                attendanceData.setCheckInTime(null);
            }
            if (attendanceData.getCheckOutTime() != null && attendanceData.getCheckOutTime().toString().equals("--:--")) {
                attendanceData.setCheckOutTime(null);
            }

            Attendance saved = attendanceService.saveAttendance(employeeId, attendanceData);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error saving attendance: " + e.getMessage());
        }
    }

    // ✅ 2. Fetch attendance by specific date
    @GetMapping("/date/{employeeId}")
    public ResponseEntity<?> getAttendanceByDate(
            @PathVariable Long employeeId,
            @RequestParam("date") String date) {
        try {
            LocalDate targetDate = LocalDate.parse(date, DATE_FORMATTER);
            Optional<Attendance> recordOpt = attendanceService.getByDate(employeeId, targetDate);

            return ResponseEntity.ok(recordOpt.map(List::of).orElse(List.of()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(List.of());
        }
    }

    // ✅ 3. Fetch attendance by date range (for reports / PDF)
    @GetMapping("/range/{employeeId}")
    public ResponseEntity<List<Attendance>> getAttendanceByRange(
            @PathVariable Long employeeId,
            @RequestParam("from") String fromDate,
            @RequestParam("to") String toDate) {
        try {
            LocalDate from = LocalDate.parse(fromDate, DATE_FORMATTER);
            LocalDate to = LocalDate.parse(toDate, DATE_FORMATTER);

            List<Attendance> records = attendanceService.getByDateRange(employeeId, from, to);
            return ResponseEntity.ok(records);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    // ✅ 4. Get last 5 days attendance (auto mark Absent)
    @GetMapping("/last5/{employeeId}")
    public ResponseEntity<List<Attendance>> getLastFiveDaysAttendance(@PathVariable Long employeeId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDate fiveDaysAgo = today.minusDays(4);

            List<Attendance> records = attendanceService.getByDateRange(employeeId, fiveDaysAgo, today);
            if (records == null) records = new ArrayList<>();

            // Map existing dates
            Map<LocalDate, Attendance> recordMap = records.stream()
                    .collect(Collectors.toMap(Attendance::getAttendanceDate, a -> a, (a1, a2) -> a1));

            // Add missing days as Absent (not saved to DB)
            for (int i = 0; i < 5; i++) {
                LocalDate d = fiveDaysAgo.plusDays(i);
                recordMap.computeIfAbsent(d, date -> {
                    Attendance abs = new Attendance();
                    abs.setAttendanceDate(date);
                    abs.setStatus("Absent");
                    return abs;
                });
            }

            // Sort and return
            List<Attendance> finalList = new ArrayList<>(recordMap.values());
            finalList.sort(Comparator.comparing(Attendance::getAttendanceDate));
            return ResponseEntity.ok(finalList);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(List.of());
        }
    }
    @GetMapping("/attendance/download/{employeeId}")
    public ResponseEntity<byte[]> downloadAttendanceReport(
            @PathVariable Long employeeId,
            @RequestParam String from,
            @RequestParam String to) {

        List<Attendance> attendanceList = attendanceService.getByDateRange(employeeId, LocalDate.parse(from), LocalDate.parse(to));
        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));

        ByteArrayInputStream bis = attendanceReportService.generateAttendanceReport(attendanceList, employee.getUsername(), from, to);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=Attendance_Report_" + from + "_to_" + to + ".pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(bis.readAllBytes());
    }

    @PostMapping("/idle/start")
    public ResponseEntity<String> idleStart(@RequestBody Map<String, String> body) {
        attendanceService.startIdle(body.get("time"));
        return ResponseEntity.ok("Idle Start Recorded");
    }

    @PostMapping("/idle/end")
    public ResponseEntity<String> idleEnd(@RequestBody Map<String, String> body) {
        attendanceService.endIdle(body.get("time"));
        return ResponseEntity.ok("Idle End Recorded");
    }
}