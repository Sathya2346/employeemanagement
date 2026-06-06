package com.example.employeemanagement.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.EmployeeDetails;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.EmployeeDetailsService;

import java.util.Optional;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
public class OnboardingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeDetailsService detailsService;

    @MockBean
    private EmployeeRepository employeeRepository;

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    public void testShowUserOnboardingFormNotLoggedIn() throws Exception {
        mockMvc.perform(get("/user/onboarding"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    public void testShowUserOnboardingFormSuccess() throws Exception {
        Employee emp = new Employee();
        emp.setId(1L);
        emp.setUsername("user");
        emp.setOverallStatus("PENDING");

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(emp));
        when(detailsService.getDetailsByEmployeeId(1L)).thenReturn(null);

        mockMvc.perform(get("/user/onboarding")
                .sessionAttr("employeeId", 1L))
                .andExpect(status().isOk())
                .andExpect(view().name("user/onboardingForm"))
                .andExpect(model().attributeExists("employee"))
                .andExpect(model().attributeExists("details"))
                .andExpect(model().attribute("overallStatus", "PENDING"));
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    public void testSubmitUserOnboardingRedirect() throws Exception {
        mockMvc.perform(post("/user/onboarding/submit")
                .sessionAttr("employeeId", 1L)
                .param("personalPhone", "1234567890")
                .param("bankName", "My Bank"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/user/onboarding"));

        verify(detailsService, times(1)).submitDetails(any(EmployeeDetails.class), eq(1L));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testListPendingReviews() throws Exception {
        mockMvc.perform(get("/admin/onboarding/pending"))
                .andExpect(status().isOk())
                .andExpect(view().name("admin/pendingOnboarding"))
                .andExpect(model().attributeExists("pendingEmployees"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testShowReviewPage() throws Exception {
        Employee emp = new Employee();
        emp.setId(2L);
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(emp));
        when(detailsService.getDetailsByEmployeeId(2L)).thenReturn(new EmployeeDetails());

        mockMvc.perform(get("/admin/onboarding/review/2"))
                .andExpect(status().isOk())
                .andExpect(view().name("admin/reviewOnboarding"))
                .andExpect(model().attributeExists("employee"))
                .andExpect(model().attributeExists("details"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testSubmitReviewRedirect() throws Exception {
        mockMvc.perform(post("/admin/onboarding/review/2")
                .param("phoneStatus", "APPROVED"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/onboarding/pending"));

        verify(detailsService, times(1)).reviewDetails(eq(2L), any(EmployeeDetails.class));
    }
}
