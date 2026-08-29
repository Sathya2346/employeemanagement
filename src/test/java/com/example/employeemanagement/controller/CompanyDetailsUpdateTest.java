package com.example.employeemanagement.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.example.employeemanagement.model.CompanyDetails;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@Transactional
public class CompanyDetailsUpdateTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Employee testEmployee;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setFirstname("Test");
        testEmployee.setLastname("Employee");
        testEmployee.setUsername("testemp_" + System.nanoTime());
        testEmployee.setEmail("test_" + System.nanoTime() + "@example.com");
        testEmployee.setPassword("password");
        testEmployee.setOverallStatus("PENDING");
        testEmployee.setUserType("ROLE_USER");
        testEmployee.setDateOfBirth(LocalDate.of(1995, 6, 15));
        testEmployee = employeeRepository.save(testEmployee);
    }

    // ═══════════════════════════════════════════════════════════
    // REST API Tests (PUT /api/employees/{id})
    // ═══════════════════════════════════════════════════════════

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Successful company details update with all valid fields")
    void testApiUpdateCompanyDetailsValid() throws Exception {
        String json = """
            {
                "companyDetails": {
                    "employeeEmail": "updated@company.com",
                    "designation": "Senior Developer",
                    "shiftTiming": "Morning (9:00 AM - 6:00 PM)",
                    "joiningDate": "2024-01-15",
                    "leavingDate": null,
                    "status": "Active"
                }
            }
            """;

        mockMvc.perform(put("/api/employees/" + testEmployee.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyDetails.employeeEmail").value("updated@company.com"))
                .andExpect(jsonPath("$.companyDetails.designation").value("Senior Developer"))
                .andExpect(jsonPath("$.companyDetails.shiftTiming").value("Morning (9:00 AM - 6:00 PM)"))
                .andExpect(jsonPath("$.companyDetails.status").value("Active"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Update fails when employee email is empty")
    void testApiUpdateFailsWithEmptyEmail() throws Exception {
        String json = """
            {
                "companyDetails": {
                    "employeeEmail": "",
                    "designation": "Senior Developer",
                    "shiftTiming": "Morning (9:00 AM - 6:00 PM)",
                    "joiningDate": "2024-01-15",
                    "status": "Active"
                }
            }
            """;

        mockMvc.perform(put("/api/employees/" + testEmployee.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Employee company email is required."));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Update fails when designation is empty")
    void testApiUpdateFailsWithEmptyDesignation() throws Exception {
        String json = """
            {
                "companyDetails": {
                    "employeeEmail": "valid@company.com",
                    "designation": "",
                    "shiftTiming": "Morning (9:00 AM - 6:00 PM)",
                    "joiningDate": "2024-01-15",
                    "status": "Active"
                }
            }
            """;

        mockMvc.perform(put("/api/employees/" + testEmployee.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Designation is required."));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Update fails when joining date is null")
    void testApiUpdateFailsWithNullJoiningDate() throws Exception {
        String json = """
            {
                "companyDetails": {
                    "employeeEmail": "valid@company.com",
                    "designation": "Developer",
                    "shiftTiming": "Morning (9:00 AM - 6:00 PM)",
                    "joiningDate": null,
                    "status": "Active"
                }
            }
            """;

        mockMvc.perform(put("/api/employees/" + testEmployee.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Joining date is required."));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Update fails when joining date is before DOB + 18 years")
    void testApiUpdateFailsJoiningBeforeDOB18() throws Exception {
        String json = """
            {
                "companyDetails": {
                    "employeeEmail": "valid@company.com",
                    "designation": "Developer",
                    "shiftTiming": "Morning (9:00 AM - 6:00 PM)",
                    "joiningDate": "2008-01-01",
                    "status": "Active"
                }
            }
            """;

        mockMvc.perform(put("/api/employees/" + testEmployee.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Joining date must be at least 18 years after Date of Birth"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Update fails with invalid email format")
    void testApiUpdateFailsWithInvalidEmailFormat() throws Exception {
        String json = """
            {
                "companyDetails": {
                    "employeeEmail": "not-an-email",
                    "designation": "Developer",
                    "shiftTiming": "Morning (9:00 AM - 6:00 PM)",
                    "joiningDate": "2024-01-15",
                    "status": "Active"
                }
            }
            """;

        mockMvc.perform(put("/api/employees/" + testEmployee.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid company email format."));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Update fails when shift timing is empty")
    void testApiUpdateFailsWithEmptyShiftTiming() throws Exception {
        String json = """
            {
                "companyDetails": {
                    "employeeEmail": "valid@company.com",
                    "designation": "Developer",
                    "shiftTiming": "",
                    "joiningDate": "2024-01-15",
                    "status": "Active"
                }
            }
            """;

        mockMvc.perform(put("/api/employees/" + testEmployee.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Shift timing is required."));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Update fails when status is empty")
    void testApiUpdateFailsWithEmptyStatus() throws Exception {
        String json = """
            {
                "companyDetails": {
                    "employeeEmail": "valid@company.com",
                    "designation": "Developer",
                    "shiftTiming": "Morning (9:00 AM - 6:00 PM)",
                    "joiningDate": "2024-01-15",
                    "status": ""
                }
            }
            """;

        mockMvc.perform(put("/api/employees/" + testEmployee.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Status is required."));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Update with null leaving date succeeds (optional field)")
    void testApiUpdateWithNullLeavingDate() throws Exception {
        String json = """
            {
                "companyDetails": {
                    "employeeEmail": "valid@company.com",
                    "designation": "Developer",
                    "shiftTiming": "Morning (9:00 AM - 6:00 PM)",
                    "joiningDate": "2024-01-15",
                    "leavingDate": null,
                    "status": "Active"
                }
            }
            """;

        mockMvc.perform(put("/api/employees/" + testEmployee.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyDetails.employeeEmail").value("valid@company.com"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Update with leaving date succeeds")
    void testApiUpdateWithLeavingDate() throws Exception {
        String json = """
            {
                "companyDetails": {
                    "employeeEmail": "valid@company.com",
                    "designation": "Developer",
                    "shiftTiming": "Morning (9:00 AM - 6:00 PM)",
                    "joiningDate": "2024-01-15",
                    "leavingDate": "2025-06-30",
                    "status": "Inactive"
                }
            }
            """;

        mockMvc.perform(put("/api/employees/" + testEmployee.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyDetails.leavingDate").value("2025-06-30"))
                .andExpect(jsonPath("$.companyDetails.status").value("Inactive"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Update with null companyDetails succeeds (no-op)")
    void testApiUpdateWithNullCompanyDetails() throws Exception {
        String json = "{ \"firstname\": \"Changed\" }";

        mockMvc.perform(put("/api/employees/" + testEmployee.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Update non-existent employee returns 404")
    void testApiUpdateNonExistentEmployee() throws Exception {
        String json = """
            {
                "companyDetails": {
                    "employeeEmail": "valid@company.com",
                    "designation": "Developer",
                    "shiftTiming": "Morning (9:00 AM - 6:00 PM)",
                    "joiningDate": "2024-01-15",
                    "status": "Active"
                }
            }
            """;

        mockMvc.perform(put("/api/employees/999999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isNotFound());
    }

    // ═══════════════════════════════════════════════════════════
    // Verify DB persistence
    // ═══════════════════════════════════════════════════════════

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("API: Verify company details persist in DB after update")
    void testApiCompanyDetailsPersistInDB() throws Exception {
        String json = """
            {
                "companyDetails": {
                    "employeeEmail": "persist@test.com",
                    "designation": "Lead Developer",
                    "shiftTiming": "General (10:00 AM - 7:00 PM)",
                    "joiningDate": "2024-03-01",
                    "leavingDate": "2025-12-31",
                    "status": "Active"
                }
            }
            """;

        mockMvc.perform(put("/api/employees/" + testEmployee.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf()))
                .andExpect(status().isOk());

        // Verify in database
        Employee saved = employeeRepository.findById(testEmployee.getId()).orElse(null);
        assertNotNull(saved);
        assertNotNull(saved.getCompanyDetails());
        assertEquals("persist@test.com", saved.getCompanyDetails().getEmployeeEmail());
        assertEquals("Lead Developer", saved.getCompanyDetails().getDesignation());
        assertEquals("General (10:00 AM - 7:00 PM)", saved.getCompanyDetails().getShiftTiming());
        assertEquals(LocalDate.of(2024, 3, 1), saved.getCompanyDetails().getJoiningDate());
        assertEquals(LocalDate.of(2025, 12, 31), saved.getCompanyDetails().getLeavingDate());
        assertEquals("Active", saved.getCompanyDetails().getStatus());
    }
}
