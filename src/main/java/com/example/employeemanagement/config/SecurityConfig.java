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
        configuration.setAllowedOriginPatterns(java.util.List.of("*"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setAllowCredentials(true);
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
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login", "/auto-login", "/forgot-password", "/verify-otp",
                    "/reset-password", "/css/**", "/js/**", "/images/**", "/api/**",
                    "/notification/**", "/actuator/**", "/favicon.ico").permitAll()
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
            .securityContext(ctx -> ctx.requireExplicitSave(false));

        return http.build();
    }
}
