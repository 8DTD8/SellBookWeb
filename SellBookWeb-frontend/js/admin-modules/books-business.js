/**
 * AdminBooksBusiness — book CRUD business logic for admin panel.
 * Exposed on window.AdminBooksBusiness.
 */
(function (global) {
    'use strict';

    const AdminBooksBusiness = {

        /**
         * Load books from API, store via setter, render, and populate category filter.
         * deps: { fetchBooks, renderBooks, loadCategoriesForFilter, showAlert, setBooksData }
         */
        async loadBooks(deps) {
            const { fetchBooks, renderBooks, loadCategoriesForFilter, showAlert, setBooksData } = deps;
            try {
                const books = await fetchBooks();
                const normalizedBooks = Array.isArray(books)
                    ? books.map((book) => {
                        const { isbn, ...rest } = (book || {});
                        return rest;
                    })
                    : [];
                if (typeof setBooksData === 'function') setBooksData(normalizedBooks);
                renderBooks(normalizedBooks);
                await loadCategoriesForFilter();
            } catch (error) {
                showAlert('Lỗi khi tải danh sách sách: ' + error.message);
            }
        },

        /**
         * Render books table.
         * deps: { escapeJsString, escapeHtml, formatPrice }
         */
        renderBooks(books, deps) {
            const { escapeJsString, escapeHtml, formatPrice } = deps;
            const tbody = document.querySelector('#booksList tbody');
            tbody.innerHTML = '';

            if (!Array.isArray(books) || books.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">Không có sách</td></tr>';
                return;
            }

            books.forEach(book => {
                const safeBookId = escapeJsString(book.id);
                const safeBookTitle = escapeHtml(book.title || '');
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${safeBookTitle}</td>
                    <td>${formatPrice(book.price)}</td>
                    <td>${book.quantity || 0}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-warning btn-sm" data-book-action="edit" data-book-id="${safeBookId}">Sửa</button>
                            <button class="btn btn-danger btn-sm" data-book-action="delete" data-book-id="${safeBookId}">Xóa</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        },

        /**
         * Fill form with book data for editing.
         * deps: { getBookById, loadBookSupplierOptions, showAlert }
         */
        async editBook(id, deps) {
            const { getBookById, loadBookSupplierOptions, showAlert } = deps;
            try {
                const book = await getBookById(id);
                if (typeof loadBookSupplierOptions === 'function') {
                    await loadBookSupplierOptions(book.supplierName || '');
                }
                document.getElementById('bookId').value = book.id;
                document.getElementById('bookTitle').value = book.title;
                document.getElementById('bookAuthor').value = book.author;
                document.getElementById('bookPrice').value = book.price;
                document.getElementById('bookQuantity').value = book.quantity;
                document.getElementById('bookCategory').value = book.categoryId;
                document.getElementById('bookDescription').value = book.description || '';
                document.getElementById('bookImage').value = book.image || '';
                document.getElementById('bookSupplier').value = book.supplierName || '';
                document.getElementById('bookCoverType').value = book.coverType || 'Bìa Mềm';
                document.getElementById('bookTranslator').value = book.translator || '';
                document.getElementById('bookPublisher').value = book.publisher || '';
                document.getElementById('bookDiscount').value = book.discount || '';
                document.getElementById('bookActive').checked = book.active !== false;
                document.getElementById('bookFormTitle').textContent = 'Chỉnh sửa sách';
                document.getElementById('bookForm').classList.remove('hidden');
            } catch (error) {
                showAlert('Lỗi khi tải thông tin sách: ' + error.message);
            }
        },

        /**
         * Save (create or update) a book from form submission.
         * deps: { updateBook, createBook, showAlert, hideBookForm, reloadBooks }
         */
        async saveBook(event, deps) {
            event.preventDefault();
            const { updateBook, createBook, showAlert, hideBookForm, reloadBooks } = deps;

            if (typeof validateAdminBookFormFull === 'function') {
                const formValidation = validateAdminBookFormFull();
                if (!formValidation.isValid) {
                    showAlert(formValidation.errors[0] || 'Vui lòng kiểm tra lại thông tin sách');
                    return;
                }
            }

            const bookId = document.getElementById('bookId').value;
            const discount = document.getElementById('bookDiscount').value
                ? parseFloat(document.getElementById('bookDiscount').value)
                : null;
            const publisherValue = document.getElementById('bookPublisher').value;
            const supplierValue = document.getElementById('bookSupplier').value.trim();
            const supplierName = supplierValue || null;
            const coverTypeValue = document.getElementById('bookCoverType').value || 'Bìa Mềm';

            const bookData = {
                title: document.getElementById('bookTitle').value,
                author: document.getElementById('bookAuthor').value,
                price: parseFloat(document.getElementById('bookPrice').value),
                quantity: parseInt(document.getElementById('bookQuantity').value),
                categoryId: document.getElementById('bookCategory').value,
                description: document.getElementById('bookDescription').value,
                image: document.getElementById('bookImage').value,
                supplierName: supplierName,
                coverType: coverTypeValue,
                translator: document.getElementById('bookTranslator').value || null,
                publisher: publisherValue || null,
                discount: discount || null,
                active: document.getElementById('bookActive').checked
            };

            if (!Number.isFinite(bookData.price) || bookData.price < 0 || bookData.price > 10000000) {
                showAlert('Giá phải từ 0 đến 10.000.000 VND');
                return;
            }

            try {
                if (bookId) {
                    await updateBook(bookId, bookData);
                    showAlert('Cập nhật sách thành công!');
                } else {
                    await createBook(bookData);
                    showAlert('Thêm sách thành công!');
                }
                hideBookForm();
                reloadBooks();
            } catch (error) {
                showAlert('Lỗi: ' + error.message);
            }
        },

        /**
         * Confirm and delete a book.
         * deps: { deleteBook, showAlert, reloadBooks }
         */
        async deleteBookConfirm(id, deps) {
            const { deleteBook, showAlert, reloadBooks } = deps;
            if (confirm('Bạn chắc chắn muốn xóa sách này?')) {
                try {
                    await deleteBook(id);
                    showAlert('Xóa sách thành công!');
                    reloadBooks();
                } catch (error) {
                    showAlert('Lỗi: ' + error.message);
                }
            }
        },

        /**
         * Filter books array by search term. Returns filtered array.
         */
        searchBooks(booksData, searchTerm) {
            const term = (searchTerm || '').toLowerCase();
            return (booksData || []).filter(book =>
                book.title.toLowerCase().includes(term) ||
                book.author.toLowerCase().includes(term)
            );
        },

        /**
         * Populate category filter dropdown.
         * deps: { fetchCategories }
         */
        async loadCategoriesForFilter(deps) {
            const { fetchCategories } = deps;
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
                console.error('Error loading categories for filter:', error);
            }
        },

        /**
         * Filter books by selected category and re-render.
         * deps: { getBooksByCategory, booksData, renderBooks, showAlert }
         */
        async filterByCategory(deps) {
            const { getBooksByCategory, booksData, renderBooks, showAlert } = deps;
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
    };

    global.AdminBooksBusiness = AdminBooksBusiness;
})(window);
