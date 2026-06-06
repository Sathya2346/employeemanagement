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
import com.example.employeemanagement.repository.NotificationRepository;
import com.example.employeemanagement.service.EmployeeService;
import com.example.employeemanagement.service.LeaveService;

import java.util.ArrayList;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
public class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EmployeeService employeeService;

    @MockBean
    private NotificationRepository notificationRepository;

    @MockBean
    private LeaveService leaveService;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testAddEmployeeForm() throws Exception {
        mockMvc.perform(get("/admin/add"))
                .andExpect(status().isOk())
                .andExpect(view().name("admin/addEmployee"))
                .andExpect(model().attributeExists("employee"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testGetProfilePage() throws Exception {
        when(employeeService.getAllEmployees()).thenReturn(new ArrayList<>());

        mockMvc.perform(get("/admin/profile"))
                .andExpect(status().isOk())
                .andExpect(view().name("admin/profile"))
                .andExpect(model().attributeExists("employees"))
                .andExpect(model().attribute("totalEmployees", 0));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testViewProfileFound() throws Exception {
        Employee emp = new Employee();
        emp.setId(1L);
        emp.setUsername("johndoe");

        when(employeeService.getEmployeeById(1L)).thenReturn(emp);

        mockMvc.perform(get("/admin/viewEmployeeDetails/1"))
                .andExpect(status().isOk())
                .andExpect(view().name("admin/viewEmployeeDetails"))
                .andExpect(model().attributeExists("employee"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testViewProfileNotFoundRedirect() throws Exception {
        when(employeeService.getEmployeeById(99L)).thenReturn(null);

        mockMvc.perform(get("/admin/viewEmployeeDetails/99"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/admin/profile"));
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    public void testAddEmployeeFormAccessDeniedForUser() throws Exception {
        mockMvc.perform(get("/admin/add"))
                .andExpect(status().isForbidden()); // Restricts ROLE_USER from admin endpoints
    }

    @Test
    @WithMockUser(username = "johndoe", roles = {"USER"})
    public void testUserAttendanceRedirectWhenCompanyDetailsPending() throws Exception {
        Employee emp = new Employee();
        emp.setId(1L);
        emp.setUsername("johndoe");
        emp.setEmail("johndoe@example.com");
        emp.setOverallStatus("FULLY_APPROVED");
        emp.setCompanyDetails(new com.example.employeemanagement.model.CompanyDetails()); // empty details

        when(employeeService.getEmployeeById(1L)).thenReturn(emp);
        when(employeeService.getAllEmployees()).thenReturn(new java.util.ArrayList<>());

        mockMvc.perform(get("/user/userAttendance/1").sessionAttr("employeeId", 1L))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/user/userDashboard/1?error=no_company_details"));
    }

    @Test
    @WithMockUser(username = "johndoe", roles = {"USER"})
    public void testUserProfileRedirectWhenCompanyDetailsPending() throws Exception {
        Employee emp = new Employee();
        emp.setId(1L);
        emp.setUsername("johndoe");
        emp.setEmail("johndoe@example.com");
        emp.setOverallStatus("FULLY_APPROVED");
        emp.setCompanyDetails(new com.example.employeemanagement.model.CompanyDetails()); // empty details

        when(employeeService.getEmployeeById(1L)).thenReturn(emp);
        when(employeeService.getAllEmployees()).thenReturn(new java.util.ArrayList<>());

        mockMvc.perform(get("/user/userProfile/1").sessionAttr("employeeId", 1L))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/user/userDashboard/1?error=no_company_details"));
    }

    @Test
    @WithMockUser(username = "johndoe", roles = {"USER"})
    public void testUserLeaveRedirectWhenCompanyDetailsPending() throws Exception {
        Employee emp = new Employee();
        emp.setId(1L);
        emp.setUsername("johndoe");
        emp.setEmail("johndoe@example.com");
        emp.setOverallStatus("FULLY_APPROVED");
        emp.setCompanyDetails(new com.example.employeemanagement.model.CompanyDetails()); // empty details

        when(employeeService.getEmployeeById(1L)).thenReturn(emp);
        when(employeeService.getAllEmployees()).thenReturn(new java.util.ArrayList<>());

        mockMvc.perform(get("/leave/userLeave/1").sessionAttr("employeeId", 1L))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/user/userDashboard/1?error=no_company_details"));
    }

    @Test
    @WithMockUser(username = "johndoe", roles = {"USER"})
    public void testUserHourlyReportRedirectWhenCompanyDetailsPending() throws Exception {
        Employee emp = new Employee();
        emp.setId(1L);
        emp.setUsername("johndoe");
        emp.setEmail("johndoe@example.com");
        emp.setOverallStatus("FULLY_APPROVED");
        emp.setCompanyDetails(new com.example.employeemanagement.model.CompanyDetails()); // empty details

        when(employeeService.getEmployeeById(1L)).thenReturn(emp);
        when(employeeService.getAllEmployees()).thenReturn(new java.util.ArrayList<>());

        mockMvc.perform(get("/user/hourlyReport/1").sessionAttr("employeeId", 1L))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/user/userDashboard/1?error=no_company_details"));
    }

    @Test
    @WithMockUser(username = "johndoe", roles = {"USER"})
    public void testUserNotificationRedirectWhenCompanyDetailsPending() throws Exception {
        Employee emp = new Employee();
        emp.setId(1L);
        emp.setUsername("johndoe");
        emp.setEmail("johndoe@example.com");
        emp.setOverallStatus("FULLY_APPROVED");
        emp.setCompanyDetails(new com.example.employeemanagement.model.CompanyDetails()); // empty details

        when(employeeService.getEmployeeById(1L)).thenReturn(emp);
        when(employeeService.getAllEmployees()).thenReturn(new java.util.ArrayList<>());

        mockMvc.perform(get("/user/notification/1").sessionAttr("employeeId", 1L))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/user/userDashboard/1?error=no_company_details"));
    }
}
