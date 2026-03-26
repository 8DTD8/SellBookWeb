/**
 * VALIDATOR UTILITIES
 * ==================
 * 
 * Form validation, field validation, and business logic validation
 */

// ===============================
// EMAIL VALIDATION
// ===============================
function isValidEmail(email) {
    return VALIDATION_PATTERNS.EMAIL.test(email);
}

// ===============================
// PASSWORD VALIDATION
// ===============================
function isStrongPassword(password) {
    if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
        return false;
    }
    if (PASSWORD_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        return false;
    }
    if (PASSWORD_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        return false;
    }
    if (PASSWORD_CONFIG.REQUIRE_DIGITS && !/[0-9]/.test(password)) {
        return false;
    }
    if (PASSWORD_CONFIG.REQUIRE_SPECIAL && !new RegExp(`[${PASSWORD_CONFIG.SPECIAL_CHARS}]`).test(password)) {
        return false;
    }
    return true;
}

// ===============================
// PHONE VALIDATION
// ===============================
function isValidPhone(phone) {
    if (!phone) return true; // Optional field
    return VALIDATION_PATTERNS.PHONE.test(phone);
}

// ===============================
// NAME VALIDATION
// ===============================
function isValidName(name) {
    return name && name.trim().length >= 2;
}

// ===============================
// URL VALIDATION
// ===============================
function isValidUrl(url) {
    return VALIDATION_PATTERNS.URL.test(url);
}

// ===============================
// LOGIN FORM VALIDATION
// ===============================
function validateLoginForm(email, password) {
    const errors = [];
    
    if (!email || email.trim() === '') {
        errors.push('Email là bắt buộc');
    } else if (!isValidEmail(email)) {
        errors.push(ERROR_MESSAGES.INVALID_EMAIL);
    }
    
    if (!password || password === '') {
        errors.push('Mật khẩu là bắt buộc');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// ===============================
// REGISTER FORM VALIDATION
// ===============================
function validateRegisterForm(name, email, password, confirmPassword, phone = '') {
    const errors = [];
    
    if (!name || !isValidName(name)) {
        errors.push('Tên phải có ít nhất 2 ký tự');
    }
    
    if (!email || !isValidEmail(email)) {
        errors.push(ERROR_MESSAGES.INVALID_EMAIL);
    }
    
    if (!password || !isStrongPassword(password)) {
        errors.push(ERROR_MESSAGES.WEAK_PASSWORD);
    }
    
    if (password !== confirmPassword) {
        errors.push(ERROR_MESSAGES.PASSWORD_MISMATCH);
    }
    
    if (phone && !isValidPhone(phone)) {
        errors.push('Số điện thoại không hợp lệ');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// ===============================
// ORDER FORM VALIDATION
// ===============================
function validateOrderForm(address, city, phone) {
    const errors = [];
    
    if (!address || address.trim() === '') {
        errors.push('Địa chỉ là bắt buộc');
    }
    
    if (!city || city.trim() === '') {
        errors.push('Thành phố là bắt buộc');
    }
    
    if (!phone || !isValidPhone(phone)) {
        errors.push('Số điện thoại không hợp lệ');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// ===============================
// REVIEW FORM VALIDATION
// ===============================
function validateReviewForm(rating, comment) {
    const errors = [];
    
    if (!rating || rating < 1 || rating > 5) {
        errors.push('Đánh giá phải từ 1 đến 5 sao');
    }
    
    if (!comment || comment.trim().length < 10) {
        errors.push('Bình luận phải có ít nhất 10 ký tự');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// ===============================
// PRICE VALIDATION
// ===============================
function isValidPrice(price) {
    return !isNaN(price) && price > 0 && price < 1000000000;
}

// ===============================
// QUANTITY VALIDATION
// ===============================
function isValidQuantity(quantity) {
    return Number.isInteger(quantity) && quantity > 0 && quantity < 1000;
}

// ===============================
// DISCOUNT VALIDATION  
// ===============================
function isValidDiscount(discount) {
    return !isNaN(discount) && discount >= 0 && discount <= 100;
}

// ===============================
// STOCK VALIDATION
// ===============================
function isValidStock(stock) {
    return Number.isInteger(stock) && stock >= 0;
}

// ===============================
// EMPTY FIELD CHECK
// ===============================
function isEmpty(value) {
    return !value || (typeof value === 'string' && value.trim() === '');
}

// ===============================
// DISPLAY ERROR MESSAGES
// ===============================
function displayErrors(errors, errorsContainerId = 'errorContainer') {
    const container = document.getElementById(errorsContainerId);
    if (!container) return;
    
    container.innerHTML = '';
    if (errors.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    const errorHTML = errors.map(error => `
        <div class="error-item">
            <i class="fas fa-exclamation-circle"></i>
            <span>${error}</span>
        </div>
    `).join('');
    
    container.innerHTML = errorHTML;
    container.style.display = 'block';
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        container.style.display = 'none';
    }, 5000);
}

// ===============================  
// SERVER RESPONSE VALIDATION
// ===============================
function isValidResponse(response) {
    return response && typeof response === 'object' && !response.error;
}
