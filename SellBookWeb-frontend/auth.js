// ==============================
// AUTHENTICATION MANAGEMENT
// ==============================

const API_BASE_URL = 'http://localhost:8080/api';

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

    async logout() {
        try {
            if (this.token) {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: this.getAuthHeader()
                });
            }
        } catch (e) { /* ignore */ }
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    getAuthHeader() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}

const auth = new AuthManager();

// Check authentication on page load
window.addEventListener('load', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage !== 'login.html') {
        if (!auth.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Redirect based on role
        if (currentPage === 'admin.html' && auth.getRole() !== 'ADMIN' && auth.getRole() !== 'SUPER_ADMIN') {
            window.location.href = 'customer.html';
        } else if (currentPage === 'customer.html' && (auth.getRole() === 'ADMIN' || auth.getRole() === 'SUPER_ADMIN')) {
            window.location.href = 'admin.html';
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

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function clearError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.remove('show');
}

function showAlert(message) {
    alert(message);
}

async function handleLogin(event) {
    event.preventDefault();
    clearError();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');

    // Validation
    if (!email || !password) {
        showError('Vui lòng điền đầy đủ thông tin');
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
            throw new Error(error.message || 'Đăng nhập thất bại');
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
        auth.setAuth(user, token);

        // Redirect based on role
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'customer.html';
        }
    } catch (error) {
        showError(error.message);
        btn.disabled = false;
        btn.innerHTML = 'Đăng nhập';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    clearError();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const phone = document.getElementById('registerPhone').value;
    const btn = document.getElementById('registerBtn');

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
        showError('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }

    if (password !== passwordConfirm) {
        showError('Mật khẩu không khớp');
        return;
    }

    if (password.length < 6) {
        showError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
        showError('Số điện thoại không hợp lệ, vui lòng nhập đúng 10 chữ số');
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
                name,
                email,
                phone: phone || '',
                password,
                role: 'CUSTOMER',
                active: true
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Đăng ký thất bại');
        }

        const data = await response.json();
        
        showAlert('Đăng ký thành công! Vui lòng đăng nhập.');
        
        // Clear form and switch to login
        document.getElementById('registerForm').reset();
        toggleForm('login');
        btn.disabled = false;
        btn.innerHTML = 'Đăng ký';
    } catch (error) {
        showError(error.message);
        btn.disabled = false;
        btn.innerHTML = 'Đăng ký';
    }
}

// For local testing without backend login (remove in production)
function loginAsDemo(email, role) {
    const user = {
        id: '123',
        name: role === 'ADMIN' ? 'Admin User' : 'Customer User',
        email: email,
        role: role,
        phone: '0123456789'
    };
    auth.setAuth(user, 'demo-token');
    
    if (role === 'ADMIN') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'customer.html';
    }
}
