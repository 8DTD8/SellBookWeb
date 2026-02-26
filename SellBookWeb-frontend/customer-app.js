// ==============================
// CUSTOMER APP - GLOBAL VARIABLES
// ==============================

let allBooks = [];
let filteredBooks = [];
let cart = [];
let currentBook = null;
let myReviews = [];
let currentPage = 0;
let productsPerPage = 12;
let totalPages = 1;

// API_BASE_URL is defined in api.js, don't redeclare it here

// ==============================
// PAGE INITIALIZATION
// ==============================

// Hàm cập nhật tên người dùng trong header
function updateAccountName() {
    try {
        const user = auth.getUser();
        const accountNameEl = document.getElementById('accountName');
        
        if (accountNameEl) {
            if (user && user.name) {
                // Hiển thị tên người dùng thay vì "Tài Khoản"
                accountNameEl.textContent = user.name;
            } else {
                // Nếu chưa đăng nhập, hiển thị "Tài Khoản"
                accountNameEl.textContent = 'Tài Khoản';
            }
        }
        
        // Cập nhật userName cho các phần khác
        const userNameEl = document.getElementById('userName');
        if (userNameEl && user && user.name) {
            userNameEl.textContent = user.name;
        }
    } catch (error) {
        console.error('Error updating account name:', error);
    }
}

// Đợi cả DOM và auth.js load xong
function initializeApp() {
    // Cập nhật tên người dùng
    updateAccountName();
    
    // Load dữ liệu
    loadBooks();
    loadProfile();
    loadCart();
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm === '') {
                filteredBooks = [...allBooks];
            } else {
                filteredBooks = allBooks.filter(book =>
                    book.title.toLowerCase().includes(searchTerm) ||
                    (book.author && book.author.toLowerCase().includes(searchTerm))
                );
            }
            currentPage = 0; // Reset to first page when searching
            renderBooks(filteredBooks);
        });
        
        // Hide search bar when clicking outside
        searchInput.addEventListener('blur', (e) => {
            // Delay to allow click events to fire first
            setTimeout(() => {
                const searchBar = document.getElementById('searchBar');
                if (searchBar && !searchBar.contains(document.activeElement)) {
                    if (!searchInput.value) {
                        searchBar.classList.add('hidden');
                    }
                }
            }, 200);
        });
        
        // Show search bar on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const searchBar = document.getElementById('searchBar');
                if (searchBar) {
                    searchBar.classList.add('hidden');
                    searchInput.value = '';
                    filteredBooks = [...allBooks];
                    currentPage = 0;
                    renderBooks(filteredBooks);
                }
            }
        });
    }
}

// Chờ cả DOM và auth.js sẵn sàng
function waitForAuth() {
    if (typeof auth !== 'undefined' && auth !== null) {
        initializeApp();
    } else {
        // Nếu auth chưa sẵn sàng, đợi thêm
        setTimeout(waitForAuth, 50);
    }
}

// Khởi tạo khi DOM sẵn sàng
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        waitForAuth();
    });
} else {
    // DOM đã sẵn sàng
    waitForAuth();
}

// Cũng cập nhật khi window load hoàn toàn (fallback)
window.addEventListener('load', () => {
    setTimeout(updateAccountName, 200);
});

// ==============================
// SECTION MANAGEMENT
// ==============================

function showSection(sectionId) {
    try {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            console.error('Section not found:', sectionId);
        }

        if (sectionId === 'myReviews') {
            loadMyReviews();
        }
    } catch (error) {
        console.error('Error in showSection:', error);
    }
}

// Expose to window immediately for onclick handlers
if (typeof window !== 'undefined') {
    window.showSection = showSection;
}

// ==============================
// BOOKS LOADING & DISPLAY
// ==============================

async function loadBooks() {
    try {
        // Fetch all books (you can adjust page size if needed)
        const response = await fetchBooks(0, 1000); // Get a large number of books
        if (Array.isArray(response)) {
            allBooks = response;
        } else if (response && Array.isArray(response.content)) {
            // If it's a paginated response
            allBooks = response.content;
        } else {
            allBooks = [];
        }
        filteredBooks = [...allBooks];
        currentPage = 0;
        renderBooks(filteredBooks);
    } catch (error) {
        console.error('Error loading books:', error);
        showAlert('Lỗi khi tải sách: ' + error.message);
        allBooks = [];
        filteredBooks = [];
        renderBooks([]);
    }
}

function renderBooks(books) {
    const container = document.getElementById('booksList');
    container.innerHTML = '';

    if (!Array.isArray(books) || books.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1; padding: 3rem;">Không tìm thấy sách</p>';
        return;
    }

    // Calculate pagination
    totalPages = Math.ceil(books.length / productsPerPage);
    const startIndex = currentPage * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const booksToShow = books.slice(startIndex, endIndex);

    booksToShow.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.onclick = () => showBookDetail(book.id);
        
        // Calculate discount (simulate original price if not available)
        const originalPrice = book.originalPrice || (book.price * 1.25); // 25% markup for demo
        const discount = originalPrice > book.price ? Math.round(((originalPrice - book.price) / originalPrice) * 100) : 0;
        const hasDiscount = discount > 0;
        
        card.innerHTML = `
            <div class="book-image">
                ${book.image ? `<img src="${book.image}" alt="${book.title}">` : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5; color: #999; font-size: 3rem;">📚</div>'}
                ${hasDiscount ? `<div class="discount-badge">-${discount}%</div>` : ''}
            </div>
            <div class="book-info">
                <div class="book-title">${book.title}</div>
                <div class="book-rating">${renderStars(book.rating || 0)}</div>
                <div class="book-price-container">
                    <span class="book-price">${formatPrice(book.price)}</span>
                    ${hasDiscount ? `<span class="book-original-price">${formatPrice(originalPrice)}</span>` : ''}
                </div>
                <div class="book-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); showBookDetail('${book.id}')">Chi tiết</button>
                    <button class="btn btn-success btn-sm" onclick="event.stopPropagation(); addToCart('${book.id}')">Thêm 🛒</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Render pagination
    renderPagination();
}

let currentReviews = [];
let reviewSortType = 'newest';

async function showBookDetail(bookId) {
    try {
        currentBook = await getBookById(bookId);
        productQuantity = 1; // Reset quantity
        renderBookDetail(currentBook);
        await loadProductReviews(bookId);
        showSection('bookDetail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        showAlert('Lỗi khi tải chi tiết sách: ' + error.message);
    }
}

function renderBookDetail(book) {
    // Calculate discount
    const originalPrice = book.originalPrice || (book.price * 1.25);
    const discount = originalPrice > book.price ? Math.round(((originalPrice - book.price) / originalPrice) * 100) : 0;
    const hasDiscount = discount > 0;
    
    // Get category name for breadcrumbs
    const categoryName = getCategoryName(book.categoryId);
    
    // Render breadcrumbs
    const breadcrumbs = document.getElementById('breadcrumbs');
    breadcrumbs.innerHTML = `
        <a href="#" onclick="showSection('home'); return false;">Trang chủ</a>
        <span>></span>
        <span>${categoryName || 'Sách'}</span>
        <span>></span>
        <span>${book.title}</span>
    `;
    
    // Render main image
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = book.image || '';
        mainImage.alt = book.title;
        mainImage.onerror = function() {
            this.style.display = 'none';
            this.parentElement.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5; color: #999; font-size: 3rem;">📚</div>';
        };
    }
    
    // Render promo banner
    const promoBanner = document.getElementById('promoBanner');
    if (promoBanner && hasDiscount) {
        promoBanner.textContent = `FREESHIP 20K CHO ĐƠN 120K`;
        promoBanner.style.display = 'block';
    } else if (promoBanner) {
        promoBanner.style.display = 'none';
    }
    
    // Render thumbnails
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    if (thumbnailContainer) {
        thumbnailContainer.innerHTML = '';
        // Add main image as first thumbnail
        const thumb1 = createThumbnail(book.image, 0, true);
        thumbnailContainer.appendChild(thumb1);
        // Add more thumbnails (simulate)
        for (let i = 1; i < 3; i++) {
            const thumb = createThumbnail(book.image, i, false);
            thumbnailContainer.appendChild(thumb);
        }
        // Add "+8" indicator
        const moreThumbs = document.createElement('div');
        moreThumbs.className = 'thumbnail-more';
        moreThumbs.textContent = '+8';
        thumbnailContainer.appendChild(moreThumbs);
    }
    
    // Render product title
    const productTitle = document.getElementById('productTitle');
    if (productTitle) {
        productTitle.textContent = book.title;
    }
    
    // Render basic info
    const basicInfo = document.getElementById('productBasicInfo');
    if (basicInfo) {
        basicInfo.innerHTML = `
            <div class="basic-info-item">
                <span class="basic-info-label">Nhà cung cấp:</span>
                <span>${book.supplierName || 'Đinh Tị'}</span>
            </div>
            <div class="basic-info-item">
                <span class="basic-info-label">Nhà xuất bản:</span>
                <span>${book.publisher || 'Văn Học'}</span>
            </div>
            <div class="basic-info-item">
                <span class="basic-info-label">Tác giả:</span>
                <span>${book.author || 'Chưa có'}</span>
            </div>
            <div class="basic-info-item">
                <span class="basic-info-label">Hình thức bìa:</span>
                <span>${book.coverType || 'Bìa Mềm'}</span>
            </div>
        `;
    }
    
    // Render rating and sales
    const ratingSales = document.getElementById('productRatingSales');
    if (ratingSales) {
        const reviewCount = book.reviewCount || 1;
        const salesCount = book.salesCount || Math.floor(Math.random() * 5000) + 1000;
        ratingSales.innerHTML = `
            <div class="rating-display">
                <div class="rating-stars">${renderStars(book.rating || 0)}</div>
                <span>(${reviewCount} đánh giá)</span>
            </div>
            <div class="sales-count">Đã bán ${formatNumber(salesCount)}</div>
        `;
    }
    
    // Render pricing
    const pricing = document.getElementById('productPricing');
    if (pricing) {
        pricing.innerHTML = `
            <div class="price-container">
                <span class="current-price">${formatPrice(book.price)}</span>
                ${hasDiscount ? `<span class="original-price">${formatPrice(originalPrice)}</span>` : ''}
                ${hasDiscount ? `<span class="discount-badge-large">-${discount}%</span>` : ''}
            </div>
            ${hasDiscount ? `<div class="promo-note">Chính sách khuyến mãi trên chỉ áp dụng tại sellbookweb.com ></div>` : ''}
        `;
    }
    
    // Render availability
    const availability = document.getElementById('productAvailability');
    if (availability) {
        const storeCount = Math.floor(Math.random() * 50) + 50;
        availability.textContent = `${storeCount} nhà sách còn hàng`;
    }
    
    // Render info table
    const infoTable = document.getElementById('infoTable');
    if (infoTable) {
        infoTable.innerHTML = `
            <tr>
                <td>Mã hàng</td>
                <td>${book.isbn || book.id || 'N/A'}</td>
            </tr>
            <tr>
                <td>Tên Nhà Cung Cấp</td>
                <td>${book.supplierName || 'Đinh Tị'}</td>
            </tr>
            <tr>
                <td>Tác giả</td>
                <td>${book.author || 'Chưa có'}</td>
            </tr>
            <tr>
                <td>Người Dịch</td>
                <td>${book.translator || 'N/A'}</td>
            </tr>
            <tr>
                <td>NXB</td>
                <td>${book.publisher || 'Văn Học'}</td>
            </tr>
            <tr>
                <td>Số lượng</td>
                <td>${book.quantity || 0} quyển</td>
            </tr>
        `;
    }
    
    // Reset quantity input
    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput) {
        quantityInput.value = productQuantity;
    }
    
    // Hide login prompt if user is logged in
    const reviewLoginPrompt = document.getElementById('reviewLoginPrompt');
    if (reviewLoginPrompt) {
        const user = auth.getUser();
        if (user && user.id) {
            reviewLoginPrompt.style.display = 'none';
        } else {
            reviewLoginPrompt.style.display = 'block';
        }
    }
}

function createThumbnail(imageSrc, index, isActive) {
    const thumb = document.createElement('div');
    thumb.className = `thumbnail-item ${isActive ? 'active' : ''}`;
    thumb.onclick = () => {
        document.querySelectorAll('.thumbnail-item').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const mainImage = document.getElementById('mainProductImage');
        if (mainImage) {
            mainImage.src = imageSrc || '';
        }
    };
    
    const img = document.createElement('img');
    img.src = imageSrc || '';
    img.alt = `Thumbnail ${index + 1}`;
    img.onerror = function() {
        this.parentElement.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5; color: #999;">📚</div>';
    };
    thumb.appendChild(img);
    
    return thumb;
}

function getCategoryName(categoryId) {
    // This would normally fetch from API, but for now return a default
    return 'Sách Tiếng Việt';
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

let productQuantity = 1;

function increaseQuantity() {
    const maxQuantity = currentBook?.quantity || 99;
    if (productQuantity < maxQuantity) {
        productQuantity++;
        document.getElementById('productQuantity').value = productQuantity;
    }
}

function decreaseQuantity() {
    if (productQuantity > 1) {
        productQuantity--;
        document.getElementById('productQuantity').value = productQuantity;
    }
}

function addToCartFromDetail() {
    if (!currentBook) return;
    
    for (let i = 0; i < productQuantity; i++) {
        addToCart(currentBook.id);
    }
    showAlert(`Đã thêm ${productQuantity} sản phẩm vào giỏ hàng!`);
}

function buyNow() {
    if (!currentBook) return;
    addToCartFromDetail();
    // Navigate to checkout (you can implement this later)
    showSection('cart');
}

function changeShippingAddress() {
    showAlert('Tính năng thay đổi địa chỉ sẽ được cập nhật!');
}

// ==============================
// PRODUCT REVIEWS
// ==============================

async function loadProductReviews(bookId) {
    try {
        const reviews = await getReviewsByBook(bookId);
        if (Array.isArray(reviews)) {
            // Only show approved reviews
            currentReviews = reviews.filter(r => r.approved !== false);
        } else {
            currentReviews = [];
        }
        renderReviewsSummary();
        filterReviews(reviewSortType);
    } catch (error) {
        console.error('Error loading reviews:', error);
        currentReviews = [];
        renderReviewsSummary();
        renderReviewsList([]);
    }
}

function renderReviewsSummary() {
    const avgRatingEl = document.getElementById('averageRating');
    const starsEl = document.getElementById('ratingStarsLarge');
    const countEl = document.getElementById('reviewCount');
    const distEl = document.getElementById('ratingDistribution');
    
    if (!avgRatingEl || !starsEl || !countEl || !distEl) return;
    
    if (currentReviews.length === 0) {
        avgRatingEl.textContent = '0';
        starsEl.innerHTML = renderStars(0);
        countEl.textContent = '(0 đánh giá)';
        distEl.innerHTML = [5, 4, 3, 2, 1].map(star => `
            <div class="rating-bar-item">
                <span class="rating-bar-label">${star} sao</span>
                <div class="rating-bar-container">
                    <div class="rating-bar-fill" style="width: 0%"></div>
                </div>
                <span class="rating-bar-percentage">0%</span>
            </div>
        `).join('');
        return;
    }
    
    // Calculate average rating
    const totalRating = currentReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
    const averageRating = totalRating / currentReviews.length;
    
    document.getElementById('averageRating').textContent = averageRating.toFixed(1);
    document.getElementById('ratingStarsLarge').innerHTML = renderStars(averageRating);
    document.getElementById('reviewCount').textContent = `(${currentReviews.length} đánh giá)`;
    
    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    currentReviews.forEach(r => {
        const rating = r.rating || 0;
        if (rating >= 5) distribution[5]++;
        else if (rating >= 4) distribution[4]++;
        else if (rating >= 3) distribution[3]++;
        else if (rating >= 2) distribution[2]++;
        else if (rating >= 1) distribution[1]++;
    });
    
    const distributionHTML = [5, 4, 3, 2, 1].map(star => {
        const count = distribution[star];
        const percentage = currentReviews.length > 0 ? (count / currentReviews.length * 100).toFixed(0) : 0;
        return `
            <div class="rating-bar-item">
                <span class="rating-bar-label">${star} sao</span>
                <div class="rating-bar-container">
                    <div class="rating-bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="rating-bar-percentage">${percentage}%</span>
            </div>
        `;
    }).join('');
    
    document.getElementById('ratingDistribution').innerHTML = distributionHTML;
}

function filterReviews(sortType) {
    reviewSortType = sortType;
    
    // Update tabs
    document.querySelectorAll('.review-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.trim() === (sortType === 'newest' ? 'Mới nhất' : 'Yêu thích nhất')) {
            tab.classList.add('active');
        }
    });
    
    // Sort reviews
    let sortedReviews = [...currentReviews];
    
    if (sortType === 'newest') {
        sortedReviews.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
    } else if (sortType === 'mostLiked') {
        // Sort by likes (we'll add likes field later, for now sort by rating)
        sortedReviews.sort((a, b) => {
            const ratingA = a.rating || 0;
            const ratingB = b.rating || 0;
            if (ratingB !== ratingA) return ratingB - ratingA;
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
    }
    
    renderReviewsList(sortedReviews);
}

function renderReviewsList(reviews) {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Chưa có đánh giá nào</p>';
        return;
    }
    
    container.innerHTML = reviews.map(review => {
        const date = review.createdAt ? formatDate(review.createdAt) : 'Chưa có ngày';
        const rating = review.rating || 0;
        const likes = review.likes || 0;
        
        return `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-user-info">
                        <div class="review-user-name">${review.userName || 'Ẩn danh'}</div>
                        <div class="review-date">${date}</div>
                    </div>
                    <div class="review-rating-stars">${renderStars(rating)}</div>
                </div>
                <div class="review-comment">${review.comment || 'Không có bình luận'}</div>
                <div class="review-actions">
                    <button class="review-action-btn" onclick="likeReview('${review.id}')">
                        <i class="fas fa-thumbs-up"></i>
                        <span>Thích (${likes})</span>
                    </button>
                    <button class="review-action-btn" onclick="reportReview('${review.id}')">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>Báo cáo</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function formatDate(dateString) {
    if (!dateString) return 'Chưa có ngày';
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return 'Chưa có ngày';
    }
}

function likeReview(reviewId) {
    // This would normally call an API to like a review
    showAlert('Tính năng thích đánh giá sẽ được cập nhật!');
}

function reportReview(reviewId) {
    if (confirm('Bạn có chắc chắn muốn báo cáo đánh giá này?')) {
        // This would normally call an API to report a review
        showAlert('Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét đánh giá này.');
    }
}

function showLoginPrompt() {
    showAlert('Vui lòng đăng nhập để viết đánh giá!');
}

// ==============================
// ACCOUNT DROPDOWN
// ==============================

function toggleAccountDropdown(event) {
    try {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        const dropdown = document.getElementById('accountDropdown');
        const accountDropdownContainer = document.querySelector('.account-dropdown');
        
        console.log('toggleAccountDropdown called', { dropdown, accountDropdownContainer });
        
        if (!dropdown) {
            console.error('Dropdown element not found!');
            return;
        }
        
        if (!accountDropdownContainer) {
            console.error('Account dropdown container not found!');
            return;
        }
        
        const isShowing = dropdown.classList.contains('show');
        console.log('Current state:', { isShowing });
        
        // Đóng tất cả dropdown khác
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            if (menu !== dropdown) {
                menu.classList.remove('show');
            }
        });
        
        // Toggle dropdown hiện tại
        if (isShowing) {
            dropdown.classList.remove('show');
            accountDropdownContainer.classList.remove('active');
            console.log('Dropdown closed');
        } else {
            dropdown.classList.add('show');
            accountDropdownContainer.classList.add('active');
            console.log('Dropdown opened');
        }
    } catch (error) {
        console.error('Error in toggleAccountDropdown:', error);
    }
}

// Expose to window immediately for onclick handlers
if (typeof window !== 'undefined') {
    window.toggleAccountDropdown = toggleAccountDropdown;
}

function closeAccountDropdown() {
    try {
        const dropdown = document.getElementById('accountDropdown');
        const accountDropdown = document.querySelector('.account-dropdown');
        
        if (dropdown) {
            dropdown.classList.remove('show');
        }
        if (accountDropdown) {
            accountDropdown.classList.remove('active');
        }
    } catch (error) {
        console.error('Error in closeAccountDropdown:', error);
    }
}

// Expose to window for onclick handlers
window.closeAccountDropdown = closeAccountDropdown;

// Đóng dropdown khi click bên ngoài (sẽ được gộp với event listener khác ở cuối file)

function filterByCategory() {
    const categoryId = document.getElementById('categorySelect')?.value;
    if (categoryId) {
        filteredBooks = allBooks.filter(book => book.categoryId === categoryId);
    } else {
        filteredBooks = [...allBooks];
    }
    currentPage = 0; // Reset to first page when filtering
    sortBooks();
}

function showNotifications() {
    try {
        showAlert('Tính năng thông báo sẽ được cập nhật!');
    } catch (error) {
        console.error('Error in showNotifications:', error);
    }
}

// Expose to window for onclick handlers
window.showNotifications = showNotifications;

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
        case 'bestselling':
            // Sort by rating and quantity (simulate best selling)
            filteredBooks.sort((a, b) => {
                const scoreA = (a.rating || 0) * 10 + (a.quantity || 0);
                const scoreB = (b.rating || 0) * 10 + (b.quantity || 0);
                return scoreB - scoreA;
            });
            break;
        default: // newest
            filteredBooks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    
    currentPage = 0; // Reset to first page when sorting
    renderBooks(filteredBooks);
}

function changeProductCount() {
    productsPerPage = parseInt(document.getElementById('productCountSelect').value);
    currentPage = 0; // Reset to first page
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

async function loadProfile() {
    const user = auth.getUser();
    if (!user || !user.id) {
        console.error('User not found or missing ID', user);
        // Try to reload from localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (storedUser && storedUser.id) {
            console.log('Found user in localStorage, updating auth');
            auth.setAuth(storedUser, localStorage.getItem('token'));
            // Retry with stored user
            const retryUser = auth.getUser();
            if (retryUser && retryUser.id) {
                // Continue with retryUser
                return await loadProfileWithUser(retryUser);
            }
        }
        return;
    }
    
    return await loadProfileWithUser(user);
}

async function loadProfileWithUser(user) {
    if (!user || !user.id) {
        console.error('Invalid user provided to loadProfileWithUser', user);
        return;
    }
    
    try {
        // Load full user information from backend
        const fullUserData = await getUserById(user.id);
        
        // Update profile display with full data
        const profileNameEl = document.getElementById('profileName');
        const profileNameDisplayEl = document.getElementById('profileNameDisplay');
        const profileEmailEl = document.getElementById('profileEmail');
        const profilePhoneEl = document.getElementById('profilePhone');
        const profileRoleEl = document.getElementById('profileRole');
        const profileRoleBadgeEl = document.getElementById('profileRoleBadge');
        const profileCreatedAtEl = document.getElementById('profileCreatedAt');
        const profileStatusEl = document.getElementById('profileStatus');
        const profileAvatarEl = document.getElementById('profileAvatar');
        
        if (profileNameEl) profileNameEl.textContent = fullUserData.name || user.name || 'Chưa có';
        if (profileNameDisplayEl) profileNameDisplayEl.textContent = fullUserData.name || user.name || 'Người dùng';
        if (profileEmailEl) profileEmailEl.textContent = fullUserData.email || user.email || 'Chưa có';
        if (profilePhoneEl) profilePhoneEl.textContent = fullUserData.phone || user.phone || '-';
        if (profileRoleEl) profileRoleEl.textContent = fullUserData.role || user.role || 'CUSTOMER';
        if (profileRoleBadgeEl) {
            profileRoleBadgeEl.textContent = fullUserData.role || user.role || 'CUSTOMER';
            profileRoleBadgeEl.className = 'profile-role-badge ' + (fullUserData.role === 'ADMIN' ? 'role-admin' : 'role-customer');
        }
        
        // Format and display created date
        if (profileCreatedAtEl && fullUserData.createdAt) {
            profileCreatedAtEl.textContent = formatProfileDate(fullUserData.createdAt);
        } else if (profileCreatedAtEl) {
            profileCreatedAtEl.textContent = 'Chưa có thông tin';
        }
        
        // Display status
        if (profileStatusEl) {
            const isActive = fullUserData.active !== false;
            profileStatusEl.innerHTML = isActive 
                ? '<span class="status-active"><i class="fas fa-check-circle"></i> Đang hoạt động</span>'
                : '<span class="status-inactive"><i class="fas fa-times-circle"></i> Đã khóa</span>';
        }
        
        // Display avatar if available
        if (profileAvatarEl && fullUserData.avatar) {
            profileAvatarEl.innerHTML = `<img src="${fullUserData.avatar}" alt="${fullUserData.name}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
        } else if (profileAvatarEl) {
            // Show initials if no avatar
            const initials = (fullUserData.name || user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            profileAvatarEl.innerHTML = `<span class="avatar-initials">${initials}</span>`;
        }
        
        // Update local auth with full data
        const updatedUser = {
            ...user,
            ...fullUserData,
            phone: fullUserData.phone || user.phone || ''
        };
        auth.setAuth(updatedUser, auth.token);
        
        // Cập nhật tên trong header
        updateAccountName();
    } catch (error) {
        console.error('Error loading full profile:', error);
        // Fallback to basic user data
        const profileNameEl = document.getElementById('profileName');
        const profileNameDisplayEl = document.getElementById('profileNameDisplay');
        const profileEmailEl = document.getElementById('profileEmail');
        const profilePhoneEl = document.getElementById('profilePhone');
        const profileRoleEl = document.getElementById('profileRole');
        const profileRoleBadgeEl = document.getElementById('profileRoleBadge');
        
        if (profileNameEl) profileNameEl.textContent = user.name || '';
        if (profileNameDisplayEl) profileNameDisplayEl.textContent = user.name || 'Người dùng';
        if (profileEmailEl) profileEmailEl.textContent = user.email || '';
        if (profilePhoneEl) profilePhoneEl.textContent = user.phone || '-';
        if (profileRoleEl) profileRoleEl.textContent = user.role || '';
        if (profileRoleBadgeEl) {
            profileRoleBadgeEl.textContent = user.role || 'CUSTOMER';
            profileRoleBadgeEl.className = 'profile-role-badge ' + (user.role === 'ADMIN' ? 'role-admin' : 'role-customer');
        }
        
        updateAccountName();
    }
}

function formatProfileDate(date) {
    if (!date) return 'Chưa có thông tin';
    try {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return 'Chưa có thông tin';
    }
}

function showProfile() {
    try {
        loadProfile();
        showSection('profile');
    } catch (error) {
        console.error('Error in showProfile:', error);
    }
}

// Expose to window for onclick handlers
window.showProfile = showProfile;

function showEditProfile() {
    const user = auth.getUser();
    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.phone || '';
    
    const profileInfo = document.getElementById('profileInfo');
    if (profileInfo) {
        profileInfo.style.display = 'none';
    }
    document.getElementById('editProfileForm').classList.remove('hidden');
}

function hideEditProfile() {
    document.getElementById('editProfileForm').classList.add('hidden');
    const profileInfo = document.getElementById('profileInfo');
    if (profileInfo) {
        profileInfo.style.display = 'block';
    }
}

async function saveProfile(event) {
    event.preventDefault();
    
    const user = auth.getUser();
    if (!user || !user.id) {
        showAlert('Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
        return;
    }
    
    const userData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        role: user.role,
        active: true
    };

    try {
        await updateUser(user.id, userData);
        
        // Update local auth
        user.name = userData.name;
        user.email = userData.email;
        user.phone = userData.phone;
        auth.setAuth(user, auth.token);
        
        // Update account name in header
        updateAccountName();
        
        showAlert('Cập nhật thông tin thành công!');
        hideEditProfile();
        loadProfile();
    } catch (error) {
        console.error('Error saving profile:', error);
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
    try {
        if (confirm('Bạn chắc chắn muốn đăng xuất?')) {
            cart = [];
            localStorage.removeItem('cart');
            auth.logout();
        }
    } catch (error) {
        console.error('Error in handleLogout:', error);
    }
}

// Expose to window for onclick handlers
window.handleLogout = handleLogout;

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

function renderStars(rating) {
    const numRating = rating || 0;
    const fullStars = Math.floor(numRating);
    const hasHalf = numRating % 1 >= 0.5;
    let html = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            html += '<i class="fas fa-star star"></i>';
        } else if (i === fullStars && hasHalf) {
            html += '<i class="fas fa-star-half-alt star"></i>';
        } else {
            html += '<i class="far fa-star star empty"></i>';
        }
    }
    
    return html || '<span style="color: #999; font-size: 0.85rem;">Chưa có đánh giá</span>';
}

// ==============================
// PAGINATION
// ==============================

function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '‹';
    prevBtn.disabled = currentPage === 0;
    prevBtn.onclick = () => goToPage(currentPage - 1);
    container.appendChild(prevBtn);
    
    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(0, endPage - maxVisible + 1);
    }
    
    // First page
    if (startPage > 0) {
        const firstBtn = document.createElement('button');
        firstBtn.textContent = '1';
        firstBtn.onclick = () => goToPage(0);
        container.appendChild(firstBtn);
        
        if (startPage > 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'ellipsis';
            container.appendChild(ellipsis);
        }
    }
    
    // Page range
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = (i + 1).toString();
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.onclick = () => goToPage(i);
        container.appendChild(pageBtn);
    }
    
    // Last page
    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'ellipsis';
            container.appendChild(ellipsis);
        }
        
        const lastBtn = document.createElement('button');
        lastBtn.textContent = totalPages.toString();
        lastBtn.onclick = () => goToPage(totalPages - 1);
        container.appendChild(lastBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '›';
    nextBtn.disabled = currentPage >= totalPages - 1;
    nextBtn.onclick = () => goToPage(currentPage + 1);
    container.appendChild(nextBtn);
}

function goToPage(page) {
    if (page < 0 || page >= totalPages) return;
    currentPage = page;
    renderBooks(filteredBooks);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function focusSearch() {
    try {
        const searchBar = document.getElementById('searchBar');
        if (searchBar) {
            searchBar.classList.remove('hidden');
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
            }
        }
    } catch (error) {
        console.error('Error in focusSearch:', error);
    }
}

// Expose to window for onclick handlers
window.focusSearch = focusSearch;

function showAlert(message) {
    document.getElementById('alertText').textContent = message;
    document.getElementById('alertModal').classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('alertModal').classList.add('hidden');
}

// Expose all necessary functions to window for onclick handlers
window.sortBooks = sortBooks;
window.changeProductCount = changeProductCount;
window.addToCart = addToCart;
window.showBookDetail = showBookDetail;
window.addToCartFromDetail = addToCartFromDetail;
window.buyNow = buyNow;
window.decreaseQuantity = decreaseQuantity;
window.increaseQuantity = increaseQuantity;
window.changeShippingAddress = changeShippingAddress;
window.filterReviews = filterReviews;
window.showEditProfile = showEditProfile;
window.hideEditProfile = hideEditProfile;
window.closeAlert = closeAlert;
window.closeReviewModal = closeReviewModal;
window.showLoginPrompt = showLoginPrompt;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.checkout = checkout;
window.submitReview = submitReview;
window.openReviewModal = openReviewModal;

// Event listener tổng hợp cho các click events
document.addEventListener('click', (event) => {
    // Xử lý modal clicks
    const modal = document.getElementById('alertModal');
    if (event.target === modal) {
        closeAlert();
    }
    
    const reviewModal = document.getElementById('reviewModal');
    if (event.target === reviewModal) {
        closeReviewModal();
    }
    
    // Xử lý đóng dropdown khi click bên ngoài
    const accountDropdown = document.getElementById('accountDropdown');
    const accountDropdownContainer = document.querySelector('.account-dropdown');
    
    if (accountDropdown && accountDropdownContainer) {
        if (!accountDropdownContainer.contains(event.target)) {
            closeAccountDropdown();
        }
    }
});
