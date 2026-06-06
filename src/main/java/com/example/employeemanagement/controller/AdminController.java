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

    @Autowired
    private com.example.employeemanagement.service.NotificationService notificationService;

    // ===================== LOGIN PAGE =====================
    @GetMapping({"/", "/login"})
    public String loginPage() {
        System.out.println("DEBUG: Login page requested");
        return "login";
    }

    @GetMapping("/redirectAfterLogin")
    public String redirectAfterLogin(Authentication authentication, HttpSession session, Model model) {
        if (authentication == null) return "redirect:/login";
        
        String username = authentication.getName();
        java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities = authentication.getAuthorities();

        System.out.println("Login Success: User=" + username + " Authorities=" + authorities);

        // --- 1. Check for ADMIN role ---
        boolean isAdmin = authorities.stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));

        if (isAdmin) {
            session.setAttribute("userType", "admin");
            session.setAttribute("username", username);
            System.out.println("Redirecting Admin to dashboard");
            return "redirect:/admin/dashboard";
        }

        // --- 2. Check for USER role (Employee) ---
        boolean isUser = authorities.stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_USER") || 
                               a.getAuthority().equalsIgnoreCase("ROLE_EMPLOYEE"));

        if (isUser) {
            Employee employee = employeeRepo.findByUsername(username)
                    .or(() -> employeeRepo.findByEmail(username))
                    .orElse(null);

            if (employee == null) {
                System.err.println("Authenticated employee not found in DB: " + username);
                return "redirect:/login?error=true";
            }

            session.setAttribute("employeeId", employee.getId());
            session.setAttribute("email", employee.getEmail());
            session.setAttribute("username", employee.getUsername());
            session.setAttribute("userType", "user");

            System.out.println("User Context: ID=" + employee.getId() + " Status=" + employee.getOverallStatus());

            // Check onboarding status
            if (!"FULLY_APPROVED".equals(employee.getOverallStatus())) {
                System.out.println("Onboarding incomplete. Redirecting to form. Status: " + employee.getOverallStatus());
                return "redirect:/user/onboarding";
            }

            System.out.println("Onboarding complete. Redirecting to Dashboard ID: " + employee.getId());
            return "redirect:/user/userDashboard/" + employee.getId();
        }

        // Unrecognized role
        System.err.println("Unrecognized role for user: " + username + ". Authorities: " + authorities);
        model.addAttribute("error", "Unauthorized role access. Please contact administrator.");
        return "login";
    }

    // ===================== ADMIN DASHBOARD =====================
    @GetMapping("/admin/dashboard")
    public String dashboard(Model model) {
        holidayService.initializeDefaultHolidays();

        List<Employee> allEmployees = employeeService.getAllEmployees();
        List<Employee> employees = allEmployees.stream()
                .filter(e -> "FULLY_APPROVED".equals(e.getOverallStatus()))
                .collect(Collectors.toList());
        model.addAttribute("totalEmployees", employees.size());

        long maleCount   = employees.stream().filter(emp -> "Male".equalsIgnoreCase(emp.getGender())).count();
        long femaleCount = employees.stream().filter(emp -> "Female".equalsIgnoreCase(emp.getGender())).count();
        model.addAttribute("maleCount", maleCount);
        model.addAttribute("femaleCount", femaleCount);

        LocalDate today = LocalDate.now();
        List<Attendance> todayAttendance = attendanceService.getAttendanceByDate(today);
        long present = todayAttendance.stream().filter(att -> "Present".equalsIgnoreCase(att.getStatus())).count();
        model.addAttribute("attenPresent", present);
        model.addAttribute("attenAbsent", employees.size() - present);

        // ✅ Pending onboarding count (DETAILS_SUBMITTED or CHANGES_REQUESTED)
        long pendingOnboardingCount = allEmployees.stream()
                .filter(e -> "DETAILS_SUBMITTED".equals(e.getOverallStatus())
                          || "CHANGES_REQUESTED".equals(e.getOverallStatus()))
                .count();
        model.addAttribute("pendingOnboardingCount", pendingOnboardingCount);

        return "admin/dashboard";
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

        long totalEmployees = employeeService.getAllEmployees().stream()
                .filter(e -> "FULLY_APPROVED".equals(e.getOverallStatus()))
                .count();

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

    // ===================== UNREAD NOTIFICATIONS COUNT API =====================
    @GetMapping("/notification/unread/count")
    @ResponseBody
    public Map<String, Object> getUnreadCount(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        if (authentication == null) {
            response.put("count", 0);
            return response;
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));

        if (isAdmin) {
            response.put("count", notificationService.countUnreadForAdmin());
        } else {
            response.put("count", notificationService.countUnreadByUsername(authentication.getName()));
        }
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
