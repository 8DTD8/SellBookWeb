(function (global) {
    'use strict';

    function formatDateTime(value) {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleString('vi-VN');
    }

    function buildBookOptions(booksData) {
        return (booksData || []).map((book) => `
            <option value="${global.SafeHtml ? global.SafeHtml.escapeJsString(book.id || '') : (book.id || '')}">${global.SafeHtml ? global.SafeHtml.escape(book.title || '') : (book.title || '')}</option>
        `).join('');
    }

    function createItemRow(index, booksData, item = {}) {
        const selectedBookId = item.bookId || '';
        const quantity = item.quantity || 1;
        const unitPrice = item.unitPrice || 0;
        const options = (booksData || []).map((book) => {
            const bookId = global.SafeHtml ? global.SafeHtml.escapeJsString(book.id || '') : (book.id || '');
            const title = global.SafeHtml ? global.SafeHtml.escape(book.title || '') : (book.title || '');
            return `<option value="${bookId}" ${selectedBookId === book.id ? 'selected' : ''}>${title}</option>`;
        }).join('');

        return `
            <div class="purchase-order-item-row" data-index="${index}">
                <select class="purchase-order-book" required>
                    <option value="">-- Chọn sách --</option>
                    ${options}
                </select>
                <input type="number" class="purchase-order-quantity" min="1" value="${quantity}" required>
                <input type="number" class="purchase-order-unit-price" min="0" step="0.01" value="${unitPrice}" required>
                <button type="button" class="btn btn-danger btn-sm" data-ui-action="remove-purchase-order-item">Xóa</button>
            </div>
        `;
    }

    const AdminPurchaseOrdersBusiness = {
        async loadPurchaseOrders(deps) {
            const {
                fetchPurchaseOrders,
                fetchSuppliers,
                fetchBooks,
                setPurchaseOrdersData,
                setSuppliersData,
                setBooksData,
                renderPurchaseOrders,
                showAlert
            } = deps;

            try {
                const [orders, suppliers, books] = await Promise.all([
                    fetchPurchaseOrders(),
                    fetchSuppliers(),
                    fetchBooks(0, 100)
                ]);

                setPurchaseOrdersData(Array.isArray(orders) ? orders : []);
                setSuppliersData(Array.isArray(suppliers) ? suppliers : []);
                setBooksData(Array.isArray(books) ? books : []);
                renderPurchaseOrders(Array.isArray(orders) ? orders : []);
            } catch (error) {
                showAlert('Lỗi khi tải phiếu nhập: ' + error.message);
            }
        },

        renderPurchaseOrders(orders, deps) {
            const { escapeHtml, escapeJsString, formatPrice, suppliersData } = deps;
            const tbody = document.querySelector('#purchaseOrdersList tbody');
            if (!tbody) return;

            const supplierMap = new Map((suppliersData || []).map((supplier) => [supplier.id, supplier.name]));
            tbody.innerHTML = '';

            if (!Array.isArray(orders) || orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#999;">Chưa có phiếu nhập</td></tr>';
                return;
            }

            orders.forEach((order) => {
                const safeId = escapeJsString(order.id || '');
                const status = order.status || 'PENDING';
                const statusClass = status === 'RECEIVED' ? 'badge-success' : (status === 'CANCELLED' ? 'badge-danger' : 'badge-warning');
                const statusText = status === 'RECEIVED' ? 'Đã nhập kho' : (status === 'CANCELLED' ? 'Đã hủy' : 'Chờ nhập kho');
                const supplierName = supplierMap.get(order.supplierId) || order.supplierId || '-';
                const itemsCount = Array.isArray(order.items) ? order.items.length : 0;
                const canReceive = status === 'PENDING';
                const canCancel = status === 'PENDING';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHtml(order.id || '-')}</td>
                    <td>${escapeHtml(supplierName)}</td>
                    <td>${itemsCount}</td>
                    <td>${formatPrice(order.totalAmount || 0)}</td>
                    <td>${escapeHtml(formatDateTime(order.orderDate))}</td>
                    <td>${escapeHtml(formatDateTime(order.expectedDate))}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-success btn-sm" data-ui-action="receive-purchase-order" data-purchase-order-id="${safeId}" ${canReceive ? '' : 'disabled'}>Nhập kho</button>
                            <button class="btn btn-warning btn-sm" data-ui-action="cancel-purchase-order" data-purchase-order-id="${safeId}" ${canCancel ? '' : 'disabled'}>Hủy</button>
                            <button class="btn btn-danger btn-sm" data-ui-action="delete-purchase-order" data-purchase-order-id="${safeId}">Xóa</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        },

        showAddPurchaseOrderForm(deps) {
            const { suppliersData, booksData, showAlert } = deps;
            const activeSuppliers = (suppliersData || []).filter((supplier) => supplier.active !== false);
            if (activeSuppliers.length === 0) {
                showAlert('Cần có ít nhất một nhà cung cấp đang hoạt động trước khi tạo phiếu nhập');
                return;
            }
            if (!Array.isArray(booksData) || booksData.length === 0) {
                showAlert('Không có sách để thêm vào phiếu nhập');
                return;
            }

            const supplierSelect = document.getElementById('purchaseOrderSupplier');
            supplierSelect.innerHTML = '<option value="">-- Chọn nhà cung cấp --</option>' + activeSuppliers.map((supplier) => `
                <option value="${global.SafeHtml ? global.SafeHtml.escapeJsString(supplier.id || '') : (supplier.id || '')}">${global.SafeHtml ? global.SafeHtml.escape(supplier.name || '') : (supplier.name || '')}</option>
            `).join('');

            document.getElementById('purchaseOrderExpectedDate').value = '';
            document.getElementById('purchaseOrderNotes').value = '';
            document.getElementById('purchaseOrderItems').innerHTML = createItemRow(0, booksData);
            document.getElementById('purchaseOrderForm').classList.remove('hidden');
        },

        hidePurchaseOrderForm() {
            document.getElementById('purchaseOrderForm').classList.add('hidden');
        },

        addPurchaseOrderItem(deps) {
            const { booksData } = deps;
            const container = document.getElementById('purchaseOrderItems');
            const nextIndex = container.querySelectorAll('.purchase-order-item-row').length;
            container.insertAdjacentHTML('beforeend', createItemRow(nextIndex, booksData));
        },

        removePurchaseOrderItem(element, deps) {
            const { showAlert } = deps;
            const container = document.getElementById('purchaseOrderItems');
            const rows = container.querySelectorAll('.purchase-order-item-row');
            if (rows.length <= 1) {
                showAlert('Phiếu nhập phải có ít nhất một sách');
                return;
            }
            const row = element.closest('.purchase-order-item-row');
            if (row) {
                row.remove();
            }
        },

        async savePurchaseOrder(event, deps) {
            event.preventDefault();
            const { createPurchaseOrder, showAlert, hidePurchaseOrderForm, reloadPurchaseOrders } = deps;
            const supplierId = document.getElementById('purchaseOrderSupplier').value;
            const expectedDate = document.getElementById('purchaseOrderExpectedDate').value;
            const notes = document.getElementById('purchaseOrderNotes').value.trim();
            const rows = Array.from(document.querySelectorAll('#purchaseOrderItems .purchase-order-item-row'));

            if (!supplierId) {
                showAlert('Vui lòng chọn nhà cung cấp');
                return;
            }

            const items = rows.map((row) => {
                const bookId = row.querySelector('.purchase-order-book')?.value;
                const quantity = Number(row.querySelector('.purchase-order-quantity')?.value || 0);
                const unitPrice = Number(row.querySelector('.purchase-order-unit-price')?.value || 0);
                return {
                    bookId,
                    quantity,
                    unitPrice,
                    totalPrice: quantity * unitPrice
                };
            });

            if (items.some((item) => !item.bookId || item.quantity <= 0 || item.unitPrice < 0)) {
                showAlert('Vui lòng nhập đầy đủ sách, số lượng và đơn giá hợp lệ');
                return;
            }

            const payload = {
                supplierId,
                expectedDate: expectedDate || null,
                notes: notes || null,
                totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
                items
            };

            try {
                await createPurchaseOrder(payload);
                showAlert('Tạo phiếu nhập thành công');
                hidePurchaseOrderForm();
                reloadPurchaseOrders();
            } catch (error) {
                showAlert('Không thể tạo phiếu nhập: ' + error.message);
            }
        },

        async receivePurchaseOrder(id, deps) {
            const { updatePurchaseOrderStatus, showAlert, reloadPurchaseOrders } = deps;
            if (!confirm('Xác nhận đã nhận hàng và nhập kho cho phiếu này?')) {
                return;
            }
            try {
                await updatePurchaseOrderStatus(id, 'RECEIVED');
                showAlert('Đã nhập kho thành công');
                reloadPurchaseOrders();
            } catch (error) {
                showAlert('Không thể nhập kho: ' + error.message);
            }
        },

        async cancelPurchaseOrder(id, deps) {
            const { updatePurchaseOrderStatus, showAlert, reloadPurchaseOrders } = deps;
            if (!confirm('Bạn có chắc muốn hủy phiếu nhập này?')) {
                return;
            }
            try {
                await updatePurchaseOrderStatus(id, 'CANCELLED');
                showAlert('Đã hủy phiếu nhập');
                reloadPurchaseOrders();
            } catch (error) {
                showAlert('Không thể hủy phiếu nhập: ' + error.message);
            }
        },

        async deletePurchaseOrderConfirm(id, deps) {
            const { deletePurchaseOrder, showAlert, reloadPurchaseOrders } = deps;
            if (!confirm('Bạn có chắc muốn xóa phiếu nhập này?')) {
                return;
            }
            try {
                await deletePurchaseOrder(id);
                showAlert('Đã xóa phiếu nhập');
                reloadPurchaseOrders();
            } catch (error) {
                showAlert('Không thể xóa phiếu nhập: ' + error.message);
            }
        },

        filterByStatus(purchaseOrdersData, status) {
            if (!status) {
                return purchaseOrdersData || [];
            }
            return (purchaseOrdersData || []).filter((order) => order.status === status);
        }
    };

    global.AdminPurchaseOrdersBusiness = AdminPurchaseOrdersBusiness;
})(window);