package com.example.employeemanagement.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
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
import com.example.employeemanagement.repository.EmployeeRepository;

import com.example.employeemanagement.service.AttendanceService;
import com.example.employeemanagement.util.AppConstants;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*") // Allow all origins — safe for dev; restrict later for production
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;



    @Autowired
    private EmployeeRepository employeeRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // ✅ 1. Save or Update Attendance
    @PostMapping("/save/{employeeId}")
    public ResponseEntity<?> saveAttendance(
            @PathVariable Long employeeId,
            @RequestBody Attendance attendanceData,
            org.springframework.security.core.Authentication authentication) {
        
        // IDOR CHECK
        if (!isAuthorized(employeeId, authentication)) {
            return ResponseEntity.status(403).body("Unauthorized access to this employee's data");
        }
        try {
            // Default date if missing
            if (attendanceData.getAttendanceDate() == null) {
                attendanceData.setAttendanceDate(LocalDate.now(AppConstants.IST));
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
            @RequestParam("date") String date,
            org.springframework.security.core.Authentication authentication) {
        
        if (!isAuthorized(employeeId, authentication)) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
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
            @RequestParam("to") String toDate,
            org.springframework.security.core.Authentication authentication) {
        
        if (!isAuthorized(employeeId, authentication)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).body(List.of());
        }
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
    public ResponseEntity<List<Attendance>> getLastFiveDaysAttendance(@PathVariable Long employeeId,
            org.springframework.security.core.Authentication authentication) {

        if (!isAuthorized(employeeId, authentication)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).body(List.of());
        }
        try {
            LocalDate today = LocalDate.now(AppConstants.IST);
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

    // Helper method for IDOR protection
    private boolean isAuthorized(Long employeeId, org.springframework.security.core.Authentication authentication) {
        if (authentication == null) return false;
        
        // Admin can access everything
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return true;

        // User must match the requested employeeId
        String loggedInUsername = authentication.getName();
        return employeeRepository.findById(employeeId)
                .map(emp -> emp.getUsername().equals(loggedInUsername) || emp.getEmail().equals(loggedInUsername))
                .orElse(false);
    }
}