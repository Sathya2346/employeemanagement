package com.example.employeemanagement.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.MeetingSession;
import com.example.employeemanagement.repository.AttendanceRepository;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.MeetingSessionRepository;
import com.example.employeemanagement.repository.LeaveRepository;

import jakarta.servlet.http.HttpSession;

import com.example.employeemanagement.util.AppConstants;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private static final ZoneId IST = AppConstants.IST;
    private static final int GRACE_MINUTES = 10;


    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MeetingSessionRepository meetingSessionRepository;

    // ===============================
    // SHIFT TIMINGS (UNCHANGED)
    // ===============================
    private LocalTime getShiftStart(String shift) {
        if (shift == null) return LocalTime.of(9, 0);
        
        shift = shift.trim();
        if (shift.startsWith(AppConstants.SHIFT_MORNING)) return LocalTime.of(9, 0);
        if (shift.startsWith(AppConstants.SHIFT_GENERAL)) return LocalTime.of(10, 0);
        if (shift.startsWith(AppConstants.SHIFT_EVENING)) return LocalTime.of(14, 0);
        if (shift.startsWith(AppConstants.SHIFT_NIGHT)) return LocalTime.of(22, 0);
        
        return LocalTime.of(9, 0);
    }

    private LocalTime getShiftEnd(String shift) {
        if (shift == null) return LocalTime.of(18, 0);

        shift = shift.trim();
        if (shift.startsWith(AppConstants.SHIFT_MORNING)) return LocalTime.of(18, 0);
        if (shift.startsWith(AppConstants.SHIFT_GENERAL)) return LocalTime.of(19, 0);
        if (shift.startsWith(AppConstants.SHIFT_EVENING)) return LocalTime.of(23, 0);
        if (shift.startsWith(AppConstants.SHIFT_NIGHT)) return LocalTime.of(6, 0);
        
        return LocalTime.of(18, 0);
    }

    // ===============================
    // SAVE / UPDATE ATTENDANCE
    // ===============================
    @Override
    public Attendance saveAttendance(Long employeeId, Attendance attendanceData) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        LocalDate attendanceDate = Optional.ofNullable(attendanceData.getAttendanceDate())
                .orElse(LocalDate.now(IST));

        // Automatically cancel any pending/approved leaves for this date
        leaveService.cancelLeaveDueToCheckIn(employee, attendanceDate);

        Attendance attendance = attendanceRepository
                .findByEmployee_IdAndAttendanceDate(employeeId, attendanceDate)
                .orElseGet(Attendance::new);

        attendance.setEmployee(employee);
        attendance.setUsername(employee.getUsername());
        attendance.setAttendanceDate(attendanceDate);
        attendance.setLeaveApproved(false);

        LocalTime checkIn = attendanceData.getCheckInTime();
        LocalTime checkOut = attendanceData.getCheckOutTime();
        LocalTime breakStart = attendanceData.getBreakStart();
        LocalTime breakEnd = attendanceData.getBreakEnd();
        long idleMinutes = attendanceData.getIdleTime() != null ? attendanceData.getIdleTime() : 0;

        if (checkIn != null) {
            attendance.setCheckInTime(checkIn);
        }
        if (checkOut != null) {
            attendance.setCheckOutTime(checkOut);
        }
        if (breakStart != null) {
            attendance.setBreakStart(breakStart);
        }
        if (breakEnd != null) {
            attendance.setBreakEnd(breakEnd);
        }
        if (attendanceData.getIdleTime() != null) {
            attendance.setIdleTime(idleMinutes);
        }

        // ===============================
        // BREAK TIME (UNCHANGED)
        // ===============================
        long breakMinutes = 0;
        if (breakStart != null && breakEnd != null) {
            breakMinutes = Duration.between(breakStart, breakEnd).toMinutes();
        }
        attendance.setTotalBreakTime(breakMinutes);

        // ===============================
        // WORK TIME (Night Shift Rollover Safe)
        // ===============================
        long workMinutes = 0;
        if (checkIn != null && checkOut != null) {
            long totalMinutes = Duration.between(checkIn, checkOut).toMinutes();
            if (checkOut.isBefore(checkIn)) {
                totalMinutes += 1440; // Add 24 hours in minutes for overnight rollover
            }
            workMinutes = totalMinutes - breakMinutes - idleMinutes;
            workMinutes = Math.max(workMinutes, 0);
        }
        attendance.setTotalWorkTime(workMinutes);

        // ===============================
        // SHIFT HOURS
        // ===============================
        String shift = employee.getCompanyDetails() != null ? employee.getCompanyDetails().getShiftTiming() : AppConstants.SHIFT_MORNING;
        LocalTime officeStart = getShiftStart(shift);
        LocalTime officeEnd = getShiftEnd(shift);

        long fullWorkMinutes;
        if (officeEnd.isAfter(officeStart)) {
            fullWorkMinutes = Duration.between(officeStart, officeEnd).toMinutes() - 60;
        } else {
            fullWorkMinutes =
                    Duration.between(officeStart, LocalTime.MAX).toMinutes()
                            + Duration.between(LocalTime.MIN, officeEnd).toMinutes() - 60;
        }

        // ===============================
        // STATUS (UNCHANGED BASE)
        // ===============================
        // ===============================
        // STATUS LOGIC (Fixing BUG-07: <4 hours = Absent)
        // ===============================
        if (Boolean.TRUE.equals(attendance.getLeaveApproved())) {
            attendance.setStatus("Leave");
        } else if (checkIn == null) {
            attendance.setStatus("Absent");
        } else {
            if (workMinutes >= fullWorkMinutes && fullWorkMinutes > 0) {
                attendance.setStatus("Present");
            } else {
                attendance.setStatus("Partial");
            }
        }

        // ===============================
        // ===============================
        // LATE / EARLY CHECK-IN (SHIFT + GRACE SAFE)
        // ===============================
        long lateMinutes = 0;
        long earlyInMinutes = 0;
        boolean earlyIn = false;
        if (checkIn != null) {
            if (officeEnd.isAfter(officeStart)) {
                // Standard Day Shift
                if (checkIn.isAfter(officeStart)) {
                    lateMinutes = Duration.between(officeStart, checkIn).toMinutes();
                } else if (checkIn.isBefore(officeStart)) {
                    earlyIn = true;
                    earlyInMinutes = Duration.between(checkIn, officeStart).toMinutes();
                }
            } else {
                // Night Shift Rollover
                LocalTime adjCheckIn =
                        checkIn.isBefore(officeStart.minusHours(12)) ? checkIn.plusHours(24) : checkIn;
                if (adjCheckIn.isAfter(officeStart)) {
                    lateMinutes = Duration.between(officeStart, adjCheckIn).toMinutes();
                } else if (adjCheckIn.isBefore(officeStart)) {
                    earlyIn = true;
                    earlyInMinutes = Duration.between(adjCheckIn, officeStart).toMinutes();
                }
            }
        }

        attendance.setLateMinutes(lateMinutes);
        attendance.setEarlyInMinutes(earlyInMinutes);
        attendance.setLateCheckIn(lateMinutes > 0);
        attendance.setEarlyCheckIn(earlyIn);
        attendance.setEarlyIn(earlyIn);
        attendance.setLateIn(lateMinutes > GRACE_MINUTES);

        // ===============================
        // EARLY / LATE CHECK-OUT (NIGHT SAFE)
        // ===============================
        boolean earlyOut = false;
        boolean lateOut = false;

        if (checkOut != null) {
            if (officeEnd.isAfter(officeStart)) {
                earlyOut = checkOut.isBefore(officeEnd);
                lateOut = checkOut.isAfter(officeEnd);
            } else {
                LocalTime adjOut =
                        checkOut.isBefore(officeStart.minusHours(12)) ? checkOut.plusHours(24) : checkOut;
                LocalTime adjEnd = officeEnd.isBefore(officeStart) ? officeEnd.plusHours(24) : officeEnd;
                earlyOut = adjOut.isBefore(adjEnd);
                lateOut = adjOut.isAfter(adjEnd);
            }
        }

        attendance.setEarlyCheckOut(earlyOut);
        attendance.setEarlyOut(earlyOut);
        attendance.setLateCheckOut(lateOut);

        // ===============================
        // EARLY LEAVE MINUTES (UNCHANGED)
        // ===============================
        long earlyLeaveMinutes = 0;
        if (earlyOut && checkOut != null) {
            if (officeEnd.isAfter(officeStart)) {
                earlyLeaveMinutes = Duration.between(checkOut, officeEnd).toMinutes();
            } else {
                LocalTime adjOut =
                        checkOut.isBefore(officeStart.minusHours(12)) ? checkOut.plusHours(24) : checkOut;
                LocalTime adjEnd = officeEnd.isBefore(officeStart) ? officeEnd.plusHours(24) : officeEnd;
                earlyLeaveMinutes = Duration.between(adjOut, adjEnd).toMinutes();
            }
        }
        attendance.setEarlyLeaveMinutes(earlyLeaveMinutes);

        // ===============================
        // ACTIVITY STATUS & NOTIFICATIONS
        // ===============================
        if (checkOut != null) {
            employee.setActivityStatus("Idle");
            notificationService.sendAdminNotification(
                "Check-Out: " + employee.getFirstname(),
                employee.getFirstname() + " has checked out at " + checkOut,
                "Attendance",
                attendance.getId()
            );
        } else if (checkIn != null) {
            employee.setActivityStatus("Working");
            notificationService.sendAdminNotification(
                "Check-In: " + employee.getFirstname(),
                employee.getFirstname() + " has checked in at " + checkIn,
                "Attendance",
                attendance.getId()
            );
        }

        employeeRepository.save(employee);
        return attendanceRepository.save(attendance);
    }

    // ===============================
    // FETCH METHODS (UNCHANGED)
    // ===============================
    @Override
    public List<Attendance> getAttendanceByEmployee(Long employeeId) {
        return attendanceRepository.findByEmployee_Id(employeeId);
    }

    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    @Override
    public Optional<Attendance> getByDate(Long employeeId, LocalDate date) {
        return attendanceRepository.findByEmployee_IdAndAttendanceDate(employeeId, date);
    }

    @Override
    public List<Attendance> getByDateRange(Long employeeId, LocalDate from, LocalDate to) {
        return attendanceRepository.findByEmployee_IdAndAttendanceDateBetween(employeeId, from, to);
    }

    @Override
    public List<Attendance> findByEmployeeId(Long employeeId) {
        return attendanceRepository.findByEmployee_Id(employeeId);
    }

    @Override
    public List<Attendance> findByEmployeeIdAndDateRange(Long employeeId, LocalDate fromDate, LocalDate toDate) {
        return attendanceRepository.findByEmployee_IdAndAttendanceDateBetween(employeeId, fromDate, toDate);
    }

    @Override
    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByAttendanceDate(date);
    }

    @Override
    public List<Attendance> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByAttendanceDateBetween(startDate, endDate);
    }

    // ===============================
    // AUTO ABSENT (UNCHANGED)
    // ===============================
    @Autowired
    private HolidayService holidayService;

    @Scheduled(cron = "0 59 23 * * *")
    public void markAbsentForUnCheckedInUsers() {

        LocalDate today = LocalDate.now(IST);
        
        // ✅ Real-world logic: Don't mark absent on holidays or weekends
        if (!holidayService.isWorkingDay(today)) {
            return;
        }

        List<Employee> allEmployees = employeeRepository.findAll();

        for (Employee employee : allEmployees) {
            LocalDate joiningDate = (employee.getCompanyDetails() != null) ? employee.getCompanyDetails().getJoiningDate() : null;
            if (joiningDate != null && today.isBefore(joiningDate)) {
                continue; // Do not mark absent before employee's joining date
            }

            Optional<Attendance> existing =
                    attendanceRepository.findByEmployeeAndAttendanceDate(employee, today);

            if (existing.isPresent()) {
                String status = existing.get().getStatus();
                if ("Present".equalsIgnoreCase(status) || "Partial".equalsIgnoreCase(status) || "Leave".equalsIgnoreCase(status)) {
                    continue;
                }
            }

            if (existing.isEmpty()) {
                // Fail-safe: Check if they are on approved leave
                boolean onLeave = leaveRepository.isEmployeeOnLeave(employee.getId(), today);
                
                Attendance record = new Attendance();
                record.setEmployee(employee);
                record.setUsername(employee.getUsername());
                record.setAttendanceDate(today);
                record.setTotalWorkTime(0L);
                record.setTotalBreakTime(0L);
                record.setIdleTime(0L);

                if (onLeave) {
                    record.setStatus("Leave");
                    record.setLeaveApproved(true);
                } else {
                    record.setStatus("Absent");
                }
                
                attendanceRepository.save(record);
            }
        }
    }

    // ===============================
    // IDLE TIME (UNCHANGED)
    // ===============================
    private final Map<Long, LocalDateTime> lastIdleStartMap = new HashMap<>();

    private Employee getLoggedInEmployee() {
        try {
            org.springframework.web.context.request.ServletRequestAttributes attr = 
                (org.springframework.web.context.request.ServletRequestAttributes) 
                org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
            if (attr != null && attr.getRequest() != null) {
                jakarta.servlet.http.HttpSession sessionObj = attr.getRequest().getSession(false);
                if (sessionObj != null) {
                    Long id = (Long) sessionObj.getAttribute("employeeId");
                    if (id != null) {
                        Optional<Employee> empOpt = employeeRepository.findById(id);
                        if (empOpt.isPresent()) return empOpt.get();
                    }
                }
            }
        } catch (Exception ignored) {}

        try {
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                String name = auth.getName();
                Optional<Employee> empOpt = employeeRepository.findByUsername(name);
                if (empOpt.isPresent()) return empOpt.get();
                return employeeRepository.findByEmail(name).orElse(null);
            }
        } catch (Exception ignored) {}

        return null;
    }

    @Override
    public void startIdle(String timeStr) {
        Employee employee = getLoggedInEmployee();
        if (employee == null) return;
        LocalDateTime idleStart = LocalDateTime.parse(timeStr);
        if (!idleStart.toLocalDate().equals(LocalDate.now(IST))) return;
        lastIdleStartMap.put(employee.getId(), idleStart);

        // ✅ Update Activity Status to Idle ONLY if not on Leave, Meeting, or Break
        String currentStatus = employee.getActivityStatus();
        if (!"Leave".equals(currentStatus) && !"Meeting".equals(currentStatus) && !"In Meeting".equals(currentStatus) && !"Break".equals(currentStatus) && !"On Break".equals(currentStatus)) {
            employee.setActivityStatus("Idle");
            employeeRepository.save(employee);
        }
    }

    @Override
    public void endIdle(String timeStr) {
        Employee employee = getLoggedInEmployee();
        if (employee == null) return;
        LocalDateTime lastIdleStart = lastIdleStartMap.get(employee.getId());
        if (lastIdleStart == null) return;

        LocalDateTime idleEnd = LocalDateTime.parse(timeStr);
        if (!idleEnd.toLocalDate().equals(lastIdleStart.toLocalDate())) {
            lastIdleStartMap.remove(employee.getId());
            return;
        }

        long idleMinutes = Duration.between(lastIdleStart, idleEnd).toMinutes();
        if (idleMinutes < 0 || idleMinutes > 720) {
            lastIdleStartMap.remove(employee.getId());
            return;
        }

        // ✅ Only update attendance record IF they have checked in today
        attendanceRepository.findByEmployeeAndAttendanceDate(employee, LocalDate.now(IST))
            .ifPresent(record -> {
                long existingIdle = record.getIdleTime() != null ? record.getIdleTime() : 0;
                record.setIdleTime(existingIdle + idleMinutes);
                attendanceRepository.save(record);

                // ✅ Revert to Working ONLY IF current status was Idle
                if (record.getCheckInTime() != null && record.getCheckOutTime() == null && "Idle".equals(employee.getActivityStatus())) {
                    employee.setActivityStatus("Working");
                    employeeRepository.save(employee);
                }
            });

        lastIdleStartMap.remove(employee.getId());
    }

    @Override
    public void startBreak(String timeStr) {
        Employee employee = getLoggedInEmployee();
        if (employee != null && !"Leave".equals(employee.getActivityStatus())) {
            employee.setActivityStatus("Break");
            employeeRepository.save(employee);
        }

        if (employee != null) {
            attendanceRepository.findByEmployeeAndAttendanceDate(employee, LocalDate.now(IST))
                .ifPresent(record -> {
                    record.setBreakStart(LocalTime.now(IST));
                    record.setBreakEnd(null);
                    attendanceRepository.save(record);
                });
        }
    }

    @Override
    public void endBreak(String timeStr) {
        Employee employee = getLoggedInEmployee();
        if (employee != null && !"Leave".equals(employee.getActivityStatus())) {
            employee.setActivityStatus("Working");
            employeeRepository.save(employee);
        }

        if (employee != null) {
            attendanceRepository.findByEmployeeAndAttendanceDate(employee, LocalDate.now(IST))
                .ifPresent(record -> {
                    if (record.getBreakStart() != null) {
                        LocalTime end = LocalTime.now(IST);
                        record.setBreakEnd(end);
                        long seconds = Duration.between(record.getBreakStart(), end).getSeconds();
                        long mins = Math.max(0, Math.round(seconds / 60.0));
                        if (seconds > 0 && mins == 0) mins = 1;
                        long existingBreak = record.getTotalBreakTime() != null ? record.getTotalBreakTime() : 0;
                        record.setTotalBreakTime(existingBreak + mins);
                    }
                    attendanceRepository.save(record);
                });
        }
    }

    // ===============================
    // MEETING (like Break)
    // ===============================
    @Override
    public void startMeeting() {
        Employee employee = getLoggedInEmployee();
        if (employee != null && !"Leave".equals(employee.getActivityStatus())) {
            employee.setActivityStatus("Meeting");
            employeeRepository.save(employee);
        }

        if (employee != null) {
            attendanceRepository.findByEmployeeAndAttendanceDate(employee, LocalDate.now(IST))
                .ifPresent(record -> {
                    // Close any open session first (safety guard)
                    meetingSessionRepository.findByAttendanceIdAndMeetingEndIsNull(record.getId())
                        .ifPresent(open -> {
                            open.setMeetingEnd(LocalTime.now(IST));
                            long mins = Duration.between(open.getMeetingStart(), open.getMeetingEnd()).toMinutes();
                            open.setDuration(Math.max(mins, 0));
                            meetingSessionRepository.save(open);
                        });

                    MeetingSession session = new MeetingSession();
                    session.setAttendance(record);
                    session.setMeetingStart(LocalTime.now(IST));
                    meetingSessionRepository.save(session);
                });
        }
    }

    @Override
    public void endMeeting() {
        Employee employee = getLoggedInEmployee();
        if (employee != null && !"Leave".equals(employee.getActivityStatus())) {
            employee.setActivityStatus("Working");
            employeeRepository.save(employee);
        }

        if (employee != null) {
            attendanceRepository.findByEmployeeAndAttendanceDate(employee, LocalDate.now(IST))
                .ifPresent(record -> {
                    meetingSessionRepository.findByAttendanceIdAndMeetingEndIsNull(record.getId())
                        .ifPresent(session -> {
                            LocalTime end = LocalTime.now(IST);
                            session.setMeetingEnd(end);
                            long seconds = Duration.between(session.getMeetingStart(), end).getSeconds();
                            long mins = Math.max(0, Math.round(seconds / 60.0));
                            if (seconds > 0 && mins == 0) mins = 1;
                            session.setDuration(mins);
                            meetingSessionRepository.save(session);

                            // Update cumulative meeting time on attendance
                            long existing = record.getTotalMeetingTime() != null ? record.getTotalMeetingTime() : 0;
                            record.setTotalMeetingTime(existing + mins);
                            attendanceRepository.save(record);
                        });
                });
        }
    }

    @Override
    public void startMeetingWithDetails(Long employeeId, String platform, String meetingLink) {
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee != null) {
            employee.setActivityStatus("In Meeting (" + (platform != null ? platform : "Live") + ")");
            employeeRepository.save(employee);

            attendanceRepository.findByEmployeeAndAttendanceDate(employee, LocalDate.now(IST))
                .ifPresent(record -> {
                    // Close any open session first
                    meetingSessionRepository.findByAttendanceIdAndMeetingEndIsNull(record.getId())
                        .ifPresent(open -> {
                            open.setMeetingEnd(LocalTime.now(IST));
                            long mins = Duration.between(open.getMeetingStart(), open.getMeetingEnd()).toMinutes();
                            open.setDuration(Math.max(mins, 0));
                            meetingSessionRepository.save(open);
                        });

                    MeetingSession session = new MeetingSession();
                    session.setAttendance(record);
                    session.setMeetingStart(LocalTime.now(IST));
                    session.setMeetingPlatform(platform != null ? platform : "Manual Meeting");
                    session.setMeetingLink(meetingLink);
                    session.setVerificationStatus("VERIFIED");
                    meetingSessionRepository.save(session);
                });
        }
    }

    @Override
    public void processMeetingHeartbeat(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee != null) {
            attendanceRepository.findByEmployeeAndAttendanceDate(employee, LocalDate.now(IST))
                .ifPresent(record -> {
                    meetingSessionRepository.findByAttendanceIdAndMeetingEndIsNull(record.getId())
                        .ifPresent(session -> {
                            session.setHeartbeatCount(session.getHeartbeatCount() + 1);
                            meetingSessionRepository.save(session);
                        });
                });
        }
    }

    @Override
    public boolean isCheckedInWithoutCheckout(Long employeeId) {
        return attendanceRepository.findByEmployee_IdAndAttendanceDate(employeeId, LocalDate.now(IST))
            .map(a -> a.getCheckInTime() != null && a.getCheckOutTime() == null)
            .orElse(false);
    }
}