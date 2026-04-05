(function (global) {
    'use strict';

    function formatDateTime(value) {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';
        return date.toLocaleString('vi-VN');
    }

    function getPaymentStatusText(status) {
        switch (String(status || '').toUpperCase()) {
            case 'PENDING': return 'Chưa thanh toán';
            case 'COMPLETED': return 'Đã thanh toán';
            case 'FAILED': return 'Thất bại';
            case 'REFUNDED': return 'Đã hoàn tiền';
            default: return status || '-';
        }
    }

    function getPaymentStatusClass(status) {
        switch (String(status || '').toUpperCase()) {
            case 'PENDING': return 'badge-warning';
            case 'COMPLETED': return 'badge-success';
            case 'FAILED': return 'badge-danger';
            case 'REFUNDED': return 'badge-secondary';
            default: return 'badge-secondary';
        }
    }

    function getRowActions(payment, escapeJsString) {
        const safeId = escapeJsString(payment.id || '');
        const status = String(payment.paymentStatus || '').toUpperCase();
        const orderStatus = String(payment.orderStatus || '').toUpperCase();

        if (status === 'PENDING') {
            return `
                <button class="btn btn-success btn-sm" data-ui-action="complete-payment" data-payment-id="${safeId}">Hoàn tất</button>
                <button class="btn btn-danger btn-sm" data-ui-action="fail-payment" data-payment-id="${safeId}">Thất bại</button>
            `;
        }

        if (status === 'COMPLETED' && orderStatus === 'CANCELLED') {
            return `<button class="btn btn-warning btn-sm" data-ui-action="refund-payment" data-payment-id="${safeId}">Hoàn tiền</button>`;
        }

        if (status === 'COMPLETED') {
            return '<span class="action-lock">Chỉ hoàn tiền khi đơn đã hủy</span>';
        }

        return '<span class="action-lock">Không có thao tác</span>';
    }

    const AdminPaymentsBusiness = {
        async loadPayments(deps) {
            const { fetchPayments, fetchOrders, setPaymentsData, renderPayments, showAlert } = deps;
            try {
                const [payments, orders] = await Promise.all([
                    fetchPayments(),
                    fetchOrders(0, 200)
                ]);

                const ordersMap = new Map((Array.isArray(orders) ? orders : []).map((order) => [order.id, order]));
                const normalizedPayments = (Array.isArray(payments) ? payments : []).map((payment) => {
                    const relatedOrder = ordersMap.get(payment.orderId) || {};
                    return {
                        ...payment,
                        orderCode: relatedOrder.id || payment.orderId || '-',
                        customerName: relatedOrder.userName || relatedOrder.userId || '-',
                        paymentMethod: payment.paymentMethod || relatedOrder.paymentMethod || 'COD',
                        orderStatus: relatedOrder.status || ''
                    };
                });

                setPaymentsData(normalizedPayments);
                renderPayments(normalizedPayments);
            } catch (error) {
                showAlert('Lỗi khi tải danh sách thanh toán: ' + error.message);
            }
        },

        renderPayments(payments, deps) {
            const { escapeHtml, escapeJsString, formatPrice, getPaymentMethodText } = deps;
            const tbody = document.querySelector('#paymentsList tbody');
            if (!tbody) return;

            tbody.innerHTML = '';
            if (!Array.isArray(payments) || payments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#999;">Chưa có giao dịch thanh toán</td></tr>';
                return;
            }

            payments.forEach((payment) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHtml(payment.id || '-')}</td>
                    <td>${escapeHtml(payment.orderCode || '-')}</td>
                    <td>${escapeHtml(payment.customerName || '-')}</td>
                    <td>${escapeHtml(getPaymentMethodText(payment.paymentMethod))}</td>
                    <td>${formatPrice(Number(payment.amount || 0))}</td>
                    <td><span class="badge ${getPaymentStatusClass(payment.paymentStatus)}">${escapeHtml(getPaymentStatusText(payment.paymentStatus))}</span></td>
                    <td>${escapeHtml(payment.transactionId || '-')}</td>
                    <td>${escapeHtml(formatDateTime(payment.paymentDate || payment.createdAt))}</td>
                    <td><div class="action-buttons">${getRowActions(payment, escapeJsString)}</div></td>
                `;
                tbody.appendChild(row);
            });
        },

        filterByStatus(payments, status) {
            if (!status) {
                return payments || [];
            }

            return (payments || []).filter((payment) => String(payment.paymentStatus || '').toUpperCase() === status);
        },

        async updatePaymentStatus(id, status, deps) {
            const { updatePaymentStatusAdmin, showAlert, reloadPayments } = deps;
            const actionText = getPaymentStatusText(status).toLowerCase();
            if (!confirm(`Bạn có chắc muốn chuyển trạng thái thanh toán sang "${actionText}"?`)) {
                return;
            }

            try {
                await updatePaymentStatusAdmin(id, status);
                showAlert('Cập nhật trạng thái thanh toán thành công');
                reloadPayments();
            } catch (error) {
                showAlert('Không thể cập nhật thanh toán: ' + error.message);
            }
        }
    };

    global.AdminPaymentsBusiness = AdminPaymentsBusiness;
})(window);