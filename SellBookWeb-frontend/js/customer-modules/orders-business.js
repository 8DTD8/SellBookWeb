(function attachCustomerOrdersBusiness(globalScope) {
	function formatDate(dateString) {
		if (!dateString) {
			return 'N/A';
		}

		try {
			return new Date(dateString).toLocaleString('vi-VN');
		} catch (error) {
			return dateString;
		}
	}

	function statusLabel(status) {
		const normalizedStatus = String(status || '').toUpperCase();
		const statusMap = {
			PENDING: 'Chờ xác nhận',
			CONFIRMED: 'Đã xác nhận',
			SHIPPED: 'Đang giao',
			DELIVERED: 'Đã giao',
			CANCELLED: 'Đã hủy'
		};
		return statusMap[normalizedStatus] || normalizedStatus || 'N/A';
	}

	function statusClass(status) {
		const normalizedStatus = String(status || '').toUpperCase();
		const classMap = {
			PENDING: 'badge-warning',
			CONFIRMED: 'badge-info',
			SHIPPED: 'badge-primary',
			DELIVERED: 'badge-success',
			CANCELLED: 'badge-danger'
		};
		return classMap[normalizedStatus] || 'badge-secondary';
	}

	function renderOrderItems(order, escapeHtml, formatPrice) {
		const items = Array.isArray(order.items) ? order.items : [];
		if (items.length === 0) {
			return '<p style="margin:0;color:#777;">Không có sản phẩm.</p>';
		}

		return items.map((item) => {
			const title = escapeHtml(item.title || item.bookTitle || 'Sản phẩm');
			const quantity = Number(item.quantity || 0);
			const price = Number(item.price || 0);
			return `
				<div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px dashed #eee;">
					<span>${title} x${quantity}</span>
					<span>${formatPrice(price * quantity)}</span>
				</div>
			`;
		}).join('');
	}

	async function loadMyOrders(deps) {
		const { auth, apiCall, escapeHtml, formatPrice } = deps;
		const container = document.getElementById('myOrdersList');
		if (!container) {
			return;
		}

		const user = auth && typeof auth.getUser === 'function' ? auth.getUser() : null;
		if (!user || !user.id) {
			container.innerHTML = '<p style="text-align:center;color:#999;">Vui lòng đăng nhập để xem đơn hàng.</p>';
			return;
		}

		try {
			const orders = await apiCall(`/orders?userId=${encodeURIComponent(user.id)}`);
			if (!Array.isArray(orders) || orders.length === 0) {
				container.innerHTML = '<p style="text-align:center;color:#999;">Bạn chưa có đơn hàng nào.</p>';
				return;
			}

			container.innerHTML = orders.map((order) => {
				const orderId = escapeHtml(order.id || 'N/A');
				const normalizedStatus = String(order.status || 'PENDING').toUpperCase();
				const label = statusLabel(normalizedStatus);
				const badgeClass = statusClass(normalizedStatus);
				const total = formatPrice(Number(order.totalPrice || 0));
				const createdAt = formatDate(order.createdAt);
				const canCancel = normalizedStatus === 'PENDING' || normalizedStatus === 'CONFIRMED';

				return `
					<article style="background:#fff;border:1px solid #e5eaf2;border-radius:10px;padding:14px 16px;margin-bottom:14px;">
						<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
							<h4 style="margin:0;">Đơn #${orderId}</h4>
							<span class="order-status-badge ${badgeClass}">${escapeHtml(label)}</span>
						</div>
						<div style="color:#666;font-size:0.9rem;margin:6px 0 10px;">Ngày đặt: ${escapeHtml(createdAt)}</div>
						<div>${renderOrderItems(order, escapeHtml, formatPrice)}</div>
						<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:12px;flex-wrap:wrap;">
							<strong>Tổng tiền: ${total}</strong>
							${canCancel
								? `<button class="btn btn-danger btn-sm" data-order-action="cancel" data-order-id="${orderId}">Hủy đơn</button>`
								: ''}
						</div>
					</article>
				`;
			}).join('');
		} catch (error) {
			container.innerHTML = `<p style="text-align:center;color:red;">Lỗi tải đơn hàng: ${escapeHtml(error.message || 'Không xác định')}</p>`;
		}
	}

	async function cancelMyOrder(orderId, deps) {
		const { apiCall, showAlert, reloadOrders } = deps;
		if (!orderId) {
			return;
		}

		if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
			return;
		}

		try {
			await apiCall(`/orders/${encodeURIComponent(orderId)}/cancel`, 'PUT');
			showAlert('Hủy đơn hàng thành công.');
			if (typeof reloadOrders === 'function') {
				await reloadOrders();
			}
		} catch (error) {
			showAlert('Không thể hủy đơn hàng: ' + (error.message || 'Lỗi không xác định'));
		}
	}

	globalScope.CustomerOrdersBusiness = {
		loadMyOrders,
		cancelMyOrder
	};
})(window);
