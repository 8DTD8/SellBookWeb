// ==============================
// LOGIN PAGE VALIDATION INTEGRATION
// ==============================
// This module handles validation for login and register forms

/**
 * Setup validation for login form
 */
function setupLoginFormValidation() {
    console.log('Setting up login form validation...');
    
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    if (loginEmail) {
        loginEmail.addEventListener('blur', () => {
            const result = validateEmail(loginEmail.value);
            applyFieldValidation(loginEmail, result);
        });
        loginEmail.addEventListener('input', () => {
            const result = loginEmail.value ? validateEmail(loginEmail.value) : { isValid: true, error: null };
            applyFieldValidation(loginEmail, result);
        });
    }
    
    if (loginPassword) {
        loginPassword.addEventListener('blur', () => {
            const result = validatePassword(loginPassword.value);
            applyFieldValidation(loginPassword, result);
        });
        loginPassword.addEventListener('input', () => {
            const result = loginPassword.value ? validatePassword(loginPassword.value) : { isValid: true, error: null };
            applyFieldValidation(loginPassword, result);
        });
    }
}

/**
 * Setup validation for register form
 */
function setupRegisterFormValidation() {
    console.log('Setting up register form validation...');
    
    const registerName = document.getElementById('registerName');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
    const registerPhone = document.getElementById('registerPhone');
    
    if (registerName) {
        registerName.addEventListener('blur', () => {
            const result = validateName(registerName.value);
            applyFieldValidation(registerName, result);
        });
        registerName.addEventListener('input', () => {
            const result = validateName(registerName.value);
            applyFieldValidation(registerName, result);
        });
    }
    
    if (registerEmail) {
        registerEmail.addEventListener('blur', () => {
            const result = validateEmail(registerEmail.value);
            applyFieldValidation(registerEmail, result);
        });
        registerEmail.addEventListener('input', () => {
            const result = validateEmail(registerEmail.value);
            applyFieldValidation(registerEmail, result);
        });
    }
    
    if (registerPassword) {
        registerPassword.addEventListener('blur', () => {
            const result = validatePassword(registerPassword.value);
            applyFieldValidation(registerPassword, result);
        });
        registerPassword.addEventListener('input', () => {
            const result = validatePassword(registerPassword.value);
            applyFieldValidation(registerPassword, result);
            
            // Also validate confirm password if it has a value
            if (registerPasswordConfirm && registerPasswordConfirm.value) {
                validatePasswordMatch();
            }
        });
    }
    
    if (registerPasswordConfirm) {
        registerPasswordConfirm.addEventListener('blur', validatePasswordMatch);
        registerPasswordConfirm.addEventListener('input', validatePasswordMatch);
    }
    
    if (registerPhone) {
        registerPhone.addEventListener('blur', () => {
            const result = validatePhone(registerPhone.value);
            applyFieldValidation(registerPhone, result);
        });
        registerPhone.addEventListener('input', () => {
            const result = validatePhone(registerPhone.value);
            applyFieldValidation(registerPhone, result);
        });
    }
}

/**
 * Validate password confirmation
 */
function validatePasswordMatch() {
    const registerPassword = document.getElementById('registerPassword');
    const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
    
    if (!registerPasswordConfirm) return;
    
    const pwd1 = registerPassword?.value || '';
    const pwd2 = registerPasswordConfirm.value;
    
    const result = {
        isValid: pwd1 === pwd2 && pwd1.length >= 6,
        error: pwd1 !== pwd2 ? 'Mật khẩu không khớp' : (pwd1.length < 6 ? 'Mật khẩu phải có ít nhất 6 ký tự' : null)
    };
    
    applyFieldValidation(registerPasswordConfirm, result);
}

/**
 * Apply validation CSS classes to a field
 */
function applyFieldValidation(field, validationResult) {
    if (!field) return;
    
    const isEmpty = !field.value || field.value.trim() === '';
    
    if (isEmpty && !field.hasAttribute('required')) {
        // Optional field and empty, remove validation classes
        field.classList.remove('is-valid', 'is-invalid');
    } else if (validationResult.isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
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
 * Validate login form before submission
 */
function validateLoginFormFull() {
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    const errors = [];
    
    if (loginEmail) {
        const emailResult = validateEmail(loginEmail.value);
        if (!emailResult.isValid) {
            errors.push(emailResult.error);
            applyFieldValidation(loginEmail, emailResult);
        }
    }
    
    if (loginPassword) {
        const passwordResult = validatePassword(loginPassword.value);
        if (!passwordResult.isValid) {
            errors.push(passwordResult.error);
            applyFieldValidation(loginPassword, passwordResult);
        }
    }
    
    return { isValid: errors.length === 0, errors };
}

/**
 * Validate register form before submission
 */
function validateRegisterFormFull() {
    const registerName = document.getElementById('registerName');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const registerPasswordConfirm = document.getElementById('registerPasswordConfirm');
    const registerPhone = document.getElementById('registerPhone');
    
    const errors = [];
    
    if (registerName) {
        const nameResult = validateName(registerName.value);
        if (!nameResult.isValid) {
            errors.push(nameResult.error);
            applyFieldValidation(registerName, nameResult);
        }
    }
    
    if (registerEmail) {
        const emailResult = validateEmail(registerEmail.value);
        if (!emailResult.isValid) {
            errors.push(emailResult.error);
            applyFieldValidation(registerEmail, emailResult);
        }
    }
    
    if (registerPassword) {
        const passwordResult = validatePassword(registerPassword.value);
        if (!passwordResult.isValid) {
            errors.push(passwordResult.error);
            applyFieldValidation(registerPassword, passwordResult);
        }
    }
    
    if (registerPasswordConfirm) {
        const pwd = registerPassword?.value || '';
        const confirmPwd = registerPasswordConfirm.value;
        if (pwd !== confirmPwd) {
            errors.push('Mật khẩu không khớp');
            applyFieldValidation(registerPasswordConfirm, { isValid: false, error: 'Mật khẩu không khớp' });
        }
    }
    
    if (registerPhone) {
        const phoneResult = validatePhone(registerPhone.value);
        if (!phoneResult.isValid) {
            errors.push(phoneResult.error);
            applyFieldValidation(registerPhone, phoneResult);
        }
    }
    
    return { isValid: errors.length === 0, errors };
}

/**
 * Initialize all login page validations
 */
function initializeLoginPageValidations() {
    console.log('Initializing login page validations...');
    
    setupLoginFormValidation();
    setupRegisterFormValidation();
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLoginPageValidations);
} else {
    initializeLoginPageValidations();
}
