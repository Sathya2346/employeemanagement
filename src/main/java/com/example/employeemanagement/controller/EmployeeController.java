package com.example.employeemanagement.controller;

import java.io.IOException;
import java.util.List;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.example.employeemanagement.model.BankDetails;
import com.example.employeemanagement.model.CompanyDetails;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Leave;
import com.example.employeemanagement.model.Notification;
import com.example.employeemanagement.model.Settings;
import com.example.employeemanagement.repository.NotificationRepository;
import com.example.employeemanagement.repository.SettingsRepository;
import com.example.employeemanagement.service.EmployeeService;
import com.example.employeemanagement.service.NotificationService;
import com.example.employeemanagement.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.validation.BindingResult;

@Controller
@RequestMapping("/admin")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private SettingsRepository settingsRepository;

    @Autowired
    private com.example.employeemanagement.repository.ShiftTimingRepository shiftTimingRepository;

    // ✅ 2. Add new employee form
    @GetMapping("/add")
    public String addEmployeeForm(Model model) {
        // Create new Employee
        Employee employee = new Employee();

        // Initialize embedded objects
        employee.setCompanyDetails(new CompanyDetails());
        employee.setBankDetails(new BankDetails());

        model.addAttribute("employee", employee);
        return "admin/addEmployee";
    }

    // Alias mapping for /addEmployee to support navigation links
    @GetMapping("/addEmployee")
    public String addEmployeeFormAlias(Model model) {
        return addEmployeeForm(model);
    }

    // ✅ 3. Save new employee
    @PostMapping("/save")
    public String saveEmployee(@Valid @ModelAttribute Employee employee,
                               BindingResult bindingResult,
                               @RequestParam(value = "profileFile", required = false) MultipartFile file,
                               Model model) throws IOException{
        
        // Validate DOJ >= DOB + 18 only if both are provided
        if (employee.getDateOfBirth() != null && employee.getCompanyDetails() != null && employee.getCompanyDetails().getJoiningDate() != null) {
            if (employee.getCompanyDetails().getJoiningDate().isBefore(employee.getDateOfBirth().plusYears(18))) {
                bindingResult.rejectValue("companyDetails.joiningDate", "error.joiningDate", "Joining date must be at least 18 years after Date of Birth");
            }
        }

        if (bindingResult.hasErrors()) {
             System.out.println("Validation errors: " + bindingResult.getAllErrors());
             return "admin/addEmployee"; 
        }

        if(file != null && !file.isEmpty()){
            employee.setProfile(file.getBytes());
        }
        
        // Set default role if not provided
        if (employee.getUserType() == null || employee.getUserType().isEmpty()) {
            employee.setUserType("ROLE_USER");
        }
        // Auto-generate a secure random password (admin does not set it)
        String rawPassword = generateAutoPassword();
        employee.setPassword(rawPassword);
        employee.setOverallStatus("PENDING");

        Settings settings = settingsRepository.findById("default").orElseGet(() -> {
            Settings ds = new Settings();
            return settingsRepository.save(ds);
        });
        employee.setPaidLeaveBalance(settings.getInitialPaidLeave());
        employee.setSickLeaveBalance(settings.getInitialSickLeave());
        employee.setCasualLeaveBalance(settings.getInitialCasualLeave());
        employee.setTotalLeaves(settings.getInitialPaidLeave() + settings.getInitialSickLeave() + settings.getInitialCasualLeave());
        employee.setLeaveBalance(employee.getTotalLeaves());

        try {
            employeeService.saveEmployee(employee);
            employeeService.sendWelcomeEmail(employee.getEmail(), employee.getUsername(), rawPassword);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            model.addAttribute("errorMessage", "Email or Username already exists!");
            model.addAttribute("employee", employee);
            return "admin/addEmployee";
        }

        return "redirect:/admin/profile";
    }

    /** Generates an 8-character alphanumeric password */
    private String generateAutoPassword() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
        java.util.Random rnd = new java.util.Random();
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }

    // ✅ 4. Show employee details page (edit form)
    @GetMapping("/viewEmployeeDetails/{id}")
    public String viewProfile(@PathVariable Long id, Model model) {
        Employee emp = employeeService.getEmployeeById(id);
        
        if (emp != null) {
            if (emp.getCompanyDetails() == null) {
                emp.setCompanyDetails(new CompanyDetails());
            }
            if (emp.getBankDetails() == null) {
                emp.setBankDetails(new BankDetails());
            }
            model.addAttribute("employee", emp);
            return "admin/viewEmployeeDetails";
        } else {
            return "redirect:/admin/profile"; // Redirect if employee not found
        }
    }

    // ✅ 5. Update employee (with ID + image handling)
    @PostMapping("/updateEmployee/{id}")
    public String updateEmployee(@PathVariable Long id,
                                @Valid @ModelAttribute("employee") Employee employee,
                                BindingResult bindingResult,
                                Model model) {
        
        System.out.println("Processing update for employee ID: " + id);
        Employee existingEmployee = employeeService.getEmployeeById(id);
        if (existingEmployee == null) {
            System.err.println("Employee not found with ID: " + id);
            return "redirect:/admin/profile";
        }

        // Ensure embedded objects are initialized to prevent NullPointerException in Thymeleaf rendering
        if (existingEmployee.getCompanyDetails() == null) {
            existingEmployee.setCompanyDetails(new CompanyDetails());
        }

        // Validate only fields starting with "companyDetails."
        boolean hasCompanyErrors = bindingResult.getFieldErrors().stream()
                .anyMatch(e -> e.getField().startsWith("companyDetails."));

        // Manual validation for Joining Date >= DOB + 18
        LocalDate dob = existingEmployee.getDateOfBirth();
        LocalDate doj = (employee.getCompanyDetails() != null) ? employee.getCompanyDetails().getJoiningDate() : null;

        if (dob != null && doj != null) {
            if (doj.isBefore(dob.plusYears(18))) {
                bindingResult.rejectValue("companyDetails.joiningDate", "error.joiningDate", "Joining date must be at least 18 years after Date of Birth");
                hasCompanyErrors = true;
            }
        }

        if (hasCompanyErrors) {
            System.out.println("Update validation errors in company details: " + bindingResult.getAllErrors());
            // Sync company details from form to existing object for re-display
            if (employee.getCompanyDetails() != null) {
                CompanyDetails cd = employee.getCompanyDetails();
                CompanyDetails exCd = existingEmployee.getCompanyDetails();
                if (exCd == null) {
                    exCd = new CompanyDetails();
                    existingEmployee.setCompanyDetails(exCd);
                }
                exCd.setEmployeeEmail(cd.getEmployeeEmail());
                exCd.setDesignation(cd.getDesignation());
                exCd.setShiftTiming(cd.getShiftTiming());
                exCd.setJoiningDate(cd.getJoiningDate());
                exCd.setLeavingDate(cd.getLeavingDate());
                exCd.setStatus(cd.getStatus());
            }
            if (existingEmployee.getBankDetails() == null) {
                existingEmployee.setBankDetails(new BankDetails());
            }
            model.addAttribute("employee", existingEmployee);
            model.addAttribute("shiftTimings", shiftTimingRepository.findAll());
            model.addAttribute("errorMessage", "Please correct the errors in Company Details.");
            return "admin/updateEmployee";
        }

        try {
            // Strictly update only Company Details
            if (employee.getCompanyDetails() != null) {
                CompanyDetails cd = employee.getCompanyDetails();
                CompanyDetails exCd = existingEmployee.getCompanyDetails();
                if (exCd == null) {
                    exCd = new CompanyDetails();
                    existingEmployee.setCompanyDetails(exCd);
                }
                
                exCd.setEmployeeEmail(cd.getEmployeeEmail());
                exCd.setDesignation(cd.getDesignation());
                exCd.setShiftTiming(cd.getShiftTiming());
                exCd.setJoiningDate(cd.getJoiningDate());
                exCd.setLeavingDate(cd.getLeavingDate());
                exCd.setStatus(cd.getStatus());
            }

            employeeService.saveEmployee(existingEmployee);
            System.out.println("Successfully updated employee ID: " + id);
            return "redirect:/admin/profile?success";

        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.err.println("Data integrity violation: " + e.getMessage());
            model.addAttribute("errorMessage", "Error: The company email might already be in use.");
            // Repopulate model with existing data so profile card doesn't break
            if (employee.getCompanyDetails() != null) {
                CompanyDetails cd = employee.getCompanyDetails();
                CompanyDetails exCd = existingEmployee.getCompanyDetails();
                if (exCd != null) {
                    exCd.setEmployeeEmail(cd.getEmployeeEmail());
                    exCd.setDesignation(cd.getDesignation());
                    exCd.setShiftTiming(cd.getShiftTiming());
                    exCd.setJoiningDate(cd.getJoiningDate());
                    exCd.setLeavingDate(cd.getLeavingDate());
                    exCd.setStatus(cd.getStatus());
                }
            }
            if (existingEmployee.getBankDetails() == null) {
                existingEmployee.setBankDetails(new BankDetails());
            }
            model.addAttribute("employee", existingEmployee);
            model.addAttribute("shiftTimings", shiftTimingRepository.findAll());
            return "admin/updateEmployee";
        } catch (Exception e) {
            System.err.println("Unexpected error during update: " + e.getMessage());
            e.printStackTrace();
            if (existingEmployee.getBankDetails() == null) {
                existingEmployee.setBankDetails(new BankDetails());
            }
            model.addAttribute("errorMessage", "An unexpected error occurred: " + e.getMessage());
            model.addAttribute("employee", existingEmployee);
            model.addAttribute("shiftTimings", shiftTimingRepository.findAll());
            return "admin/updateEmployee";
        }
    }

    // ✅ 6. Delete employee
    @GetMapping("/delete/{id}")
    public String deleteEmployee(@PathVariable Long id, org.springframework.web.servlet.mvc.support.RedirectAttributes redirectAttributes) {
        try {
            employeeService.deleteEmployee(id);
            redirectAttributes.addFlashAttribute("successMessage", "Employee deleted successfully!");
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Cannot delete employee. They may have active attendance, leaves, or reports.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "An error occurred while deleting the employee.");
            e.printStackTrace();
        }
        return "redirect:/admin/profile";
    }
    
    // ✅ 7. Profile page (shows all employees)
    @GetMapping("/profile")
    public String getProfilePage(Model model){
        List<Employee> employees = employeeService.getAllEmployees();
        model.addAttribute("totalEmployees", employees.size());

        // Ensure embedded objects exist for each employee
        for(Employee e : employees){
            if(e.getCompanyDetails() == null){
                e.setCompanyDetails(new CompanyDetails());
            }
            if(e.getBankDetails() == null){
                e.setBankDetails(new BankDetails());
            }
        }

        model.addAttribute("employees", employees);
        return "admin/profile";
    }

    

    
    @GetMapping("/updateEmployee/{id}")
    public String showUpdateForm(@PathVariable("id") Long id, Model model){
        Employee employee = employeeService.getEmployeeById(id); // Fetch from DB
        if (employee != null) {
            if (employee.getCompanyDetails() == null) {
                employee.setCompanyDetails(new CompanyDetails());
            }
            if (employee.getBankDetails() == null) {
                employee.setBankDetails(new BankDetails());
            }
        }
        model.addAttribute("employee", employee);
        model.addAttribute("shiftTimings", shiftTimingRepository.findAll());
        return "admin/updateEmployee";
    }

    @GetMapping("/attendance")
    public String showAttendacePage(Model model) {
        notificationService.markNotificationsAsRead("Admin", "Attendance");
        model.addAttribute("adminUnreadCount", notificationService.countUnreadForAdmin());
        return "admin/attendance";
    }
    /* User Attendance Page
    @GetMapping("/attendance/{id}")
    public String showUserAttendacePage(@PathVariable Long id, Model model) {
        
        Employee emp = employeeService.getEmployeeById(id);
        model.addAttribute("companyDetails", emp.getCompanyDetails());
        model.addAttribute("employee", emp);

        return "admin/attendance";
    }*/




    // Payslip Page
    @GetMapping("/payslip")
    public String showPayslipPage(){
        return "payslip";
    }

    // Payroll Page
    @GetMapping("/payroll")
    public String showPayrollPage(){
        return "payroll";
    }

    // ✅ Returns all employees as JSON
    @GetMapping("/all")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        try {
            List<Employee> employees = employeeService.getAllEmployees().stream()
                    .filter(e -> "FULLY_APPROVED".equals(e.getOverallStatus()))
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    @GetMapping("/adminNotifications")
    public String getAdminNotifications(Model model) {
        return "admin/adminNotifications"; // Thymeleaf HTML file
    }
}
