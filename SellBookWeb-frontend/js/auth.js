// ==============================
// AUTHENTICATION MANAGEMENT
// ==============================

const API_BASE_URL = (window.WEB_CONFIG && window.WEB_CONFIG.API_BASE_URL)
    ? window.WEB_CONFIG.API_BASE_URL
    : 'http://localhost:8080/api';

class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getRole() {
        return this.user?.role || null;
    }

    getUser() {
        return this.user;
    }

    setAuth(user, token) {
        this.user = user;
        this.token = token;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to customer page so guest can still browse
        const currentPage = window.location.pathname.split('/').pop() || '';
        if (currentPage === 'admin.html') {
            window.location.href = 'customer.html';
        } else {
            // Reload same page (customer.html) with guest state
            window.location.reload();
        }
    }

    getAuthHeader() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

const auth = new AuthManager();
let authEventsBound = false;

function isAdminRole(role) {
    const normalizedRole = (role || '').toUpperCase();
    return normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN';
}

function setupAuthEventDelegation() {
    if (authEventsBound) {
        return;
    }

    const hasAuthForms = document.getElementById('loginForm') || document.getElementById('registerForm') || document.getElementById('forgotPasswordForm');
    if (!hasAuthForms) {
        return;
    }

    document.addEventListener('click', (event) => {
        const actionElement = event.target.closest('[data-auth-action]');
        if (!actionElement) {
            return;
        }

        const action = actionElement.dataset.authAction;

        if (action === 'toggle-form') {
            event.preventDefault();
            toggleForm(actionElement.dataset.form);
            return;
        }

        if (action === 'open-forgot-password') {
            event.preventDefault();
            openForgotPasswordModal();
            return;
        }

        if (action === 'close-forgot-password') {
            closeForgotPasswordModal();
            return;
        }

        if (action === 'request-forgot-otp') {
            requestForgotPasswordOtp();
            return;
        }

        if (action === 'verify-forgot-otp') {
            verifyForgotPasswordOtp();
            return;
        }

        if (action === 'toggle-password') {
            togglePasswordVisibility(actionElement);
        }
    });

    document.addEventListener('submit', (event) => {
        const submitForm = event.target.closest('form[data-auth-submit]');
        if (!submitForm) {
            return;
        }

        const submitType = submitForm.dataset.authSubmit;

        if (submitType === 'login') {
            handleLogin(event);
            return;
        }

        if (submitType === 'register') {
            handleRegister(event);
            return;
        }

        if (submitType === 'forgot-reset') {
            handleForgotPasswordReset(event);
        }
    });

    authEventsBound = true;
}

window.addEventListener('DOMContentLoaded', () => {
    setupAuthEventDelegation();
});

// Check authentication on page load
window.addEventListener('load', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage !== 'login.html') {
        // customer.html is publicly accessible (guest browsing)
        if (currentPage === 'customer.html') {
            // Only redirect admins away from customer page
            if (auth.isAuthenticated() && isAdminRole(auth.getRole())) {
                window.location.href = 'admin.html';
            }
            return;
        }

        if (!auth.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Redirect based on role
        if (currentPage === 'admin.html' && !isAdminRole(auth.getRole())) {
            window.location.href = 'customer.html';
        }
    }
});

// ==============================
// LOGIN/REGISTER FUNCTIONS
// ==============================

function toggleForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleBtns = document.querySelectorAll('.toggle-btn');

    if (formType === 'login') {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        toggleBtns[0].classList.add('active');
        toggleBtns[1].classList.remove('active');
    } else {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        toggleBtns[0].classList.remove('active');
        toggleBtns[1].classList.add('active');
    }
    clearError();
}

function togglePasswordVisibility(actionElement) {
    const targetId = actionElement?.dataset?.passwordTarget;
    if (!targetId) return;

    const input = document.getElementById(targetId);
    if (!input) return;

    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    actionElement.textContent = isHidden ? 'Ẩn' : 'Hiện';
    actionElement.setAttribute('aria-label', isHidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
}

function showMessage(message, type = 'error') {
    const box = document.getElementById('errorMessage');
    if (!box) return;

    box.textContent = message;
    box.classList.remove('error-type', 'success-type', 'info-type');
    if (type === 'success') {
        box.classList.add('success-type');
    } else if (type === 'info') {
        box.classList.add('info-type');
    } else {
        box.classList.add('error-type');
    }

    box.classList.add('show');
}

function showError(message) {
    showMessage(message, 'error');
}

function clearError() {
    const errorDiv = document.getElementById('errorMessage');
    if (!errorDiv) return;

    errorDiv.textContent = '';
    errorDiv.classList.remove('show', 'error-type', 'success-type', 'info-type');
}

function showAlert(message) {
    showMessage(message, 'success');
}

function showForgotPasswordMessage(message, type = 'error') {
    const box = document.getElementById('forgotPasswordMessage');
    if (!box) {
        showMessage(message, type);
        return;
    }

    box.textContent = message;
    box.classList.remove('error-type', 'success-type', 'info-type');
    if (type === 'success') {
        box.classList.add('success-type');
    } else if (type === 'info') {
        box.classList.add('info-type');
    } else {
        box.classList.add('error-type');
    }

    box.classList.add('show');
}

function clearForgotPasswordMessage() {
    const box = document.getElementById('forgotPasswordMessage');
    if (!box) return;

    box.textContent = '';
    box.classList.remove('show', 'error-type', 'success-type', 'info-type');
}

function isStrongPasswordInput(password) {
    return typeof password === 'string'
        && password.length >= 8
        && /[A-Z]/.test(password)
        && /[a-z]/.test(password)
        && /\d/.test(password)
        && /[!@#$%^&*]/.test(password);
}

let forgotPasswordOtpVerified = false;

function updateForgotPasswordStepUI() {
    const resetSection = document.getElementById('forgotResetSection');
    const resetBtn = document.getElementById('forgotResetBtn');
    const verifySection = document.getElementById('otpVerifySection');

    if (forgotPasswordOtpVerified) {
        if (resetSection) resetSection.classList.remove('hidden');
        if (resetBtn) resetBtn.classList.remove('hidden');
        if (verifySection) verifySection.classList.add('hidden');
    } else {
        if (resetSection) resetSection.classList.add('hidden');
        if (resetBtn) resetBtn.classList.add('hidden');
        if (verifySection) verifySection.classList.remove('hidden');
    }
}

function openForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    forgotPasswordOtpVerified = false;
    updateForgotPasswordStepUI();
    clearForgotPasswordMessage();
    if (modal) {
        modal.classList.add('show');
    }
}

function closeForgotPasswordModal() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.classList.remove('show');
    }

    const form = document.getElementById('forgotPasswordForm');
    if (form) {
        form.reset();
    }

    forgotPasswordOtpVerified = false;
    updateForgotPasswordStepUI();
    clearForgotPasswordMessage();
}

async function requestForgotPasswordOtp() {
    clearForgotPasswordMessage();

    forgotPasswordOtpVerified = false;
    updateForgotPasswordStepUI();

    const email = (document.getElementById('forgotEmail')?.value || '').trim();

    if (!email) {
        showForgotPasswordMessage('Vui lòng nhập email để đặt lại mật khẩu');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showForgotPasswordMessage('Vui lòng nhập email đúng định dạng (ví dụ: ten@domain.com)');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password/request-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email
            })
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload.error || payload.message || 'Không thể gửi OTP. Vui lòng thử lại sau.');
        }

        showForgotPasswordMessage(payload.message || 'OTP đã được gửi đến email của bạn.', 'info');
    } catch (error) {
        showForgotPasswordMessage(error.message || 'Không thể gửi OTP. Vui lòng thử lại sau.');
    }
}

async function verifyForgotPasswordOtp() {
    clearForgotPasswordMessage();

    const email = (document.getElementById('forgotEmail')?.value || '').trim();
    const otp = (document.getElementById('forgotOtp')?.value || '').trim();

    if (!email) {
        showForgotPasswordMessage('Vui lòng nhập email để xác thực OTP');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showForgotPasswordMessage('Vui lòng nhập email đúng định dạng (ví dụ: ten@domain.com)');
        return;
    }

    if (!/^\d{6}$/.test(otp)) {
        showForgotPasswordMessage('OTP phải gồm đúng 6 chữ số');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                otp
            })
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload.error || payload.message || 'OTP không hợp lệ hoặc đã hết hạn.');
        }

        forgotPasswordOtpVerified = true;
        updateForgotPasswordStepUI();
        showForgotPasswordMessage(payload.message || 'OTP hợp lệ. Vui lòng nhập mật khẩu mới.', 'success');
    } catch (error) {
        forgotPasswordOtpVerified = false;
        updateForgotPasswordStepUI();
        showForgotPasswordMessage(error.message || 'OTP không hợp lệ hoặc đã hết hạn.');
    }
}

async function handleForgotPasswordReset(event) {
    event.preventDefault();
    clearForgotPasswordMessage();

    const email = (document.getElementById('forgotEmail')?.value || '').trim();
    const otp = (document.getElementById('forgotOtp')?.value || '').trim();
    const newPassword = document.getElementById('forgotNewPassword')?.value || '';
    const confirmPassword = document.getElementById('forgotConfirmPassword')?.value || '';

    if (!forgotPasswordOtpVerified) {
        showForgotPasswordMessage('Vui lòng xác nhận OTP trước khi đổi mật khẩu');
        return;
    }

    if (!email) {
        showForgotPasswordMessage('Vui lòng nhập email để đặt lại mật khẩu');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showForgotPasswordMessage('Vui lòng nhập email đúng định dạng (ví dụ: ten@domain.com)');
        return;
    }

    if (!otp) {
        showForgotPasswordMessage('Vui lòng nhập mã OTP');
        return;
    }

    if (!/^\d{6}$/.test(otp)) {
        showForgotPasswordMessage('OTP phải gồm đúng 6 chữ số');
        return;
    }

    if (!isStrongPasswordInput(newPassword)) {
        showForgotPasswordMessage('Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (!@#$%^&*)');
        return;
    }

    if (newPassword !== confirmPassword) {
        showForgotPasswordMessage('Xác nhận mật khẩu mới không khớp');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                otp,
                newPassword
            })
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(payload.error || payload.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại sau.');
        }

        closeForgotPasswordModal();
        showAlert(payload.message || 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.');
    } catch (error) {
        showForgotPasswordMessage(error.message || 'Không thể đặt lại mật khẩu, vui lòng thử lại');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    clearError();

    const email = (document.getElementById('loginEmail').value || '').trim();
    const password = document.getElementById('loginPassword').value || '';
    const btn = document.getElementById('loginBtn');

    // Validation
    if (!email) {
        showError('Vui lòng nhập email đăng nhập');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Vui lòng nhập email đúng định dạng (ví dụ: ten@domain.com)');
        return;
    }

    if (!password) {
        showError('Vui lòng nhập mật khẩu đăng nhập');
        return;
    }

    if (password.length < 8) {
        showError('Mật khẩu phải có ít nhất 8 ký tự');
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span> Đang xử lý...';

        // Call login API
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || error.message || 'Đăng nhập chưa thành công. Vui lòng kiểm tra lại thông tin.');
        }

        const data = await response.json();
        
        // Save auth data
        // API returns { accessToken, refreshToken, user: { id, name, email, ... } }
        const userData = data.user || data; // Fallback to data if user is not nested
        const user = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            phone: userData.phone || ''
        };

        const token = data.accessToken || data.token; // Support both accessToken and token
        if (!token) {
            throw new Error('Đăng nhập chưa thành công. Vui lòng thử lại sau.');
        }
        auth.setAuth(user, token);

        // Redirect based on role
        if (isAdminRole(user.role)) {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'customer.html';
        }
    } catch (error) {
        showError(error.message || 'Đăng nhập chưa thành công. Vui lòng thử lại sau.');
        btn.disabled = false;
        btn.innerHTML = 'Đăng nhập';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    clearError();

    const username = (document.getElementById('registerUsername')?.value || '').trim();
    const email = (document.getElementById('registerEmail').value || '').trim();
    const password = document.getElementById('registerPassword').value || '';
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value || '';
    const btn = document.getElementById('registerBtn');

    // Validation

    if (!username) {
        showError('Vui lòng nhập username đăng ký');
        return;
    }

    if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) {
        showError('Username chỉ gồm chữ, số, dấu chấm, gạch dưới, gạch ngang và dài 3-30 ký tự');
        return;
    }

    if (!email) {
        showError('Vui lòng nhập email đăng ký');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('Vui lòng nhập email đúng định dạng (ví dụ: ten@domain.com)');
        return;
    }

    if (!password) {
        showError('Vui lòng nhập mật khẩu đăng ký');
        return;
    }

    if (!isStrongPasswordInput(password)) {
        showError('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (!@#$%^&*)');
        return;
    }

    if (password !== passwordConfirm) {
        showError('Xác nhận mật khẩu không khớp');
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span> Đang xử lý...';

        // Register user
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: username,
                username,
                email,
                phone: '',
                password,
                role: 'CUSTOMER',
                active: true
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || error.message || 'Đăng ký chưa thành công. Vui lòng thử lại sau.');
        }

        const data = await response.json();
        
        showAlert('Đăng ký thành công. Vui lòng đăng nhập để tiếp tục.');
        
        // Clear form and switch to login
        document.getElementById('registerForm').reset();
        toggleForm('login');
        btn.disabled = false;
        btn.innerHTML = 'Đăng ký';
    } catch (error) {
        showError(error.message || 'Đăng ký chưa thành công. Vui lòng thử lại sau.');
        btn.disabled = false;
        btn.innerHTML = 'Đăng ký';
    }
}

// For local testing without backend login (remove in production)
function loginAsDemo(email, role) {
    const user = {
        id: '123',
        name: isAdminRole(role) ? 'Admin User' : 'Customer User',
        email: email,
        role: role,
        phone: '0123456789'
    };
    auth.setAuth(user, 'demo-token');
    
    if (isAdminRole(role)) {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'customer.html';
    }
}
