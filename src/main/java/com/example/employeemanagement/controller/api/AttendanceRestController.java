package com.example.employeemanagement.controller.api;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @Autowired
    private com.example.employeemanagement.repository.AuditRepository auditRepository;

    @Autowired
    private com.example.employeemanagement.repository.NotificationRepository notificationRepository;

    // In-memory Device & IP Anti-Forgery Tracking Map (Key: IP + Device, Value: EmployeeCheck)
    private static final java.util.concurrent.ConcurrentHashMap<String, DeviceCheck> deviceLogMap = new java.util.concurrent.ConcurrentHashMap<>();

    private static class DeviceCheck {
        Long employeeId;
        long timestamp;

        DeviceCheck(Long employeeId, long timestamp) {
            this.employeeId = employeeId;
            this.timestamp = timestamp;
        }
    }

    private void checkForgedDeviceLogin(Long employeeId, jakarta.servlet.http.HttpServletRequest request) {
        if (request == null) return;
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        String deviceId = request.getHeader("X-Device-Fingerprint");
        String key = (ip != null ? ip : "UNKNOWN") + "|" + (deviceId != null ? deviceId : (userAgent != null ? userAgent : "UNKNOWN"));

        long now = System.currentTimeMillis();
        DeviceCheck previous = deviceLogMap.get(key);

        if (previous != null && !previous.employeeId.equals(employeeId) && (now - previous.timestamp) < 120000) {
            // FORGERY ALERT: Different employee checking in from same IP & Device within 2 minutes!
            String warnMsg = "🚨 FORGERY ALERT: Multiple employees (ID " + previous.employeeId + " & ID " + employeeId + ") checking in from same Device/IP (" + ip + ")";

            // 1. Log to AuditLog
            com.example.employeemanagement.model.AuditLog audit = new com.example.employeemanagement.model.AuditLog();
            audit.setEntityName("Attendance");
            audit.setEntityId(String.valueOf(employeeId));
            audit.setAction("FORGERY_ALERT");
            audit.setPerformedBy("System Security Monitor");
            audit.setTimestamp(java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Kolkata")));
            audit.setDetails(warnMsg);
            auditRepository.save(audit);

            // 2. Alert Admin
            com.example.employeemanagement.model.Notification notif = new com.example.employeemanagement.model.Notification();
            notif.setType("FORGERY_ALERT");
            notif.setRecipient("Admin");
            notif.setTitle("🚨 Duplicate Device Forgery Alert");
            notif.setMessage(warnMsg);
            notif.setEmployeeName("Employee #" + employeeId);
            notificationRepository.save(notif);
        }

        deviceLogMap.put(key, new DeviceCheck(employeeId, now));
    }

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
    public ResponseEntity<?> checkIn(@PathVariable Long employeeId, jakarta.servlet.http.HttpServletRequest request) {
        try {
            // Verify employee exists
            Employee emp = employeeRepository.findById(employeeId).orElse(null);
            if (emp == null) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", "Employee not found with id: " + employeeId);
                return ResponseEntity.status(404).body(err);
            }

            checkForgedDeviceLogin(employeeId, request);
            LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
            LocalTime now = LocalTime.now(java.time.ZoneId.of("Asia/Kolkata"));

            Attendance att = attendanceService.getByDate(employeeId, today).orElseGet(() -> {
                Attendance newAtt = new Attendance();
                newAtt.setAttendanceDate(today);
                newAtt.setUsername(emp.getUsername());
                return newAtt;
            });

            if (att.getCheckInTime() == null) {
                att.setCheckInTime(now);
                att.setStatus("Working");
                att = attendanceService.saveAttendance(employeeId, att);
            }

            return ResponseEntity.ok(att);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Check-in failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
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
            Attendance saved = attendanceService.saveAttendance(employeeId, attendanceData, true);
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

    @PostMapping("/meetingin/{employeeId}")
    public ResponseEntity<?> meetingInWithId(@PathVariable Long employeeId, @RequestBody(required = false) java.util.Map<String, String> body, jakarta.servlet.http.HttpServletRequest request) {
        checkForgedDeviceLogin(employeeId, request);
        String platform = body != null ? body.get("platform") : "Manual Meeting";
        String link = body != null ? body.get("meetingLink") : null;
        attendanceService.startMeetingWithDetails(employeeId, platform, link);
        return ResponseEntity.ok(java.util.Map.of("message", "Meeting Started", "platform", platform));
    }

    @PostMapping("/meeting-heartbeat/{employeeId}")
    public ResponseEntity<?> meetingHeartbeat(@PathVariable Long employeeId, jakarta.servlet.http.HttpServletRequest request) {
        // Validate employee exists
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        if (emp == null) {
            return ResponseEntity.status(404).body(java.util.Map.of("success", false, "message", "Employee not found"));
        }

        // Validate employee is actually checked in today
        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
        Attendance att = attendanceService.getByDate(employeeId, today).orElse(null);
        if (att == null || att.getCheckInTime() == null) {
            return ResponseEntity.badRequest().body(java.util.Map.of("success", false, "message", "Employee is not checked in today"));
        }

        checkForgedDeviceLogin(employeeId, request);
        attendanceService.processMeetingHeartbeat(employeeId);
        return ResponseEntity.ok(java.util.Map.of("status", "VERIFIED", "timestamp", System.currentTimeMillis()));
    }

    @PostMapping("/end-meeting/{employeeId}")
    public ResponseEntity<?> endMeetingWithId(@PathVariable Long employeeId) {
        attendanceService.endMeeting();
        return ResponseEntity.ok(java.util.Map.of("message", "Meeting Ended Successfully"));
    }

    // ═══════════════════════════════════════════════════════════════
    // AUTO-DETECT: Unified status reporting from web / desktop / mobile
    // ═══════════════════════════════════════════════════════════════
    @PostMapping("/meeting-status/{employeeId}")
    public ResponseEntity<?> reportMeetingStatus(
            @PathVariable Long employeeId,
            @RequestBody java.util.Map<String, Object> body) {
        String status = (String) body.getOrDefault("status", "unknown");
        String platform = (String) body.getOrDefault("platform", "auto-detect");
        String meetingLink = (String) body.get("meetingLink");

        switch (status.toLowerCase()) {
            case "meeting_started":
            case "in_meeting":
                attendanceService.startMeetingWithDetails(employeeId, platform, meetingLink);
                break;
            case "meeting_ended":
            case "not_in_meeting":
                attendanceService.endMeeting();
                break;
            case "heartbeat":
                attendanceService.processMeetingHeartbeat(employeeId);
                break;
            default:
                return ResponseEntity.badRequest().body(Map.of("error", "Unknown status: " + status));
        }
        return ResponseEntity.ok(Map.of(
            "message", "Status updated",
            "status", status,
            "timestamp", System.currentTimeMillis()
        ));
    }

    // GET current meeting status for a client to poll
    @GetMapping("/meeting-status/{employeeId}")
    public ResponseEntity<?> getMeetingStatus(@PathVariable Long employeeId) {
        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        if (emp == null) return ResponseEntity.notFound().build();

        String activityStatus = emp.getActivityStatus();
        boolean inMeeting = activityStatus != null && (
            activityStatus.contains("Meeting") || activityStatus.contains("In Meeting"));

        // Get last heartbeat info
        LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
        Attendance att = attendanceService.getByDate(employeeId, today).orElse(null);
        long totalMeetingMins = (att != null && att.getTotalMeetingTime() != null) ? att.getTotalMeetingTime() : 0;

        return ResponseEntity.ok(Map.of(
            "employeeId", employeeId,
            "inMeeting", inMeeting,
            "activityStatus", activityStatus != null ? activityStatus : "Unknown",
            "totalMeetingMinutes", totalMeetingMins
        ));
    }

    // ── Admin Rectification Endpoint (Resets Forged Hours & Notifies) ────────
    @PostMapping("/admin/rectify/{attendanceId}")
    public ResponseEntity<?> adminRectifyAttendance(@PathVariable Long attendanceId, @RequestParam(required = false) String reason) {
        return attendanceRepository.findById(attendanceId).map(record -> {
            record.setTotalMeetingTime(0L);
            record.setStatus("FORGERY_REJECTED");
            attendanceRepository.save(record);

            // Audit Log
            com.example.employeemanagement.model.AuditLog audit = new com.example.employeemanagement.model.AuditLog();
            audit.setEntityName("Attendance");
            audit.setEntityId(String.valueOf(attendanceId));
            audit.setAction("ADMIN_RECTIFIED_FORGERY");
            audit.setPerformedBy("Admin");
            audit.setTimestamp(java.time.LocalDateTime.now(java.time.ZoneId.of("Asia/Kolkata")));
            audit.setDetails("Admin rectified attendance record #" + attendanceId + ". Reason: " + (reason != null ? reason : "Proxy Forgery Detected"));
            auditRepository.save(audit);

            return ResponseEntity.ok(java.util.Map.of("status", "RECTIFIED", "message", "Attendance record #" + attendanceId + " successfully reset and marked FORGERY_REJECTED"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
