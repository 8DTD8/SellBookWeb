// ==============================
// CUSTOMER WEB - GLOBAL VARIABLES
// ==============================

let allBooks = [];
let filteredBooks = [];
let cart = [];
let currentBook = null;
let selectedCategories = [];
let selectedPriceRange = 'all';
let allCategoriesData = [];
let selectedCartItems = new Set();
let myReviews = [];
let currentPage = 0;
let productsPerPage = 12;
let totalPages = 1;
let notifications = [];
let unreadNotificationCount = 0;
let notificationPollingInterval = null;
let bookStockPollingInterval = null;
const BOOK_STOCK_POLLING_MS = 8000;
let customerEventsBound = false;
let customerSectionManager = null;

const escapeHtml = (window.SafeHtml && window.SafeHtml.escape)
    ? window.SafeHtml.escape
    : (value) => String(value ?? '');
const escapeJsString = (window.SafeHtml && window.SafeHtml.escapeJsString)
    ? window.SafeHtml.escapeJsString
    : (value) => String(value ?? '');
const sanitizeUrl = (window.SafeHtml && window.SafeHtml.sanitizeUrl)
    ? window.SafeHtml.sanitizeUrl
    : (value) => String(value ?? '');

// API_BASE_URL is defined in api.js, don't redeclare it here

// ==============================
// PAGE INITIALIZATION
// ==============================

// Hàm cập nhật tên người dùng trong header
function updateAccountName() {
    try {
        const user = auth.getUser();
        const isLoggedIn = auth.isAuthenticated();

        // Toggle navbar controls
        const userNavControls = document.getElementById('userNavControls');
        const guestNavControls = document.getElementById('guestNavControls');
        if (userNavControls) userNavControls.style.display = isLoggedIn ? 'flex' : 'none';
        if (guestNavControls) guestNavControls.style.display = isLoggedIn ? 'none' : 'block';

        const accountNameEl = document.getElementById('accountName');
        if (accountNameEl) {
            accountNameEl.textContent = (user && user.name) ? user.name : 'Tài Khoản';
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
function initializeWeb() {
    setupCustomerEventDelegation();

    // Cập nhật tên người dùng và trạng thái nav
    updateAccountName();

    // Load books và categories cho tất cả mọi người (kể cả khách)
    loadBooks();
    initializeCategories();

    if (auth.isAuthenticated()) {
        // Chỉ load các tính năng cần đăng nhập
        loadProfile();
        loadCart();
        loadNotifBadge();
        startNotificationPolling();
    }
    
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

function setupCustomerEventDelegation() {
    if (customerEventsBound) {
        return;
    }

    const customerHandlerDeps = {
        showBookDetail,
        addToCart,
        likeReview,
        showSection,
        checkout,
        updateCartQuantity,
        toggleCartItemCoupon,
        removeFromCart,
        toggleSelectAllCart,
        toggleCartItemSelect,
        cancelMyOrder,
        handleNotificationClick,
        viewBookDetail: showBookDetail,
        filterByPrice,
        toggleFilterPanel,
        focusSearch,
        toggleAccountDropdown,
        showProfile,
        closeAccountDropdown,
        handleLogout,
        closeFilterPanel,
        addToCartFromDetail,
        buyNow,
        changeShippingAddress,
        decreaseQuantity,
        increaseQuantity,
        showLoginPrompt,
        showEditProfile,
        hideEditProfile,
        applyCheckoutCoupon,
        placeOrder,
        markAllAsRead,
        closeAlert,
        closeReviewModal,
        sortBooks,
        changeProductCount,
        saveProfile,
        submitReview,
        filterReviews,
        selectPaymentMethod
    };

    if (
        window.CustomerFeatureEventsModule
        && typeof window.CustomerFeatureEventsModule.bindFeatureEvents === 'function'
        && window.CustomerHandlerFactories
        && typeof window.CustomerHandlerFactories.createFeatureHandlers === 'function'
    ) {
        window.CustomerFeatureEventsModule.bindFeatureEvents(
            window.CustomerHandlerFactories.createFeatureHandlers(customerHandlerDeps)
        );
    }

    if (
        window.CustomerUiModule
        && typeof window.CustomerUiModule.bindStaticUiHandlers === 'function'
        && window.CustomerHandlerFactories
        && typeof window.CustomerHandlerFactories.createUiRouters === 'function'
    ) {
        window.CustomerUiModule.bindStaticUiHandlers({
            root: document,
            ...window.CustomerHandlerFactories.createUiRouters(customerHandlerDeps)
        });
    }

    customerEventsBound = true;
}

// Chờ cả DOM và auth.js sẵn sàng
function waitForWebAuth() {
    if (typeof auth !== 'undefined' && auth !== null) {
        initializeWeb();
    } else {
        // Nếu auth chưa sẵn sàng, đợi thêm
        setTimeout(waitForWebAuth, 50);
    }
}

// Khởi tạo khi DOM sẵn sàng
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        waitForWebAuth();
    });
} else {
    // DOM đã sẵn sàng
    waitForWebAuth();
}

// Cũng cập nhật khi window load hoàn toàn (fallback)
window.addEventListener('load', () => {
    setTimeout(updateAccountName, 200);
});

window.addEventListener('beforeunload', () => {
    stopBookStockPolling();
});

// ==============================
// SECTION MANAGEMENT
// ==============================

// Sections that require the user to be logged in
const PROTECTED_SECTIONS = new Set(['cart', 'checkout', 'myOrders', 'profile', 'myReviews', 'notifications']);

function requireLogin(message) {
    showAlert(message || 'Vui lòng đăng nhập để sử dụng tính năng này.');
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    return false;
}

function showSection(sectionId) {
    // Guard protected sections for guests
    if (PROTECTED_SECTIONS.has(sectionId) && !auth.isAuthenticated()) {
        requireLogin();
        return;
    }

    if (sectionId !== 'bookDetail') {
        stopBookStockPolling();
    }

    if (
        !customerSectionManager
        && window.CustomerSectionBusiness
        && typeof window.CustomerSectionBusiness.createSectionManager === 'function'
    ) {
        customerSectionManager = window.CustomerSectionBusiness.createSectionManager({
            setActiveSection: (targetId) => {
                document.querySelectorAll('.section').forEach(section => {
                    section.classList.remove('active');
                });

                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                } else {
                    console.error('Section not found:', targetId);
                }
            },
            loadMyReviews,
            loadMyOrders,
            loadNotifications,
            loadCart,
            logger: console
        });
    }

    if (customerSectionManager) {
        customerSectionManager(sectionId);
        return;
    }

    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Expose to window immediately for onclick handlers
if (typeof window !== 'undefined') {
    window.showSection = showSection;
    window.toggleFilterPanel = toggleFilterPanel;
    window.closeFilterPanel = closeFilterPanel;
    window.filterByPrice = filterByPrice;
}

// ==============================
// BOOKS LOADING & DISPLAY
// ==============================

async function loadBooks() {
    try {
        // Backend validates max page size at 100
        const response = await fetchBooks(0, 100);
        if (Array.isArray(response)) {
            allBooks = response.map((book) => {
                const { isbn, ...rest } = (book || {});
                return rest;
            });
        } else if (response && Array.isArray(response.content)) {
            // If it's a paginated response
            allBooks = response.content.map((book) => {
                const { isbn, ...rest } = (book || {});
                return rest;
            });
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
    if (window.CustomerBookDetailBusiness && typeof window.CustomerBookDetailBusiness.renderBooks === 'function') {
        window.CustomerBookDetailBusiness.renderBooks(books, {
            escapeJsString,
            escapeHtml,
            sanitizeUrl,
            formatPrice,
            renderStars,
            renderPagination,
            currentPage,
            productsPerPage,
            setTotalPages: (value) => { totalPages = value; }
        });
        return;
    }
}

let currentReviews = [];
let reviewSortType = 'newest';

async function showBookDetail(bookId) {
    if (window.CustomerBookDetailBusiness && typeof window.CustomerBookDetailBusiness.showBookDetail === 'function') {
        await window.CustomerBookDetailBusiness.showBookDetail(bookId, {
            getBookById,
            renderBookDetail,
            loadProductReviews,
            showSection,
            showAlert,
            setCurrentBook: (book) => { currentBook = book; },
            setProductQuantity: (quantity) => { productQuantity = quantity; }
        });
        startBookStockPolling();
        return;
    }
    showAlert('Không thể tải chi tiết sách do thiếu module business.');
}

function applyBookQuantityToDetailView(quantity) {
    const normalizedQuantity = Number(quantity) || 0;

    const availability = document.getElementById('productAvailability');
    if (availability) {
        availability.textContent = normalizedQuantity > 0 ? 'Còn hàng' : 'Hết hàng';
        availability.style.color = normalizedQuantity > 0 ? '#28a745' : '#dc3545';
    }

    const infoTable = document.getElementById('infoTable');
    if (infoTable) {
        infoTable.querySelectorAll('tr').forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 2 && cells[0].textContent.trim() === 'Số lượng') {
                cells[1].textContent = `${normalizedQuantity} quyển`;
            }
        });
    }

    const quantityInput = document.getElementById('productQuantity');
    if (quantityInput && normalizedQuantity > 0) {
        if (Number(quantityInput.value) > normalizedQuantity) {
            quantityInput.value = String(normalizedQuantity);
            productQuantity = normalizedQuantity;
        }
    }
}

async function refreshCurrentBookStock() {
    if (!currentBook || !currentBook.id) return;

    try {
        const latestBook = await getBookById(currentBook.id);
        const oldQuantity = Number(currentBook.quantity) || 0;
        const nextQuantity = Number(latestBook?.quantity) || 0;

        if (oldQuantity === nextQuantity) return;

        currentBook = { ...currentBook, ...latestBook };
        allBooks = allBooks.map((book) => (
            book.id === currentBook.id ? { ...book, ...latestBook } : book
        ));
        filteredBooks = filteredBooks.map((book) => (
            book.id === currentBook.id ? { ...book, ...latestBook } : book
        ));

        applyBookQuantityToDetailView(nextQuantity);
    } catch (error) {
        console.error('Error refreshing book stock:', error);
    }
}

function startBookStockPolling() {
    stopBookStockPolling();
    if (!currentBook || !currentBook.id) return;

    bookStockPollingInterval = setInterval(() => {
        const detailSection = document.getElementById('bookDetail');
        const isDetailActive = detailSection && detailSection.classList.contains('active');
        if (!isDetailActive) {
            stopBookStockPolling();
            return;
        }
        refreshCurrentBookStock();
    }, BOOK_STOCK_POLLING_MS);
}

function stopBookStockPolling() {
    if (bookStockPollingInterval) {
        clearInterval(bookStockPollingInterval);
        bookStockPollingInterval = null;
    }
}

function renderBookDetail(book) {
    if (window.CustomerBookDetailBusiness && typeof window.CustomerBookDetailBusiness.renderBookDetail === 'function') {
        window.CustomerBookDetailBusiness.renderBookDetail(book, {
            escapeHtml,
            sanitizeUrl,
            formatPrice,
            formatNumber,
            renderStars,
            auth,
            getCategoryName
        });
        return;
    }
}

function createThumbnail(imageSrc, index, isActive) {
    if (window.CustomerBookDetailBusiness && typeof window.CustomerBookDetailBusiness.createThumbnail === 'function') {
        return window.CustomerBookDetailBusiness.createThumbnail(imageSrc, index, isActive);
    }
    return document.createElement('div');
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

// Parse coupon value (ví dụ: "SALE 10", "Mã giảm 10k" -> 10)
function parseCouponValue(code) {
    if (!code) return 0;
    const match = String(code).match(/(\d+(\.\d+)?)/);
    if (!match) return 0;
    return parseFloat(match[1]);
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
    if (!auth.isAuthenticated()) {
        requireLogin('Vui lòng đăng nhập để thêm vào giỏ hàng.');
        return;
    }
    for (let i = 0; i < productQuantity; i++) {
        addToCart(currentBook.id);
    }
    showAlert(`Đã thêm ${productQuantity} sản phẩm vào giỏ hàng!`);
}

function buyNow() {
    if (!currentBook) return;
    if (!auth.isAuthenticated()) {
        requireLogin('Vui lòng đăng nhập để mua hàng.');
        return;
    }
    addToCartFromDetail();
    // Navigate to checkout
    showSection('cart');
}

function changeShippingAddress() {
    showAlert('Tính năng thay đổi địa chỉ sẽ được cập nhật!');
}

// ==============================
// PRODUCT REVIEWS
// ==============================

async function loadProductReviews(bookId) {
    if (window.CustomerBookDetailBusiness && typeof window.CustomerBookDetailBusiness.loadProductReviews === 'function') {
        await window.CustomerBookDetailBusiness.loadProductReviews(bookId, {
            getReviewsByBook,
            renderReviewsSummary,
            filterReviews,
            reviewSortType,
            setCurrentReviews: (reviews) => { currentReviews = reviews; }
        });
        return;
    }
}

function renderReviewsSummary() {
    if (window.CustomerBookDetailBusiness && typeof window.CustomerBookDetailBusiness.renderReviewsSummary === 'function') {
        window.CustomerBookDetailBusiness.renderReviewsSummary(currentReviews, { renderStars });
        return;
    }
}

function filterReviews(sortType) {
    if (window.CustomerBookDetailBusiness && typeof window.CustomerBookDetailBusiness.filterReviews === 'function') {
        window.CustomerBookDetailBusiness.filterReviews(sortType, {
            currentReviews,
            renderReviewsList,
            setReviewSortType: (value) => { reviewSortType = value; }
        });
        return;
    }
}

function renderReviewsList(reviews) {
    if (window.CustomerBookDetailBusiness && typeof window.CustomerBookDetailBusiness.renderReviewsList === 'function') {
        window.CustomerBookDetailBusiness.renderReviewsList(reviews, {
            escapeJsString,
            escapeHtml,
            renderStars
        });
        return;
    }
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

function showLoginPrompt() {
    requireLogin('Vui lòng đăng nhập để viết đánh giá sản phẩm.');
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

function applyFilters() {
    let result = [...allBooks];

    // Filter by selected categories
    if (selectedCategories.length > 0) {
        result = result.filter(book => selectedCategories.includes(book.categoryId));
    }

    // Filter by price range
    if (selectedPriceRange !== 'all') {
        result = result.filter(book => {
            const price = book.price || 0;
            switch (selectedPriceRange) {
                case 'under50': return price < 50000;
                case '50to100': return price >= 50000 && price <= 100000;
                case '100to200': return price >= 100000 && price <= 200000;
                case 'over200': return price > 200000;
                default: return true;
            }
        });
    }

    filteredBooks = result;
    currentPage = 0;
    sortBooks();
}

function filterByPrice(range) {
    selectedPriceRange = range;
    // Update active button
    document.querySelectorAll('.price-range-btn').forEach(btn => btn.classList.remove('active'));
    const clickedBtn = document.querySelector(`.price-range-btn[data-price-range="${range}"]`);
    if (clickedBtn) clickedBtn.classList.add('active');
    applyFilters();
}

function toggleFilterPanel(event) {
    if (event) event.stopPropagation();
    const sidebar = document.getElementById('filterSidebar');
    const overlay = document.getElementById('filterOverlay');
    const toggle = document.querySelector('.navbar-menu-toggle');
    if (sidebar && overlay) {
        const isShowing = sidebar.classList.contains('show');
        if (isShowing) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
            if (toggle) toggle.classList.remove('active');
        } else {
            sidebar.classList.add('show');
            overlay.classList.add('show');
            if (toggle) toggle.classList.add('active');
        }
    }
}

function closeFilterPanel() {
    const sidebar = document.getElementById('filterSidebar');
    const overlay = document.getElementById('filterOverlay');
    const toggle = document.querySelector('.navbar-menu-toggle');
    if (sidebar) sidebar.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    if (toggle) toggle.classList.remove('active');
}

function showNotifications() {
    showSection('notifications');
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

// Load categories for filter sidebar
async function loadCategories() {
    try {
        const categories = await fetchCategories();
        if (!Array.isArray(categories)) return;
        allCategoriesData = categories;
        renderFilterCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderFilterCategories(categories) {
    const container = document.getElementById('filterCategoryList');
    if (!container) return;

    container.innerHTML = '';

    // "Tất cả" option
    const allItem = document.createElement('label');
    allItem.className = 'filter-category-item' + (selectedCategories.length === 0 ? ' active' : '');
    allItem.innerHTML = `
        <input type="checkbox" ${selectedCategories.length === 0 ? 'checked' : ''} onchange="toggleAllCategories(this)">
        <span class="custom-checkbox"></span>
        <span>Tất cả</span>
    `;
    container.appendChild(allItem);

    categories.forEach(cat => {
        const safeCategoryId = escapeJsString(cat.id);
        const safeCategoryName = escapeHtml(cat.name || 'Danh mục');
        const item = document.createElement('label');
        const isChecked = selectedCategories.includes(cat.id);
        item.className = 'filter-category-item' + (isChecked ? ' active' : '');
        item.innerHTML = `
            <input type="checkbox" value="${safeCategoryId}" ${isChecked ? 'checked' : ''} onchange="toggleCategoryFilter(this, '${safeCategoryId}')">
            <span class="custom-checkbox"></span>
            <span>${safeCategoryName}</span>
        `;
        container.appendChild(item);
    });
}

function toggleAllCategories(checkbox) {
    selectedCategories = [];
    renderFilterCategories(allCategoriesData);
    applyFilters();
}

function toggleCategoryFilter(checkbox, categoryId) {
    if (checkbox.checked) {
        if (!selectedCategories.includes(categoryId)) {
            selectedCategories.push(categoryId);
        }
    } else {
        selectedCategories = selectedCategories.filter(id => id !== categoryId);
    }
    renderFilterCategories(allCategoriesData);
    applyFilters();
}

// Expose filter functions to window
window.toggleAllCategories = toggleAllCategories;
window.toggleCategoryFilter = toggleCategoryFilter;

// Initialize category filter - call after DOM and books are loaded
function initializeCategories() {
    loadCategories();
}

// ==============================
// CART MANAGEMENT
// ==============================

async function addToCart(bookId) {
    if (!auth.isAuthenticated()) {
        requireLogin('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
        return;
    }
    if (window.CustomerCartBusiness && typeof window.CustomerCartBusiness.addToCart === 'function') {
        await window.CustomerCartBusiness.addToCart(bookId, {
            cart,
            allBooks,
            getBookById,
            showAlert,
            parseCouponValue,
            setCart: (nextCart) => { cart = nextCart; },
            saveCart,
            reloadCart: loadCart,
            updateCartCount
        });
        return;
    }
}

function removeFromCart(bookId) {
    if (window.CustomerCartBusiness && typeof window.CustomerCartBusiness.removeFromCart === 'function') {
        window.CustomerCartBusiness.removeFromCart(bookId, {
            cart,
            setCart: (nextCart) => { cart = nextCart; },
            saveCart,
            reloadCart: loadCart,
            updateCartCount
        });
        return;
    }
}

function updateCartQuantity(bookId, quantity) {
    if (window.CustomerCartBusiness && typeof window.CustomerCartBusiness.updateCartQuantity === 'function') {
        window.CustomerCartBusiness.updateCartQuantity(bookId, quantity, {
            cart,
            setCart: (nextCart) => { cart = nextCart; },
            saveCart,
            reloadCart: loadCart
        });
        return;
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
    const el = document.getElementById('cartCount');
    if (!el) return;
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    el.textContent = count;
}

function renderCart() {
    if (window.CustomerCartBusiness && typeof window.CustomerCartBusiness.renderCart === 'function') {
        window.CustomerCartBusiness.renderCart({
            cart,
            selectedCartItems,
            escapeJsString,
            escapeHtml,
            sanitizeUrl,
            formatPrice,
            parseCouponValue,
            allBooks,
            saveCart
        });
        return;
    }
}

function toggleCartItemSelect(bookId, checkbox) {
    if (window.CustomerCartBusiness && typeof window.CustomerCartBusiness.toggleCartItemSelect === 'function') {
        window.CustomerCartBusiness.toggleCartItemSelect(bookId, checkbox.checked, {
            selectedCartItems,
            reRenderCart: renderCart
        });
        return;
    }
}

function toggleSelectAllCart(checkbox) {
    if (window.CustomerCartBusiness && typeof window.CustomerCartBusiness.toggleSelectAllCart === 'function') {
        window.CustomerCartBusiness.toggleSelectAllCart(checkbox.checked, {
            cart,
            selectedCartItems,
            reRenderCart: renderCart
        });
        return;
    }
}

// Expose to window
window.toggleCartItemSelect = toggleCartItemSelect;
window.toggleSelectAllCart = toggleSelectAllCart;

function toggleCartItemCoupon(bookId) {
    if (window.CustomerCartBusiness && typeof window.CustomerCartBusiness.toggleCartItemCoupon === 'function') {
        window.CustomerCartBusiness.toggleCartItemCoupon(bookId, {
            cart,
            setCart: (nextCart) => { cart = nextCart; },
            saveCart,
            reRenderCart: renderCart,
            parseCouponValue
        });
        return;
    }
}

function checkout() {
    if (cart.length === 0) {
        showAlert('Giỏ hàng trống');
        return;
    }
    if (selectedCartItems.size === 0) {
        showAlert('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
        return;
    }
    showSection('checkout');
    renderCheckoutPage();
}

function renderCheckoutPage() {
    if (window.CustomerCheckoutBusiness && typeof window.CustomerCheckoutBusiness.renderCheckoutPage === 'function') {
        window.CustomerCheckoutBusiness.renderCheckoutPage({
            cart,
            selectedCartItems,
            auth,
            formatPrice
        });
        return;
    }
}

function selectPaymentMethod(method, element) {
    if (window.CustomerCheckoutBusiness && typeof window.CustomerCheckoutBusiness.selectPaymentMethod === 'function') {
        window.CustomerCheckoutBusiness.selectPaymentMethod(method, element);
        return;
    }
}

function applyCheckoutCoupon() {
    if (window.CustomerCheckoutBusiness && typeof window.CustomerCheckoutBusiness.applyCheckoutCoupon === 'function') {
        window.CustomerCheckoutBusiness.applyCheckoutCoupon({
            showAlert,
            formatPrice,
            cart,
            selectedCartItems,
            apiBaseUrl: API_BASE_URL
        });
        return;
    }
}

function updateCheckoutWithCoupon(coupon) {
    if (window.CustomerCheckoutBusiness && typeof window.CustomerCheckoutBusiness.updateCheckoutWithCoupon === 'function') {
        window.CustomerCheckoutBusiness.updateCheckoutWithCoupon(coupon, {
            formatPrice,
            cart,
            selectedCartItems
        });
        return;
    }
}

async function placeOrder() {
    if (window.CustomerCheckoutBusiness && typeof window.CustomerCheckoutBusiness.placeOrder === 'function') {
        await window.CustomerCheckoutBusiness.placeOrder({
            showAlert,
            apiCall,
            auth,
            cart,
            selectedCartItems,
            setCart: (nextCart) => { cart = nextCart; },
            saveCart,
            clearSelectedItems: () => { selectedCartItems.clear(); },
            updateCartCount,
            showSection
        });
        return;
    }
}

// Expose checkout functions to window
window.checkout = checkout;
window.selectPaymentMethod = selectPaymentMethod;
window.applyCheckoutCoupon = applyCheckoutCoupon;
window.placeOrder = placeOrder;

// ==============================
// MY ORDERS
// ==============================

async function loadMyOrders() {
    if (
        window.CustomerOrdersBusiness
        && typeof window.CustomerOrdersBusiness.loadMyOrders === 'function'
    ) {
        await window.CustomerOrdersBusiness.loadMyOrders({
            auth,
            apiCall,
            escapeHtml,
            escapeJsString,
            formatPrice
        });
        return;
    }

    const container = document.getElementById('myOrdersList');
    if (container) {
        container.innerHTML = '<p style="text-align:center;color:red;">Không thể tải đơn hàng do thiếu module business.</p>';
    }
}

async function cancelMyOrder(orderId) {
    if (
        window.CustomerOrdersBusiness
        && typeof window.CustomerOrdersBusiness.cancelMyOrder === 'function'
    ) {
        await window.CustomerOrdersBusiness.cancelMyOrder(orderId, {
            apiCall,
            showAlert,
            reloadOrders: loadMyOrders
        });
        return;
    }

    showAlert('Không thể hủy đơn hàng do thiếu module business.');
}

window.loadMyOrders = loadMyOrders;
window.cancelMyOrder = cancelMyOrder;

// ==============================
// NOTIFICATION SYSTEM
// ==============================

// Start polling for notifications
function startNotificationPolling() {
    const user = auth.getUser();
    if (!user || !user.id) return;
    
    // Initial load
    loadNotifBadge();
    
    // Poll every 30 seconds
    notificationPollingInterval = setInterval(async () => {
        await loadNotifBadge();
    }, 30000);
}

// Stop polling for notifications
function stopNotificationPolling() {
    if (notificationPollingInterval) {
        clearInterval(notificationPollingInterval);
        notificationPollingInterval = null;
    }
}

// Load notification badge count
async function loadNotifBadge() {
    if (
        window.CustomerNotificationsBusiness
        && typeof window.CustomerNotificationsBusiness.loadNotifBadge === 'function'
    ) {
        await window.CustomerNotificationsBusiness.loadNotifBadge({
            auth,
            getUnreadCount,
            setUnreadNotificationCount: (count) => {
                unreadNotificationCount = count;
            },
            updateNotificationBadge,
            logger: console
        });
        return;
    }

    console.error('CustomerNotificationsBusiness module is unavailable');
}

// Update notification badge display
function updateNotificationBadge(count = unreadNotificationCount) {
    if (
        window.CustomerNotificationsBusiness
        && typeof window.CustomerNotificationsBusiness.updateNotificationBadge === 'function'
    ) {
        window.CustomerNotificationsBusiness.updateNotificationBadge(count);
        return;
    }

    const badge = document.getElementById('notifBadge');
    if (badge) {
        badge.style.display = 'none';
        badge.classList.remove('has-notifications');
    }
}

// Load and display notifications
async function loadNotifications() {
    if (
        window.CustomerNotificationsBusiness
        && typeof window.CustomerNotificationsBusiness.loadNotifications === 'function'
    ) {
        await window.CustomerNotificationsBusiness.loadNotifications({
            auth,
            getNotifications,
            setNotifications: (next) => {
                notifications = next;
            },
            renderNotifications,
            showAlert,
            logger: console
        });
        return;
    }

    console.error('CustomerNotificationsBusiness module is unavailable');
}

// Render notifications list
function renderNotifications() {
    if (
        window.CustomerNotificationsBusiness
        && typeof window.CustomerNotificationsBusiness.renderNotifications === 'function'
    ) {
        window.CustomerNotificationsBusiness.renderNotifications({
            notifications,
            escapeHtml,
            escapeJsString,
            formatRelativeDate
        });
        return;
    }

    const container = document.getElementById('notificationsList');
    if (container) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Không thể hiển thị thông báo do thiếu module business.</p>';
    }
}

// Handle notification click
async function handleNotificationClick(notificationId) {
    if (
        window.CustomerNotificationsBusiness
        && typeof window.CustomerNotificationsBusiness.handleNotificationClick === 'function'
    ) {
        await window.CustomerNotificationsBusiness.handleNotificationClick(notificationId, {
            notifications,
            markNotificationAsRead,
            setUnreadNotificationCount: (count) => {
                unreadNotificationCount = count;
            },
            getUnreadNotificationCount: () => unreadNotificationCount,
            updateNotificationBadge,
            renderNotifications,
            loadMyOrders,
            logger: console
        });
        return;
    }

    console.error('CustomerNotificationsBusiness module is unavailable');
}

// Mark all notifications as read
async function markAllAsRead() {
    if (
        window.CustomerNotificationsBusiness
        && typeof window.CustomerNotificationsBusiness.markAllAsRead === 'function'
    ) {
        await window.CustomerNotificationsBusiness.markAllAsRead({
            auth,
            notifications,
            markAllNotificationsAsRead,
            setUnreadNotificationCount: (count) => {
                unreadNotificationCount = count;
            },
            updateNotificationBadge,
            renderNotifications,
            showAlert,
            logger: console
        });
        return;
    }

    console.error('CustomerNotificationsBusiness module is unavailable');
}

// Format date for display
function formatRelativeDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
}

// Expose notification functions
window.loadNotifications = loadNotifications;
window.handleNotificationClick = handleNotificationClick;
window.markAllAsRead = markAllAsRead;
window.startNotificationPolling = startNotificationPolling;
window.stopNotificationPolling = stopNotificationPolling;

// ==============================
// PROFILE MANAGEMENT
// ==============================

async function loadProfile() {
    if (
        window.CustomerProfileBusiness
        && typeof window.CustomerProfileBusiness.loadProfile === 'function'
    ) {
        return window.CustomerProfileBusiness.loadProfile({
            auth,
            loadProfileWithUser,
            logger: console
        });
    }

    console.error('CustomerProfileBusiness module is unavailable');
}

async function loadProfileWithUser(user) {
    if (
        window.CustomerProfileBusiness
        && typeof window.CustomerProfileBusiness.loadProfileWithUser === 'function'
    ) {
        return window.CustomerProfileBusiness.loadProfileWithUser(user, {
            auth,
            getUserById,
            formatProfileDate,
            updateAccountName,
            logger: console
        });
    }

    console.error('CustomerProfileBusiness module is unavailable');
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

function setProfileView(view) {
    const profileInfo = document.getElementById('profileInfo');
    const editProfileForm = document.getElementById('editProfileForm');
    const changePasswordForm = document.getElementById('changePasswordForm');

    if (profileInfo) {
        profileInfo.style.display = view === 'info' ? 'block' : 'none';
    }
    if (editProfileForm) {
        editProfileForm.classList.toggle('hidden', view !== 'edit');
    }
    if (changePasswordForm) {
        changePasswordForm.classList.toggle('hidden', view !== 'password');
    }
}

function showEditProfile() {
    const user = auth.getUser();
    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.phone || '';
    setProfileView('edit');
}

function hideEditProfile() {
    setProfileView('info');
}

function showChangePasswordForm() {
    const form = document.getElementById('changePasswordForm');
    if (form) {
        form.querySelector('form')?.reset();
    }
    setProfileView('password');
}

function hideChangePasswordForm() {
    const form = document.getElementById('changePasswordForm');
    if (form) {
        form.querySelector('form')?.reset();
    }
    setProfileView('info');
}

function isStrongPassword(password) {
    return typeof password === 'string'
        && password.length >= 8
        && /[A-Z]/.test(password)
        && /[a-z]/.test(password)
        && /\d/.test(password)
        && /[!@#$%^&*]/.test(password);
}

async function handleChangePasswordSubmit(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword')?.value || '';
    const newPassword = document.getElementById('newPassword')?.value || '';
    const confirmNewPassword = document.getElementById('confirmNewPassword')?.value || '';

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showAlert('Vui lòng nhập đầy đủ thông tin đổi mật khẩu.');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showAlert('Xác nhận mật khẩu mới không khớp.');
        return;
    }

    if (!isStrongPassword(newPassword)) {
        showAlert('Mật khẩu mới phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (!@#$%^&*).');
        return;
    }

    if (currentPassword === newPassword) {
        showAlert('Mật khẩu mới không được trùng mật khẩu hiện tại.');
        return;
    }

    try {
        await window.changePassword(currentPassword, newPassword);
        showAlert('Đổi mật khẩu thành công!');
        hideChangePasswordForm();
    } catch (error) {
        console.error('Error changing password:', error);
        showAlert('Lỗi: ' + error.message);
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

function initializeReviewModal() {
    const starLabels = document.querySelectorAll('.review-star-label');
    starLabels.forEach(label => {
        label.addEventListener('click', function (e) {
            e.preventDefault();
            const star = this.getAttribute('data-star');
            const input = document.getElementById('star' + star);
            if (input) input.checked = true;
            updateReviewRatingText(star);
        });
        
        // Hover effect
        label.addEventListener('mouseenter', function () {
            const star = this.getAttribute('data-star');
            document.querySelectorAll('.review-star-label').forEach((l, idx) => {
                if (idx < star) l.style.color = '#667eea';
                else l.style.color = '#ddd';
            });
        });
    });
    
    document.querySelector('.review-star-rating')?.addEventListener('mouseleave', function () {
        const checked = document.querySelector('input[name="rating"]:checked');
        if (checked) {
            const star = checked.value;
            document.querySelectorAll('.review-star-label').forEach((l, idx) => {
                if (idx < star) l.style.color = '#ffc107';
                else l.style.color = '#ddd';
            });
        } else {
            document.querySelectorAll('.review-star-label').forEach(l => {
                l.style.color = '#ddd';
            });
        }
    });
}

function updateReviewRatingText(rating) {
    const ratingText = document.getElementById('reviewRatingText');
    if (ratingText) {
        const ratings = ['', '★ Thiếu tòi', '★★ Bình thường', '★★★ Tốt', '★★★★ Rất tốt', '★★★★★ Tuyệt vời'];
        ratingText.textContent = ratings[rating] || 'Chọn xếp hạng';
    }
}

function openReviewModal(bookId) {
    reviewingBookId = bookId;
    const book = currentBook || allBooks.find(b => b.id === bookId);
    
    if (book) {
        // Set book info
        const bookImage = document.getElementById('reviewBookImage');
        const bookTitle = document.getElementById('reviewBookTitle');
        if (bookImage) bookImage.src = book.image || '';
        if (bookTitle) bookTitle.textContent = book.title || 'Sách';
    }
    
    document.getElementById('reviewModal').classList.remove('hidden');
    setTimeout(() => {
        initializeReviewModal();
    }, 50);
}

function closeReviewModal() {
    document.getElementById('reviewModal').classList.add('hidden');
    document.getElementById('reviewComment').value = '';
    document.querySelectorAll('input[name="rating"]').forEach(input => input.checked = false);
    const ratingText = document.getElementById('reviewRatingText');
    if (ratingText) ratingText.textContent = 'Chọn xếp hạng';
    document.querySelectorAll('.review-star-label').forEach(l => l.style.color = '#ddd');
    reviewingBookId = null;
}

async function likeReview(reviewId) {
    if (!auth.isAuthenticated()) {
        requireLogin();
        return;
    }

    try {
        const user = auth.getUser();
        const userId = user?.id;
        if (!userId) {
            showAlert('Lỗi: Không thể lấy ID người dùng');
            return;
        }

        const updatedReview = await toggleLikeReview(reviewId, userId);
        
        // Update the UI
        const likeButton = document.querySelector(`[data-review-action="like"][data-review-id="${reviewId}"]`);
        if (likeButton) {
            likeButton.innerHTML = `
                <i class="fas fa-thumbs-up"></i>
                <span>Thích (${updatedReview.likes || 0})</span>
            `;
        }
    } catch (error) {
        console.error('Error liking review:', error);
        showAlert('Lỗi: Không thể thích đánh giá. Vui lòng thử lại.');
    }
}

async function submitReview(event) {
    if (window.CustomerMyReviewsBusiness && typeof window.CustomerMyReviewsBusiness.submitReview === 'function') {
        await window.CustomerMyReviewsBusiness.submitReview(event, {
            auth,
            createReview,
            showAlert,
            closeReviewModal,
            showBookDetail,
            reviewingBookId
        });
        return;
    }
}

async function loadMyReviews() {
    if (window.CustomerMyReviewsBusiness && typeof window.CustomerMyReviewsBusiness.loadMyReviews === 'function') {
        await window.CustomerMyReviewsBusiness.loadMyReviews({
            auth,
            getUserReviews,
            showAlert,
            setMyReviews: (reviews) => { myReviews = reviews; },
            renderMyReviews
        });
        return;
    }
}

function renderMyReviews(reviews) {
    if (window.CustomerMyReviewsBusiness && typeof window.CustomerMyReviewsBusiness.renderMyReviews === 'function') {
        window.CustomerMyReviewsBusiness.renderMyReviews(reviews, { allBooks });
        return;
    }
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
window.showChangePasswordForm = showChangePasswordForm;
window.hideChangePasswordForm = hideChangePasswordForm;
window.handleChangePasswordSubmit = handleChangePasswordSubmit;
window.closeAlert = closeAlert;
window.closeReviewModal = closeReviewModal;
window.showLoginPrompt = showLoginPrompt;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.toggleCartItemCoupon = toggleCartItemCoupon;
window.checkout = checkout;
window.submitReview = submitReview;
window.openReviewModal = openReviewModal;
window.likeReview = likeReview;

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
    
    // Xử lý đóng filter panel khi click bên ngoài
    const filterSidebar = document.getElementById('filterSidebar');
    const filterToggle = document.querySelector('.navbar-menu-toggle');
    
    if (filterSidebar && filterToggle) {
        if (!filterToggle.contains(event.target) && !filterSidebar.contains(event.target)) {
            closeFilterPanel();
        }
    }
});
