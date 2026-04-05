// ==============================
// ADMIN VALIDATION INTEGRATION MODULE
// ==============================
// This module integrates form validations for admin pages
// Validates book, category, user, and order forms

/**
 * Setup validation for admin book form
 */
function setupAdminBookFormValidation() {
    console.log('Setting up admin book form validation...');
    
    const bookTitle = document.getElementById('bookTitle');
    const bookAuthor = document.getElementById('bookAuthor');
    const bookPrice = document.getElementById('bookPrice');
    const bookQuantity = document.getElementById('bookQuantity');
    const bookDiscount = document.getElementById('bookDiscount');
    
    if (bookTitle) {
        bookTitle.addEventListener('blur', () => {
            const result = validateRequired(bookTitle.value);
            applyFieldValidation(bookTitle, result);
        });
        bookTitle.addEventListener('input', () => {
            const result = validateRequired(bookTitle.value);
            applyFieldValidation(bookTitle, result);
        });
    }
    
    if (bookAuthor) {
        bookAuthor.addEventListener('blur', () => {
            const result = validateRequired(bookAuthor.value);
            applyFieldValidation(bookAuthor, result);
        });
        bookAuthor.addEventListener('input', () => {
            const result = validateRequired(bookAuthor.value);
            applyFieldValidation(bookAuthor, result);
        });
    }
    
    if (bookPrice) {
        bookPrice.addEventListener('blur', () => {
            const result = validatePrice(bookPrice.value);
            applyFieldValidation(bookPrice, result);
        });
        bookPrice.addEventListener('input', () => {
            const result = bookPrice.value ? validatePrice(bookPrice.value) : { isValid: true, error: null };
            applyFieldValidation(bookPrice, result);
        });
    }
    
    if (bookQuantity) {
        bookQuantity.addEventListener('blur', () => {
            const result = bookQuantity.value ? validateQuantity(bookQuantity.value) : { isValid: true, error: null };
            applyFieldValidation(bookQuantity, result);
        });
        bookQuantity.addEventListener('input', () => {
            const result = bookQuantity.value ? validateQuantity(bookQuantity.value) : { isValid: true, error: null };
            applyFieldValidation(bookQuantity, result);
        });
    }
    
    if (bookDiscount) {
        bookDiscount.addEventListener('blur', () => {
            const result = bookDiscount.value ? validateDiscount(bookDiscount.value) : { isValid: true, error: null };
            applyFieldValidation(bookDiscount, result);
        });
        bookDiscount.addEventListener('input', () => {
            const result = bookDiscount.value ? validateDiscount(bookDiscount.value) : { isValid: true, error: null };
            applyFieldValidation(bookDiscount, result);
        });
    }
}

/**
 * Setup validation for admin user form
 */
function setupAdminUserFormValidation() {
    console.log('Setting up admin user form validation...');
    
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userPhone = document.getElementById('userPhone');
    const userRole = document.getElementById('userRole');
    
    if (userName) {
        userName.addEventListener('blur', () => {
            const result = validateName(userName.value);
            applyFieldValidation(userName, result);
        });
        userName.addEventListener('input', () => {
            const result = validateName(userName.value);
            applyFieldValidation(userName, result);
        });
    }
    
    if (userEmail) {
        userEmail.addEventListener('blur', () => {
            const result = validateEmail(userEmail.value);
            applyFieldValidation(userEmail, result);
        });
        userEmail.addEventListener('input', () => {
            const value = (userEmail.value || '').trim();
            const shouldValidate = value.includes('@') || value.includes('.');
            const result = shouldValidate ? validateEmail(value) : { isValid: true, error: null };
            applyFieldValidation(userEmail, result);
        });
    }
    
    if (userPhone) {
        userPhone.addEventListener('blur', () => {
            const result = validatePhone(userPhone.value);
            applyFieldValidation(userPhone, result);
        });
        userPhone.addEventListener('input', () => {
            const result = validatePhone(userPhone.value);
            applyFieldValidation(userPhone, result);
        });
    }
    
    if (userRole) {
        userRole.addEventListener('change', () => {
            const result = validateRequired(userRole.value);
            applyFieldValidation(userRole, result);
        });
    }
}

/**
 * Apply validation CSS classes to a field
 */
function applyFieldValidation(field, validationResult) {
    if (!field) return;
    let feedbackEl = field.nextElementSibling;
    if (!feedbackEl || !feedbackEl.classList.contains('validation-feedback')) {
        feedbackEl = document.createElement('div');
        feedbackEl.className = 'validation-feedback hidden';
        field.parentElement.insertBefore(feedbackEl, field.nextElementSibling);
    }
    
    const isEmpty = !field.value || field.value.trim() === '';
    
    if (isEmpty && !field.hasAttribute('required')) {
        // Optional field and empty, remove validation classes
        field.classList.remove('is-valid', 'is-invalid');
        feedbackEl.textContent = '';
        feedbackEl.classList.add('hidden');
        feedbackEl.classList.remove('invalid');
    } else if (validationResult.isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
        feedbackEl.textContent = '';
        feedbackEl.classList.add('hidden');
        feedbackEl.classList.remove('invalid');
    } else {
        field.classList.remove('is-valid');
        field.classList.add('is-invalid');
        showFieldError(field, validationResult.error);
    }
}

/**
 * Show field error message
 */
function showFieldError(field, errorMessage) {
    let feedbackEl = field.nextElementSibling;
    if (!feedbackEl || !feedbackEl.classList.contains('validation-feedback')) {
        feedbackEl = document.createElement('div');
        feedbackEl.className = 'validation-feedback';
        field.parentElement.insertBefore(feedbackEl, field.nextElementSibling);
    }
    feedbackEl.textContent = errorMessage;
    feedbackEl.classList.add('invalid');
    feedbackEl.classList.remove('hidden');
}

/**
 * Validate admin book form before submission
 */
function validateAdminBookFormFull() {
    const bookTitle = document.getElementById('bookTitle');
    const bookAuthor = document.getElementById('bookAuthor');
    const bookPrice = document.getElementById('bookPrice');
    const bookQuantity = document.getElementById('bookQuantity');
    const bookDiscount = document.getElementById('bookDiscount');
    
    const errors = [];
    
    if (bookTitle) {
        const titleResult = validateRequired(bookTitle.value);
        if (!titleResult.isValid) {
            errors.push('Vui lòng nhập tên sách');
            applyFieldValidation(bookTitle, titleResult);
        }
    }
    
    if (bookAuthor) {
        const authorResult = validateRequired(bookAuthor.value);
        if (!authorResult.isValid) {
            errors.push('Vui lòng nhập tác giả');
            applyFieldValidation(bookAuthor, authorResult);
        }
    }
    
    if (bookPrice) {
        const priceResult = validatePrice(bookPrice.value);
        if (!priceResult.isValid) {
            errors.push(priceResult.error);
            applyFieldValidation(bookPrice, priceResult);
        }
    }
    
    if (bookQuantity && bookQuantity.value) {
        const qtyResult = validateQuantity(bookQuantity.value);
        if (!qtyResult.isValid) {
            errors.push(qtyResult.error);
            applyFieldValidation(bookQuantity, qtyResult);
        }
    }
    
    if (bookDiscount && bookDiscount.value) {
        const discountResult = validateDiscount(bookDiscount.value);
        if (!discountResult.isValid) {
            errors.push(discountResult.error);
            applyFieldValidation(bookDiscount, discountResult);
        }
    }
    
    return { isValid: errors.length === 0, errors };
}

/**
 * Validate admin user form before submission
 */
function validateAdminUserFormFull() {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userPhone = document.getElementById('userPhone');
    const userRole = document.getElementById('userRole');
    
    const errors = [];
    
    if (userName) {
        const nameResult = validateName(userName.value);
        if (!nameResult.isValid) {
            errors.push(nameResult.error);
            applyFieldValidation(userName, nameResult);
        }
    }
    
    if (userEmail) {
        const emailResult = validateEmail(userEmail.value);
        if (!emailResult.isValid) {
            errors.push(emailResult.error);
            applyFieldValidation(userEmail, emailResult);
        }
    }
    
    if (userPhone) {
        const phoneResult = validatePhone(userPhone.value);
        if (!phoneResult.isValid) {
            errors.push(phoneResult.error);
            applyFieldValidation(userPhone, phoneResult);
        }
    }
    
    if (userRole) {
        const roleResult = validateRequired(userRole.value);
        if (!roleResult.isValid) {
            errors.push('Vui lòng chọn vai trò');
            applyFieldValidation(userRole, roleResult);
        }
    }
    
    return { isValid: errors.length === 0, errors };
}

/**
 * Initialize admin form validations on page load
 */
function initializeAdminFormValidations() {
    console.log('Initializing admin form validations...');
    
    // Setup initial validation
    setupAdminBookFormValidation();
    setupAdminUserFormValidation();
    
    // Listen for modal opens
    const setupValidationForModal = () => {
        setTimeout(() => {
            setupAdminBookFormValidation();
            setupAdminUserFormValidation();
        }, 100);
    };
    
    // Hook into modal show events if they exist
    document.addEventListener('show-modal', setupValidationForModal);
}

/**
 * Initialize admin validations on DOM ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAdminFormValidations);
} else {
    initializeAdminFormValidations();
}

// Watch for dynamically added modal content
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Re-initialize validation if forms are added to DOM
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    if (typeof node.querySelector === 'function' && (node.querySelector('.book-form') || node.querySelector('.user-form'))) {
                        setTimeout(() => {
                            setupAdminBookFormValidation();
                            setupAdminUserFormValidation();
                        }, 50);
                    }
                }
            });
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });
