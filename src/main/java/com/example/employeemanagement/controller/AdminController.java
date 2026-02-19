package com.example.employeemanagement.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.example.employeemanagement.model.Attendance;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.AttendanceService;
import com.example.employeemanagement.service.EmployeeService;
import com.example.employeemanagement.service.HolidayService;

import jakarta.servlet.http.HttpSession;

@Controller
public class AdminController {

    @Autowired
    private EmployeeRepository employeeRepo;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private HolidayService holidayService;

    @Autowired
    private AttendanceService attendanceService;


    // ===================== LOGIN PAGE =====================
    @GetMapping({"/", "/login"})
    public String loginPage() {
        return "login";
    }

    @GetMapping("/redirectAfterLogin")
    public String redirectAfterLogin(Authentication authentication, HttpSession session, Model model) {
        String username = authentication.getName();
        
        // --- 1. Check if the authenticated user has the ADMIN role ---
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"))) {

            session.setAttribute("userType", "admin");
            session.setAttribute("username", username); 
            return "redirect:/admin/dashboard";
        
        // --- 2. Check if the authenticated user has the USER role ---
        } else if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_USER"))) {
            
            // For a regular USER, we need to find the Employee object to get the ID for redirection
            Employee employee = employeeRepo.findByUsername(username)
                    .or(() -> employeeRepo.findByEmail(username))
                    .orElse(null);

            if (employee == null) {
                // Should not happen if authentication passed, but for safety
                return "redirect:/login?error=true";
            }

            session.setAttribute("employeeId", employee.getId());
            session.setAttribute("email", employee.getEmail());
            session.setAttribute("userType", "user");
            
            return "redirect:/user/userDashboard/" + employee.getId();
        } else {
            // Unrecognized role
            model.addAttribute("error", "Unauthorized role access.");
            return "login";
        }
    }

    // ===================== ADMIN DASHBOARD =====================
    @GetMapping("/admin/dashboard")
    public String dashboard(HttpSession session, Model model) {
        String userType = (String) session.getAttribute("userType");

        if (userType == null || !"admin".equalsIgnoreCase(userType)) {
            return "redirect:/";
        }

        holidayService.initializeDefaultHolidays();

        long remainingHolidays = holidayService.getRemainingHolidayCount();
        model.addAttribute("remainingHolidays", remainingHolidays);
        model.addAttribute("holidayList", holidayService.getRemainingHolidays());

        List<Employee> employees = employeeService.getAllEmployees();
        model.addAttribute("totalEmployees", employees.size());

        long maleCount = employees.stream()
                .filter(emp -> "Male".equalsIgnoreCase(emp.getGender()))
                .count();
        long femaleCount = employees.stream()
                .filter(emp -> "Female".equalsIgnoreCase(emp.getGender()))
                .count();
        model.addAttribute("maleCount", maleCount);
        model.addAttribute("femaleCount", femaleCount);

        LocalDate today = LocalDate.now();
        List<Attendance> todayAttendance = attendanceService.getAttendanceByDate(today);
        long present = todayAttendance.stream()
                .filter(att -> "Present".equalsIgnoreCase(att.getStatus()))
                .count();
        long absent = employees.size() - present;
        model.addAttribute("attenPresent", present);
        model.addAttribute("attenAbsent", absent);

        return "admin/dashboard"; // ✅ No leading slash
    }

    // ===================== ATTENDANCE SUMMARY API =====================
    @GetMapping("/admin/api/attendanceSummary")
    @ResponseBody
    public Map<String, Object> getAttendanceSummary() {
        Map<String, Object> response = new HashMap<>();

        LocalDate today = LocalDate.now();
        List<String> days = new java.util.ArrayList<>();
        List<Integer> presentList = new java.util.ArrayList<>();
        List<Integer> absentList = new java.util.ArrayList<>();

        // ✅ Optimized: Fetch all 7 days in ONE query
        LocalDate startDate = today.minusDays(6);
        List<Attendance> weeklyAttendance = attendanceService.getAttendanceByDateRange(startDate, today);

        // Group by Date for fast lookup
        Map<LocalDate, List<Attendance>> attendanceMap = weeklyAttendance.stream()
                .collect(Collectors.groupingBy(Attendance::getAttendanceDate));

        long totalEmployees = employeeService.getAllEmployees().size();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dayName = date.getDayOfWeek().name().substring(0, 3).toUpperCase(); 
            days.add(dayName);

            List<Attendance> dailyRecords = attendanceMap.getOrDefault(date, new ArrayList<>());
            
            long present = dailyRecords.stream()
                    .filter(a -> "Present".equalsIgnoreCase(a.getStatus()))
                    .count();

            long absent = totalEmployees - present;

            presentList.add((int) present);
            absentList.add((int) absent);
        }

        // ✅ Ensure the order is Sunday → Monday
        List<String> orderedDays = List.of("SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT");
        List<Integer> orderedPresent = new java.util.ArrayList<>();
        List<Integer> orderedAbsent = new java.util.ArrayList<>();

        for (String day : orderedDays) {
            int index = days.indexOf(day);
            if (index != -1) {
                orderedPresent.add(presentList.get(index));
                orderedAbsent.add(absentList.get(index));
            } else {
                orderedPresent.add(0);
                orderedAbsent.add(0);
            }
        }

        response.put("days", orderedDays);
        response.put("present", orderedPresent);
        response.put("absent", orderedAbsent);

        return response;
    }

    // ===================== LOGOUT =====================
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

    // ===================== PASSWORD RECOVERY =====================
    @GetMapping("/forgot-password")
    public String forgotPasswordPage() {
        return "forgot-password";
    }

    @PostMapping("/forgot-password")
    public String sendOtp(@RequestParam String email, Model model) {
        try {
            employeeService.sendOtp(email);
            model.addAttribute("email", email);
            model.addAttribute("message", "OTP sent to your email.");
            return "verify-otp";
        } catch (Exception e) {
            model.addAttribute("error", e.getMessage());
            return "forgot-password";
        }
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam String email,
                            @RequestParam String otp,
                            Model model) {
        if (employeeService.verifyOtp(email, otp)) {
            model.addAttribute("email", email);
            return "reset-password";
        }
        model.addAttribute("email", email);
        model.addAttribute("error", "Invalid or expired OTP.");
        return "verify-otp";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestParam String email,
                                @RequestParam String password,
                                Model model) {
        try {
            employeeService.changePassword(email, password);
            model.addAttribute("message", "Password changed successfully. Please login.");
            return "login";
        } catch (Exception e) {
            model.addAttribute("email", email);
            model.addAttribute("error", e.getMessage());
            return "reset-password";
        }
    }
}