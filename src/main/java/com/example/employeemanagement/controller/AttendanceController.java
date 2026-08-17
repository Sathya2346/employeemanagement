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

    private LocalDate parseDateFlexible(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) return null;
        dateStr = dateStr.trim();
        String[] formats = {"yyyy-MM-dd", "MM/dd/yyyy", "dd/MM/yyyy", "yyyy/MM/dd", "dd-MM-yyyy", "MM-dd-yyyy"};
        for (String fmt : formats) {
            try {
                return LocalDate.parse(dateStr, DateTimeFormatter.ofPattern(fmt));
            } catch (Exception ignored) {}
        }
        return LocalDate.parse(dateStr);
    }

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
            LocalDate targetDate = parseDateFlexible(date);
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
            LocalDate from = parseDateFlexible(fromDate);
            LocalDate to = parseDateFlexible(toDate);

            com.example.employeemanagement.model.Employee employee = employeeRepository.findById(employeeId).orElse(null);
            LocalDate joiningDate = (employee != null && employee.getCompanyDetails() != null) ? employee.getCompanyDetails().getJoiningDate() : null;
            if (joiningDate != null && from != null && from.isBefore(joiningDate)) {
                from = joiningDate;
            }

            if (from != null && to != null && from.isAfter(to)) {
                return ResponseEntity.ok(List.of());
            }

            List<Attendance> records = attendanceService.getByDateRange(employeeId, from, to);
            return ResponseEntity.ok(records != null ? records : List.of());

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
            com.example.employeemanagement.model.Employee employee = employeeRepository.findById(employeeId).orElse(null);
            LocalDate joiningDate = (employee != null && employee.getCompanyDetails() != null) ? employee.getCompanyDetails().getJoiningDate() : null;

            LocalDate today = LocalDate.now(AppConstants.IST);
            LocalDate fiveDaysAgo = today.minusDays(4);

            // Respect Joining Date: do not display attendance rows before joining date
            LocalDate startRange = fiveDaysAgo;
            if (joiningDate != null && joiningDate.isAfter(fiveDaysAgo)) {
                startRange = joiningDate;
            }

            if (startRange.isAfter(today)) {
                return ResponseEntity.ok(List.of());
            }

            List<Attendance> records = attendanceService.getByDateRange(employeeId, startRange, today);
            if (records == null) records = new ArrayList<>();

            // Filter out any stray records prior to joining date
            if (joiningDate != null) {
                final LocalDate doj = joiningDate;
                records = records.stream()
                        .filter(r -> r.getAttendanceDate() != null && !r.getAttendanceDate().isBefore(doj))
                        .collect(Collectors.toList());
            }

            // Map existing dates
            Map<LocalDate, Attendance> recordMap = records.stream()
                    .collect(Collectors.toMap(Attendance::getAttendanceDate, a -> a, (a1, a2) -> a1));

            // Add missing days as Absent starting from startRange up to today
            for (LocalDate d = startRange; !d.isAfter(today); d = d.plusDays(1)) {
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

    @PostMapping("/break/start")
    public ResponseEntity<String> breakStart(@RequestBody Map<String, String> body) {
        attendanceService.startBreak(body.get("time"));
        return ResponseEntity.ok("Break Start Recorded");
    }

    @PostMapping("/break/end")
    public ResponseEntity<String> breakEnd(@RequestBody Map<String, String> body) {
        attendanceService.endBreak(body.get("time"));
        return ResponseEntity.ok("Break End Recorded");
    }

    @PostMapping("/meeting/start")
    public ResponseEntity<String> meetingStart() {
        attendanceService.startMeeting();
        return ResponseEntity.ok("Meeting Start Recorded");
    }

    @PostMapping("/meeting/end")
    public ResponseEntity<String> meetingEnd() {
        attendanceService.endMeeting();
        return ResponseEntity.ok("Meeting End Recorded");
    }

    // Returns whether the employee is checked in without checkout (for logout guard)
    @GetMapping("/checkin-status/{employeeId}")
    public ResponseEntity<?> getCheckinStatus(
            @PathVariable Long employeeId,
            org.springframework.security.core.Authentication authentication) {
        if (!isAuthorized(employeeId, authentication)) {
            return ResponseEntity.status(403).body(Map.of("error", "Unauthorized"));
        }
        boolean checkedIn = attendanceService.isCheckedInWithoutCheckout(employeeId);
        return ResponseEntity.ok(Map.of("checkedIn", checkedIn));
    }

    // ✅ Returns current activity status for live dashboard badge updates
    @GetMapping("/status/{employeeId}")
    public ResponseEntity<?> getEmployeeActivityStatus(@PathVariable Long employeeId) {
        return employeeRepository.findById(employeeId)
            .map(emp -> ResponseEntity.ok(Map.of(
                "activityStatus", emp.getActivityStatus() != null ? emp.getActivityStatus() : "Working",
                "overallStatus", emp.getOverallStatus() != null ? emp.getOverallStatus() : ""
            )))
            .orElse(ResponseEntity.notFound().build());
    }

    // ✅ 5. Fetch all attendance records (for admin dashboard / list)
    @GetMapping("/all")
    public ResponseEntity<List<Attendance>> getAllAttendance(org.springframework.security.core.Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));
        
        if (!isAdmin) {
             return ResponseEntity.status(403).body(List.of());
        }
        
        try {
            List<Attendance> allRecords = attendanceService.getAllAttendance();
            return ResponseEntity.ok(allRecords);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    // Helper method for IDOR protection
    private boolean isAuthorized(Long employeeId, org.springframework.security.core.Authentication authentication) {
        if (authentication == null) return false;
        
        // Admin can access everything
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));
        if (isAdmin) return true;

        // User must match the requested employeeId
        String loggedInUsername = authentication.getName();
        return employeeRepository.findById(employeeId)
                .map(emp -> (emp.getUsername() != null && emp.getUsername().equalsIgnoreCase(loggedInUsername)) || 
                            (emp.getEmail() != null && emp.getEmail().equalsIgnoreCase(loggedInUsername)))
                .orElse(false);
    }
}