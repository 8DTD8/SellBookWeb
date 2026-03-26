/**
 * ENHANCED FORM VALIDATION UTILITIES
 * ==================================
 * 
 * Comprehensive form validation with real-time feedback
 * and constraint checking for all application forms
 */

// ===============================
// FIELD-LEVEL VALIDATORS
// ===============================

// Email: Standard email format
function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
        isValid: regex.test(email),
        error: regex.test(email) ? null : 'Email không hợp lệ'
    };
}

// Phone: Vietnamese 10-digit phone
function validatePhone(phone) {
    if (!phone) return { isValid: true, error: null }; // Optional field
    const regex = /^[0-9]{10}$/;
    return {
        isValid: regex.test(phone),
        error: regex.test(phone) ? null : 'Số điện thoại phải là 10 chữ số'
    };
}

// ISBN: 10 or 13 digits
function validateISBN(isbn) {
    const regex = /^(\d{10}|\d{13})$/;
    return {
        isValid: regex.test(isbn),
        error: regex.test(isbn) ? null : 'ISBN phải là 10 hoặc 13 chữ số'
    };
}

// Price: Must be positive number
function validatePrice(price) {
    const num = parseFloat(price);
    return {
        isValid: num > 0 && !isNaN(num),
        error: (num > 0 && !isNaN(num)) ? null : 'Giá phải lớn hơn 0'
    };
}

// Quantity: Must be positive integer, not zero
function validateQuantity(quantity) {
    const num = parseInt(quantity, 10);
    return {
        isValid: num > 0 && !isNaN(num),
        error: (num > 0 && !isNaN(num)) ? null : 'Số lượng phải lớn hơn 0'
    };
}

// Discount: 0-100 percent
function validateDiscount(discount) {
    const num = parseFloat(discount);
    return {
        isValid: num >= 0 && num <= 100 && !isNaN(num),
        error: (num >= 0 && num <= 100 && !isNaN(num)) ? null : 'Giảm giá phải từ 0 đến 100%'
    };
}

// Password: Min 6 characters
function validatePassword(password) {
    return {
        isValid: password && password.length >= 6,
        error: (password && password.length >= 6) ? null : 'Mật khẩu phải có ít nhất 6 ký tự'
    };
}

// Name: Min 2 characters, not empty
function validateName(name) {
    const trimmed = (name || '').trim();
    return {
        isValid: trimmed.length >= 2,
        error: trimmed.length >= 2 ? null : 'Tên phải có ít nhất 2 ký tự'
    };
}

// Required field (not empty)
function validateRequired(value, fieldName = 'Trường') {
    const isValid = value && (typeof value === 'string' ? value.trim() : value) ? true : false;
    return {
        isValid: isValid,
        error: isValid ? null : `${fieldName} là bắt buộc`
    };
}

// ===============================
// REAL-TIME VALIDATION FEEDBACK
// ===============================

/**
 * Add real-time validation to an input field
 * @param {HTMLElement} inputElement - Input element to validate
 * @param {Function} validationFn - Validation function
 * @param {Object} options - Display options
 */
function setupFieldValidator(inputElement, validationFn, options = {}) {
    const feedbackElement = options.feedbackElement || inputElement.nextElementSibling;
    const containerClass = options.containerClass || 'form-group';
    const container = inputElement.closest(`.${containerClass}`);
    
    function showValidation() {
        const result = validationFn(inputElement.value);
        
        // Remove previous feedback classes
        if (feedbackElement) {
            feedbackElement.classList.remove('valid', 'invalid', 'hidden');
            feedbackElement.textContent = result.error || '✓ Hợp lệ';
        }
        
        if (result.isValid) {
            inputElement.classList.remove('is-invalid');
            inputElement.classList.add('is-valid');
            if (feedbackElement) feedbackElement.classList.add('valid');
        } else {
            inputElement.classList.remove('is-valid');
            inputElement.classList.add('is-invalid');
            if (feedbackElement) feedbackElement.classList.add('invalid');
        }
        
        return result.isValid;
    }
    
    // Validate on input, blur, and change
    inputElement.addEventListener('input', showValidation);
    inputElement.addEventListener('blur', showValidation);
    inputElement.addEventListener('change', showValidation);
    
    // Initial validation if value exists
    if (inputElement.value) {
        showValidation();
    }
}

// ===============================
// VALIDATION FEEDBACK SYSTEM
// ===============================

/**
 * Create and append validation feedback element
 */
function createValidationFeedback(inputElement) {
    const feedback = document.createElement('small');
    feedback.className = 'validation-feedback hidden';
    inputElement.after(feedback);
    return feedback;
}

/**
 * Show validation error on element
 */
function showValidationError(inputElement, message) {
    inputElement.classList.add('is-invalid');
    inputElement.classList.remove('is-valid');
    
    let feedback = inputElement.nextElementSibling?.classList?.contains('validation-feedback') 
        ? inputElement.nextElementSibling 
        : createValidationFeedback(inputElement);
    
    feedback.textContent = message;
    feedback.classList.remove('hidden');
    feedback.classList.add('invalid');
}

/**
 * Show validation success on element
 */
function showValidationSuccess(inputElement) {
    inputElement.classList.remove('is-invalid');
    inputElement.classList.add('is-valid');
    
    let feedback = inputElement.nextElementSibling?.classList?.contains('validation-feedback') 
        ? inputElement.nextElementSibling 
        : createValidationFeedback(inputElement);
    
    feedback.textContent = '✓ Hợp lệ';
    feedback.classList.remove('hidden', 'invalid');
    feedback.classList.add('valid');
}

/**
 * Clear validation feedback
 */
function clearValidationFeedback(inputElement) {
    inputElement.classList.remove('is-invalid', 'is-valid');
    
    let feedback = inputElement.nextElementSibling?.classList?.contains('validation-feedback');
    if (feedback) {
        feedback.classList.add('hidden');
    }
}

// ===============================
// FORM-LEVEL VALIDATORS
// ===============================

// Login Form
function validateLoginForm(email, password) {
    const errors = [];
    
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) errors.push(emailVal.error);
    
    const passwordVal = validateRequired(password, 'Mật khẩu');
    if (!passwordVal.isValid) errors.push(passwordVal.error);
    
    return { isValid: errors.length === 0, errors };
}

// Register Form
function validateRegisterForm(name, email, password, confirmPassword, phone = '') {
    const errors = [];
    
    const nameVal = validateName(name);
    if (!nameVal.isValid) errors.push(nameVal.error);
    
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) errors.push(emailVal.error);
    
    const passwordVal = validatePassword(password);
    if (!passwordVal.isValid) errors.push(passwordVal.error);
    
    if (password !== confirmPassword) {
        errors.push('Mật khẩu không khớp');
    }
    
    const phoneVal = validatePhone(phone);
    if (!phoneVal.isValid) errors.push(phoneVal.error);
    
    return { isValid: errors.length === 0, errors };
}

// Checkout Recipient Info Form
function validateCheckoutRecipientInfo(name, phone, email) {
    const errors = [];
    
    const nameVal = validateName(name);
    if (!nameVal.isValid) errors.push(nameVal.error);
    
    const phoneVal = validatePhone(phone);
    if (!phoneVal.isValid) errors.push(phoneVal.error);
    
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) errors.push(emailVal.error);
    
    return { isValid: errors.length === 0, errors };
}

// Checkout Address Form
function validateCheckoutAddress(province, address) {
    const errors = [];
    
    const provinceVal = validateRequired(province, 'Tỉnh/Thành phố');
    if (!provinceVal.isValid) errors.push(provinceVal.error);
    
    const addressVal = validateRequired(address, 'Địa chỉ cụ thể');
    if (!addressVal.isValid) errors.push(addressVal.error);
    
    return { isValid: errors.length === 0, errors };
}

// Admin Book Form
function validateAdminBookForm(title, author, isbn, price, quantity, category) {
    const errors = [];
    
    const titleVal = validateRequired(title, 'Tiêu đề');
    if (!titleVal.isValid) errors.push(titleVal.error);
    
    const authorVal = validateRequired(author, 'Tác giả');
    if (!authorVal.isValid) errors.push(authorVal.error);
    
    const isbnVal = validateISBN(isbn);
    if (!isbnVal.isValid) errors.push(isbnVal.error);
    
    const priceVal = validatePrice(price);
    if (!priceVal.isValid) errors.push(priceVal.error);
    
    const quantityVal = validateQuantity(quantity);
    if (!quantityVal.isValid) errors.push(quantityVal.error);
    
    const categoryVal = validateRequired(category, 'Danh mục');
    if (!categoryVal.isValid) errors.push(categoryVal.error);
    
    return { isValid: errors.length === 0, errors };
}

// Admin User Form
function validateAdminUserForm(name, email, role) {
    const errors = [];
    
    const nameVal = validateName(name);
    if (!nameVal.isValid) errors.push(nameVal.error);
    
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) errors.push(emailVal.error);
    
    const roleVal = validateRequired(role, 'Vai trò');
    if (!roleVal.isValid) errors.push(roleVal.error);
    
    return { isValid: errors.length === 0, errors };
}

// Profile Edit Form
function validateProfileEditForm(name, email, phone = '') {
    const errors = [];
    
    const nameVal = validateName(name);
    if (!nameVal.isValid) errors.push(nameVal.error);
    
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) errors.push(emailVal.error);
    
    const phoneVal = validatePhone(phone);
    if (!phoneVal.isValid) errors.push(phoneVal.error);
    
    return { isValid: errors.length === 0, errors };
}

// ===============================
// CART VALIDATION
// ===============================

/**
 * Check if cart item quantity doesn't exceed available stock
 */
function validateCartItemQuantity(quantity, availableStock) {
    return quantity > 0 && quantity <= availableStock;
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

/**
 * Display form validation errors
 */
function displayFormErrors(form, errors) {
    // Clear previous errors
    const errorContainer = form.querySelector('.error-messages');
    if (errorContainer) {
        errorContainer.innerHTML = '';
        errorContainer.style.display = 'none';
    }
    
    if (errors.length > 0) {
        const errorDiv = form.querySelector('.error-messages') || createErrorContainer(form);
        
        errors.forEach(error => {
            const errorItem = document.createElement('div');
            errorItem.className = 'error-item';
            errorItem.textContent = error;
            errorDiv.appendChild(errorItem);
        });
        
        errorDiv.style.display = 'block';
    }
}

/**
 * Create error container if doesn't exist
 */
function createErrorContainer(form) {
    const container = document.createElement('div');
    container.className = 'error-messages';
    form.insertBefore(container, form.firstChild);
    return container;
}

/**
 * Calculate discount price in real-time
 */
function calculateDiscountedPrice(originalPrice, discountPercent) {
    const discount = (originalPrice * discountPercent) / 100;
    return Math.max(0, originalPrice - discount);
}

/**
 * Format currency (VND)
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}
