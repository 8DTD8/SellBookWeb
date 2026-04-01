/**
 * CustomerCheckoutBusiness — checkout flow business logic for the customer panel.
 * Exposed on window.CustomerCheckoutBusiness.
 */
(function (global) {
    'use strict';

    const CustomerCheckoutBusiness = {

        /**
         * Render the checkout page sidebar and pre-fill user info.
         * deps: { cart, selectedCartItems, auth, formatPrice }
         */
        renderCheckoutPage(deps) {
            const { cart, selectedCartItems, auth, formatPrice } = deps;
            const user = auth.getUser();

            const nameInput = document.getElementById('checkoutName');
            const emailInput = document.getElementById('checkoutEmail');
            const phoneInput = document.getElementById('checkoutPhone');
            if (nameInput && user) nameInput.value = user.name || '';
            if (emailInput && user) emailInput.value = user.email || '';
            if (phoneInput && user) phoneInput.value = user.phone || '';

            const itemsList = document.getElementById('checkoutItemsList');
            const selectedItems = cart.filter(item => selectedCartItems.has(item.id));

            document.getElementById('checkoutItemCount').textContent = selectedItems.length + ' sản phẩm';

            let subtotal = 0;
            let totalOriginal = 0;
            let itemsHtml = '';

            selectedItems.forEach(item => {
                const originalPrice = item.price || 0;
                const percentDiscount = item.discount || 0;
                const priceAfterPercent = percentDiscount > 0
                    ? originalPrice * (1 - percentDiscount / 100)
                    : originalPrice;
                const couponValue = item.couponValue || 0;
                const hasCoupon = !!item.discountCode && couponValue > 0;
                const couponApplied = hasCoupon && (item.couponApplied !== false);
                const finalPrice = couponApplied
                    ? Math.max(priceAfterPercent - couponValue, 0)
                    : priceAfterPercent;

                subtotal += finalPrice * item.quantity;
                totalOriginal += originalPrice * item.quantity;

                itemsHtml += `
                    <div class="checkout-order-item">
                        ${item.image
                            ? `<img src="${item.image}" alt="${item.title || ''}">`
                            : '<div style="width:50px;height:65px;background:#f5f5f5;border-radius:4px;display:flex;align-items:center;justify-content:center;">📚</div>'}
                        <div class="checkout-order-item-info">
                            <div class="checkout-order-item-title">${item.title || 'Sách'}</div>
                            <div class="checkout-order-item-qty">x${item.quantity}</div>
                            <div class="checkout-order-item-price">${formatPrice(finalPrice * item.quantity)}</div>
                        </div>
                    </div>
                `;
            });

            itemsList.innerHTML = itemsHtml;

            const shippingFee = 30000;
            const savings = totalOriginal - subtotal;

            document.getElementById('checkoutSubtotal').textContent = formatPrice(subtotal);
            document.getElementById('checkoutShipping').textContent = formatPrice(shippingFee);
            document.getElementById('checkoutSavings').textContent = '-' + formatPrice(savings);
            document.getElementById('checkoutTotal').textContent = formatPrice(subtotal + shippingFee);

            // Reset payment method
            CustomerCheckoutBusiness.selectPaymentMethod('COD',
                document.querySelector('.payment-method-option.selected'));
        },

        /** Highlight selected payment method and toggle bank/momo info panels. */
        selectPaymentMethod(method, element) {
            document.querySelectorAll('.payment-method-option').forEach(opt => opt.classList.remove('selected'));
            if (element) element.classList.add('selected');
            const radio = document.querySelector(`input[name="paymentMethod"][value="${method}"]`);
            if (radio) radio.checked = true;
            const bankInfo = document.getElementById('bankInfo');
            const momoInfo = document.getElementById('momoInfo');
            if (bankInfo) bankInfo.style.display = method === 'BANK' ? 'block' : 'none';
            if (momoInfo) momoInfo.style.display = method === 'MOMO' ? 'block' : 'none';
        },

        /**
         * Validate and apply a coupon code to the checkout total.
         * deps: { showAlert, formatPrice, cart, selectedCartItems, apiBaseUrl }
         */
        applyCheckoutCoupon(deps) {
            const { showAlert, formatPrice, cart, selectedCartItems, apiBaseUrl } = deps;
            const code = document.getElementById('checkoutCouponInput').value.trim();
            if (!code) { showAlert('Vui lòng nhập mã giảm giá'); return; }
            const normalizedCode = code.toUpperCase();
            document.getElementById('checkoutCouponInput').value = normalizedCode;

            const baseUrl = apiBaseUrl || 'http://localhost:8080/api';
            fetch(`${baseUrl}/coupons/code/${encodeURIComponent(normalizedCode)}`)
                .then(async res => {
                    if (!res.ok) {
                        throw new Error('Mã giảm giá không tồn tại hoặc đã hết hạn');
                    }

                    const contentType = res.headers.get('content-type') || '';
                    const bodyText = await res.text();

                    if (!bodyText.trim()) {
                        throw new Error('Mã giảm giá không tồn tại hoặc đã hết hạn');
                    }

                    if (!contentType.includes('application/json')) {
                        throw new Error('Phản hồi mã giảm giá không hợp lệ');
                    }

                    try {
                        return JSON.parse(bodyText);
                    } catch (error) {
                        throw new Error('Dữ liệu mã giảm giá không hợp lệ');
                    }
                })
                .then(coupon => {
                    if (!coupon || !coupon.active) {
                        showAlert('Mã giảm giá không hợp lệ hoặc đã hết hạn');
                        return;
                    }
                    window.appliedCheckoutCoupon = coupon;
                    CustomerCheckoutBusiness.updateCheckoutWithCoupon(coupon, { formatPrice, cart, selectedCartItems });
                    showAlert(`Áp dụng mã ${coupon.code} thành công! Giảm ${coupon.discountType === 'PERCENTAGE' ? coupon.discountValue + '%' : formatPrice(coupon.discountValue)}`);
                })
                .catch(err => {
                    window.appliedCheckoutCoupon = null;
                    showAlert('Lỗi: ' + err.message);
                });
        },

        /**
         * Recalculate checkout totals with the applied coupon.
         * deps: { formatPrice, cart, selectedCartItems }
         */
        updateCheckoutWithCoupon(coupon, deps) {
            const { formatPrice, cart, selectedCartItems } = deps;
            const selectedItems = cart.filter(item => selectedCartItems.has(item.id));
            let subtotal = 0;
            let totalOriginal = 0;

            selectedItems.forEach(item => {
                const originalPrice = item.price || 0;
                const percentDiscount = item.discount || 0;
                const priceAfterPercent = percentDiscount > 0
                    ? originalPrice * (1 - percentDiscount / 100)
                    : originalPrice;
                const couponValue = item.couponValue || 0;
                const hasCoupon = !!item.discountCode && couponValue > 0;
                const couponApplied = hasCoupon && (item.couponApplied !== false);
                const finalPrice = couponApplied
                    ? Math.max(priceAfterPercent - couponValue, 0)
                    : priceAfterPercent;
                subtotal += finalPrice * item.quantity;
                totalOriginal += originalPrice * item.quantity;
            });

            let couponDiscount = 0;
            if (coupon) {
                if (coupon.discountType === 'PERCENTAGE') {
                    couponDiscount = subtotal * (coupon.discountValue / 100);
                } else {
                    couponDiscount = coupon.discountValue;
                }
                couponDiscount = Math.min(couponDiscount, subtotal);
            }

            const afterCoupon = subtotal - couponDiscount;
            const shippingFee = 30000;
            const savings = totalOriginal - afterCoupon;

            document.getElementById('checkoutSubtotal').textContent = formatPrice(afterCoupon);
            document.getElementById('checkoutShipping').textContent = formatPrice(shippingFee);
            document.getElementById('checkoutSavings').textContent = '-' + formatPrice(savings);
            document.getElementById('checkoutTotal').textContent = formatPrice(afterCoupon + shippingFee);
        },

        /**
         * Validate form, build order payload, submit via API, and navigate to success.
         * deps: { showAlert, apiCall, auth, cart, selectedCartItems, formatPrice,
         *         setCart, saveCart, clearSelectedItems, updateCartCount, showSection }
         */
        async placeOrder(deps) {
            const { showAlert, apiCall, auth, cart, selectedCartItems,
                    setCart, saveCart, clearSelectedItems, updateCartCount, showSection } = deps;

            const name = document.getElementById('checkoutName').value.trim();
            const phone = document.getElementById('checkoutPhone').value.trim();
            const email = document.getElementById('checkoutEmail').value.trim();
            const province = document.getElementById('checkoutProvince').value;
            const district = document.getElementById('checkoutDistrict').value.trim();
            const ward = document.getElementById('checkoutWard').value.trim();
            const address = document.getElementById('checkoutAddress').value.trim();
            const note = document.getElementById('checkoutNote').value.trim();
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'COD';

            if (!name) { showAlert('Vui lòng nhập họ và tên'); return; }
            if (!phone) { showAlert('Vui lòng nhập số điện thoại'); return; }
            if (!/^[0-9]{10}$/.test(phone)) { showAlert('Số điện thoại không hợp lệ, vui lòng nhập đúng 10 chữ số'); return; }
            if (!email) { showAlert('Vui lòng nhập email'); return; }
            if (!province) { showAlert('Vui lòng chọn tỉnh/thành phố'); return; }
            if (!address) { showAlert('Vui lòng nhập địa chỉ cụ thể'); return; }

            const selectedItems = cart.filter(item => selectedCartItems.has(item.id));
            if (selectedItems.length === 0) {
                showAlert('Không có sản phẩm nào được chọn');
                return;
            }

            const provinceText = document.getElementById('checkoutProvince').selectedOptions[0]?.text || '';
            const fullAddress = [address, ward, district, provinceText].filter(Boolean).join(', ');

            let totalPrice = 0;
            const orderItems = selectedItems.map(item => {
                const originalPrice = item.price || 0;
                const percentDiscount = item.discount || 0;
                const priceAfterPercent = percentDiscount > 0
                    ? originalPrice * (1 - percentDiscount / 100)
                    : originalPrice;
                const couponValue = item.couponValue || 0;
                const hasCoupon = !!item.discountCode && couponValue > 0;
                const couponApplied = hasCoupon && (item.couponApplied !== false);
                const finalPrice = couponApplied
                    ? Math.max(priceAfterPercent - couponValue, 0)
                    : priceAfterPercent;
                totalPrice += finalPrice * item.quantity;
                return { bookId: item.id, title: item.title, price: finalPrice, quantity: item.quantity };
            });

            const shippingFee = 30000;
            totalPrice += shippingFee;

            const user = auth.getUser();
            const orderData = {
                userId: user?.id,
                items: orderItems,
                totalPrice: totalPrice,
                status: 'PENDING',
                paymentMethod: paymentMethod,
                shippingAddress: fullAddress + (note ? ' | Ghi chú: ' + note : ''),
                phone: phone
            };

            const placeOrderBtn = document.querySelector('.btn-place-order');
            try {
                if (placeOrderBtn) {
                    placeOrderBtn.disabled = true;
                    placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
                }

                const result = await apiCall('/orders', 'POST', orderData);

                const newCart = cart.filter(item => !selectedCartItems.has(item.id));
                setCart(newCart);
                if (typeof clearSelectedItems === 'function') clearSelectedItems();
                saveCart(newCart);
                updateCartCount();

                document.getElementById('successOrderId').textContent = result.id || 'N/A';
                showSection('orderSuccess');
            } catch (error) {
                showAlert('Đặt hàng thất bại: ' + error.message);
            } finally {
                if (placeOrderBtn) {
                    placeOrderBtn.disabled = false;
                    placeOrderBtn.innerHTML = '<i class="fas fa-check"></i> Đặt hàng';
                }
            }
        }
    };

    global.CustomerCheckoutBusiness = CustomerCheckoutBusiness;
})(window);
