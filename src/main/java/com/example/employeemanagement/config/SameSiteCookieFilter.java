package com.example.employeemanagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;

/**
 * Filter that rewrites the Set-Cookie header to add SameSite=Lax attribute.
 * This is needed for mobile browsers accessing the app via local IP address.
 * Without SameSite=Lax, some browsers drop cookies on cross-origin redirects.
 */
@Component
public class SameSiteCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        filterChain.doFilter(request, new SameSiteResponseWrapper(response));
    }

    private static class SameSiteResponseWrapper extends HttpServletResponseWrapper {

        public SameSiteResponseWrapper(HttpServletResponse response) {
            super(response);
        }

        @Override
        public void setHeader(String name, String value) {
            if ("Set-Cookie".equalsIgnoreCase(name)) {
                value = addSameSite(value);
            }
            super.setHeader(name, value);
        }

        @Override
        public void addHeader(String name, String value) {
            if ("Set-Cookie".equalsIgnoreCase(name)) {
                value = addSameSite(value);
            }
            super.addHeader(name, value);
        }

        private String addSameSite(String cookieValue) {
            if (cookieValue != null && !cookieValue.toLowerCase().contains("samesite")) {
                cookieValue = cookieValue + "; SameSite=Lax";
            }
            return cookieValue;
        }
    }
}
