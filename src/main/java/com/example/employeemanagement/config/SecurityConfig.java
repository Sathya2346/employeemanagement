package com.example.employeemanagement.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.EmployeeRepository;

@Configuration
public class SecurityConfig {

    @Autowired
    private EmployeeRepository employeeRepo;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        // Allow specific origins for security (local dev, Render deployment, mobile app)
        configuration.setAllowedOriginPatterns(java.util.List.of(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://*.onrender.com",
            "exp://*"
        ));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationSuccessHandler customAuthenticationSuccessHandler() {
        return (request, response, authentication) -> {
            String username = authentication.getName();
            jakarta.servlet.http.HttpSession session = request.getSession(false);
            if (session == null) session = request.getSession(true);

            java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> authorities =
                    authentication.getAuthorities();

            System.out.println("=== LOGIN SUCCESS ===");
            System.out.println("User: " + username + " | Session: " + session.getId());

            // Save SecurityContext to session (works when cookie is sent)
            HttpSessionSecurityContextRepository repo = new HttpSessionSecurityContextRepository();
            org.springframework.security.core.context.SecurityContext ctx =
                org.springframework.security.core.context.SecurityContextHolder.getContext();
            repo.saveContext(ctx, request, response);

            boolean isAdmin = authorities.stream()
                    .anyMatch(a -> a.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));

            String targetUrl;
            if (isAdmin) {
                session.setAttribute("userType", "admin");
                session.setAttribute("username", username);
                targetUrl = "/admin/dashboard";
            } else {
                Employee employee = employeeRepo.findByUsername(username)
                        .or(() -> employeeRepo.findByEmail(username))
                        .orElse(null);

                if (employee == null) {
                    System.err.println("Employee not found: " + username);
                    response.sendRedirect(request.getContextPath() + "/login?error=true");
                    return;
                }

                session.setAttribute("employeeId", employee.getId());
                session.setAttribute("email", employee.getEmail());
                session.setAttribute("username", employee.getUsername());
                session.setAttribute("userType", "user");

                targetUrl = "FULLY_APPROVED".equals(employee.getOverallStatus())
                    ? "/user/userDashboard/" + employee.getId()
                    : "/user/onboarding";
            }

            // Generate a one-time token
            String loginToken = java.util.UUID.randomUUID().toString();

            // Store SecurityContext in APPLICATION scope keyed by token
            // This allows AutoLoginController to find it even if browser doesn't send cookie
            jakarta.servlet.ServletContext appCtx = request.getServletContext();
            appCtx.setAttribute("loginToken_" + loginToken, ctx);
            appCtx.setAttribute("loginData_" + loginToken + "_userType", session.getAttribute("userType"));
            appCtx.setAttribute("loginData_" + loginToken + "_username", session.getAttribute("username"));
            appCtx.setAttribute("loginData_" + loginToken + "_employeeId", session.getAttribute("employeeId"));
            appCtx.setAttribute("loginData_" + loginToken + "_email", session.getAttribute("email"));

            // Also store token in session (fast path when cookie IS sent)
            session.setAttribute("pendingLoginToken", loginToken);

            System.out.println("Redirecting to /auto-login | token=" + loginToken + " | target=" + targetUrl);
            String autoLoginUrl = "/auto-login?token=" + loginToken
                    + "&sid=" + session.getId()
                    + "&target=" + java.net.URLEncoder.encode(targetUrl, "UTF-8");
            response.sendRedirect(request.getContextPath() + autoLoginUrl);
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**") // Stateless REST API; web forms still protected
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no auth required)
                .requestMatchers("/", "/login", "/auto-login", "/forgot-password", "/verify-otp",
                    "/reset-password", "/css/**", "/js/**", "/images/**",
                    "/notification/**", "/actuator/**", "/h2-console/**", "/favicon.ico").permitAll()
                // Public API endpoints (auth not required)
                .requestMatchers(
                    org.springframework.http.HttpMethod.POST, "/api/auth/login",
                    "/api/auth/forgot-password", "/api/auth/verify-otp", "/api/auth/reset-password"
                ).permitAll()
                // Admin-only API endpoints
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Employee data management — Admin only
                .requestMatchers("/api/employees/**").hasRole("ADMIN")
                // Attendance — Admin or User (users manage their own via employeeId)
                .requestMatchers("/api/attendance/**").authenticated()
                // Leave — Admin or User
                .requestMatchers("/api/leave/**").authenticated()
                // Hourly reports — Admin or User
                .requestMatchers("/api/hourly-reports/**").authenticated()
                // Notifications — Admin or User
                .requestMatchers("/api/notifications/**").authenticated()
                // Auth endpoints that need session (me, logout)
                .requestMatchers("/api/auth/me", "/api/auth/logout", "/api/auth/my-details").authenticated()
                // Onboarding — Authenticated users
                .requestMatchers("/api/onboarding/**").authenticated()
                // Web pages
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/user/**").hasRole("USER")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .successHandler(customAuthenticationSuccessHandler())
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .requestCache(cache -> cache
                .requestCache(new org.springframework.security.web.savedrequest.NullRequestCache())
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation().changeSessionId()
                .maximumSessions(10)
            )
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .securityContext(ctx -> ctx.requireExplicitSave(false));

        return http.build();
    }
}
