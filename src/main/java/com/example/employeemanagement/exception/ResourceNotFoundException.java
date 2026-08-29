package com.example.employeemanagement.exception;

/**
 * Custom exception thrown when a requested resource is not found.
 * Used to return proper 404 responses instead of silent failures.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
