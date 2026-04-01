const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';
const ROLE_ADMIN = 'ADMIN';
const ROLE_SUPER_ADMIN = 'SUPER_ADMIN';

function getBaseApiUrl() {
    if (window.WEB_CONFIG && window.WEB_CONFIG.API_BASE_URL) {
        return window.WEB_CONFIG.API_BASE_URL;
    }
    return typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : DEFAULT_API_BASE_URL;
}

function getAuthToken() {
    return (typeof auth !== 'undefined' && auth.token) ? auth.token : null;
}

function getCurrentRole() {
    if (typeof auth === 'undefined' || typeof auth.getRole !== 'function') {
        return '';
    }
    return (auth.getRole() || '').toUpperCase();
}

function hasAdminPrivileges(role) {
    return role === ROLE_ADMIN || role === ROLE_SUPER_ADMIN;
}

function buildRequestOptions(method, data) {
    const requestOptions = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const token = getAuthToken();
    if (token) {
        requestOptions.headers.Authorization = `Bearer ${token}`;
    }

    if (data !== null && data !== undefined) {
        requestOptions.body = JSON.stringify(data);
    }

    return requestOptions;
}

async function parseErrorMessage(response) {
    const responseText = await response.text().catch(() => '');
    if (!responseText) {
        return '';
    }

    try {
        const errorPayload = JSON.parse(responseText);
        return errorPayload.message || errorPayload.error || '';
    } catch {
        return responseText;
    }
}

function throwAuthError(statusCode, errorMessage) {
    if (statusCode === 401) {
        if (typeof auth !== 'undefined') {
            auth.logout();
        }
        throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }

    if (statusCode === 403) {
        throw new Error(errorMessage || 'Bạn không có quyền truy cập hoặc phiên đăng nhập không hợp lệ');
    }
}

async function parseSuccessResponse(response) {
    const contentType = response.headers.get('content-type');
    if (response.status === 204 || !contentType) {
        return null;
    }

    if (contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
}

function buildUserEndpoint(userId) {
    return hasAdminPrivileges(getCurrentRole()) ? `/admin/users/${userId}` : `/users/${userId}`;
}

async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const url = `${getBaseApiUrl()}${endpoint}`;
        const response = await fetch(url, buildRequestOptions(method, data));

        if (!response.ok) {
            const errorMessage = await parseErrorMessage(response);
            throwAuthError(response.status, errorMessage);
            throw new Error(errorMessage || `Error ${response.status}: ${response.statusText}`);
        }

        return parseSuccessResponse(response);
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==============================
// BOOKS API
// ==============================

async function fetchBooks(page = 0, size = 10) {
    return apiCall(`/books?page=${page}&size=${size}`);
}

async function getBookById(id) {
    return apiCall(`/books/${id}`);
}

async function createBook(bookData) {
    return apiCall('/books', 'POST', bookData);
}

async function updateBook(id, bookData) {
    return apiCall(`/books/${id}`, 'PUT', bookData);
}

async function deleteBook(id) {
    return apiCall(`/books/${id}`, 'DELETE');
}

async function searchBooks(title) {
    return apiCall(`/books/search?title=${encodeURIComponent(title)}`);
}

async function getBooksByCategory(categoryId) {
    return apiCall(`/books/category/${categoryId}`);
}

// ==============================
// CATEGORIES API
// ==============================

async function fetchCategories() {
    return apiCall('/categories');
}

async function getCategoryById(id) {
    return apiCall(`/categories/${id}`);
}

async function createCategory(categoryData) {
    return apiCall('/categories', 'POST', categoryData);
}

async function updateCategory(id, categoryData) {
    return apiCall(`/categories/${id}`, 'PUT', categoryData);
}

async function deleteCategory(id) {
    return apiCall(`/categories/${id}`, 'DELETE');
}

// ==============================
// USERS API
// ==============================

async function fetchUsers() {
    return apiCall('/admin/users');
}

async function getUserById(id) {
    return apiCall(buildUserEndpoint(id));
}

async function registerUser(userData) {
    return apiCall('/admin/users', 'POST', userData);
}

async function updateUser(id, userData) {
    return apiCall(buildUserEndpoint(id), 'PUT', userData);
}

async function deleteUser(id) {
    return apiCall(`/admin/users/${id}`, 'DELETE');
}

// ==============================
// REVIEWS API
// ==============================

async function createReview(reviewData) {
    return apiCall('/reviews', 'POST', reviewData);
}

async function getReviewsByBook(bookId) {
    return apiCall(`/reviews/book/${bookId}`);
}

async function getUserReviews(userId) {
    return apiCall(`/reviews/user/${userId}`);
}

async function getPendingReviews() {
    return apiCall('/reviews/pending');
}

async function approveReview(id) {
    return apiCall(`/reviews/${id}/approve`, 'PUT');
}

async function deleteReview(id) {
    return apiCall(`/reviews/${id}`, 'DELETE');
}

// ==============================
// ORDERS API
// ==============================

async function fetchOrders(page = 0, size = 20) {
    const response = await apiCall(`/admin/orders?page=${page}&size=${size}`);
    return response && response.orders ? response.orders : [];
}

async function getOrderById(id) {
    const response = await apiCall(`/admin/orders/${id}`);
    return response && response.order ? response.order : null;
}

async function updateOrderStatus(id, status) {
    const response = await apiCall(`/admin/orders/${id}/status?status=${status}`, 'PUT');
    return response && response.order ? response.order : null;
}

// ==============================
// NOTIFICATIONS API
// ==============================

async function getNotifications(userId) {
    return apiCall(`/notifications?userId=${userId}`);
}

async function getUnreadNotifications(userId) {
    return apiCall(`/notifications/unread?userId=${userId}`);
}

async function getUnreadCount(userId) {
    try {
        const response = await apiCall(`/notifications/unread-count?userId=${userId}`);
        return response && response.count ? response.count : 0;
    } catch (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }
}

async function markNotificationAsRead(id) {
    return apiCall(`/notifications/${id}/read`, 'PUT');
}

async function markAllNotificationsAsRead(userId) {
    return apiCall(`/notifications/mark-all-read?userId=${userId}`, 'PUT');
}

// Expose all API functions to global scope for use in other scripts
if (typeof window !== 'undefined') {
    window.fetchBooks = fetchBooks;
    window.getBookById = getBookById;
    window.createBook = createBook;
    window.updateBook = updateBook;
    window.deleteBook = deleteBook;
    window.searchBooks = searchBooks;
    window.getBooksByCategory = getBooksByCategory;
    window.fetchCategories = fetchCategories;
    window.getCategoryById = getCategoryById;
    window.createCategory = createCategory;
    window.updateCategory = updateCategory;
    window.deleteCategory = deleteCategory;
    window.fetchUsers = fetchUsers;
    window.getUserById = getUserById;
    window.registerUser = registerUser;
    window.updateUser = updateUser;
    window.deleteUser = deleteUser;
    window.createReview = createReview;
    window.getReviewsByBook = getReviewsByBook;
    window.getUserReviews = getUserReviews;
    window.getPendingReviews = getPendingReviews;
    window.approveReview = approveReview;
    window.deleteReview = deleteReview;
    window.fetchOrders = fetchOrders;
    window.getOrderById = getOrderById;
    window.updateOrderStatus = updateOrderStatus;
    window.getNotifications = getNotifications;
    window.getUnreadNotifications = getUnreadNotifications;
    window.getUnreadCount = getUnreadCount;
    window.markNotificationAsRead = markNotificationAsRead;
    window.markAllNotificationsAsRead = markAllNotificationsAsRead;
    window.apiCall = apiCall;
}
