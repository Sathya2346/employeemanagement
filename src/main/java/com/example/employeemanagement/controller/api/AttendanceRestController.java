package com.example.employeemanagement.controller.api;

import java.time.LocalDate;
import java.time.LocalTime;

import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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
import com.example.employeemanagement.repository.AttendanceRepository;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceRestController {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @GetMapping("/today/{employeeId}")
    public ResponseEntity<Attendance> getTodayAttendance(@PathVariable Long employeeId) {
        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
        Attendance att = attendanceService.getByDate(employeeId, today).orElse(null);
        if (att == null) {
            return ResponseEntity.ok(null);
        }
        return ResponseEntity.ok(att);
    }

    @PostMapping("/check-in/{employeeId}")
    public ResponseEntity<Attendance> checkIn(@PathVariable Long employeeId) {
        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
        LocalTime now = LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"));
        String timeStr = now.format(DateTimeFormatter.ofPattern("HH:mm:ss"));

        Attendance att = attendanceService.getByDate(employeeId, today).orElseGet(() -> {
            Attendance newAtt = new Attendance();
            newAtt.setAttendanceDate(today);
            Employee emp = employeeRepository.findById(employeeId).orElse(null);
            if (emp != null) {
                newAtt.setUsername(emp.getUsername());
            }
            return newAtt;
        });

        if (att.getCheckInTime() == null) {
            att.setCheckInTime(now);
            att.setStatus("Working");
            att = attendanceService.saveAttendance(employeeId, att);
        }

        return ResponseEntity.ok(att);
    }

    @PostMapping("/check-out/{employeeId}")
    public ResponseEntity<Attendance> checkOut(@PathVariable Long employeeId) {
        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
        LocalTime now = LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"));

        Attendance att = attendanceService.getByDate(employeeId, today).orElse(null);
        if (att != null && att.getCheckInTime() != null && att.getCheckOutTime() == null) {
            att.setCheckOutTime(now);
            att.setStatus("Checked Out");
            att = attendanceService.saveAttendance(employeeId, att);
        }

        return ResponseEntity.ok(att);
    }

    @GetMapping("/range/{employeeId}")
    public ResponseEntity<List<Attendance>> getRange(
            @PathVariable Long employeeId,
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        List<Attendance> list = attendanceService.getByDateRange(employeeId, from, to);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/save/{employeeId}")
    public ResponseEntity<?> saveAttendance(
            @PathVariable Long employeeId,
            @RequestBody Attendance attendanceData) {
        try {
            if (attendanceData.getAttendanceDate() == null) {
                attendanceData.setAttendanceDate(LocalDate.now(java.time.ZoneId.of("Asia/Kolkata")));
            }
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

    @GetMapping("/last5/{employeeId}")
    public ResponseEntity<List<Attendance>> getLastFiveDaysAttendance(@PathVariable Long employeeId) {
        try {
            com.example.employeemanagement.model.Employee employee = employeeRepository.findById(employeeId).orElse(null);
            LocalDate joiningDate = (employee != null && employee.getCompanyDetails() != null) ? employee.getCompanyDetails().getJoiningDate() : null;

            LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
            LocalDate fiveDaysAgo = today.minusDays(4);
            LocalDate startRange = (joiningDate != null && joiningDate.isAfter(fiveDaysAgo)) ? joiningDate : fiveDaysAgo;

            if (startRange.isAfter(today)) {
                return ResponseEntity.ok(List.of());
            }

            List<Attendance> records = attendanceService.getByDateRange(employeeId, startRange, today);
            if (records == null) records = new java.util.ArrayList<>();
            
            if (joiningDate != null) {
                final LocalDate doj = joiningDate;
                records = records.stream()
                        .filter(r -> r.getAttendanceDate() != null && !r.getAttendanceDate().isBefore(doj))
                        .collect(java.util.stream.Collectors.toList());
            }

            java.util.Map<LocalDate, Attendance> recordMap = records.stream()
                    .collect(java.util.stream.Collectors.toMap(Attendance::getAttendanceDate, a -> a, (a1, a2) -> a1));
            
            for (LocalDate d = startRange; !d.isAfter(today); d = d.plusDays(1)) {
                recordMap.computeIfAbsent(d, date -> {
                    Attendance abs = new Attendance();
                    abs.setAttendanceDate(date);
                    abs.setStatus("Absent");
                    return abs;
                });
            }
            List<Attendance> finalList = new java.util.ArrayList<>(recordMap.values());
            finalList.sort(java.util.Comparator.comparing(Attendance::getAttendanceDate));
            return ResponseEntity.ok(finalList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    @PostMapping("/break/start")
    public ResponseEntity<String> breakStart(@RequestBody java.util.Map<String, String> body) {
        attendanceService.startBreak(body.get("time"));
        return ResponseEntity.ok("Break Start Recorded");
    }

    @PostMapping("/break/end")
    public ResponseEntity<String> breakEnd(@RequestBody java.util.Map<String, String> body) {
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
}
