// ==============================
// ADMIN APP - GLOBAL VARIABLES
// ==============================

let currentSection = 'dashboard';
let booksData = [];
let categoriesData = [];
let usersData = [];
let currentReviewsView = 'pending';

// ==============================
// PAGE INITIALIZATION
// ==============================

document.addEventListener('DOMContentLoaded', () => {
    // Display user info
    const user = auth.getUser();
    document.getElementById('adminName').textContent = `👤 ${user.name} (${user.role})`;
    
    loadDashboard();
    loadCategories();
});

// ==============================
// SECTION MANAGEMENT
// ==============================

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    currentSection = sectionId;

    // Load data for the section
    switch(sectionId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'books':
            loadBooks();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'users':
            loadUsers();
            break;
        case 'reviews':
            loadReviews();
            break;
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
    try {
        const books = await fetchBooks();
        const categories = await fetchCategories();
        const users = await fetchUsers();
        const reviews = await getPendingReviews();

        document.getElementById('totalBooks').textContent = Array.isArray(books) ? books.length : 0;
        document.getElementById('totalCategories').textContent = Array.isArray(categories) ? categories.length : 0;
        document.getElementById('totalUsers').textContent = Array.isArray(users) ? users.length : 0;
        document.getElementById('pendingReviews').textContent = Array.isArray(reviews) ? reviews.length : 0;
    } catch (error) {
        showAlert('Lỗi khi tải bảng điều khiển: ' + error.message);
    }
}

// ==============================
// BOOKS MANAGEMENT
// ==============================

async function loadBooks() {
    try {
        booksData = await fetchBooks();
        renderBooks(booksData);
        await loadCategoriesForFilter();
    } catch (error) {
        showAlert('Lỗi khi tải danh sách sách: ' + error.message);
    }
}

function renderBooks(books) {
    const tbody = document.querySelector('#booksList tbody');
    tbody.innerHTML = '';

    if (!Array.isArray(books) || books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #999;">Không có sách</td></tr>';
        return;
    }

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title || ''}</td>
            <td>${book.author || ''}</td>
            <td>${book.isbn || ''}</td>
            <td>${formatPrice(book.price)}</td>
            <td>${book.quantity || 0}</td>
            <td>${getCategoryNames(book.categoryIds)}</td>
            <td>${book.supplierName || book.publisher || ''}</td>
            <td>${book.coverType || 'Bìa Mềm'}</td>
            <td>${book.translator || 'N/A'}</td>
            <td>${book.rating ? book.rating.toFixed(1) : '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editBook('${book.id}')">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBookConfirm('${book.id}')">Xóa</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function showAddBookForm() {
    document.getElementById('bookId').value = '';
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookAuthor').value = '';
    document.getElementById('bookIsbn').value = '';
    document.getElementById('bookPrice').value = '';
    document.getElementById('bookQuantity').value = '';
    populateCategoryCheckboxes([]);
    document.getElementById('bookDescription').value = '';
    document.getElementById('bookImage').value = '';
    document.getElementById('bookSupplier').value = '';
    document.getElementById('bookCoverType').value = 'Bìa Mềm';
    document.getElementById('bookTranslator').value = '';
    document.getElementById('bookPublisher').value = '';
    document.getElementById('bookDiscountCode').value = '';
    document.getElementById('bookDiscount').value = '';
    document.getElementById('bookActive').checked = true;
    document.getElementById('bookFormTitle').textContent = 'Thêm sách mới';
    document.getElementById('bookForm').classList.remove('hidden');
}

function hideBookForm() {
    document.getElementById('bookForm').classList.add('hidden');
}

async function editBook(id) {
    try {
        const book = await getBookById(id);
        document.getElementById('bookId').value = book.id;
        document.getElementById('bookTitle').value = book.title;
        document.getElementById('bookAuthor').value = book.author;
        document.getElementById('bookIsbn').value = book.isbn;
        document.getElementById('bookPrice').value = book.price;
        document.getElementById('bookQuantity').value = book.quantity;
        populateCategoryCheckboxes(book.categoryIds || []);
        document.getElementById('bookDescription').value = book.description || '';
        document.getElementById('bookImage').value = book.image || '';
        document.getElementById('bookSupplier').value = book.supplierName || book.publisher || '';
        document.getElementById('bookCoverType').value = book.coverType || 'Bìa Mềm';
        document.getElementById('bookTranslator').value = book.translator || '';
        document.getElementById('bookPublisher').value = book.publisher || '';
        document.getElementById('bookDiscountCode').value = book.discountCode || '';
        document.getElementById('bookDiscount').value = book.discount || '';
        document.getElementById('bookActive').checked = book.active !== false;
        document.getElementById('bookFormTitle').textContent = 'Chỉnh sửa sách';
        document.getElementById('bookForm').classList.remove('hidden');
    } catch (error) {
        showAlert('Lỗi khi tải thông tin sách: ' + error.message);
    }
}

async function saveBook(event) {
    event.preventDefault();

    const bookId = document.getElementById('bookId').value;
    const discountCode = document.getElementById('bookDiscountCode').value.trim();
    const discount = document.getElementById('bookDiscount').value ? parseFloat(document.getElementById('bookDiscount').value) : null;
    const publisherValue = document.getElementById('bookPublisher').value;
    const supplierValue = document.getElementById('bookSupplier').value;
    const supplierName = supplierValue || publisherValue || null;
    const coverTypeValue = document.getElementById('bookCoverType').value || 'Bìa Mềm';
    
    const bookData = {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        isbn: document.getElementById('bookIsbn').value,
        price: parseFloat(document.getElementById('bookPrice').value),
        quantity: parseInt(document.getElementById('bookQuantity').value),
        categoryIds: getSelectedCategoryIds(),
        description: document.getElementById('bookDescription').value,
        image: document.getElementById('bookImage').value,
        supplierName: supplierName,
        coverType: coverTypeValue,
        translator: document.getElementById('bookTranslator').value || null,
        publisher: publisherValue || null,
        discountCode: discountCode || null,
        discount: discount || null,
        active: document.getElementById('bookActive').checked
    };

    try {
        if (bookId) {
            await updateBook(bookId, bookData);
            showAlert('Cập nhật sách thành công!');
        } else {
            await createBook(bookData);
            showAlert('Thêm sách thành công!');
        }
        hideBookForm();
        loadBooks();
    } catch (error) {
        showAlert('Lỗi: ' + error.message);
    }
}

async function deleteBookConfirm(id) {
    if (confirm('Bạn chắc chắn muốn xóa sách này?')) {
        try {
            await deleteBook(id);
            showAlert('Xóa sách thành công!');
            loadBooks();
        } catch (error) {
            showAlert('Lỗi: ' + error.message);
        }
    }
}

function searchBooks() {
    const searchTerm = document.getElementById('searchBook').value.toLowerCase();
    const filtered = booksData.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.isbn.includes(searchTerm)
    );
    renderBooks(filtered);
}

async function loadCategoriesForFilter() {
    try {
        const categories = await fetchCategories();
        const select = document.getElementById('categoryFilter');
        select.innerHTML = '<option value="">-- Tất cả danh mục --</option>';
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

async function filterByCategory() {
    const categoryId = document.getElementById('categoryFilter').value;
    if (categoryId) {
        try {
            const books = await getBooksByCategory(categoryId);
            renderBooks(books);
        } catch (error) {
            showAlert('Lỗi khi lọc sách: ' + error.message);
        }
    } else {
        renderBooks(booksData);
    }
}

function getCategoryNames(categoryIds) {
    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) return '-';
    return categoryIds.map(id => {
        const cat = categoriesData.find(c => c.id === id);
        return cat ? cat.name : '';
    }).filter(Boolean).join(', ') || '-';
}

// ==============================
// CATEGORIES MANAGEMENT
// ==============================

async function loadCategories() {
    try {
        categoriesData = await fetchCategories();
        renderCategories(categoriesData);
        populateCategorySelect();
    } catch (error) {
        showAlert('Lỗi khi tải danh mục: ' + error.message);
    }
}

function renderCategories(categories) {
    const container = document.getElementById('categoriesList');
    container.innerHTML = '';

    if (!Array.isArray(categories) || categories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Không có danh mục</p>';
        return;
    }

    // Separate parent and child categories
    const parentCategories = categories.filter(c => !c.parentId);
    const childCategories = categories.filter(c => c.parentId);

    // Render parent categories first
    parentCategories.forEach(category => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.borderLeft = '4px solid #667eea';
        card.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">
                <i class="${category.icon || 'fas fa-book'}"></i>
            </div>
            <h3>${category.name}</h3>
            <p>${category.description || 'Không có mô tả'}</p>
            <p style="font-size: 0.85rem; color: #999;">
                <span class="badge ${category.active ? 'badge-success' : 'badge-danger'}">
                    ${category.active ? 'Hoạt động' : 'Không hoạt động'}
                </span>
                <span class="badge badge-info" style="margin-left: 0.5rem;">Nhóm chính</span>
            </p>
            <div class="card-buttons">
                <button class="btn btn-warning btn-sm" onclick="editCategory('${category.id}')">Sửa</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCategoryConfirm('${category.id}')">Xóa</button>
            </div>
        `;
        container.appendChild(card);

        // Render child categories under this parent
        const children = childCategories.filter(c => c.parentId === category.id);
        if (children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.style.marginLeft = '2rem';
            childrenContainer.style.marginTop = '1rem';
            childrenContainer.style.paddingLeft = '1rem';
            childrenContainer.style.borderLeft = '2px solid #e0e0e0';
            
            children.forEach(child => {
                const childCard = document.createElement('div');
                childCard.className = 'card';
                childCard.style.marginBottom = '0.75rem';
                childCard.style.backgroundColor = '#f8f9fa';
                childCard.innerHTML = `
                    <div style="font-size: 1.5rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="${child.icon || 'fas fa-book'}"></i>
                        <span style="font-size: 1rem; color: #666;">→</span>
                    </div>
                    <h4 style="font-size: 1rem; margin: 0.5rem 0;">${child.name}</h4>
                    <p style="font-size: 0.85rem; color: #666; margin: 0.25rem 0;">${child.description || 'Không có mô tả'}</p>
                    <p style="font-size: 0.75rem; color: #999;">
                        <span class="badge ${child.active ? 'badge-success' : 'badge-danger'}">
                            ${child.active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                    </p>
                    <div class="card-buttons">
                        <button class="btn btn-warning btn-sm" onclick="editCategory('${child.id}')">Sửa</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteCategoryConfirm('${child.id}')">Xóa</button>
                    </div>
                `;
                childrenContainer.appendChild(childCard);
            });
            container.appendChild(childrenContainer);
        }
    });

    // Render orphaned child categories (if any)
    const orphaned = childCategories.filter(c => {
        const parentExists = categories.some(p => p.id === c.parentId);
        return !parentExists;
    });
    
    if (orphaned.length > 0) {
        orphaned.forEach(category => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.borderLeft = '4px solid #ffc107';
            card.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">
                    <i class="${category.icon || 'fas fa-book'}"></i>
                </div>
                <h3>${category.name}</h3>
                <p>${category.description || 'Không có mô tả'}</p>
                <p style="font-size: 0.85rem; color: #999;">
                    <span class="badge ${category.active ? 'badge-success' : 'badge-danger'}">
                        ${category.active ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                    <span class="badge badge-warning" style="margin-left: 0.5rem;">Parent không tồn tại</span>
                </p>
                <div class="card-buttons">
                    <button class="btn btn-warning btn-sm" onclick="editCategory('${category.id}')">Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCategoryConfirm('${category.id}')">Xóa</button>
                </div>
            `;
            container.appendChild(card);
        });
    }
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
    try {
        const category = await getCategoryById(id);
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('categoryIcon').value = category.icon || '';
        populateParentCategorySelect(category.id); // Exclude current category from parent list
        document.getElementById('categoryParentId').value = category.parentId || '';
        document.getElementById('categoryActive').checked = category.active !== false;
        document.getElementById('categoryFormTitle').textContent = 'Chỉnh sửa danh mục';
        document.getElementById('categoryForm').classList.remove('hidden');
    } catch (error) {
        showAlert('Lỗi khi tải danh mục: ' + error.message);
    }
}

async function saveCategory(event) {
    event.preventDefault();

    const categoryId = document.getElementById('categoryId').value;
    const parentId = document.getElementById('categoryParentId').value;
    const categoryData = {
        name: document.getElementById('categoryName').value,
        description: document.getElementById('categoryDescription').value,
        icon: document.getElementById('categoryIcon').value,
        parentId: parentId || null,
        active: document.getElementById('categoryActive').checked
    };

    try {
        if (categoryId) {
            await updateCategory(categoryId, categoryData);
            showAlert('Cập nhật danh mục thành công!');
        } else {
            await createCategory(categoryData);
            showAlert('Thêm danh mục thành công!');
        }
        hideCategoryForm();
        loadCategories();
    } catch (error) {
        showAlert('Lỗi: ' + error.message);
    }
}

async function deleteCategoryConfirm(id) {
    if (confirm('Bạn chắc chắn muốn xóa danh mục này?')) {
        try {
            await deleteCategory(id);
            showAlert('Xóa danh mục thành công!');
            loadCategories();
        } catch (error) {
            showAlert('Lỗi: ' + error.message);
        }
    }
}

function populateCategorySelect() {
    populateCategoryCheckboxes([]);
}

function populateCategoryCheckboxes(selectedIds) {
    const container = document.getElementById('bookCategoryContainer');
    if (!container) return;
    container.innerHTML = '';
    if (Array.isArray(categoriesData)) {
        categoriesData.forEach(cat => {
            const checked = selectedIds.includes(cat.id) ? 'checked' : '';
            const label = document.createElement('label');
            label.style.cssText = 'display: block; padding: 4px 0; cursor: pointer;';
            label.innerHTML = `<input type="checkbox" class="book-cat-cb" value="${cat.id}" ${checked}> ${cat.name}`;
            container.appendChild(label);
        });
    }
}

function getSelectedCategoryIds() {
    const checkboxes = document.querySelectorAll('.book-cat-cb:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function populateParentCategorySelect(excludeId = null) {
    const select = document.getElementById('categoryParentId');
    if (!select) return;
    
    // Keep the first option (empty)
    const firstOption = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (firstOption) {
        select.appendChild(firstOption);
    } else {
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '-- Không có (Nhóm chính) --';
        select.appendChild(emptyOption);
    }
    
    if (Array.isArray(categoriesData)) {
        // Only show parent categories (those without parentId)
        const parentCategories = categoriesData.filter(cat => !cat.parentId && cat.id !== excludeId);
        parentCategories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    }
}

// ==============================
// USERS MANAGEMENT
// ==============================

async function loadUsers() {
    try {
        usersData = await fetchUsers();
        renderUsers(usersData);
    } catch (error) {
        showAlert('Lỗi khi tải danh sách người dùng: ' + error.message);
    }
}

function renderUsers(users) {
    const tbody = document.querySelector('#usersList tbody');
    tbody.innerHTML = '';

    if (!Array.isArray(users) || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">Không có người dùng</td></tr>';
        return;
    }

    const currentUser = auth.getUser();
    const currentRole = currentUser ? currentUser.role : '';

    const roleOrder = { 'SUPER_ADMIN': 0, 'ADMIN': 1, 'STAFF': 2, 'CUSTOMER': 3 };
    users.sort((a, b) => (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99));

    users.forEach(user => {
        const row = document.createElement('tr');
        // ADMIN cannot delete self, other ADMINs, or SUPER_ADMINs
        // ADMIN cannot edit ADMIN or SUPER_ADMIN users
        const isAdminTarget = (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');
        const isSelf = (user.id === currentUser?.id);
        const canDelete = currentRole === 'SUPER_ADMIN' || (!isAdminTarget && !isSelf);
        const canEdit = currentRole === 'SUPER_ADMIN' || (!isAdminTarget && !isSelf);

        const roleLabel = {
            'SUPER_ADMIN': 'Super Admin',
            'ADMIN': 'Quản trị viên',
            'STAFF': 'Nhân viên',
            'CUSTOMER': 'Khách hàng'
        }[user.role] || user.role;

        row.innerHTML = `
            <td>${user.name || ''}</td>
            <td>${user.email || ''}</td>
            <td>${user.phone || '-'}</td>
            <td>${roleLabel}</td>
            <td>
                <span class="badge ${user.online ? 'badge-success' : 'badge-danger'}">
                    ${user.online ? 'Hoạt động' : 'Không hoạt động'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${canEdit ? `<button class="btn btn-warning btn-sm" onclick="editUser('${user.id}')">Sửa</button>` : ''}
                    ${canDelete ? `<button class="btn btn-danger btn-sm" onclick="deleteUserConfirm('${user.id}')">Xóa</button>` : ''}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateRoleDropdown() {
    const roleSelect = document.getElementById('userRole');
    const currentRole = auth.getUser()?.role || '';
    roleSelect.innerHTML = '';
    const roles = [{ value: 'CUSTOMER', label: 'Khách hàng' }, { value: 'STAFF', label: 'Nhân viên' }];
    if (currentRole === 'SUPER_ADMIN') {
        roles.push({ value: 'ADMIN', label: 'Quản trị viên' });
        roles.push({ value: 'SUPER_ADMIN', label: 'Super Admin' });
    }
    roles.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.value;
        opt.textContent = r.label;
        roleSelect.appendChild(opt);
    });
}

function showAddUserForm() {
    document.getElementById('userId').value = '';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPhone').value = '';
    document.getElementById('userActive').checked = true;
    document.getElementById('userFormTitle').textContent = 'Thêm người dùng';
    populateRoleDropdown();
    document.getElementById('userRole').value = 'CUSTOMER';
    document.getElementById('userForm').classList.remove('hidden');
}

function hideUserForm() {
    document.getElementById('userForm').classList.add('hidden');
}

async function editUser(id) {
    try {
        const user = await getUserById(id);
        document.getElementById('userId').value = user.id;
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPhone').value = user.phone || '';
        document.getElementById('userActive').checked = user.active !== false;
        document.getElementById('userFormTitle').textContent = 'Chỉnh sửa người dùng';
        populateRoleDropdown();
        document.getElementById('userRole').value = user.role;
        document.getElementById('userForm').classList.remove('hidden');
    } catch (error) {
        showAlert('Lỗi khi tải thông tin người dùng: ' + error.message);
    }
}

async function saveUser(event) {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const userData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        phone: document.getElementById('userPhone').value,
        role: document.getElementById('userRole').value,
        active: document.getElementById('userActive').checked
    };

    try {
        if (userId) {
            await updateUser(userId, userData);
            showAlert('Cập nhật người dùng thành công!');
        } else {
            await registerUser(userData);
            showAlert('Thêm người dùng thành công!');
        }
        hideUserForm();
        loadUsers();
    } catch (error) {
        showAlert('Lỗi: ' + error.message);
    }
}

async function deleteUserConfirm(id) {
    if (confirm('Bạn chắc chắn muốn xóa người dùng này?')) {
        try {
            await deleteUser(id);
            showAlert('Xóa người dùng thành công!');
            loadUsers();
        } catch (error) {
            showAlert('Lỗi: ' + error.message);
        }
    }
}

// ==============================
// REVIEWS MANAGEMENT
// ==============================

async function loadReviews() {
    try {
        if (currentReviewsView === 'pending') {
            const reviews = await getPendingReviews();
            renderReviews(reviews);
        } else {
            await showAllReviews();
        }
    } catch (error) {
        showAlert('Lỗi khi tải đánh giá: ' + error.message);
    }
}

function showReviewTab(tab) {
    currentReviewsView = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    loadReviews();
}

async function showAllReviews() {
    try {
        const books = await fetchBooks();
        let allReviews = [];
        
        if (Array.isArray(books)) {
            for (const book of books) {
                const reviews = await getReviewsByBook(book.id);
                if (Array.isArray(reviews)) {
                    allReviews.push(...reviews);
                }
            }
        }
        
        renderReviews(allReviews);
    } catch (error) {
        showAlert('Lỗi khi tải đánh giá: ' + error.message);
    }
}

function renderReviews(reviews) {
    const container = document.getElementById('reviewsList');
    container.innerHTML = '';

    if (!Array.isArray(reviews) || reviews.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">Không có đánh giá</p>';
        return;
    }

    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card';
        
        const stars = '⭐'.repeat(review.rating || 0);
        const statusClass = review.approved ? 'approved' : 'pending';
        const statusText = review.approved ? 'Đã duyệt' : 'Chờ duyệt';
        
        let actionButtons = `<button class="btn btn-danger btn-sm" onclick="deleteReviewConfirm('${review.id}')">Xóa</button>`;
        if (!review.approved) {
            actionButtons = `
                <button class="btn btn-success btn-sm" onclick="approveReviewConfirm('${review.id}')">Duyệt</button>
                <button class="btn btn-danger btn-sm" onclick="deleteReviewConfirm('${review.id}')">Xóa</button>
            `;
        }
        
        card.innerHTML = `
            <div class="review-header">
                <div>
                    <p class="review-book">📖 ${getBookTitleById(review.bookId)}</p>
                    <p class="review-user">👤 ${review.userName || 'Ẩn danh'}</p>
                </div>
                <span class="review-status ${statusClass}">${statusText}</span>
            </div>
            <div class="review-rating">${stars}</div>
            <p class="review-comment">${review.comment || 'Không có bình luận'}</p>
            <div class="review-buttons">
                ${actionButtons}
            </div>
        `;
        
        container.appendChild(card);
    });
}

function getBookTitleById(bookId) {
    const book = booksData.find(b => b.id === bookId);
    return book ? book.title : 'Sách chưa xác định';
}

async function approveReviewConfirm(id) {
    if (confirm('Bạn chắc chắn muốn duyệt đánh giá này?')) {
        try {
            await approveReview(id);
            showAlert('Duyệt đánh giá thành công!');
            loadReviews();
        } catch (error) {
            showAlert('Lỗi: ' + error.message);
        }
    }
}

async function deleteReviewConfirm(id) {
    if (confirm('Bạn chắc chắn muốn xóa đánh giá này?')) {
        try {
            await deleteReview(id);
            showAlert('Xóa đánh giá thành công!');
            loadReviews();
        } catch (error) {
            showAlert('Lỗi: ' + error.message);
        }
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
