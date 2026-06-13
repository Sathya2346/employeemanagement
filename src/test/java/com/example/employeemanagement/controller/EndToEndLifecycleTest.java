package com.example.employeemanagement.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.CompanyDetails;
import com.example.employeemanagement.model.BankDetails;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.EmployeeDetailsRepository;
import com.example.employeemanagement.model.EmployeeDetails;
import com.example.employeemanagement.service.EmployeeDetailsService;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class EndToEndLifecycleTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeDetailsRepository detailsRepository;

    @Autowired
    private EmployeeDetailsService detailsService;

    @Test
    public void testFullEmployeeLifecycle() throws Exception {
        // Step 1: Admin registers a new employee (authenticated as admin)
        Employee employee = new Employee();
        employee.setFirstname("Jane");
        employee.setLastname("Doe");
        employee.setUsername("janedoe");
        employee.setEmail("janedoe@example.com");
        employee.setPassword("password123");
        employee.setDateOfBirth(LocalDate.of(1995, 5, 10));
        employee.setGender("Female");
        employee.setPhone("1234567890");
        employee.setAddress("123 Elm St");
        employee.setCity("Chicago");
        employee.setOverallStatus("PENDING");
        employee.setUserType("ROLE_USER");

        Employee saved = employeeRepository.save(employee);
        assertNotNull(saved.getId());

        // Step 2: Employee completes onboarding submission
        EmployeeDetails details = new EmployeeDetails();
        details.setPersonalPhone("9876543210");
        details.setPersonalAddress("456 Oak Ave");
        details.setPersonalCity("Chicago");
        details.setPersonalGender("Female");
        details.setPersonalDateOfBirth("1995-05-10");
        details.setPersonalEmergencyNumber("9876543211");
        details.setPersonalMaritalStatus("Single");
        details.setPersonalLanguage("English");
        details.setPersonalBloodGroup("O+");
        details.setAadharNumber("123456789012");
        details.setPanNumber("ABCDE1234F");
        details.setDegreeName("B.Tech");
        details.setDegreeInstitution("University");
        details.setAccountNumber("987654321012");
        details.setBankName("EMS Bank");
        details.setIfscCode("EMSB0000123");
        details.setPersonalBranch("Main Branch");

        // Submit onboarding details
        detailsService.submitDetails(details, saved.getId());

        // Assert employee status is updated to DETAILS_SUBMITTED
        Employee updatedEmp = employeeRepository.findById(saved.getId()).orElse(null);
        assertNotNull(updatedEmp);
        assertEquals("DETAILS_SUBMITTED", updatedEmp.getOverallStatus());

        // Step 3: Admin reviews and approves onboarding details
        EmployeeDetails submittedDetails = detailsRepository.findByEmployeeId(saved.getId());
        assertNotNull(submittedDetails);
        
        // Approve all fields
        submittedDetails.setPhoneStatus("APPROVED");
        submittedDetails.setAddressStatus("APPROVED");
        submittedDetails.setCityStatus("APPROVED");
        submittedDetails.setGenderStatus("APPROVED");
        submittedDetails.setDobStatus("APPROVED");
        submittedDetails.setEmergencyStatus("APPROVED");
        submittedDetails.setMaritalFieldStatus("APPROVED");
        submittedDetails.setLanguageStatus("APPROVED");
        submittedDetails.setBloodStatus("APPROVED");
        submittedDetails.setAadharStatus("APPROVED");
        submittedDetails.setPanStatus("APPROVED");
        submittedDetails.setDegreeNameStatus("APPROVED");
        submittedDetails.setDegreeInstStatus("APPROVED");
        submittedDetails.setAccountStatus("APPROVED");
        submittedDetails.setBankNameStatus("APPROVED");
        submittedDetails.setIfscStatus("APPROVED");
        submittedDetails.setBranchStatus("APPROVED");
        submittedDetails.setPhotoStatus("APPROVED");
        submittedDetails.setMark10thStatus("APPROVED");
        submittedDetails.setMark12thStatus("APPROVED");
        submittedDetails.setSem1Status("APPROVED");
        submittedDetails.setSem2Status("APPROVED");
        submittedDetails.setSem3Status("APPROVED");
        submittedDetails.setSem4Status("APPROVED");
        submittedDetails.setSem5Status("APPROVED");
        submittedDetails.setSem6Status("APPROVED");
        submittedDetails.setSem7Status("APPROVED");
        submittedDetails.setSem8Status("APPROVED");
        submittedDetails.setTransferCertStatus("APPROVED");
        submittedDetails.setProvisionalCertStatus("APPROVED");
        submittedDetails.setCourseCompletionStatus("APPROVED");

        detailsService.reviewDetails(saved.getId(), submittedDetails);

        // Assert employee is now FULLY_APPROVED
        Employee approvedEmp = employeeRepository.findById(saved.getId()).orElse(null);
        assertNotNull(approvedEmp);
        assertEquals("FULLY_APPROVED", approvedEmp.getOverallStatus());

        // Step 4: Verify that user CANNOT access Attendance, Leave, or Hourly Reports yet (Company Details are pending!)
        // Perform requests authenticated as employee "janedoe" with ROLE_USER
        mockMvc.perform(get("/user/userAttendance/" + saved.getId())
                .with(user("janedoe").roles("USER"))
                .sessionAttr("employeeId", saved.getId()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/user/userDashboard/" + saved.getId() + "?error=no_company_details"));

        mockMvc.perform(get("/leave/userLeave/" + saved.getId())
                .with(user("janedoe").roles("USER"))
                .sessionAttr("employeeId", saved.getId()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/user/userDashboard/" + saved.getId() + "?error=no_company_details"));

        mockMvc.perform(get("/user/hourlyReport/" + saved.getId())
                .with(user("janedoe").roles("USER"))
                .sessionAttr("employeeId", saved.getId()))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/user/userDashboard/" + saved.getId() + "?error=no_company_details"));

        // Step 5: Admin assigns Company Details (populate all required validation fields)
        CompanyDetails company = new CompanyDetails();
        company.setShiftTiming("09:00 AM - 05:00 PM");
        company.setEmployeeEmail("janedoe@example.com");
        company.setDesignation("Software Engineer");
        company.setJoiningDate(LocalDate.now());
        company.setStatus("Active");
        approvedEmp.setCompanyDetails(company);

        BankDetails bank = new BankDetails();
        bank.setAccHolderName("Jane Doe");
        bank.setBankName("EMS Bank");
        bank.setIfscCode("EMSB0000123");
        bank.setBranchName("Main Branch");
        bank.setAccNumber("123456789012");
        bank.setPanCard("ABCDE1234F");
        approvedEmp.setBankDetails(bank);

        employeeRepository.save(approvedEmp);

        // Step 6: Verify that the employee can now successfully access Attendance, Leave, and Hourly Reports
        mockMvc.perform(get("/user/userAttendance/" + saved.getId())
                .with(user("janedoe").roles("USER"))
                .sessionAttr("employeeId", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(view().name("user/userAttendance"))
                .andExpect(model().attributeExists("employee"))
                .andExpect(model().attributeExists("companyDetails"));

        mockMvc.perform(get("/leave/userLeave/" + saved.getId())
                .with(user("janedoe").roles("USER"))
                .sessionAttr("employeeId", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(view().name("user/userLeave"))
                .andExpect(model().attributeExists("employee"))
                .andExpect(model().attributeExists("leaves"));

        mockMvc.perform(get("/user/hourlyReport/" + saved.getId())
                .with(user("janedoe").roles("USER"))
                .sessionAttr("employeeId", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(view().name("user/userHourlyReport"))
                .andExpect(model().attributeExists("employee"));
    }

    @Test
    public void testUpdateEmployeeWithNullBankDetails() throws Exception {
        // Create an employee with NO bank details
        Employee employee = new Employee();
        employee.setFirstname("John");
        employee.setLastname("Smith");
        employee.setUsername("johnsmith");
        employee.setEmail("johnsmith@example.com");
        employee.setPassword("password123");
        employee.setDateOfBirth(LocalDate.of(1990, 1, 1));
        employee.setGender("Male");
        employee.setPhone("1234567891");
        employee.setAddress("123 Elm St");
        employee.setCity("Chicago");
        employee.setOverallStatus("PENDING");
        employee.setUserType("ROLE_USER");
        
        Employee saved = employeeRepository.save(employee);
        assertNotNull(saved.getId());
        assertNull(saved.getBankDetails());
        
        // Now try to update Company Details via the endpoint
        mockMvc.perform(post("/admin/updateEmployee/" + saved.getId())
                .with(user("admin").roles("ADMIN"))
                .param("companyDetails.employeeEmail", "johnsmith@company.com")
                .param("companyDetails.designation", "Developer")
                .param("companyDetails.shiftTiming", "General Shift (09:00 AM - 06:00 PM)")
                .param("companyDetails.joiningDate", "2026-06-01")
                .param("companyDetails.status", "Active"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/profile?success"));
                
        // Reload and check that bank details are still null
        Employee updated = employeeRepository.findById(saved.getId()).orElse(null);
        assertNotNull(updated);
        assertNull(updated.getBankDetails());
        assertNotNull(updated.getCompanyDetails());
        assertEquals("johnsmith@company.com", updated.getCompanyDetails().getEmployeeEmail());
    }
}

