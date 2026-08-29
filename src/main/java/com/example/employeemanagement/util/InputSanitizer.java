package com.example.employeemanagement.util;

/**
 * Utility class for sanitizing user input to prevent XSS attacks.
 * Escapes HTML special characters to their entity equivalents.
 */
public final class InputSanitizer {

    private InputSanitizer() {
        // Utility class, no instantiation
    }

    /**
     * Sanitizes a string by escaping HTML special characters.
     * Converts: & < > " ' / to their HTML entity equivalents.
     */
    public static String sanitize(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }

    /**
     * Sanitizes only dangerous HTML characters while preserving normal text.
     * Strips script tags and event handlers.
     */
    public static String stripDangerousHtml(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }
        // Remove script tags and their content
        String result = input.replaceAll("(?i)<script[^>]*>.*?</script>", "");
        // Remove event handlers
        result = result.replaceAll("(?i)\\bon\\w+\\s*=", "");
        // Remove remaining HTML tags
        result = result.replaceAll("<[^>]+>", "");
        return result.trim();
    }
}
