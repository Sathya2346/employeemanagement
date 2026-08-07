package com.example.employeemanagement.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.PrintWriter;

/**
 * Auto-login bridge controller.
 *
 * Solves mobile browser cookie issue: after POST /login, mobile Chrome on IP-based
 * URLs does not send the JSESSIONID cookie back on subsequent redirects.
 *
 * This controller renders an HTML page that uses JavaScript to manually set the
 * JSESSIONID cookie (via document.cookie), then navigates to the dashboard.
 * This bypasses the browser's Set-Cookie header handling which fails on IP URLs.
 */
@Controller
public class AutoLoginController {

    @GetMapping("/auto-login")
    public void autoLogin(
            @RequestParam(required = false) String token,
            @RequestParam(required = false) String sid,
            @RequestParam(required = false, defaultValue = "/") String target,
            HttpServletRequest request,
            HttpServletResponse response) throws Exception {

        System.out.println("=== AUTO-LOGIN BRIDGE ===");
        System.out.println("Token: " + token + " | SID: " + sid + " | Target: " + target);

        if (token == null || sid == null) {
            System.out.println("Missing token or sid, redirecting to login");
            response.sendRedirect(request.getContextPath() + "/login?error=true");
            return;
        }

        // Fast path: Check if the cookie WAS sent and session has our token
        HttpSession currentSession = request.getSession(false);
        System.out.println("Current session: " + (currentSession != null ? currentSession.getId() : "null"));

        if (currentSession != null) {
            String pendingToken = (String) currentSession.getAttribute("pendingLoginToken");
            if (token.equals(pendingToken)) {
                currentSession.removeAttribute("pendingLoginToken");
                System.out.println("Cookie session valid! Redirecting to: " + target);
                response.sendRedirect(request.getContextPath() + target);
                return;
            }
        }

        // Cookie was NOT sent — browser didn't include the cookie.
        // Retrieve the SecurityContext from application scope.
        Object storedContext = request.getServletContext().getAttribute("loginToken_" + token);
        if (storedContext instanceof SecurityContext) {
            System.out.println("Found SecurityContext in application scope for token: " + token);
            SecurityContext secCtx = (SecurityContext) storedContext;

            // Remove immediately (one-time use)
            request.getServletContext().removeAttribute("loginToken_" + token);

            // Set SecurityContextHolder so SecurityContextPersistenceFilter saves it
            SecurityContextHolder.setContext(secCtx);

            // Create a new session and save auth + user data into it
            HttpSession newSession = request.getSession(true);
            newSession.setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, secCtx);

            // Copy user attributes from application scope into session
            String[] attrs = {"userType", "username", "employeeId", "email"};
            for (String attr : attrs) {
                String key = "loginData_" + token + "_" + attr;
                Object val = request.getServletContext().getAttribute(key);
                if (val != null) {
                    newSession.setAttribute(attr, val);
                    request.getServletContext().removeAttribute(key);
                }
            }

            String sessionId = newSession.getId();
            System.out.println("Session: " + sessionId + " | Auth: " +
                secCtx.getAuthentication().getName() + " | Target: " + target);

            // Render an HTML page that sets the cookie via JavaScript, then navigates
            response.setContentType("text/html;charset=UTF-8");
            response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            PrintWriter out = response.getWriter();
            out.println("<!DOCTYPE html>");
            out.println("<html><head><title>Logging in...</title>");
            out.println("<style>");
            out.println("body{display:flex;justify-content:center;align-items:center;height:100vh;margin:0;");
            out.println("background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);font-family:sans-serif;color:#fff}");
            out.println(".loader{text-align:center}");
            out.println(".spinner{width:40px;height:40px;border:4px solid rgba(255,255,255,0.3);");
            out.println("border-top:4px solid #fff;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px}");
            out.println("@keyframes spin{to{transform:rotate(360deg)}}");
            out.println("</style></head><body>");
            out.println("<div class='loader'>");
            out.println("<div class='spinner'></div>");
            out.println("<p>Logging in, please wait...</p>");
            out.println("</div>");
            out.println("<script>");
            // Set the JSESSIONID cookie via JavaScript (httpOnly=false allows this)
            out.println("document.cookie='JSESSIONID=" + sessionId + "; path=/; SameSite=Lax';");
            // Small delay to ensure cookie is stored, then navigate
            out.println("setTimeout(function(){");
            out.println("  window.location.replace('" + escapeJs(target) + "');");
            out.println("},500);");
            out.println("</script>");
            out.println("</body></html>");
            out.flush();
            return;
        }

        System.out.println("No valid token found in application scope. Redirecting to login.");
        response.sendRedirect(request.getContextPath() + "/login?error=true");
    }

    /** Escape a string for safe inclusion in a JavaScript string literal */
    private String escapeJs(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                     .replace("'", "\\'")
                     .replace("\"", "\\\"")
                     .replace("\n", "\\n")
                     .replace("\r", "\\r");
    }
}
