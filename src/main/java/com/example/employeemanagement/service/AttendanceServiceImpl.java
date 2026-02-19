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
import com.example.employeemanagement.repository.AttendanceRepository;
import com.example.employeemanagement.repository.EmployeeRepository;

import jakarta.servlet.http.HttpSession;

import com.example.employeemanagement.util.AppConstants;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private static final ZoneId IST = AppConstants.IST;
    private static final int GRACE_MINUTES = 10;

    @Autowired
    private HttpSession session;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

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

        Attendance attendance = attendanceRepository
                .findByEmployee_IdAndAttendanceDate(employeeId, attendanceDate)
                .orElseGet(Attendance::new);

        attendance.setEmployee(employee);
        attendance.setUsername(employee.getUsername());
        attendance.setAttendanceDate(attendanceDate);

        if (Boolean.TRUE.equals(attendance.getLeaveApproved())) {
            throw new RuntimeException("Cannot check-in: Leave is approved for today!");
        }

        LocalTime checkIn = attendanceData.getCheckInTime();
        LocalTime checkOut = attendanceData.getCheckOutTime();
        LocalTime breakStart = attendanceData.getBreakStart();
        LocalTime breakEnd = attendanceData.getBreakEnd();
        long idleMinutes = attendanceData.getIdleTime() != null ? attendanceData.getIdleTime() : 0;

        attendance.setCheckInTime(checkIn);
        attendance.setCheckOutTime(checkOut);
        attendance.setBreakStart(breakStart);
        attendance.setBreakEnd(breakEnd);
        attendance.setIdleTime(idleMinutes);

        // ===============================
        // BREAK TIME (UNCHANGED)
        // ===============================
        long breakMinutes = 0;
        if (breakStart != null && breakEnd != null) {
            breakMinutes = Duration.between(breakStart, breakEnd).toMinutes();
        }
        attendance.setTotalBreakTime(breakMinutes);

        // ===============================
        // WORK TIME (UNCHANGED)
        // ===============================
        long workMinutes = 0;
        if (checkIn != null && checkOut != null) {
            workMinutes = Duration.between(checkIn, checkOut).toMinutes()
                    - breakMinutes - idleMinutes;
            workMinutes = Math.max(workMinutes, 0);
        }
        attendance.setTotalWorkTime(workMinutes);

        // ===============================
        // SHIFT HOURS
        // ===============================
        String shift = employee.getCompanyDetails().getShiftTiming();
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
        } else {
            // Check for Half Day (e.g. 4 hours = 240 mins)
            if (workMinutes < 240) {
                attendance.setStatus("Absent");
            } else if (workMinutes < fullWorkMinutes) {
                attendance.setStatus("Partial");
            } else {
                attendance.setStatus("Present");
            }
        }

        // ===============================
        // LATE CHECK-IN (SHIFT + GRACE SAFE)
        // ===============================
        long lateMinutes = 0;
        if (checkIn != null) {
            if (officeEnd.isAfter(officeStart)) {
                if (checkIn.isAfter(officeStart)) {
                    lateMinutes = Duration.between(officeStart, checkIn).toMinutes();
                }
            } else {
                LocalTime adjCheckIn =
                        checkIn.isBefore(officeStart) ? checkIn.plusHours(24) : checkIn;
                if (adjCheckIn.isAfter(officeStart)) {
                    lateMinutes = Duration.between(officeStart, adjCheckIn).toMinutes();
                }
            }
        }

        attendance.setLateMinutes(lateMinutes);
        attendance.setLateCheckIn(lateMinutes > 0);
        attendance.setLateIn(lateMinutes > GRACE_MINUTES);

        // ===============================
        // EARLY / LATE CHECK-OUT (NIGHT SAFE)
        // ===============================
        boolean earlyOut = false;

        if (checkOut != null) {
            if (officeEnd.isAfter(officeStart)) {
                earlyOut = checkOut.isBefore(officeEnd);
                attendance.setLateCheckOut(checkOut.isAfter(officeEnd));
            } else {
                LocalTime adjOut =
                        checkOut.isBefore(officeStart) ? checkOut.plusHours(24) : checkOut;
                LocalTime adjEnd = officeEnd.plusHours(24);
                earlyOut = adjOut.isBefore(adjEnd);
                attendance.setLateCheckOut(adjOut.isAfter(adjEnd));
            }
        }

        attendance.setEarlyCheckOut(earlyOut);
        attendance.setEarlyOut(earlyOut);

        // ===============================
        // EARLY LEAVE MINUTES (UNCHANGED)
        // ===============================
        long earlyLeaveMinutes = 0;
        if (earlyOut && checkOut != null) {
            if (officeEnd.isAfter(officeStart)) {
                earlyLeaveMinutes = Duration.between(checkOut, officeEnd).toMinutes();
            } else {
                LocalTime adjOut =
                        checkOut.isBefore(officeStart) ? checkOut.plusHours(24) : checkOut;
                LocalTime adjEnd = officeEnd.plusHours(24);
                earlyLeaveMinutes = Duration.between(adjOut, adjEnd).toMinutes();
            }
        }
        attendance.setEarlyLeaveMinutes(earlyLeaveMinutes);

        // ===============================
        // STATUS DOWNGRADE (HR CORRECT)
        // ===============================
        if ("Present".equals(attendance.getStatus())
                && (attendance.getLateIn() || earlyLeaveMinutes > 0)) {
            attendance.setStatus("Partial");
        }

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
    private com.example.employeemanagement.repository.LeaveRepository leaveRepository;

    @Scheduled(cron = "0 59 23 * * *")
    public void markAbsentForUnCheckedInUsers() {

        LocalDate today = LocalDate.now(IST);
        List<Employee> allEmployees = employeeRepository.findAll();

        for (Employee employee : allEmployees) {

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
        Long id = (Long) session.getAttribute("employeeId");
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee Not Found in Session"));
    }

    @Override
    public void startIdle(String timeStr) {
        Employee employee = getLoggedInEmployee();
        LocalDateTime idleStart = LocalDateTime.parse(timeStr);
        if (!idleStart.toLocalDate().equals(LocalDate.now(IST))) return;
        lastIdleStartMap.put(employee.getId(), idleStart);
    }

    @Override
    public void endIdle(String timeStr) {
        Employee employee = getLoggedInEmployee();
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

        Attendance record = attendanceRepository
                .findByEmployeeAndAttendanceDate(employee, LocalDate.now(IST))
                .orElseThrow();

        long existingIdle = record.getIdleTime() != null ? record.getIdleTime() : 0;
        record.setIdleTime(existingIdle + idleMinutes);

        attendanceRepository.save(record);
        lastIdleStartMap.remove(employee.getId());
    }
}