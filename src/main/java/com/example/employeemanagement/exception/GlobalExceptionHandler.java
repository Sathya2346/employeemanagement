package com.example.employeemanagement.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;

/**
 * Global exception handler for Thymeleaf web controllers only.
 * REST API controllers use RestExceptionHandler which returns JSON.
 * This handler is scoped to exclude the controller.api package.
 */
@ControllerAdvice(basePackages = {
    "com.example.employeemanagement.controller"
})
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NoHandlerFoundException.class)
    public String handleNotFound(NoHandlerFoundException ex, Model model) {
        model.addAttribute("error", "The page you are looking for does not exist.");
        return "error";
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public String handleMethodNotSupported(HttpRequestMethodNotSupportedException ex, Model model) {
        model.addAttribute("error", "HTTP method not supported: " + ex.getMethod());
        return "error";
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<java.util.Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("success", false);
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(Exception.class)
    public String handleGenericException(Exception ex, Model model) {
        log.error("Unhandled exception in controller: ", ex);
        model.addAttribute("error", ex.getMessage() != null ? ex.getMessage() : "Internal Server Error");
        return "error";
    }
}
