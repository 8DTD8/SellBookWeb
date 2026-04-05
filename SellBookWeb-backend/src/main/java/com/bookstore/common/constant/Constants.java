package com.bookstore.common.constant;

/**
 * ✅ Application Constants
 * Centralized magic strings and configuration values
 */
public class Constants {
    
    // Entity statuses
    public static final String ENTITY_STATUS_ACTIVE = "ACTIVE";
    public static final String ENTITY_STATUS_INACTIVE = "INACTIVE";
    
    // Order statuses
    public static final String ORDER_STATUS_PENDING = "PENDING";
    public static final String ORDER_STATUS_CONFIRMED = "CONFIRMED";
    public static final String ORDER_STATUS_SHIPPED = "SHIPPED";
    public static final String ORDER_STATUS_DELIVERED = "DELIVERED";
    public static final String ORDER_STATUS_CANCELLED = "CANCELLED";
    
    // Payment statuses
    public static final String PAYMENT_STATUS_PENDING = "PENDING";
    public static final String PAYMENT_STATUS_COMPLETED = "COMPLETED";
    public static final String PAYMENT_STATUS_FAILED = "FAILED";
    public static final String PAYMENT_STATUS_REFUNDED = "REFUNDED";
    
    // User roles
    public static final String USER_ROLE_ADMIN = "ADMIN";
    public static final String USER_ROLE_CUSTOMER = "CUSTOMER";
    public static final String USER_ROLE_SUPER_ADMIN = "SUPER_ADMIN";
    
    // Book properties defaults
    public static final String BOOK_DEFAULT_COVER_TYPE = "Bìa Mềm";
    public static final Double BOOK_DEFAULT_RATING = 0.0;
    public static final Integer BOOK_DEFAULT_SALES_COUNT = 0;
    
    // Notification types
    public static final String NOTIFICATION_TYPE_ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED";
    public static final String NOTIFICATION_TYPE_NEW_ORDER = "NEW_ORDER";
    public static final String NOTIFICATION_TYPE_PAYMENT_SUCCESS = "PAYMENT_SUCCESS";
    public static final String NOTIFICATION_TYPE_WISHLIST_BACK_IN_STOCK = "WISHLIST_BACK_IN_STOCK";
    
    // Error messages
    public static final String ERROR_BOOK_NOT_FOUND = "Book not found";
    public static final String ERROR_ORDER_NOT_FOUND = "Order not found";
    public static final String ERROR_USER_NOT_FOUND = "User not found";
    public static final String ERROR_EMAIL_ALREADY_EXISTS = "Email already exists";
    public static final String ERROR_INVALID_PASSWORD = "Invalid password";
    public static final String ERROR_INVALID_ID = "Invalid ID: must not be null or empty";
}
