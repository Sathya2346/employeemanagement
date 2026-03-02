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
import com.example.employeemanagement.repository.NotificationRepository;
import com.example.employeemanagement.service.EmployeeService;
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

    // ✅ 3. Save new employee
    @PostMapping("/save")
    public String saveEmployee(@Valid @ModelAttribute Employee employee,
                               BindingResult bindingResult,
                               @RequestParam("profileFile") MultipartFile file,
                               Model model) throws IOException{
        
        // Validate DOJ >= DOB + 18
        if (employee.getDateOfBirth() != null && employee.getCompanyDetails() != null && employee.getCompanyDetails().getJoiningDate() != null) {
            if (employee.getCompanyDetails().getJoiningDate().isBefore(employee.getDateOfBirth().plusYears(18))) {
                bindingResult.rejectValue("companyDetails.joiningDate", "error.joiningDate", "Joining date must be at least 18 years after Date of Birth");
            }
        }

        if (bindingResult.hasErrors()) {
             // Return to the form page to display errors
             // (Thymeleaf fields.hasErrors() would handle display if configured, 
             // ensuring no 500 crash).
             System.out.println("Validation errors: " + bindingResult.getAllErrors());
             return "admin/addEmployee"; 
        }

        if(!file.isEmpty()){
            employee.setProfile(file.getBytes());
        }
        
        try {
            employeeService.saveEmployee(employee);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            model.addAttribute("errorMessage", "Email or Phone number already exists!");
            model.addAttribute("employee", employee); // Return the entered data
            return "admin/addEmployee";
        }
        
        return "redirect:/admin/profile";  // ✅ Corrected path
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
                                @RequestParam("profileFile") MultipartFile file,
                                Model model) throws IOException{
        
        Employee existingEmployee = employeeService.getEmployeeById(id);
        if (existingEmployee == null) {
            return "redirect:/admin/profile";
        }

        // Handle optional password: if blank, remove validation errors and don't update it
        if (employee.getPassword() == null || employee.getPassword().isEmpty()) {
            if (bindingResult.hasFieldErrors("password")) {
                // There's a better way to do this in Spring, but manual filtering works
                List<org.springframework.validation.FieldError> errorsToKeep = bindingResult.getFieldErrors().stream()
                        .filter(e -> !e.getField().equals("password"))
                        .collect(java.util.stream.Collectors.toList());
                
                // Clear and re-add non-password errors if needed, but let's just ignore password later
            }
        }

        // Validate DOJ >= DOB + 18
        LocalDate dob = employee.getDateOfBirth() != null ? employee.getDateOfBirth() : existingEmployee.getDateOfBirth();
        LocalDate doj = (employee.getCompanyDetails() != null && employee.getCompanyDetails().getJoiningDate() != null) 
                        ? employee.getCompanyDetails().getJoiningDate() : 
                        (existingEmployee.getCompanyDetails() != null ? existingEmployee.getCompanyDetails().getJoiningDate() : null);

        if (dob != null && doj != null) {
            if (doj.isBefore(dob.plusYears(18))) {
                bindingResult.rejectValue("companyDetails.joiningDate", "error.joiningDate", "Joining date must be at least 18 years after Date of Birth");
            }
        }

        if (bindingResult.hasErrors()) {
            // Check if errors are only for password and it's blank
            boolean onlyPasswordError = bindingResult.getFieldErrors().stream()
                    .allMatch(e -> e.getField().equals("password") && (employee.getPassword() == null || employee.getPassword().isEmpty()));
            
            if (!onlyPasswordError) {
                System.out.println("Update validation errors: " + bindingResult.getAllErrors());
                employee.setProfile(existingEmployee.getProfile());
                return "admin/updateEmployee";
            }
        }

        // Merge logic: if field is empty in form, keep existing
        if (employee.getFirstname() == null || employee.getFirstname().isEmpty()) employee.setFirstname(existingEmployee.getFirstname());
        if (employee.getLastname() == null || employee.getLastname().isEmpty()) employee.setLastname(existingEmployee.getLastname());
        if (employee.getGender() == null || employee.getGender().isEmpty()) employee.setGender(existingEmployee.getGender());
        if (employee.getDateOfBirth() == null) employee.setDateOfBirth(existingEmployee.getDateOfBirth());
        if (employee.getEmail() == null || employee.getEmail().isEmpty()) employee.setEmail(existingEmployee.getEmail());
        if (employee.getPhone() == null || employee.getPhone().isEmpty()) employee.setPhone(existingEmployee.getPhone());
        if (employee.getAddress() == null || employee.getAddress().isEmpty()) employee.setAddress(existingEmployee.getAddress());
        if (employee.getCity() == null || employee.getCity().isEmpty()) employee.setCity(existingEmployee.getCity());
        
        // Handle nested details merge
        if (employee.getCompanyDetails() == null) {
            employee.setCompanyDetails(existingEmployee.getCompanyDetails());
        } else {
            CompanyDetails cd = employee.getCompanyDetails();
            CompanyDetails exCd = existingEmployee.getCompanyDetails();
            if (exCd != null) {
                if (cd.getEmployeeEmail() == null || cd.getEmployeeEmail().isEmpty()) cd.setEmployeeEmail(exCd.getEmployeeEmail());
                if (cd.getDesignation() == null || cd.getDesignation().isEmpty()) cd.setDesignation(exCd.getDesignation());
                if (cd.getShiftTiming() == null || cd.getShiftTiming().isEmpty()) cd.setShiftTiming(exCd.getShiftTiming());
                if (cd.getJoiningDate() == null) cd.setJoiningDate(exCd.getJoiningDate());
                if (cd.getStatus() == null || cd.getStatus().isEmpty()) cd.setStatus(exCd.getStatus());
            }
        }

        // Bank Details Merge
        if (employee.getBankDetails() == null) {
            employee.setBankDetails(existingEmployee.getBankDetails());
        } else {
            BankDetails bd = employee.getBankDetails();
            BankDetails exBd = existingEmployee.getBankDetails();
            if (exBd != null) {
                if (bd.getAccHolderName() == null || bd.getAccHolderName().isEmpty()) bd.setAccHolderName(exBd.getAccHolderName());
                if (bd.getBankName() == null || bd.getBankName().isEmpty()) bd.setBankName(exBd.getBankName());
                if (bd.getBranchName() == null || bd.getBranchName().isEmpty()) bd.setBranchName(exBd.getBranchName());
                if (bd.getAccNumber() == null || bd.getAccNumber().isEmpty()) bd.setAccNumber(exBd.getAccNumber());
                if (bd.getIfscCode() == null || bd.getIfscCode().isEmpty()) bd.setIfscCode(exBd.getIfscCode());
                if (bd.getPanCard() == null || bd.getPanCard().isEmpty()) bd.setPanCard(exBd.getPanCard());
            }
        }

        // Preserve protected fields
        employee.setTotalLeaves(existingEmployee.getTotalLeaves());
        employee.setPaidLeaveBalance(existingEmployee.getPaidLeaveBalance());
        employee.setSickLeaveBalance(existingEmployee.getSickLeaveBalance());
        employee.setCasualLeaveBalance(existingEmployee.getCasualLeaveBalance());
        employee.setLeaveBalance(existingEmployee.getLeaveBalance());
        employee.setOtp(existingEmployee.getOtp());
        employee.setOtpExpiry(existingEmployee.getOtpExpiry());
        employee.setLastLoginDate(existingEmployee.getLastLoginDate());
        employee.setLeaves(existingEmployee.getLeaves());
        employee.setAttendances(existingEmployee.getAttendances());

        // Handle Password logic
        if (employee.getPassword() == null || employee.getPassword().isEmpty()) {
            employee.setPassword(existingEmployee.getPassword());
        } else if (!employee.getPassword().startsWith("$2a$")) {
            employee.setPassword(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(employee.getPassword()));
        }

        // Handle image upload
        if (!file.isEmpty()) {
            employee.setProfile(file.getBytes());
        } else {
            employee.setProfile(existingEmployee.getProfile());
        }

        try {
            employeeService.saveEmployee(employee);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            model.addAttribute("errorMessage", "Email or Phone number already exists!");
            return "admin/updateEmployee";
        }
        
        return "redirect:/admin/profile";
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

    

    
    // Update Employee
    @GetMapping("/updateEmployee/{id}")
    public String showUpdateForm(@PathVariable("id") Long id, Model model){
        Employee employee = employeeService.getEmployeeById(id); // Fetch from DB
        model.addAttribute("employee", employee);
        return "admin/updateEmployee";
    }

    @GetMapping("/attendance")
    public String showAttendacePage() {
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


    @GetMapping("/leave/all")
    public String showAllLeaves(Model model) {
        List<Leave> allLeaves = leaveService.getAllLeaves();
        model.addAttribute("leaves", allLeaves);
        model.addAttribute("totalLeaves", allLeaves.size());
        return "admin/leave";
    }

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
            List<Employee> employees = employeeService.getAllEmployees();
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(List.of());
        }
    }

    @GetMapping("/adminNotifications")
    public String getAdminNotifications(Model model) {
        List<Notification> notifications = notificationRepository.findAllByOrderByCreatedAtDesc();
        model.addAttribute("notifications", notifications);
        return "admin/adminNotifications"; // Thymeleaf HTML file
    }
}
