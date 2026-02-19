package com.example.employeemanagement.controller;

import java.io.IOException;
import java.util.List;

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
                                @ModelAttribute("employee") Employee employee,
                                @RequestParam("profileFile") MultipartFile file,
                                Model model) throws IOException{
        // handle image upload
        if (!file.isEmpty()) {
            employee.setProfile(file.getBytes());
        } else {
            // keep existing image
            Employee existing = employeeService.getEmployeeById(id);
            employee.setProfile(existing.getProfile());
        }

                                            
        try {
            employeeService.updateEmployeeById(employee);
            // Add success message if needed, but RedirectAttributes not in method sig yet.
            // For now, let's just redirect. The user requested error handling primarily.
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            model.addAttribute("errorMessage", "Email or Phone number already exists!");
             // re-fetch original employee data if needed or just use the submitted 'employee'
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
