/**
 * AdminOrdersModalBusiness — order detail/status modal business logic for admin panel.
 * Exposed on window.AdminOrdersModalBusiness.
 */
(function (global) {
    'use strict';

    const AdminOrdersModalBusiness = {

        /** Map payment method code to readable label. */
        getPaymentMethodText(method) {
            switch (method) {
                case 'COD': return 'Thanh toán khi nhận hàng';
                case 'CARD': return 'Thẻ ngân hàng';
                case 'TRANSFER': return 'Chuyển khoản';
                default: return method || '-';
            }
        },

        /**
         * Fetch order by ID and open details modal.
         * deps: { getOrderById, showAlert, escapeHtml, escapeJsString, getOrderStatusBadgeClass, getOrderStatusText, formatPrice }
         */
        async viewOrderDetails(orderId, deps) {
            const { getOrderById, getUserById, showAlert } = deps;
            try {
                const response = await getOrderById(orderId);
                const order = response && response.order ? response.order : response;

                // Backfill buyer information when order payload does not include user profile fields.
                if (order && order.userId && (!order.userName || !order.userEmail) && typeof getUserById === 'function') {
                    try {
                        const user = await getUserById(order.userId);
                        if (user) {
                            order.userName = order.userName || user.name || '-';
                            order.userEmail = order.userEmail || user.email || '-';
                            order.phone = order.phone || user.phone || '-';
                        }
                    } catch (error) {
                        // Keep order details visible even if user profile lookup fails.
                    }
                }

                AdminOrdersModalBusiness.showOrderDetailsModal(order, deps);
            } catch (error) {
                showAlert('Lỗi khi tải chi tiết đơn hàng: ' + error.message);
            }
        },

        /**
         * Build and show the order details modal.
         * deps: { escapeHtml, escapeJsString, getOrderStatusBadgeClass, getOrderStatusText, formatPrice }
         */
        showOrderDetailsModal(order, deps) {
            const { escapeHtml, escapeJsString, getOrderStatusBadgeClass, getOrderStatusText, formatPrice } = deps;

            let modal = document.getElementById('orderDetailsModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'orderDetailsModal';
                modal.className = 'modal';
                document.body.appendChild(modal);
            }

            const safeOrderId = escapeHtml(order.id || '-');
            const safeUserName = escapeHtml(order.userName || '-');
            const safeUserEmail = escapeHtml(order.userEmail || '-');
            const safePhone = escapeHtml(order.phone || '-');
            const safeAddress = escapeHtml(order.shippingAddress || '-');
            const safeCreatedAt = escapeHtml(order.createdAt ? new Date(order.createdAt).toLocaleString() : '-');
            const safePayment = escapeHtml(AdminOrdersModalBusiness.getPaymentMethodText(order.paymentMethod));
            const safeUserId = escapeHtml(order.userId || '-');

            const itemsHtml = order.items && order.items.length > 0
                ? order.items.map(item => `
                    <div class="order-modal-item-row">
                        <span class="order-modal-item-name">${escapeHtml(item.title || '')}</span>
                        <span class="order-modal-item-qty">x${item.quantity || 0}</span>
                        <span class="order-modal-item-price">${formatPrice((item.quantity || 0) * (item.price || 0))}</span>
                    </div>
                `).join('')
                : '<p>Không có thông tin sản phẩm</p>';

            modal.innerHTML = `
                <div class="modal-content order-modal">
                    <div class="modal-header order-modal-header">
                        <h3>Chi tiết đơn hàng #${safeOrderId}</h3>
                        <button class="btn btn-close" data-modal-action="close-order-details">×</button>
                    </div>
                    <div class="modal-body order-modal-body">
                        <section class="order-modal-card">
                            <h4>Thông tin người mua</h4>
                            <p><strong>Khách hàng:</strong> ${safeUserName}</p>
                            <p><strong>Email:</strong> ${safeUserEmail}</p>
                            <p><strong>Số điện thoại:</strong> ${safePhone}</p>
                            <p><strong>User ID:</strong> ${safeUserId}</p>
                        </section>
                        <section class="order-modal-card">
                            <h4>Thông tin đơn hàng</h4>
                            <p><strong>Mã đơn hàng:</strong> ${safeOrderId}</p>
                            <p><strong>Ngày đặt:</strong> ${safeCreatedAt}</p>
                            <p><strong>Phương thức thanh toán:</strong> ${safePayment}</p>
                            <p><strong>Địa chỉ giao hàng:</strong> ${safeAddress}</p>
                            <p><strong>Trạng thái:</strong> <span class="badge ${getOrderStatusBadgeClass(order.status)}">${getOrderStatusText(order.status)}</span></p>
                        </section>
                        <section class="order-modal-card order-modal-items">
                            <h4>Sản phẩm trong đơn</h4>
                            <div class="order-modal-items-list">${itemsHtml}</div>
                        </section>
                        <section class="order-modal-card">
                            <h4>Tổng kết thanh toán</h4>
                            <p><strong>Tạm tính:</strong> ${formatPrice(order.totalPrice)}</p>
                            <p><strong>Phí ship:</strong> ${formatPrice(order.shippingFee || 0)}</p>
                            <p><strong>Tổng cộng:</strong> <strong>${formatPrice(order.totalAmount || order.totalPrice)}</strong></p>
                        </section>
                    </div>
                    <div class="modal-footer order-modal-footer">
                        <button class="btn btn-secondary" data-modal-action="close-order-details">Đóng</button>
                    </div>
                </div>
            `;

            modal.classList.remove('hidden');
        },

        /** Hide the order details modal. */
        closeOrderDetailsModal() {
            const modal = document.getElementById('orderDetailsModal');
            if (modal) modal.classList.add('hidden');
        },

        /**
         * Fetch order and open update-status modal.
         * deps: { apiCall, showAlert, escapeHtml, escapeJsString, getOrderStatusBadgeClass, getOrderStatusText }
         */
        async showUpdateStatusForm(orderId, deps) {
            const { apiCall, showAlert } = deps;
            try {
                const response = await apiCall(`/admin/orders/${orderId}`);
                const order = response && response.order ? response.order : response;
                if (order && order.status === 'CANCELLED') {
                    showAlert('Đơn hàng đã hủy không thể cập nhật trạng thái nữa.');
                    return;
                }
                AdminOrdersModalBusiness.showUpdateStatusModal(order, deps);
            } catch (error) {
                showAlert('Lỗi khi tải thông tin đơn hàng: ' + error.message);
            }
        },

        /**
         * Build and show the update-status modal.
         * deps: { escapeHtml, escapeJsString, getOrderStatusBadgeClass, getOrderStatusText }
         */
        showUpdateStatusModal(order, deps) {
            const { escapeHtml, escapeJsString, getOrderStatusBadgeClass, getOrderStatusText } = deps;

            let modal = document.getElementById('updateStatusModal');
            if (!modal) {
                const safeOrderId = escapeHtml(order.id || '-');
                const safeUserName = escapeHtml(order.userName || '-');
                const safeOrderIdJs = escapeJsString(order.id || '');

                modal = document.createElement('div');
                modal.id = 'updateStatusModal';
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Cập nhật trạng thái đơn hàng #${safeOrderId}</h3>
                            <button class="btn btn-close" data-modal-action="close-update-status">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="order-info">
                                <p><strong>Mã đơn hàng:</strong> ${safeOrderId}</p>
                                <p><strong>Khách hàng:</strong> ${safeUserName}</p>
                                <p><strong>Trạng thái hiện tại:</strong>
                                    <span class="badge ${getOrderStatusBadgeClass(order.status)}">
                                        ${getOrderStatusText(order.status)}
                                    </span>
                                </p>
                            </div>
                            <form id="updateStatusForm" data-order-id="${safeOrderIdJs}">
                                <div class="form-group">
                                    <label>Trạng thái mới:</label>
                                    <select id="newStatus" required>
                                        <option value="PENDING">Chờ xác nhận</option>
                                        <option value="CONFIRMED">Đã xác nhận</option>
                                        <option value="SHIPPED">Đang vận chuyển</option>
                                        <option value="DELIVERED">Đã giao</option>
                                        <option value="CANCELLED">Đã hủy</option>
                                    </select>
                                </div>
                                <div class="form-buttons">
                                    <button type="submit" class="btn btn-success">Cập nhật</button>
                                    <button type="button" class="btn btn-secondary" data-modal-action="close-update-status">Hủy</button>
                                </div>
                            </form>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }

            setTimeout(() => {
                const select = document.getElementById('newStatus');
                if (select) select.value = order.status;
            }, 100);

            modal.classList.remove('hidden');
        },

        /**
         * Submit order status update.
         * deps: { apiCall, showAlert, currentSection, reloadOrders }
         */
        async updateOrderStatus(event, orderId, deps) {
            event.preventDefault();
            const { apiCall, showAlert, currentSection, reloadOrders } = deps;
            const newStatus = document.getElementById('newStatus').value;
            try {
                const response = await apiCall(`/admin/orders/${orderId}/status?status=${newStatus}`, 'PUT');
                console.log('Update status response:', response);
                showAlert('Cập nhật trạng thái đơn hàng thành công!');
                AdminOrdersModalBusiness.closeUpdateStatusModal();
                if (currentSection === 'orders') reloadOrders();
            } catch (error) {
                console.error('Update status error:', error);
                showAlert('Lỗi: ' + error.message);
            }
        },

        /** Hide the update-status modal. */
        closeUpdateStatusModal() {
            const modal = document.getElementById('updateStatusModal');
            if (modal) modal.classList.add('hidden');
        }
    };

    global.AdminOrdersModalBusiness = AdminOrdersModalBusiness;
})(window);
