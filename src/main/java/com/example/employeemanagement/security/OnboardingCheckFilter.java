package com.example.employeemanagement.security;

import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.service.EmployeeService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

/**
 * ✅ FIX #6: Security Filter to enforce onboarding completion
 *
 * This filter ensures that users cannot access protected pages (attendance,
 * leave, hourly reports) before completing their onboarding.
 */
@Component
public class OnboardingCheckFilter extends OncePerRequestFilter {

    @Autowired
    private EmployeeService employeeService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        // Skip filter for certain paths
        if (shouldSkipFilter(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check if this is a protected user page
        if (requestURI.matches(".*/user/.*")) {
            // Allow onboarding pages and profile pages without restriction
            if (requestURI.contains("/onboarding") || requestURI.contains("/userProfile")) {
                filterChain.doFilter(request, response);
                return;
            }

            // For other user pages, verify onboarding is complete
            HttpSession session = request.getSession(true); // Ensure session exists
            Long employeeId = (Long) session.getAttribute("employeeId");

            // ✅ SESSION RECOVERY: If employeeId is missing, try to recover from SecurityContext
            if (employeeId == null) {
                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof EmployeeUserDetails) {
                    EmployeeUserDetails userDetails = (EmployeeUserDetails) auth.getPrincipal();
                    employeeId = userDetails.getEmployee().getId();
                    session.setAttribute("employeeId", employeeId);
                    session.setAttribute("username", userDetails.getUsername());
                    session.setAttribute("userType", "user");
                }
            }

            if (employeeId != null) {
                Employee employee = employeeService.getEmployeeById(employeeId);

                // If employee hasn't completed onboarding, redirect them
                if (employee != null && !"FULLY_APPROVED".equals(employee.getOverallStatus())) {
                    response.sendRedirect("/user/onboarding");
                    return;
                }
            } else {
                // If we still can't find an employeeId, they should probably log in again
                response.sendRedirect("/login");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Determine which paths should skip this filter
     */
    private boolean shouldSkipFilter(String requestURI) {
        // Skip filter for login, logout, password reset, etc.
        if (requestURI.contains("/login")
                || requestURI.contains("/logout")
                || requestURI.contains("/forgot-password")
                || requestURI.contains("/verify-otp")
                || requestURI.contains("/reset-password")
                || requestURI.contains("/redirectAfterLogin")
                || requestURI.contains("/api/")
                || requestURI.contains("/css/")
                || requestURI.contains("/js/")
                || requestURI.contains("/images/")
                || requestURI.contains("/admin/")
                || requestURI.equals("/")) {
            return true;
        }
        return false;
    }
}
