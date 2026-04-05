// ==============================
// ADMIN WEB - GLOBAL VARIABLES
// ==============================

let currentSection = 'dashboard';
let booksData = [];
let categoriesData = [];
let couponsData = [];
let usersData = [];
let suppliersData = [];
let purchaseOrdersData = [];
let paymentsData = [];
let currentReviewsView = 'pending';
let adminActionEventsBound = false;
let adminStaticEventsBound = false;
let adminSectionNavigator = null;

const escapeHtml = (window.SafeHtml && window.SafeHtml.escape)
    ? window.SafeHtml.escape
    : (value) => String(value ?? '');
const escapeJsString = (window.SafeHtml && window.SafeHtml.escapeJsString)
    ? window.SafeHtml.escapeJsString
    : (value) => String(value ?? '');

function isCurrentUserSuperAdmin() {
    const user = auth.getUser();
    return !!user && (user.role || '').toUpperCase() === 'SUPER_ADMIN';
}

// ==============================
// PAGE INITIALIZATION
// ==============================

document.addEventListener('DOMContentLoaded', () => {
    // Display user info
    const user = auth.getUser();
    const role = (user?.role || '').toUpperCase();
    if (!user || (role !== 'ADMIN' && role !== 'SUPER_ADMIN')) {
        auth.logout();
        return;
    }
    document.getElementById('adminName').textContent = `👤 ${user.name} (${user.role})`;

    setupAdminStaticDelegation();
    setupAdminUserActionsDelegation();
    setupAdminReviewAndOrderDelegation();
    
    loadDashboard();
    loadCategories();
});

function setupAdminStaticDelegation() {
    if (adminStaticEventsBound) {
        return;
    }

    const adminHandlerDeps = {
        showSection,
        handleLogout,
        showAddBookForm,
        hideBookForm,
        showAddCategoryForm,
        hideCategoryForm,
        showAddCouponForm,
        hideCouponForm,
        showAddSupplierForm,
        hideSupplierForm,
        editSupplier,
        deleteSupplierConfirm,
        showAddPurchaseOrderForm,
        hidePurchaseOrderForm,
        addPurchaseOrderItem,
        removePurchaseOrderItem,
        saveSupplier,
        savePurchaseOrder,
        receivePurchaseOrder,
        cancelPurchaseOrder,
        deletePurchaseOrderConfirm,
        refreshPurchaseOrders,
        filterPurchaseOrdersByStatus,
        refreshPayments,
        filterPaymentsByStatus,
        completePayment,
        failPayment,
        refundPayment,
        hideUserForm,
        refreshOrders,
        closeAlert,
        searchBooks,
        searchOrders,
        filterByCategory,
        filterByStatus,
        saveBook,
        saveCategory,
        saveCoupon,
        saveUser,
        editBook,
        deleteBookConfirm,
        editCategory,
        deleteCategoryConfirm,
        editCoupon,
        deleteCouponConfirm,
        showReviewTab
    };

    if (
        window.AdminUiModule
        && typeof window.AdminUiModule.bindStaticUiHandlers === 'function'
        && window.AdminHandlerFactories
        && typeof window.AdminHandlerFactories.createStaticUiRouters === 'function'
    ) {
        window.AdminUiModule.bindStaticUiHandlers({
            root: document,
            ...window.AdminHandlerFactories.createStaticUiRouters(adminHandlerDeps)
        });
    }

    adminStaticEventsBound = true;
}

function setupAdminReviewAndOrderDelegation() {
    if (adminActionEventsBound) {
        return;
    }

    if (
        window.AdminFeatureEventsModule
        && typeof window.AdminFeatureEventsModule.bindReviewOrderEvents === 'function'
        && window.AdminHandlerFactories
        && typeof window.AdminHandlerFactories.createReviewOrderHandlers === 'function'
    ) {
        window.AdminFeatureEventsModule.bindReviewOrderEvents(
            window.AdminHandlerFactories.createReviewOrderHandlers({
                approveReviewConfirm,
                deleteReviewConfirm,
                viewOrderDetails,
                showUpdateStatusForm,
                closeOrderDetailsModal,
                closeUpdateStatusModal,
                updateOrderStatus
            })
        );
    }

    adminActionEventsBound = true;
}

function setupAdminUserActionsDelegation() {
    if (
        window.AdminFeatureEventsModule
        && typeof window.AdminFeatureEventsModule.bindUserActionEvents === 'function'
        && window.AdminHandlerFactories
        && typeof window.AdminHandlerFactories.createUserHandlers === 'function'
    ) {
        window.AdminFeatureEventsModule.bindUserActionEvents(
            window.AdminHandlerFactories.createUserHandlers({
                editUser,
                deleteUserConfirm,
                toggleUserBan
            })
        );
    }
}

// ==============================
// SECTION MANAGEMENT
// ==============================

function showSection(sectionId) {
    if (
        !adminSectionNavigator
        && window.AdminSectionBusiness
        && typeof window.AdminSectionBusiness.createSectionNavigator === 'function'
    ) {
        adminSectionNavigator = window.AdminSectionBusiness.createSectionNavigator({
            setCurrentSection: (sectionIdValue) => {
                currentSection = sectionIdValue;
            },
            loadDashboard,
            loadBooks,
            loadCategories,
            loadCoupons,
            loadUsers,
            loadSuppliers,
            loadPurchaseOrders,
            loadPayments,
            loadReviews,
            loadOrders
        });
    }

    if (adminSectionNavigator) {
        adminSectionNavigator(sectionId);
        return;
    }

    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        currentSection = sectionId;
    }
}

function handleLogout() {
    if (confirm('Bạn chắc chắn muốn đăng xuất?')) {
        auth.logout();
    }
}

// ==============================
// DASHBOARD
// ==============================

async function loadDashboard() {
    if (
        window.AdminSectionBusiness
        && typeof window.AdminSectionBusiness.loadDashboardStats === 'function'
    ) {
        await window.AdminSectionBusiness.loadDashboardStats({
            fetchBooks,
            fetchCategories,
            fetchUsers,
            getPendingReviews,
            setStat: (elementId, value) => {
                const el = document.getElementById(elementId);
                if (el) {
                    el.textContent = value;
                }
            },
            showAlert
        });
        return;
    }

    showAlert('Không thể tải bảng điều khiển do thiếu module business.');
}

// ==============================
// BOOKS MANAGEMENT
// ==============================

async function loadBooks() {
    if (window.AdminBooksBusiness && typeof window.AdminBooksBusiness.loadBooks === 'function') {
        await window.AdminBooksBusiness.loadBooks({
            fetchBooks,
            renderBooks,
            loadCategoriesForFilter,
            showAlert,
            setBooksData: (data) => { booksData = data; }
        });
        return;
    }
    showAlert('Không thể tải sách do thiếu module business.');
}

function renderBooks(books) {
    if (window.AdminBooksBusiness && typeof window.AdminBooksBusiness.renderBooks === 'function') {
        window.AdminBooksBusiness.renderBooks(books, { escapeJsString, escapeHtml, formatPrice });
        return;
    }
    const tbody = document.querySelector('#booksList tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;">Module chưa tải.</td></tr>';
}

function showAddBookForm() {
    document.getElementById('bookId').value = '';
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookAuthor').value = '';
    document.getElementById('bookPrice').value = '';
    document.getElementById('bookQuantity').value = '';
    document.getElementById('bookCategory').value = '';
    document.getElementById('bookDescription').value = '';
    document.getElementById('bookImage').value = '';
    document.getElementById('bookSupplier').value = '';
    document.getElementById('bookCoverType').value = 'Bìa Mềm';
    document.getElementById('bookTranslator').value = '';
    document.getElementById('bookPublisher').value = '';
    document.getElementById('bookDiscount').value = '';
    document.getElementById('bookActive').checked = true;
    document.getElementById('bookFormTitle').textContent = 'Thêm sách mới';
    document.getElementById('bookForm').classList.remove('hidden');
}

function hideBookForm() {
    document.getElementById('bookForm').classList.add('hidden');
}

async function editBook(id) {
    if (window.AdminBooksBusiness && typeof window.AdminBooksBusiness.editBook === 'function') {
        await window.AdminBooksBusiness.editBook(id, { getBookById, showAlert });
        return;
    }
    showAlert('Không thể chỉnh sửa sách do thiếu module business.');
}

async function saveBook(event) {
    if (window.AdminBooksBusiness && typeof window.AdminBooksBusiness.saveBook === 'function') {
        await window.AdminBooksBusiness.saveBook(event, {
            updateBook, createBook, showAlert,
            hideBookForm, reloadBooks: loadBooks
        });
        return;
    }
    showAlert('Không thể lưu sách do thiếu module business.');
}

async function deleteBookConfirm(id) {
    if (window.AdminBooksBusiness && typeof window.AdminBooksBusiness.deleteBookConfirm === 'function') {
        await window.AdminBooksBusiness.deleteBookConfirm(id, { deleteBook, showAlert, reloadBooks: loadBooks });
        return;
    }
    showAlert('Không thể xóa sách do thiếu module business.');
}

function searchBooks() {
    const searchTerm = document.getElementById('searchBook').value;
    if (window.AdminBooksBusiness && typeof window.AdminBooksBusiness.searchBooks === 'function') {
        const filtered = window.AdminBooksBusiness.searchBooks(booksData, searchTerm);
        renderBooks(filtered);
        return;
    }
    renderBooks(booksData);
}

async function loadCategoriesForFilter() {
    if (window.AdminBooksBusiness && typeof window.AdminBooksBusiness.loadCategoriesForFilter === 'function') {
        await window.AdminBooksBusiness.loadCategoriesForFilter({ fetchCategories });
        return;
    }
}

async function filterByCategory() {
    if (window.AdminBooksBusiness && typeof window.AdminBooksBusiness.filterByCategory === 'function') {
        await window.AdminBooksBusiness.filterByCategory({
            getBooksByCategory, booksData, renderBooks, showAlert
        });
        return;
    }
    renderBooks(booksData);
}

function getCategoryName(categoryId) {
    const category = categoriesData.find(cat => cat.id === categoryId);
    return category ? category.name : '-';
}

// ==============================
// CATEGORIES MANAGEMENT
// ==============================

async function loadCategories() {
    if (window.AdminCategoriesBusiness && typeof window.AdminCategoriesBusiness.loadCategories === 'function') {
        await window.AdminCategoriesBusiness.loadCategories({
            fetchCategories, renderCategories, populateCategorySelect, showAlert,
            setCategoriesData: (data) => { categoriesData = data; }
        });
        return;
    }
    showAlert('Không thể tải danh mục do thiếu module business.');
}

function renderCategories(categories) {
    if (window.AdminCategoriesBusiness && typeof window.AdminCategoriesBusiness.renderCategories === 'function') {
        window.AdminCategoriesBusiness.renderCategories(categories, { escapeJsString, escapeHtml });
        return;
    }
    const tbody = document.querySelector('#categoriesList tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;">Module chưa tải.</td></tr>';
}

function showAddCategoryForm() {
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryDescription').value = '';
    document.getElementById('categoryIcon').value = '';
    document.getElementById('categoryParentId').value = '';
    document.getElementById('categoryActive').checked = true;
    document.getElementById('categoryFormTitle').textContent = 'Thêm danh mục mới';
    populateParentCategorySelect();
    document.getElementById('categoryForm').classList.remove('hidden');
}

function hideCategoryForm() {
    document.getElementById('categoryForm').classList.add('hidden');
}

async function editCategory(id) {
    if (window.AdminCategoriesBusiness && typeof window.AdminCategoriesBusiness.editCategory === 'function') {
        await window.AdminCategoriesBusiness.editCategory(id, {
            getCategoryById, showAlert, populateParentCategorySelect
        });
        return;
    }
    showAlert('Không thể chỉnh sửa danh mục do thiếu module business.');
}

async function saveCategory(event) {
    if (window.AdminCategoriesBusiness && typeof window.AdminCategoriesBusiness.saveCategory === 'function') {
        await window.AdminCategoriesBusiness.saveCategory(event, {
            updateCategory, createCategory, showAlert,
            hideCategoryForm, reloadCategories: loadCategories
        });
        return;
    }
    showAlert('Không thể lưu danh mục do thiếu module business.');
}

async function deleteCategoryConfirm(id) {
    if (window.AdminCategoriesBusiness && typeof window.AdminCategoriesBusiness.deleteCategoryConfirm === 'function') {
        await window.AdminCategoriesBusiness.deleteCategoryConfirm(id, { deleteCategory, showAlert, reloadCategories: loadCategories });
        return;
    }
    showAlert('Không thể xóa danh mục do thiếu module business.');
}

function populateCategorySelect() {
    if (window.AdminCategoriesBusiness && typeof window.AdminCategoriesBusiness.populateCategorySelect === 'function') {
        window.AdminCategoriesBusiness.populateCategorySelect(categoriesData);
        return;
    }
}

function populateParentCategorySelect(excludeId = null) {
    if (window.AdminCategoriesBusiness && typeof window.AdminCategoriesBusiness.populateParentCategorySelect === 'function') {
        window.AdminCategoriesBusiness.populateParentCategorySelect(categoriesData, excludeId);
        return;
    }
}

// ==============================
// COUPONS MANAGEMENT
// ==============================

async function loadCoupons() {
    if (window.AdminCouponsBusiness && typeof window.AdminCouponsBusiness.loadCoupons === 'function') {
        await window.AdminCouponsBusiness.loadCoupons({
            fetchCoupons,
            renderCoupons,
            showAlert,
            setCouponsData: (data) => { couponsData = data; }
        });
        return;
    }
    showAlert('Không thể tải mã giảm giá do thiếu module business.');
}

function renderCoupons(coupons) {
    if (window.AdminCouponsBusiness && typeof window.AdminCouponsBusiness.renderCoupons === 'function') {
        window.AdminCouponsBusiness.renderCoupons(coupons, { escapeHtml, escapeJsString, formatPrice });
        return;
    }
    const tbody = document.querySelector('#couponsList tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;">Module chưa tải.</td></tr>';
}

function showAddCouponForm() {
    document.getElementById('couponId').value = '';
    document.getElementById('couponCode').value = '';
    document.getElementById('couponDescription').value = '';
    document.getElementById('couponDiscountValue').value = '';
    document.getElementById('couponMinimumAmount').value = '';
    document.getElementById('couponMaxUsage').value = '';
    document.getElementById('couponStartDate').value = '';
    document.getElementById('couponEndDate').value = '';
    document.getElementById('couponActive').checked = true;
    document.getElementById('couponFormTitle').textContent = 'Thêm mã giảm giá mới';
    document.getElementById('couponForm').classList.remove('hidden');
}

function hideCouponForm() {
    document.getElementById('couponForm').classList.add('hidden');
}

async function editCoupon(id) {
    if (window.AdminCouponsBusiness && typeof window.AdminCouponsBusiness.editCoupon === 'function') {
        await window.AdminCouponsBusiness.editCoupon(id, { getCouponById, showAlert });
        return;
    }
    showAlert('Không thể chỉnh sửa mã giảm giá do thiếu module business.');
}

async function saveCoupon(event) {
    if (window.AdminCouponsBusiness && typeof window.AdminCouponsBusiness.saveCoupon === 'function') {
        await window.AdminCouponsBusiness.saveCoupon(event, {
            createCoupon,
            updateCoupon,
            showAlert,
            hideCouponForm,
            reloadCoupons: loadCoupons
        });
        return;
    }
    showAlert('Không thể lưu mã giảm giá do thiếu module business.');
}

async function deleteCouponConfirm(id) {
    if (window.AdminCouponsBusiness && typeof window.AdminCouponsBusiness.deleteCouponConfirm === 'function') {
        await window.AdminCouponsBusiness.deleteCouponConfirm(id, {
            deleteCoupon,
            showAlert,
            reloadCoupons: loadCoupons
        });
        return;
    }
    showAlert('Không thể xóa mã giảm giá do thiếu module business.');
}

// ==============================
// USERS MANAGEMENT
// ==============================

async function loadUsers() {
    if (window.AdminUsersBusiness && typeof window.AdminUsersBusiness.loadUsers === 'function') {
        await window.AdminUsersBusiness.loadUsers({
            fetchUsers, renderUsers, showAlert,
            setUsersData: (data) => { usersData = data; }
        });
        return;
    }
    showAlert('Không thể tải người dùng do thiếu module business.');
}

// ==============================
// SUPPLIERS MANAGEMENT
// ==============================

async function loadSuppliers() {
    if (window.AdminSuppliersBusiness && typeof window.AdminSuppliersBusiness.loadSuppliers === 'function') {
        await window.AdminSuppliersBusiness.loadSuppliers({
            fetchSuppliers,
            renderSuppliers,
            showAlert,
            setSuppliersData: (data) => { suppliersData = data; }
        });
        return;
    }
    showAlert('Không thể tải nhà cung cấp do thiếu module business.');
}

function renderSuppliers(suppliers) {
    if (window.AdminSuppliersBusiness && typeof window.AdminSuppliersBusiness.renderSuppliers === 'function') {
        window.AdminSuppliersBusiness.renderSuppliers(suppliers, { escapeHtml, escapeJsString });
        return;
    }
}

function showAddSupplierForm() {
    document.getElementById('supplierId').value = '';
    document.getElementById('supplierName').value = '';
    document.getElementById('supplierEmail').value = '';
    document.getElementById('supplierPhone').value = '';
    document.getElementById('supplierContactPerson').value = '';
    document.getElementById('supplierAddress').value = '';
    document.getElementById('supplierCity').value = '';
    document.getElementById('supplierCountry').value = '';
    document.getElementById('supplierBankAccount').value = '';
    document.getElementById('supplierActive').checked = true;
    document.getElementById('supplierFormTitle').textContent = 'Thêm nhà cung cấp';
    document.getElementById('supplierForm').classList.remove('hidden');
}

function hideSupplierForm() {
    document.getElementById('supplierForm').classList.add('hidden');
}

async function editSupplier(id) {
    if (window.AdminSuppliersBusiness && typeof window.AdminSuppliersBusiness.editSupplier === 'function') {
        await window.AdminSuppliersBusiness.editSupplier(id, { getSupplierById, showAlert });
    }
}

async function saveSupplier(event) {
    if (window.AdminSuppliersBusiness && typeof window.AdminSuppliersBusiness.saveSupplier === 'function') {
        await window.AdminSuppliersBusiness.saveSupplier(event, {
            createSupplier,
            updateSupplier,
            showAlert,
            hideSupplierForm,
            reloadSuppliers: loadSuppliers
        });
    }
}

async function deleteSupplierConfirm(id) {
    if (window.AdminSuppliersBusiness && typeof window.AdminSuppliersBusiness.deleteSupplierConfirm === 'function') {
        await window.AdminSuppliersBusiness.deleteSupplierConfirm(id, {
            deleteSupplier,
            showAlert,
            reloadSuppliers: loadSuppliers
        });
    }
}

// ==============================
// PURCHASE ORDERS MANAGEMENT
// ==============================

async function loadPurchaseOrders() {
    if (window.AdminPurchaseOrdersBusiness && typeof window.AdminPurchaseOrdersBusiness.loadPurchaseOrders === 'function') {
        await window.AdminPurchaseOrdersBusiness.loadPurchaseOrders({
            fetchPurchaseOrders,
            fetchSuppliers,
            fetchBooks,
            setPurchaseOrdersData: (data) => { purchaseOrdersData = data; },
            setSuppliersData: (data) => { suppliersData = data; },
            setBooksData: (data) => { booksData = data; },
            renderPurchaseOrders,
            showAlert
        });
        return;
    }
    showAlert('Không thể tải phiếu nhập do thiếu module business.');
}

function renderPurchaseOrders(orders) {
    if (window.AdminPurchaseOrdersBusiness && typeof window.AdminPurchaseOrdersBusiness.renderPurchaseOrders === 'function') {
        window.AdminPurchaseOrdersBusiness.renderPurchaseOrders(orders, {
            escapeHtml,
            escapeJsString,
            formatPrice,
            suppliersData
        });
    }
}

function showAddPurchaseOrderForm() {
    if (window.AdminPurchaseOrdersBusiness && typeof window.AdminPurchaseOrdersBusiness.showAddPurchaseOrderForm === 'function') {
        window.AdminPurchaseOrdersBusiness.showAddPurchaseOrderForm({ suppliersData, booksData, showAlert });
    }
}

function hidePurchaseOrderForm() {
    if (window.AdminPurchaseOrdersBusiness && typeof window.AdminPurchaseOrdersBusiness.hidePurchaseOrderForm === 'function') {
        window.AdminPurchaseOrdersBusiness.hidePurchaseOrderForm();
    }
}

function addPurchaseOrderItem() {
    if (window.AdminPurchaseOrdersBusiness && typeof window.AdminPurchaseOrdersBusiness.addPurchaseOrderItem === 'function') {
        window.AdminPurchaseOrdersBusiness.addPurchaseOrderItem({ booksData });
    }
}

function removePurchaseOrderItem(element) {
    if (window.AdminPurchaseOrdersBusiness && typeof window.AdminPurchaseOrdersBusiness.removePurchaseOrderItem === 'function') {
        window.AdminPurchaseOrdersBusiness.removePurchaseOrderItem(element, { showAlert });
    }
}

async function savePurchaseOrder(event) {
    if (window.AdminPurchaseOrdersBusiness && typeof window.AdminPurchaseOrdersBusiness.savePurchaseOrder === 'function') {
        await window.AdminPurchaseOrdersBusiness.savePurchaseOrder(event, {
            createPurchaseOrder,
            showAlert,
            hidePurchaseOrderForm,
            reloadPurchaseOrders: loadPurchaseOrders
        });
    }
}

async function receivePurchaseOrder(id) {
    if (window.AdminPurchaseOrdersBusiness && typeof window.AdminPurchaseOrdersBusiness.receivePurchaseOrder === 'function') {
        await window.AdminPurchaseOrdersBusiness.receivePurchaseOrder(id, {
            updatePurchaseOrderStatus,
            showAlert,
            reloadPurchaseOrders: loadPurchaseOrders
        });
    }
}

async function cancelPurchaseOrder(id) {
    if (window.AdminPurchaseOrdersBusiness && typeof window.AdminPurchaseOrdersBusiness.cancelPurchaseOrder === 'function') {
        await window.AdminPurchaseOrdersBusiness.cancelPurchaseOrder(id, {
            updatePurchaseOrderStatus,
            showAlert,
            reloadPurchaseOrders: loadPurchaseOrders
        });
    }
}

async function deletePurchaseOrderConfirm(id) {
    if (window.AdminPurchaseOrdersBusiness && typeof window.AdminPurchaseOrdersBusiness.deletePurchaseOrderConfirm === 'function') {
        await window.AdminPurchaseOrdersBusiness.deletePurchaseOrderConfirm(id, {
            deletePurchaseOrder,
            showAlert,
            reloadPurchaseOrders: loadPurchaseOrders
        });
    }
}

function filterPurchaseOrdersByStatus() {
    const status = document.getElementById('purchaseOrderStatusFilter').value;
    if (window.AdminPurchaseOrdersBusiness && typeof window.AdminPurchaseOrdersBusiness.filterByStatus === 'function') {
        renderPurchaseOrders(window.AdminPurchaseOrdersBusiness.filterByStatus(purchaseOrdersData, status));
    }
}

function refreshPurchaseOrders() {
    loadPurchaseOrders();
}

// ==============================
// PAYMENTS MANAGEMENT
// ==============================

async function loadPayments() {
    if (window.AdminPaymentsBusiness && typeof window.AdminPaymentsBusiness.loadPayments === 'function') {
        await window.AdminPaymentsBusiness.loadPayments({
            fetchPayments,
            fetchOrders,
            setPaymentsData: (data) => { paymentsData = data; },
            renderPayments,
            showAlert
        });
        return;
    }
    showAlert('Không thể tải danh sách thanh toán do thiếu module business.');
}

function renderPayments(payments) {
    if (window.AdminPaymentsBusiness && typeof window.AdminPaymentsBusiness.renderPayments === 'function') {
        window.AdminPaymentsBusiness.renderPayments(payments, {
            escapeHtml,
            escapeJsString,
            formatPrice,
            getPaymentMethodText
        });
    }
}

function filterPaymentsByStatus() {
    const status = document.getElementById('paymentStatusFilter').value;
    if (window.AdminPaymentsBusiness && typeof window.AdminPaymentsBusiness.filterByStatus === 'function') {
        renderPayments(window.AdminPaymentsBusiness.filterByStatus(paymentsData, status));
    }
}

async function completePayment(id) {
    if (window.AdminPaymentsBusiness && typeof window.AdminPaymentsBusiness.updatePaymentStatus === 'function') {
        await window.AdminPaymentsBusiness.updatePaymentStatus(id, 'COMPLETED', {
            updatePaymentStatusAdmin,
            showAlert,
            reloadPayments: loadPayments
        });
    }
}

async function failPayment(id) {
    if (window.AdminPaymentsBusiness && typeof window.AdminPaymentsBusiness.updatePaymentStatus === 'function') {
        await window.AdminPaymentsBusiness.updatePaymentStatus(id, 'FAILED', {
            updatePaymentStatusAdmin,
            showAlert,
            reloadPayments: loadPayments
        });
    }
}

async function refundPayment(id) {
    if (window.AdminPaymentsBusiness && typeof window.AdminPaymentsBusiness.updatePaymentStatus === 'function') {
        await window.AdminPaymentsBusiness.updatePaymentStatus(id, 'REFUNDED', {
            updatePaymentStatusAdmin,
            showAlert,
            reloadPayments: loadPayments
        });
    }
}

function refreshPayments() {
    loadPayments();
}

function renderUsers(users) {
    if (window.AdminUsersBusiness && typeof window.AdminUsersBusiness.renderUsers === 'function') {
        window.AdminUsersBusiness.renderUsers(users, { escapeJsString, escapeHtml, auth, isCurrentUserSuperAdmin });
        return;
    }
    const tbody = document.querySelector('#usersList tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;">Module chưa tải.</td></tr>';
}

function showAddUserForm() {
    showAlert('Tạo tài khoản tại trang này đã bị tắt. Hãy nâng quyền từ user có sẵn.');
}

function hideUserForm() {
    document.getElementById('userForm').classList.add('hidden');
}

async function editUser(id) {
    if (window.AdminUsersBusiness && typeof window.AdminUsersBusiness.editUser === 'function') {
        await window.AdminUsersBusiness.editUser(id, { getUserById, showAlert, auth, isCurrentUserSuperAdmin });
        return;
    }
    showAlert('Không thể chỉnh sửa người dùng do thiếu module business.');
}

async function saveUser(event) {
    if (window.AdminUsersBusiness && typeof window.AdminUsersBusiness.saveUser === 'function') {
        await window.AdminUsersBusiness.saveUser(event, {
            updateUser, showAlert, hideUserForm, reloadUsers: loadUsers, isCurrentUserSuperAdmin
        });
        return;
    }
    showAlert('Không thể lưu người dùng do thiếu module business.');
}

async function toggleUserBan(id, currentlyActive) {
    if (window.AdminUsersBusiness && typeof window.AdminUsersBusiness.toggleUserBan === 'function') {
        await window.AdminUsersBusiness.toggleUserBan(id, currentlyActive, {
            updateUser, showAlert, reloadUsers: loadUsers
        });
        return;
    }
    showAlert('Không thể thực hiện do thiếu module business.');
}

async function deleteUserConfirm(id) {
    if (window.AdminUsersBusiness && typeof window.AdminUsersBusiness.deleteUserConfirm === 'function') {
        await window.AdminUsersBusiness.deleteUserConfirm(id, {
            deleteUser, showAlert, reloadUsers: loadUsers, auth, usersData
        });
        return;
    }
    showAlert('Không thể xóa người dùng do thiếu module business.');
}

// ==============================
// REVIEWS MANAGEMENT
// ==============================

async function loadReviews() {
    if (
        window.AdminReviewsBusiness
        && typeof window.AdminReviewsBusiness.loadReviews === 'function'
    ) {
        await window.AdminReviewsBusiness.loadReviews({
            currentReviewsView,
            getPendingReviews,
            showAllReviews,
            renderReviews,
            showAlert
        });
        return;
    }

    showAlert('Không thể tải đánh giá do thiếu module business.');
}

function showReviewTab(tab, buttonElement = null) {
    currentReviewsView = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    const activeTab = buttonElement || document.querySelector(`.tab-button[data-review-tab="${tab}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    loadReviews();
}

async function showAllReviews() {
    if (
        window.AdminReviewsBusiness
        && typeof window.AdminReviewsBusiness.showAllReviews === 'function'
    ) {
        await window.AdminReviewsBusiness.showAllReviews({
            fetchBooks,
            getReviewsByBook,
            renderReviews,
            showAlert
        });
        return;
    }

    showAlert('Không thể tải tất cả đánh giá do thiếu module business.');
}

function renderReviews(reviews) {
    if (
        window.AdminReviewsBusiness
        && typeof window.AdminReviewsBusiness.renderReviews === 'function'
    ) {
        window.AdminReviewsBusiness.renderReviews(reviews, {
            escapeHtml,
            escapeJsString
        });
        return;
    }

    const container = document.getElementById('reviewsList');
    if (container) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Không thể hiển thị đánh giá do thiếu module business.</p>';
    }
}

function getBookTitleById(bookId) {
    const book = booksData.find(b => b.id === bookId);
    return book ? book.title : 'Sách chưa xác định';
}

async function approveReviewConfirm(id) {
    if (
        window.AdminReviewsBusiness
        && typeof window.AdminReviewsBusiness.approveReviewConfirm === 'function'
    ) {
        await window.AdminReviewsBusiness.approveReviewConfirm(id, {
            approveReview,
            showAlert,
            reloadReviews: loadReviews
        });
        return;
    }

    showAlert('Không thể duyệt đánh giá do thiếu module business.');
}

async function deleteReviewConfirm(id) {
    if (
        window.AdminReviewsBusiness
        && typeof window.AdminReviewsBusiness.deleteReviewConfirm === 'function'
    ) {
        await window.AdminReviewsBusiness.deleteReviewConfirm(id, {
            deleteReview,
            showAlert,
            reloadReviews: loadReviews
        });
        return;
    }

    showAlert('Không thể xóa đánh giá do thiếu module business.');
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

function showAlert(message) {
    document.getElementById('alertText').textContent = message;
    document.getElementById('alertModal').classList.remove('hidden');
}

function closeAlert() {
    document.getElementById('alertModal').classList.add('hidden');
}

// Close alert when clicking outside the modal
document.addEventListener('click', (event) => {
    const modal = document.getElementById('alertModal');
    if (event.target === modal) {
        closeAlert();
    }
});

// ==============================
// ORDERS MANAGEMENT
// ==============================

let ordersData = [];

async function loadOrders() {
    if (
        window.AdminOrdersBusiness
        && typeof window.AdminOrdersBusiness.loadOrders === 'function'
    ) {
        await window.AdminOrdersBusiness.loadOrders({
            fetchOrders,
            setOrdersData: (orders) => {
                ordersData = Array.isArray(orders) ? orders : [];
            },
            renderOrders,
            showAlert,
            closeAlert,
            logger: console
        });
        return;
    }

    showAlert('Không thể tải danh sách đơn hàng do thiếu module business.');
}

function renderOrders(orders) {
    if (
        window.AdminOrdersBusiness
        && typeof window.AdminOrdersBusiness.renderOrders === 'function'
    ) {
        window.AdminOrdersBusiness.renderOrders(orders, {
            formatPrice,
            escapeHtml,
            escapeJsString,
            getOrderStatusBadgeClass,
            getOrderStatusText
        });
        return;
    }

    const tbody = document.querySelector('#ordersList tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">Không thể hiển thị đơn hàng do thiếu module business.</td></tr>';
    }
}

function getOrderStatusBadgeClass(status) {
    switch(status) {
        case 'PENDING': return 'badge-warning';
        case 'CONFIRMED': return 'badge-info';
        case 'SHIPPED': return 'badge-primary';
        case 'DELIVERED': return 'badge-success';
        case 'CANCELLED': return 'badge-danger';
        default: return 'badge-secondary';
    }
}

function getOrderStatusText(status) {
    switch(status) {
        case 'PENDING': return 'Chờ xác nhận';
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'SHIPPED': return 'Đang vận chuyển';
        case 'DELIVERED': return 'Đã giao';
        case 'CANCELLED': return 'Đã hủy';
        default: return status;
    }
}

async function viewOrderDetails(orderId) {
    if (window.AdminOrdersModalBusiness && typeof window.AdminOrdersModalBusiness.viewOrderDetails === 'function') {
        await window.AdminOrdersModalBusiness.viewOrderDetails(orderId, {
            getOrderById, getUserById, showAlert, escapeHtml, escapeJsString,
            getOrderStatusBadgeClass, getOrderStatusText, formatPrice
        });
        return;
    }
    showAlert('Không thể xem chi tiết đơn hàng do thiếu module business.');
}

function showOrderDetailsModal(order) {
    if (window.AdminOrdersModalBusiness && typeof window.AdminOrdersModalBusiness.showOrderDetailsModal === 'function') {
        window.AdminOrdersModalBusiness.showOrderDetailsModal(order, {
            escapeHtml, escapeJsString, getOrderStatusBadgeClass, getOrderStatusText, formatPrice
        });
        return;
    }
}

function closeOrderDetailsModal() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function showUpdateStatusForm(orderId) {
    if (window.AdminOrdersModalBusiness && typeof window.AdminOrdersModalBusiness.showUpdateStatusForm === 'function') {
        await window.AdminOrdersModalBusiness.showUpdateStatusForm(orderId, {
            apiCall, showAlert, escapeHtml, escapeJsString,
            getOrderStatusBadgeClass, getOrderStatusText
        });
        return;
    }
    showAlert('Không thể cập nhật trạng thái do thiếu module business.');
}

function showUpdateStatusModal(order) {
    if (window.AdminOrdersModalBusiness && typeof window.AdminOrdersModalBusiness.showUpdateStatusModal === 'function') {
        window.AdminOrdersModalBusiness.showUpdateStatusModal(order, {
            escapeHtml, escapeJsString, getOrderStatusBadgeClass, getOrderStatusText
        });
        return;
    }
}

async function updateOrderStatus(event, orderId) {
    if (window.AdminOrdersModalBusiness && typeof window.AdminOrdersModalBusiness.updateOrderStatus === 'function') {
        await window.AdminOrdersModalBusiness.updateOrderStatus(event, orderId, {
            apiCall, showAlert, currentSection, reloadOrders: loadOrders
        });
        return;
    }
    showAlert('Không thể cập nhật trạng thái do thiếu module business.');
}

function closeUpdateStatusModal() {
    const modal = document.getElementById('updateStatusModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function getPaymentMethodText(method) {
    if (window.AdminOrdersModalBusiness && typeof window.AdminOrdersModalBusiness.getPaymentMethodText === 'function') {
        return window.AdminOrdersModalBusiness.getPaymentMethodText(method);
    }
    switch (method) {
        case 'COD': return 'Thanh toán khi nhận hàng';
        case 'BANK': return 'Chuyển khoản ngân hàng';
        case 'MOMO': return 'Ví MoMo';
        default: return method || '-';
    }
}

function searchOrders() {
    const searchTerm = document.getElementById('searchOrder').value;
    if (
        window.AdminOrdersBusiness
        && typeof window.AdminOrdersBusiness.searchOrders === 'function'
    ) {
        const filtered = window.AdminOrdersBusiness.searchOrders(ordersData, searchTerm);
        renderOrders(filtered);
        return;
    }

    renderOrders(ordersData);
}

function filterByStatus() {
    const status = document.getElementById('statusFilter').value;
    if (
        window.AdminOrdersBusiness
        && typeof window.AdminOrdersBusiness.filterByStatus === 'function'
    ) {
        const filtered = window.AdminOrdersBusiness.filterByStatus(ordersData, status);
        renderOrders(filtered);
        return;
    }

    renderOrders(ordersData);
}

function refreshOrders() {
    loadOrders();
}

// Close alert when clicking outside the modal
document.addEventListener('click', (event) => {
    const modal = document.getElementById('alertModal');
    if (event.target === modal) {
        closeAlert();
    }
});
