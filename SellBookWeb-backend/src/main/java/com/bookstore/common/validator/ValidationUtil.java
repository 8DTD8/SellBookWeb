package com.bookstore.common.validator;

/**
 * ✅ Input Validation Utility
 * Centralized validation logic
 */
public class ValidationUtil {
    
    /**
     * Validate that ID is not null or empty
     */
    public static boolean isValidId(String id) {
        return id != null && !id.trim().isEmpty();
    }
    
    /**
     * Validate that string is not null or empty
     */
    public static boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }
    
    /**
     * Validate email format
     */
    public static boolean isValidEmail(String email) {
        if (email == null) return false;
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return email.matches(emailRegex);
    }
    
    /**
     * Validate phone number (Vietnamese format)
     */
    public static boolean isValidPhone(String phone) {
        if (phone == null) return false;
        // Vietnamese phone: starts with 0 and has 10 digits
        String phoneRegex = "^0\\d{9}$";
        return phone.matches(phoneRegex);
    }
    
    /**
     * Sanitize supplier name - use publisher if supplier is empty
     */
    public static String sanitizeSupplierName(String supplierName, String publisherName) {
        if (isNotEmpty(supplierName)) {
            return supplierName;
        }
        return isNotEmpty(publisherName) ? publisherName : null;
    }
    
    /**
     * Sanitize cover type - use default if empty
     */
    public static String sanitizeCoverType(String coverType) {
        if (isNotEmpty(coverType)) {
            return coverType;
        }
        return "Bìa Mềm"; // Default cover type
    }
}
