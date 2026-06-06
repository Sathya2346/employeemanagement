package com.example.employeemanagement;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.EmployeeDetails;
import com.example.employeemanagement.service.EmployeeDetailsService;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.EmployeeDetailsRepository;
import org.springframework.test.context.ActiveProfiles;
import java.time.LocalDate;

@SpringBootTest
@ActiveProfiles("test")
public class OnboardingTest {

    @Autowired
    private EmployeeDetailsService detailsService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeDetailsRepository detailsRepository;

    @Test
    public void testOnboardingApprovalCopiesDOB() {
        // 1. Create a dummy employee
        Employee emp = new Employee();
        emp.setUsername("tester_junit_v3");
        emp.setEmail("junit_v3@test.com");
        emp.setFirstname("JUnit");
        emp.setLastname("Test");
        emp.setOverallStatus("PENDING");
        emp = employeeRepository.save(emp);

        // 2. Create onboarding details
        EmployeeDetails details = new EmployeeDetails();
        details.setEmployee(emp);
        details.setPersonalDateOfBirth("1990-01-01");
        details.setPersonalPhone("1234567890");
        details.setPersonalAddress("Test St");
        details.setPersonalCity("Test City");
        details.setPersonalGender("Male");
        details.setPersonalEmergencyNumber("9876543210");
        details.setPersonalMaritalStatus("Single");
        details.setPersonalLanguage("English");
        details.setPersonalBloodGroup("O+");
        details.setAccountNumber("123456789");
        details.setBankName("Test Bank");
        details.setIfscCode("TEST0000001");
        details.setPersonalBranch("Test Branch");
        details.setPanNumber("ABCDE1234F");
        
        // Mark all as approved (Matching Service logic exactly)
        details.setPhoneStatus("APPROVED");
        details.setAddressStatus("APPROVED");
        details.setCityStatus("APPROVED");
        details.setGenderStatus("APPROVED");
        details.setDobStatus("APPROVED");
        details.setEmergencyStatus("APPROVED");
        details.setMaritalFieldStatus("APPROVED");
        details.setLanguageStatus("APPROVED");
        details.setBloodStatus("APPROVED");
        
        details.setAadharStatus("APPROVED");
        details.setPanStatus("APPROVED");
        details.setDegreeNameStatus("APPROVED");
        details.setDegreeInstStatus("APPROVED");
        
        details.setAccountStatus("APPROVED");
        details.setBankNameStatus("APPROVED");
        details.setIfscStatus("APPROVED");
        details.setBranchStatus("APPROVED");
        
        details.setPhotoStatus("APPROVED");
        details.setMark10thStatus("APPROVED");
        details.setMark12thStatus("APPROVED");
        
        details.setSem1Status("APPROVED");
        details.setSem2Status("APPROVED");
        details.setSem3Status("APPROVED");
        details.setSem4Status("APPROVED");
        details.setSem5Status("APPROVED");
        details.setSem6Status("APPROVED");
        details.setSem7Status("APPROVED");
        details.setSem8Status("APPROVED");
        
        details.setTransferCertStatus("APPROVED");
        details.setProvisionalCertStatus("APPROVED");
        details.setCourseCompletionStatus("APPROVED");
        
        detailsRepository.save(details);

        // 3. Trigger review approval
        detailsService.reviewDetails(emp.getId(), details);

        // 4. Verify results
        Employee updatedEmp = employeeRepository.findById(emp.getId()).orElseThrow();
        assertEquals("FULLY_APPROVED", updatedEmp.getOverallStatus());
        assertEquals(LocalDate.of(1990, 1, 1), updatedEmp.getDateOfBirth(), "DOB should be correctly copied and parsed");
    }


}
