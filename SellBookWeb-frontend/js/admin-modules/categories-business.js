/**
 * AdminCategoriesBusiness — category CRUD business logic for admin panel.
 * Exposed on window.AdminCategoriesBusiness.
 */
(function (global) {
    'use strict';

    const AdminCategoriesBusiness = {

        /**
         * Load categories from API, store via setter, render, and populate selects.
         * deps: { fetchCategories, renderCategories, populateCategorySelect, showAlert, setCategoriesData }
         */
        async loadCategories(deps) {
            const { fetchCategories, renderCategories, populateCategorySelect, showAlert, setCategoriesData } = deps;
            try {
                const categories = await fetchCategories();
                if (typeof setCategoriesData === 'function') setCategoriesData(categories);
                renderCategories(categories);
                populateCategorySelect();
            } catch (error) {
                showAlert('Lỗi khi tải danh mục: ' + error.message);
            }
        },

        /**
         * Render categories table.
         * deps: { escapeJsString, escapeHtml }
         */
        renderCategories(categories, deps) {
            const { escapeJsString, escapeHtml } = deps;
            const tbody = document.querySelector('#categoriesList tbody');
            tbody.innerHTML = '';

            if (!Array.isArray(categories) || categories.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">Không có danh mục</td></tr>';
                return;
            }

            const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

            categories.forEach(category => {
                const safeCategoryId = escapeJsString(category.id);
                const safeCategoryName = escapeHtml(category.name || '');
                const safeCategoryIcon = escapeHtml(category.icon || 'fas fa-book');
                const parentName = category.parentId
                    ? (categoryMap.get(category.parentId)?.name || '--')
                    : '--';
                const safeParentName = escapeHtml(parentName);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${safeCategoryName}</td>
                    <td>${safeCategoryIcon}</td>
                    <td>${safeParentName}</td>
                    <td>
                        <span class="badge ${category.active ? 'badge-success' : 'badge-danger'}">
                            ${category.active ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-warning btn-sm" data-category-action="edit" data-category-id="${safeCategoryId}">Sửa</button>
                            <button class="btn btn-danger btn-sm" data-category-action="delete" data-category-id="${safeCategoryId}">Xóa</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        },

        /**
         * Fill form with category data for editing.
         * deps: { getCategoryById, showAlert, populateParentCategorySelect }
         */
        async editCategory(id, deps) {
            const { getCategoryById, showAlert, populateParentCategorySelect } = deps;
            try {
                const category = await getCategoryById(id);
                document.getElementById('categoryId').value = category.id;
                document.getElementById('categoryName').value = category.name;
                document.getElementById('categoryDescription').value = category.description || '';
                document.getElementById('categoryIcon').value = category.icon || '';
                populateParentCategorySelect(category.id);
                document.getElementById('categoryParentId').value = category.parentId || '';
                document.getElementById('categoryActive').checked = category.active !== false;
                document.getElementById('categoryFormTitle').textContent = 'Chỉnh sửa danh mục';
                document.getElementById('categoryForm').classList.remove('hidden');
            } catch (error) {
                showAlert('Lỗi khi tải danh mục: ' + error.message);
            }
        },

        /**
         * Save (create or update) a category from form submission.
         * deps: { updateCategory, createCategory, showAlert, hideCategoryForm, reloadCategories }
         */
        async saveCategory(event, deps) {
            event.preventDefault();
            const { updateCategory, createCategory, showAlert, hideCategoryForm, reloadCategories } = deps;

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
                reloadCategories();
            } catch (error) {
                showAlert('Lỗi: ' + error.message);
            }
        },

        /**
         * Confirm and delete a category.
         * deps: { deleteCategory, showAlert, reloadCategories }
         */
        async deleteCategoryConfirm(id, deps) {
            const { deleteCategory, showAlert, reloadCategories } = deps;
            if (confirm('Bạn chắc chắn muốn xóa danh mục này?')) {
                try {
                    await deleteCategory(id);
                    showAlert('Xóa danh mục thành công!');
                    reloadCategories();
                } catch (error) {
                    showAlert('Lỗi: ' + error.message);
                }
            }
        },

        /**
         * Populate the bookCategory select with current categoriesData.
         * categoriesData: array of category objects
         */
        populateCategorySelect(categoriesData) {
            const select = document.getElementById('bookCategory');
            if (!select) return;
            select.innerHTML = '<option value="">-- Chọn danh mục --</option>';
            if (Array.isArray(categoriesData)) {
                categoriesData.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    select.appendChild(option);
                });
            }
        },

        /**
         * Populate the categoryParentId select, excluding the given id.
         * categoriesData: array; excludeId: id to skip (current category being edited)
         */
        populateParentCategorySelect(categoriesData, excludeId) {
            const select = document.getElementById('categoryParentId');
            if (!select) return;

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
                const parentCategories = categoriesData.filter(cat => !cat.parentId && cat.id !== excludeId);
                parentCategories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    select.appendChild(option);
                });
            }
        }
    };

    global.AdminCategoriesBusiness = AdminCategoriesBusiness;
})(window);
