(function (global) {
    'use strict';

    async function loadOrders(deps) {
        const { fetchOrders, setOrdersData, renderOrders, showAlert, closeAlert, logger } = deps;
        try {
            showAlert('Đang tải danh sách đơn hàng...');
            const orders = await fetchOrders();
            setOrdersData(orders);
            closeAlert();
            renderOrders(orders);
        } catch (error) {
            closeAlert();
            showAlert('Lỗi khi tải danh sách đơn hàng: ' + error.message);
            logger.error('Order loading error:', error);
        }
    }

    function renderOrders(orders, deps) {
        const {
            formatPrice,
            escapeHtml,
            escapeJsString,
            getOrderStatusBadgeClass,
            getOrderStatusText
        } = deps;

        const tbody = document.querySelector('#ordersList tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!Array.isArray(orders) || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #999;">Không có đơn hàng</td></tr>';
            return;
        }

        orders.forEach(order => {
            if (!order) return;

            const row = document.createElement('tr');
            const orderId = order.id || '';
            const customerName = order.userName || order.userId || '-';
            const phone = order.phone || '-';
            const createdAt = order.createdAt ? (new Date(order.createdAt).toLocaleString() || '-') : '-';
            const totalPrice = formatPrice(order.totalPrice || 0);
            const status = order.status || 'UNKNOWN';
            const statusBadgeClass = getOrderStatusBadgeClass(status);
            const statusText = getOrderStatusText(status);
            const isLockedStatus = status === 'CANCELLED' || status === 'DELIVERED';
            const safeOrderId = escapeHtml(orderId);
            const safeCustomerName = escapeHtml(customerName);
            const safePhone = escapeHtml(phone);
            const safeCreatedAt = escapeHtml(createdAt);
            const safeOrderIdJs = escapeJsString(orderId);

            row.innerHTML = `
                <td>${safeOrderId}</td>
                <td>${safeCustomerName}</td>
                <td>${safePhone}</td>
                <td>${safeCreatedAt}</td>
                <td>${totalPrice}</td>
                <td>
                    <span class="badge ${statusBadgeClass}">${statusText}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-info btn-sm" data-order-action="detail" data-order-id="${safeOrderIdJs}">Chi tiết</button>
                        <button class="btn btn-warning btn-sm" data-order-action="update-status" data-order-id="${safeOrderIdJs}" ${isLockedStatus ? 'disabled title="Đơn đã hoàn tất hoặc đã hủy, không thể cập nhật"' : ''}>Cập nhật trạng thái</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    function searchOrders(ordersData, searchTerm) {
        const normalized = (searchTerm || '').toLowerCase();
        return (ordersData || []).filter(order =>
            (order.id && order.id.toLowerCase().includes(normalized)) ||
            (order.userName && order.userName.toLowerCase().includes(normalized)) ||
            (order.phone && order.phone.toLowerCase().includes(normalized))
        );
    }

    function filterByStatus(ordersData, status) {
        if (!status) {
            return ordersData || [];
        }
        return (ordersData || []).filter(order => order.status === status);
    }

    global.AdminOrdersBusiness = {
        loadOrders,
        renderOrders,
        searchOrders,
        filterByStatus
    };
})(window);
