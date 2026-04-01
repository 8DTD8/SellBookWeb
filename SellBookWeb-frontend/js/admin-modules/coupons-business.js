/**
 * AdminCouponsBusiness — coupon CRUD business logic for admin panel.
 * Exposed on window.AdminCouponsBusiness.
 */
(function (global) {
    'use strict';

    const AdminCouponsBusiness = {

        async loadCoupons(deps) {
            const { fetchCoupons, renderCoupons, showAlert, setCouponsData } = deps;
            try {
                const coupons = await fetchCoupons();
                const normalizedCoupons = Array.isArray(coupons) ? coupons : [];
                if (typeof setCouponsData === 'function') {
                    setCouponsData(normalizedCoupons);
                }
                renderCoupons(normalizedCoupons);
            } catch (error) {
                showAlert('Lỗi khi tải danh sách mã giảm giá: ' + error.message);
            }
        },

        renderCoupons(coupons, deps) {
            const { escapeHtml, escapeJsString, formatPrice } = deps;
            const tbody = document.querySelector('#couponsList tbody');
            if (!tbody) {
                return;
            }
            tbody.innerHTML = '';

            if (!Array.isArray(coupons) || coupons.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">Không có mã giảm giá</td></tr>';
                return;
            }

            coupons.forEach(coupon => {
                const safeId = escapeJsString(coupon.id || '');
                const safeCode = escapeHtml(coupon.code || '');
                const currentUsage = coupon.currentUsage || 0;
                const maxUsage = coupon.maxUsage || 0;
                const usageText = maxUsage > 0 ? `${currentUsage}/${maxUsage}` : `${currentUsage}/không giới hạn`;
                const statusText = coupon.active ? 'Hoạt động' : 'Tạm tắt';
                const discountValueText = coupon.discountType === 'PERCENTAGE'
                    ? `${coupon.discountValue || 0}%`
                    : formatPrice(coupon.discountValue || 0);

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${safeCode}</td>
                    <td>${coupon.discountType || '-'} / ${discountValueText}</td>
                    <td>${usageText}</td>
                    <td>${statusText}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-warning btn-sm" data-ui-action="edit-coupon" data-coupon-id="${safeId}">Sửa</button>
                            <button class="btn btn-danger btn-sm" data-ui-action="delete-coupon" data-coupon-id="${safeId}">Xóa</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        },

        async editCoupon(id, deps) {
            const { getCouponById, showAlert } = deps;
            try {
                const coupon = await getCouponById(id);
                document.getElementById('couponId').value = coupon.id || '';
                document.getElementById('couponCode').value = coupon.code || '';
                document.getElementById('couponDescription').value = coupon.description || '';
                document.getElementById('couponDiscountType').value = coupon.discountType || 'PERCENTAGE';
                document.getElementById('couponDiscountValue').value = coupon.discountValue || 0;
                document.getElementById('couponMinimumAmount').value = coupon.minimumAmount || '';
                document.getElementById('couponMaxUsage').value = coupon.maxUsage || '';
                document.getElementById('couponStartDate').value = toDateTimeLocalValue(coupon.startDate);
                document.getElementById('couponEndDate').value = toDateTimeLocalValue(coupon.endDate);
                document.getElementById('couponActive').checked = coupon.active !== false;
                document.getElementById('couponFormTitle').textContent = 'Chỉnh sửa mã giảm giá';
                document.getElementById('couponForm').classList.remove('hidden');
            } catch (error) {
                showAlert('Lỗi khi tải thông tin mã giảm giá: ' + error.message);
            }
        },

        async saveCoupon(event, deps) {
            event.preventDefault();
            const { createCoupon, updateCoupon, showAlert, hideCouponForm, reloadCoupons } = deps;

            const couponId = document.getElementById('couponId').value;
            const code = document.getElementById('couponCode').value.trim().toUpperCase();
            const discountValue = parseFloat(document.getElementById('couponDiscountValue').value);
            const maxUsageRaw = document.getElementById('couponMaxUsage').value;
            const maxUsage = maxUsageRaw ? parseInt(maxUsageRaw, 10) : null;
            const minimumAmountRaw = document.getElementById('couponMinimumAmount').value;
            const minimumAmount = minimumAmountRaw ? parseFloat(minimumAmountRaw) : 0;
            const startDateRaw = document.getElementById('couponStartDate').value;
            const endDateRaw = document.getElementById('couponEndDate').value;

            if (!code) {
                showAlert('Vui lòng nhập mã giảm giá');
                return;
            }

            if (!Number.isFinite(discountValue) || discountValue <= 0) {
                showAlert('Giá trị giảm phải lớn hơn 0');
                return;
            }

            if (maxUsage !== null && (!Number.isInteger(maxUsage) || maxUsage <= 0)) {
                showAlert('Giới hạn lượt dùng phải là số nguyên dương');
                return;
            }

            if (startDateRaw && endDateRaw) {
                const startDate = new Date(startDateRaw);
                const endDate = new Date(endDateRaw);
                if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
                    showAlert('Thời gian bắt đầu/kết thúc không hợp lệ');
                    return;
                }
                if (endDate < startDate) {
                    showAlert('Ngày kết thúc không được trước ngày bắt đầu');
                    return;
                }
            }

            const couponData = {
                code,
                description: document.getElementById('couponDescription').value || null,
                discountType: document.getElementById('couponDiscountType').value,
                discountValue,
                minimumAmount,
                maxUsage,
                startDate: startDateRaw || null,
                endDate: endDateRaw || null,
                active: document.getElementById('couponActive').checked
            };

            try {
                if (couponId) {
                    await updateCoupon(couponId, couponData);
                    showAlert('Cập nhật mã giảm giá thành công!');
                } else {
                    await createCoupon(couponData);
                    showAlert('Tạo mã giảm giá thành công!');
                }
                hideCouponForm();
                reloadCoupons();
            } catch (error) {
                showAlert('Lỗi: ' + error.message);
            }
        },

        async deleteCouponConfirm(id, deps) {
            const { deleteCoupon, showAlert, reloadCoupons } = deps;
            if (!confirm('Bạn chắc chắn muốn xóa mã giảm giá này?')) {
                return;
            }
            try {
                await deleteCoupon(id);
                showAlert('Xóa mã giảm giá thành công!');
                reloadCoupons();
            } catch (error) {
                showAlert('Lỗi: ' + error.message);
            }
        }
    };

    function toDateTimeLocalValue(value) {
        if (!value) {
            return '';
        }
        const text = String(value);
        return text.length >= 16 ? text.slice(0, 16) : text;
    }

    global.AdminCouponsBusiness = AdminCouponsBusiness;
})(window);
