(function attachCustomerNotificationsBusiness(globalScope) {
	function extractCount(payload) {
		if (typeof payload === 'number') {
			return payload;
		}
		if (payload && typeof payload.count === 'number') {
			return payload.count;
		}
		if (payload && typeof payload.unreadCount === 'number') {
			return payload.unreadCount;
		}
		return 0;
	}

	function normalizeNotifications(payload) {
		if (Array.isArray(payload)) {
			return payload;
		}
		if (payload && Array.isArray(payload.content)) {
			return payload.content;
		}
		if (payload && Array.isArray(payload.data)) {
			return payload.data;
		}
		return [];
	}

	async function loadNotifBadge(deps) {
		const {
			auth,
			getUnreadCount,
			setUnreadNotificationCount,
			updateNotificationBadge,
			logger
		} = deps;

		const user = auth && typeof auth.getUser === 'function' ? auth.getUser() : null;
		if (!user || !user.id || typeof getUnreadCount !== 'function') {
			setUnreadNotificationCount(0);
			updateNotificationBadge(0);
			return;
		}

		try {
			const unread = await getUnreadCount(user.id);
			const count = Math.max(0, extractCount(unread));
			setUnreadNotificationCount(count);
			updateNotificationBadge(count);
		} catch (error) {
			(logger || console).error('Error loading notification badge:', error);
			setUnreadNotificationCount(0);
			updateNotificationBadge(0);
		}
	}

	function updateNotificationBadge(count) {
		const badge = document.getElementById('notifBadge');
		if (!badge) {
			return;
		}

		if (count > 0) {
			badge.textContent = String(count);
			badge.style.display = 'inline-flex';
			badge.classList.add('has-notifications');
			return;
		}

		badge.textContent = '0';
		badge.style.display = 'none';
		badge.classList.remove('has-notifications');
	}

	async function loadNotifications(deps) {
		const {
			auth,
			getNotifications,
			setNotifications,
			renderNotifications,
			showAlert,
			logger
		} = deps;

		const user = auth && typeof auth.getUser === 'function' ? auth.getUser() : null;
		if (!user || !user.id || typeof getNotifications !== 'function') {
			setNotifications([]);
			renderNotifications();
			return;
		}

		try {
			const payload = await getNotifications(user.id);
			setNotifications(normalizeNotifications(payload));
			renderNotifications();
		} catch (error) {
			(logger || console).error('Error loading notifications:', error);
			if (typeof showAlert === 'function') {
				showAlert('Không thể tải thông báo. Vui lòng thử lại sau.');
			}
		}
	}

	function renderNotifications(deps) {
		const {
			notifications,
			escapeHtml,
			formatRelativeDate
		} = deps;

		const container = document.getElementById('notificationsList');
		if (!container) {
			return;
		}

		if (!Array.isArray(notifications) || notifications.length === 0) {
			container.innerHTML = '<p style="text-align:center;color:#999;">Bạn chưa có thông báo nào.</p>';
			return;
		}

		const safeText = typeof escapeHtml === 'function' ? escapeHtml : (value) => String(value ?? '');
		const safeDate = typeof formatRelativeDate === 'function'
			? formatRelativeDate
			: (value) => String(value ?? '');

		container.innerHTML = notifications.map((notification) => {
			const notificationId = safeText(notification.id ?? '');
			const title = safeText(notification.title || 'Thông báo');
			const message = safeText(notification.message || 'Bạn có thông báo mới.');
			const createdAt = safeDate(notification.createdAt);
			const isUnread = notification.read !== true && notification.isRead !== true;
			const bookId = notification.bookId || notification.relatedBookId;
			const unreadLabel = isUnread ? '<span class="badge badge-warning">Mới</span>' : '';
			const bookCta = bookId
				? `<button type="button" class="btn btn-sm btn-primary notification-book-card" data-book-id="${safeText(bookId)}">Xem sách liên quan</button>`
				: '';

			return `
				<article class="notification-item${isUnread ? ' unread' : ''}" data-notification-id="${notificationId}">
					<div class="notification-main">
						<div class="notification-header-row">
							<h4>${title}</h4>
							${unreadLabel}
						</div>
						<p>${message}</p>
						<small>${safeText(createdAt)}</small>
					</div>
					<div class="notification-actions">
						${bookCta}
					</div>
				</article>
			`;
		}).join('');
	}

	async function handleNotificationClick(notificationId, deps) {
		const {
			notifications,
			markNotificationAsRead,
			setUnreadNotificationCount,
			getUnreadNotificationCount,
			updateNotificationBadge,
			renderNotifications,
			logger
		} = deps;

		const index = Array.isArray(notifications)
			? notifications.findIndex((item) => String(item.id) === String(notificationId))
			: -1;

		if (index < 0) {
			return;
		}

		const target = notifications[index];
		if (target.read === true || target.isRead === true) {
			return;
		}

		try {
			if (typeof markNotificationAsRead === 'function') {
				await markNotificationAsRead(notificationId);
			}
			target.read = true;
			target.isRead = true;
			const nextCount = Math.max(0, Number(getUnreadNotificationCount()) - 1);
			setUnreadNotificationCount(nextCount);
			updateNotificationBadge(nextCount);
			renderNotifications();
		} catch (error) {
			(logger || console).error('Error marking notification as read:', error);
		}
	}

	async function markAllAsRead(deps) {
		const {
			auth,
			notifications,
			markAllNotificationsAsRead,
			setUnreadNotificationCount,
			updateNotificationBadge,
			renderNotifications,
			showAlert,
			logger
		} = deps;

		const user = auth && typeof auth.getUser === 'function' ? auth.getUser() : null;
		if (!user || !user.id) {
			return;
		}

		try {
			if (typeof markAllNotificationsAsRead === 'function') {
				await markAllNotificationsAsRead(user.id);
			}

			if (Array.isArray(notifications)) {
				notifications.forEach((item) => {
					item.read = true;
					item.isRead = true;
				});
			}

			setUnreadNotificationCount(0);
			updateNotificationBadge(0);
			renderNotifications();
		} catch (error) {
			(logger || console).error('Error marking all notifications as read:', error);
			if (typeof showAlert === 'function') {
				showAlert('Không thể đánh dấu đã đọc tất cả thông báo.');
			}
		}
	}

	globalScope.CustomerNotificationsBusiness = {
		loadNotifBadge,
		updateNotificationBadge,
		loadNotifications,
		renderNotifications,
		handleNotificationClick,
		markAllAsRead
	};
})(window);
