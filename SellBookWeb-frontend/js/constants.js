/**
 * CONSTANTS - Centralized Configuration
 * ====================================
 * 
 * All application constants and configuration values
 * in one place for easy maintenance and updates
 */

// ===============================
// API CONFIGURATION
// ===============================
const API_CONFIG = {
    BASE_URL: 'http://localhost:8080/api',
    ENDPOINTS: {
        // Auth
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        REFRESH_TOKEN: '/auth/refresh-token',
        LOGOUT: '/auth/logout',
        
        // Books
        BOOKS: '/books',
        BOOKS_SEARCH: '/books/search',
        BOOKS_BY_CATEGORY: '/books/category',
        BOOK_BY_ID: '/books',
        
        // Categories
        CATEGORIES: '/categories',
        CATEGORY_BY_ID: '/categories',
        
        // Cart
        CART: '/cart',
        CART_ITEMS: '/cart/items',
        
        // Orders
        ORDERS: '/orders',
        ORDER_BY_ID: '/orders',
        
        // Wishlist
        WISHLIST: '/wishlist',
        WISHLIST_ITEMS: '/wishlist/items',
        
        // Reviews
        REVIEWS: '/reviews',
        REVIEW_BY_ID: '/reviews',
        
        // User Profile
        PROFILE: '/users/profile',
        
        // Admin
        ADMIN_USERS: '/admin/users',
        ADMIN_BOOKS: '/admin/books',
        ADMIN_CATEGORIES: '/admin/categories',
        ADMIN_ORDERS: '/admin/orders',
        ADMIN_DASHBOARD: '/admin/dashboard/stats',
    }
};

// ===============================
// PAGINATION & DISPLAY
// ===============================
const PAGE_CONFIG = {
    ITEMS_PER_PAGE: 12,
    MAX_NOTIFICATION_COUNT: 99,
    SEARCH_DEBOUNCE_MS: 300,
    AUTO_DISMISS_TIMEOUT: 3000, // 3 seconds
};

// ===============================
// PASSWORD POLICY
// ===============================
const PASSWORD_CONFIG = {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_DIGITS: true,
    REQUIRE_SPECIAL: true,
    SPECIAL_CHARS: '!@#$%^&*',
};

// ===============================
// VALIDATION PATTERNS
// ===============================
const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\d\s\+\-\(\)]+$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};

// ===============================
// USER ROLES
// ===============================
const USER_ROLES = {
    CUSTOMER: 'CUSTOMER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN',
};

// ===============================
// ORDER STATUSES
// ===============================
const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    REFUNDED: 'REFUNDED',
};

// ===============================
// NOTIFICATION TYPES
// ===============================
const NOTIFICATION_TYPE = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
};

// ===============================
// STORAGE KEYS
// ===============================
const STORAGE_KEYS = {
    USER_INFO: 'userInfo',
    AUTH_TOKEN: 'authToken',
    REFRESH_TOKEN: 'refreshToken',
    CART: 'cart',
    WISHLIST: 'wishlist',
    PREFERENCES: 'userPreferences',
    THEME: 'theme', // 'light' or 'dark'
};

// ===============================
// UI SETTINGS
// ===============================
const UI_CONFIG = {
    THEME: 'light',
    ANIMATION_DURATION: 300, // milliseconds
    MODAL_OVERLAY_OPACITY: 0.5,
    DEFAULT_PAGE_SIZE: 12,
    MAX_FILE_SIZE: 5242880, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

// ===============================
// ERROR MESSAGES
// ===============================
const ERROR_MESSAGES = {
    // Auth
    INVALID_EMAIL: 'Email không hợp lệ',
    WEAK_PASSWORD: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
    PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
    LOGIN_FAILED: 'Đăng nhập thất bại. Vui lòng thử lại',
    REGISTER_FAILED: 'Đăng ký thất bại. Vui lòng thử lại',
    
    // Network
    NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra internet',
    TIMEOUT: 'Yêu cầu hết thời gian chờ. Vui lòng thử lại',
    SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau',
    
    // Validation
    REQUIRED_FIELD: 'Trường này là bắt buộc',
    INVALID_FORMAT: 'Định dạng không hợp lệ',
};

// ===============================
// SUCCESS MESSAGES
// ===============================
const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    REGISTER_SUCCESS: 'Đăng ký thành công. Vui lòng đăng nhập',
    LOGOUT_SUCCESS: 'Đã đăng xuất',
    PROFILE_UPDATED: 'Cập nhật hồ sơ thành công',
    ITEM_ADDED_TO_CART: 'Đã thêm vào giỏ hàng',
    ITEM_REMOVED: 'Đã xóa mục',
    ORDER_PLACED: 'Đơn hàng đã được tạo',
};

// ===============================
// DATE & TIME
// ===============================
const DATE_FORMAT = {
    SHORT: 'dd/MM/yyyy',
    LONG: 'dd MMMM yyyy',
    WITH_TIME: 'dd/MM/yyyy HH:mm',
};

// ===============================
// CURRENCY
// ===============================
const CURRENCY_CONFIG = {
    SYMBOL: '₫',
    NAME: 'VND',
    DECIMAL_PLACES: 0, // Vietnamese Dong doesn't use decimals
};

// ===============================
// HTTP STATUS CODES
// ===============================
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};

// ===============================
// FEATURE FLAGS
// ===============================
const FEATURES = {
    ENABLE_WISHLIST: true,
    ENABLE_REVIEWS: true,
    ENABLE_RATINGS: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_NOTIFICATIONS_POLLING: true,
    NOTIFICATIONS_POLL_INTERVAL: 30000, // 30 seconds
    ENABLE_CART: true,
    ENABLE_CHECKOUT: true,
    ENABLE_ORDER_TRACKING: true,
};

// Export for modules (if using ES6 modules)
// export { API_CONFIG, PAGE_CONFIG, PASSWORD_CONFIG, ... };
