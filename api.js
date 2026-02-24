// API Base URL
const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Add authorization token if available
        if (typeof auth !== 'undefined' && auth.token) {
            options.headers['Authorization'] = `Bearer ${auth.token}`;
        }

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (response.status === 401) {
            // Token expired or invalid
            if (typeof auth !== 'undefined') {
                auth.logout();
            }
            throw new Error('Phiên đăng nhập đã hết hạn');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error: ${response.statusText}`);
        }

        return await response.json();
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
    return apiCall('/users');
}

async function getUserById(id) {
    return apiCall(`/users/${id}`);
}

async function registerUser(userData) {
    return apiCall('/users/register', 'POST', userData);
}

async function updateUser(id, userData) {
    return apiCall(`/users/${id}`, 'PUT', userData);
}

async function deleteUser(id) {
    return apiCall(`/users/${id}`, 'DELETE');
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
