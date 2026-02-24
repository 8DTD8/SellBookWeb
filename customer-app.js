// ==============================
// CUSTOMER APP - GLOBAL VARIABLES
// ==============================

let allBooks = [];
let filteredBooks = [];
let cart = [];
let currentBook = null;
let myReviews = [];

const API_BASE_URL = 'http://localhost:8080/api';

// ==============================
// PAGE INITIALIZATION
// ==============================

document.addEventListener('DOMContentLoaded', () => {
    const user = auth.getUser();
    document.getElementById('userName').textContent = user.name;
    
    loadBooks();
    loadProfile();
    loadCart();
    
    // Search functionality
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filteredBooks = allBooks.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm)
        );
        renderBooks(filteredBooks);
    });
});

// ==============================
// SECTION MANAGEMENT
// ==============================

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    if (sectionId === 'myReviews') {
        loadMyReviews();
    }
}

// ==============================
// BOOKS LOADING & DISPLAY
// ==============================

async function loadBooks() {
    try {
        allBooks = await fetchBooks();
        if (!Array.isArray(allBooks)) {
            allBooks = [];
        }
        filteredBooks = [...allBooks];
        renderBooks(filteredBooks);
    } catch (error) {
        showAlert('Lỗi khi tải sách: ' + error.message);
    }
}

function renderBooks(books) {
    const container = document.getElementById('booksList');
    container.innerHTML = '';

    if (!Array.isArray(books) || books.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1;">Không tìm thấy sách</p>';
        return;
    }

    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="book-image">
                ${book.image ? `<img src="${book.image}" alt="${book.title}">` : '📚'}
            </div>
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-author">by ${book.author}</div>
                <div class="book-rating">${makeStars(book.rating || 0)}</div>
                <div class="book-price">${formatPrice(book.price)}</div>
                <div class="book-actions">
                    <button class="btn btn-primary btn-sm" onclick="showBookDetail('${book.id}')">Chi tiết</button>
                    <button class="btn btn-success btn-sm" onclick="addToCart('${book.id}')">Thêm 🛒</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function showBookDetail(bookId) {
    try {
        currentBook = await getBookById(bookId);
        const container = document.getElementById('bookDetailContent');
        
        const reviewsHTML = currentBook.rating ? `
            <div class="book-reviews">
                <h3>Đánh giá từ khách hàng</h3>
                <div id="reviewsList" class="reviews-container"></div>
                <button class="btn btn-primary" onclick="openReviewModal('${currentBook.id}')">Đánh giá sách này</button>
            </div>
        ` : '<p>Chưa có đánh giá</p>';
        
        container.innerHTML = `
            <a class="detail-back" onclick="showSection('home')">← Quay lại</a>
            <div class="detail-header">
                <div class="detail-image">
                    ${currentBook.image ? `<img src="${currentBook.image}" alt="${currentBook.title}">` : '📚'}
                </div>
                <div class="detail-info">
                    <h2>${currentBook.title}</h2>
                    <div class="detail-author">Tác giả: ${currentBook.author}</div>
                    <div class="detail-rating">Xếp hạng: ${makeStars(currentBook.rating || 0)} (${currentBook.rating || 'Chưa có'})</div>
                    <div class="detail-price">${formatPrice(currentBook.price)}</div>
                    <div class="detail-description">${currentBook.description || 'Không có mô tả'}</div>
                    <div class="detail-meta">
                        <div class="meta-item">
                            <label>Mã ISBN</label>
                            <p>${currentBook.isbn}</p>
                        </div>
                        <div class="meta-item">
                            <label>Số lượng có sẵn</label>
                            <p>${currentBook.quantity} quyển</p>
                        </div>
                    </div>
                    <div class="detail-actions">
                        <button class="btn btn-success" style="flex: 1;" onclick="addToCart('${currentBook.id}')">🛒 Thêm vào giỏ</button>
                        <button class="btn btn-primary" style="flex: 1;" onclick="openReviewModal('${currentBook.id}')">⭐ Đánh giá</button>
                    </div>
                </div>
            </div>
            ${reviewsHTML}
        `;
        
        // Load reviews for this book
        try {
            const reviews = await getReviewsByBook(bookId);
            if (Array.isArray(reviews) && reviews.length > 0) {
                const reviewsList = document.getElementById('reviewsList');
                if (reviewsList) {
                    reviewsList.innerHTML = '';
                    reviews.forEach(review => {
                        const item = document.createElement('div');
                        item.className = 'review-item';
                        item.innerHTML = `
                            <div class="review-header">
                                <div>
                                    <div class="review-user">${review.userName || 'Ẩn danh'}</div>
                                    <div class="review-rating">${makeStars(review.rating)}</div>
                                </div>
                            </div>
                            <div class="review-comment">${review.comment}</div>
                        `;
                        reviewsList.appendChild(item);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
        
        showSection('bookDetail');
    } catch (error) {
        showAlert('Lỗi khi tải chi tiết sách: ' + error.message);
    }
}

function filterByCategory() {
    const categoryId = document.getElementById('categorySelect').value;
    if (categoryId) {
        filteredBooks = allBooks.filter(book => book.categoryId === categoryId);
    } else {
        filteredBooks = [...allBooks];
    }
    sortBooks();
}

function sortBooks() {
    const sortType = document.getElementById('sortSelect').value;
    
    switch(sortType) {
        case 'priceLow':
            filteredBooks.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
        case 'priceHigh':
            filteredBooks.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
        case 'ratingHigh':
            filteredBooks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        default: // newest
            filteredBooks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    
    renderBooks(filteredBooks);
}

// Load categories for filter
async function loadCategories() {
    try {
        const categories = await fetchCategories();
        const select = document.getElementById('categorySelect');
        if (Array.isArray(categories)) {
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Initialize category filter on page load
window.addEventListener('load', loadCategories);

// ==============================
// CART MANAGEMENT
// ==============================

function addToCart(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    const existingItem = cart.find(item => item.id === bookId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: bookId,
            title: book.title,
            price: book.price,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();
    showAlert('Đã thêm vào giỏ hàng!');
}

function removeFromCart(bookId) {
    cart = cart.filter(item => item.id !== bookId);
    saveCart();
    updateCartCount();
    loadCart();
}

function updateCartQuantity(bookId, quantity) {
    const item = cart.find(i => i.id === bookId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart();
        loadCart();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
    renderCart();
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function renderCart() {
    const container = document.getElementById('cartContent');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <p>Giỏ hàng của bạn trống</p>
                <button class="btn btn-primary" onclick="showSection('home')">Tiếp tục mua sắm</button>
            </div>
        `;
        return;
    }

    let html = '<div>';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <input type="number" value="${item.quantity}" readonly>
                        <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    </div>
                    <div style="min-width: 100px; text-align: right;">
                        <div style="font-weight: 600; color: #667eea;">${formatPrice(itemTotal)}</div>
                        <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">Xóa</button>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
        <div class="cart-summary">
            <div class="summary-row">
                <span>Tạm tính:</span>
                <span>${formatPrice(total)}</span>
            </div>
            <div class="summary-row total">
                <span>Tổng cộng:</span>
                <span>${formatPrice(total)}</span>
            </div>
            <div class="cart-actions">
                <button class="btn btn-secondary" onclick="showSection('home')">Tiếp tục mua sắm</button>
                <button class="btn btn-primary" onclick="checkout()">Thanh toán</button>
            </div>
        </div>
    </div>`;

    container.innerHTML = html;
}

function checkout() {
    if (cart.length === 0) {
        showAlert('Giỏ hàng trống');
        return;
    }
    showAlert('Tính năng thanh toán sẽ được cập nhật!');
}

// ==============================
// PROFILE MANAGEMENT
// ==============================

function loadProfile() {
    const user = auth.getUser();
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profilePhone').textContent = user.phone || '-';
    document.getElementById('profileRole').textContent = user.role;
}

function showProfile() {
    loadProfile();
    showSection('profile');
}

function showEditProfile() {
    const user = auth.getUser();
    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.phone || '';
    
    document.getElementById('profileInfo').style.display = 'none';
    document.getElementById('editProfileForm').classList.remove('hidden');
}

function hideEditProfile() {
    document.getElementById('editProfileForm').classList.add('hidden');
}

async function saveProfile(event) {
    event.preventDefault();
    
    const userData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        role: auth.getUser().role,
        active: true
    };

    try {
        await updateUser(auth.getUser().id, userData);
        
        // Update local auth
        const user = auth.getUser();
        user.name = userData.name;
        user.email = userData.email;
        user.phone = userData.phone;
        auth.setAuth(user, auth.token);
        
        showAlert('Cập nhật thông tin thành công!');
        hideEditProfile();
        loadProfile();
    } catch (error) {
        showAlert('Lỗi: ' + error.message);
    }
}

// ==============================
// REVIEWS
// ==============================

let reviewingBookId = null;

function openReviewModal(bookId) {
    reviewingBookId = bookId;
    document.getElementById('reviewModal').classList.remove('hidden');
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.add('hidden');
    document.getElementById('reviewComment').value = '';
    document.querySelectorAll('input[name="rating"]').forEach(input => input.checked = false);
    reviewingBookId = null;
}

async function submitReview(event) {
    event.preventDefault();

    const rating = document.querySelector('input[name="rating"]:checked');
    const comment = document.getElementById('reviewComment').value;

    if (!rating) {
        showAlert('Vui lòng chọn xếp hạng');
        return;
    }

    const reviewData = {
        bookId: reviewingBookId,
        userId: auth.getUser().id,
        userName: auth.getUser().name,
        rating: parseInt(rating.value),
        comment: comment,
        approved: false
    };

    try {
        await createReview(reviewData);
        showAlert('Đánh giá của bạn đã được gửi!');
        closeReviewModal();
        showBookDetail(reviewingBookId);
    } catch (error) {
        showAlert('Lỗi: ' + error.message);
    }
}

async function loadMyReviews() {
    try {
        const userId = auth.getUser().id;
        myReviews = await getUserReviews(userId);
        renderMyReviews(myReviews);
    } catch (error) {
        showAlert('Lỗi khi tải đánh giá: ' + error.message);
    }
}

function renderMyReviews(reviews) {
    const container = document.getElementById('myReviewsList');
    
    if (!Array.isArray(reviews) || reviews.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; color: #999;">Bạn chưa có đánh giá nào</p>
        `;
        return;
    }

    container.innerHTML = '';
    reviews.forEach(review => {
        const item = document.createElement('div');
        item.className = 'review-item';
        item.innerHTML = `
            <div class="review-header">
                <div>
                    <div class="review-book">📖 ${getBookTitle(review.bookId)}</div>
                    <div class="review-rating">${makeStars(review.rating)}</div>
                </div>
                <span style="font-size: 0.85rem; color: ${review.approved ? '#48bb78' : '#f56565'};">
                    ${review.approved ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
                </span>
            </div>
            <div class="review-comment">${review.comment}</div>
        `;
        container.appendChild(item);
    });
}

function getBookTitle(bookId) {
    const book = allBooks.find(b => b.id === bookId);
    return book ? book.title : 'Sách chưa xác định';
}

// ==============================
// LOGOUT
// ==============================

function handleLogout() {
    if (confirm('Bạn chắc chắn muốn đăng xuất?')) {
        cart = [];
        localStorage.removeItem('cart');
        auth.logout();
    }
}

// ==============================
// UTILITY FUNCTIONS
// ==============================

function formatPrice(price) {
    if (!price) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function makeStars(rating) {
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 >= 0.5;
    let stars = '⭐'.repeat(fullStars);
    if (hasHalf) stars += '✨';
    return stars || 'Chưa có đánh giá';
}

function showAlert(message) {
    document.getElementById('alertText').textContent = message;
    document.getElementById('alertModal').classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('alertModal').classList.add('hidden');
}

document.addEventListener('click', (event) => {
    const modal = document.getElementById('alertModal');
    if (event.target === modal) {
        closeAlert();
    }
    
    const reviewModal = document.getElementById('reviewModal');
    if (event.target === reviewModal) {
        closeReviewModal();
    }
});
