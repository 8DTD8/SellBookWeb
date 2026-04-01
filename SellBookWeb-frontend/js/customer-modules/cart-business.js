/**
 * CustomerCartBusiness — shopping cart business logic for the customer panel.
 * Exposed on window.CustomerCartBusiness.
 */
(function (global) {
    'use strict';

    const CustomerCartBusiness = {

        /**
         * Add a book to the cart.
         * deps: { cart, allBooks, getBookById, showAlert, parseCouponValue,
         *         setCart, saveCart, reloadCart, updateCartCount }
         */
        async addToCart(bookId, deps) {
            const { cart, allBooks, getBookById, showAlert, parseCouponValue,
                    setCart, saveCart, reloadCart, updateCartCount } = deps;
            try {
                let book = (allBooks || []).find(b => b.id === bookId);
                if (!book) book = await getBookById(bookId);
                if (!book) { showAlert('Không tìm thấy sách!'); return; }

                const workingCart = [...cart];
                const existingItem = workingCart.find(item => item.id === bookId);
                const hasDiscount = book.discount && book.discount > 0;
                const discount = hasDiscount ? book.discount : 0;
                const couponValue = parseCouponValue(book.discountCode);

                if (existingItem) {
                    existingItem.quantity += 1;
                    existingItem.discount = discount;
                    existingItem.discountCode = book.discountCode || null;
                    existingItem.couponValue = couponValue || 0;
                } else {
                    workingCart.push({
                        id: bookId,
                        title: book.title,
                        price: book.price,
                        discount: discount,
                        discountCode: book.discountCode || null,
                        couponValue: couponValue || 0,
                        couponApplied: true,
                        image: book.image,
                        quantity: 1
                    });
                }

                setCart(workingCart);
                saveCart(workingCart);
                reloadCart();
                updateCartCount();
                showAlert('Đã thêm vào giỏ hàng!');
            } catch (error) {
                console.error('Error adding to cart:', error);
                showAlert('Lỗi khi thêm vào giỏ hàng: ' + error.message);
            }
        },

        /**
         * Remove an item from the cart.
         * deps: { cart, setCart, saveCart, reloadCart, updateCartCount }
         */
        removeFromCart(bookId, deps) {
            const { cart, setCart, saveCart, reloadCart, updateCartCount } = deps;
            const newCart = cart.filter(item => item.id !== bookId);
            setCart(newCart);
            saveCart(newCart);
            updateCartCount();
            reloadCart();
        },

        /**
         * Update the quantity of a cart item.
         * deps: { cart, setCart, saveCart, reloadCart }
         */
        updateCartQuantity(bookId, quantity, deps) {
            const { cart, setCart, saveCart, reloadCart } = deps;
            const workingCart = [...cart];
            const item = workingCart.find(i => i.id === bookId);
            if (item) {
                item.quantity = Math.max(1, quantity);
                setCart(workingCart);
                saveCart(workingCart);
                reloadCart();
            }
        },

        /**
         * Toggle selection of a single cart item.
         * deps: { selectedCartItems, reRenderCart }
         */
        toggleCartItemSelect(bookId, checked, deps) {
            const { selectedCartItems, reRenderCart } = deps;
            if (checked) {
                selectedCartItems.add(bookId);
            } else {
                selectedCartItems.delete(bookId);
            }
            reRenderCart();
        },

        /**
         * Select or deselect all cart items.
         * deps: { cart, selectedCartItems, reRenderCart }
         */
        toggleSelectAllCart(checked, deps) {
            const { cart, selectedCartItems, reRenderCart } = deps;
            if (checked) {
                cart.forEach(item => selectedCartItems.add(item.id));
            } else {
                selectedCartItems.clear();
            }
            reRenderCart();
        },

        /**
         * Toggle the coupon applied flag for a cart item.
         * deps: { cart, setCart, saveCart, reRenderCart, parseCouponValue }
         */
        toggleCartItemCoupon(bookId, deps) {
            const { cart, setCart, saveCart, reRenderCart, parseCouponValue } = deps;
            const workingCart = [...cart];
            const item = workingCart.find(i => i.id === bookId);
            if (!item) return;
            const couponValue = item.couponValue != null ? item.couponValue : parseCouponValue(item.discountCode);
            if (!item.discountCode || !couponValue || couponValue <= 0) return;
            item.couponApplied = item.couponApplied === false ? true : false;
            setCart(workingCart);
            saveCart(workingCart);
            reRenderCart();
        },

        /**
         * Render the cart UI into #cartContent.
         * deps: { cart, selectedCartItems, escapeJsString, escapeHtml, sanitizeUrl,
         *         formatPrice, parseCouponValue, saveCart }
         */
        renderCart(deps) {
            const { cart, selectedCartItems, escapeJsString, escapeHtml, sanitizeUrl,
                    formatPrice, parseCouponValue, saveCart, allBooks } = deps;

            const container = document.getElementById('cartContent');
            if (!container) { console.error('cartContent element not found'); return; }

            if (!cart || cart.length === 0) {
                selectedCartItems.clear();
                container.innerHTML = `
                    <div class="cart-empty">
                        <i class="fas fa-shopping-cart" style="font-size: 4rem; color: #ddd; margin-bottom: 1rem;"></i>
                        <p style="font-size: 1.2rem; color: #666; margin-bottom: 1rem;">Giỏ hàng của bạn trống</p>
                        <button class="btn btn-primary" data-cart-action="continue-shopping">Tiếp tục mua sắm</button>
                    </div>
                `;
                return;
            }

            // Clean up selectedCartItems
            const cartIds = new Set(cart.map(item => item.id));
            selectedCartItems.forEach(id => { if (!cartIds.has(id)) selectedCartItems.delete(id); });

            const allSelected = cart.length > 0 && cart.every(item => selectedCartItems.has(item.id));
            let html = '<div class="cart-items-list">';
            html += `
                <div class="cart-select-all">
                    <label class="cart-checkbox-label">
                        <input type="checkbox" ${allSelected ? 'checked' : ''} data-cart-action="select-all">
                        <span class="cart-custom-checkbox"></span>
                        <span>Chọn tất cả (${selectedCartItems.size}/${cart.length})</span>
                    </label>
                </div>
            `;

            let subtotalOriginal = 0;
            let subtotalFinal = 0;

            cart.forEach(item => {
                const safeItemId = escapeJsString(item.id);
                const safeItemTitle = escapeHtml(item.title || 'Sách');
                const safeDiscountCode = escapeHtml(item.discountCode || '');
                const isSelected = selectedCartItems.has(item.id);
                const originalPrice = item.price || 0;
                const percentDiscount = item.discount || 0;
                const priceAfterPercent = percentDiscount > 0
                    ? originalPrice * (1 - percentDiscount / 100)
                    : originalPrice;

                if (item.couponValue == null || typeof item.couponValue === 'undefined') {
                    item.couponValue = parseCouponValue(item.discountCode);
                }
                const couponValue = item.couponValue || 0;
                const hasCoupon = !!item.discountCode && couponValue > 0;
                const couponApplied = hasCoupon && (item.couponApplied !== false);
                const finalPrice = couponApplied
                    ? Math.max(priceAfterPercent - couponValue, 0)
                    : priceAfterPercent;

                const originalItemTotal = originalPrice * item.quantity;
                const finalItemTotal = finalPrice * item.quantity;

                if (isSelected) {
                    subtotalOriginal += originalItemTotal;
                    subtotalFinal += finalItemTotal;
                }

                let imageUrl = item.image || '';
                if (!imageUrl && allBooks) {
                    const book = allBooks.find(b => b.id === item.id);
                    if (book && book.image) {
                        imageUrl = book.image;
                        item.image = book.image;
                        if (typeof saveCart === 'function') saveCart(cart);
                    }
                }
                const safeImageUrl = sanitizeUrl(imageUrl);

                html += `
                    <div class="cart-item ${isSelected ? 'cart-item-selected' : ''}">
                        <div class="cart-item-checkbox">
                            <label class="cart-checkbox-label">
                                <input type="checkbox" ${isSelected ? 'checked' : ''} data-cart-action="select-item" data-book-id="${safeItemId}">
                                <span class="cart-custom-checkbox"></span>
                            </label>
                        </div>
                        <div class="cart-item-image" style="width: 100px; height: 120px; flex-shrink: 0; background: #f5f5f5; border-radius: 4px; overflow: hidden;">
                            ${safeImageUrl
                                ? `<img src="${safeImageUrl}" alt="${safeItemTitle}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f5f5;color:#999;font-size:2rem;\\'>📚</div>'">`
                                : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f5f5;color:#999;font-size:2rem;">📚</div>'}
                        </div>
                        <div class="cart-item-info">
                            <div class="cart-item-title">${safeItemTitle}</div>
                            <div class="cart-item-price">
                                <span class="cart-item-current-price">${formatPrice(finalPrice)}</span>
                                ${percentDiscount > 0 ? `<span class="cart-item-original-price">${formatPrice(originalPrice)}</span><span class="cart-item-discount-badge">-${percentDiscount}%</span>` : ''}
                            </div>
                            <div class="quantity-control">
                                <button data-cart-action="qty-dec" data-book-id="${safeItemId}" data-next-quantity="${item.quantity - 1}">-</button>
                                <input type="number" value="${item.quantity}" readonly>
                                <button data-cart-action="qty-inc" data-book-id="${safeItemId}" data-next-quantity="${item.quantity + 1}">+</button>
                            </div>
                            ${hasCoupon ? `
                                <div class="cart-item-coupon">
                                    <button type="button" class="coupon-toggle ${couponApplied ? 'applied' : 'not-applied'}" data-cart-action="toggle-coupon" data-book-id="${safeItemId}">
                                        ${couponApplied ? 'Đang áp dụng' : 'Không áp dụng'}: ${safeDiscountCode} (-${formatPrice(couponValue)})
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                        <div class="cart-item-total">
                            <div class="cart-item-total-price">${formatPrice(finalItemTotal)}</div>
                            ${percentDiscount > 0 ? `<div class="cart-item-total-original">${formatPrice(originalItemTotal)}</div>` : ''}
                            <button class="btn btn-danger btn-sm" data-cart-action="remove-item" data-book-id="${safeItemId}">Xóa</button>
                        </div>
                    </div>
                `;
            });

            const discountTotal = subtotalOriginal - subtotalFinal;
            const selectedCount = selectedCartItems.size;

            html += `
                <div class="cart-summary">
                    <div class="summary-row">
                        <span>Tạm tính (${selectedCount} sản phẩm):</span>
                        <span>${formatPrice(subtotalOriginal)}</span>
                    </div>
                    ${discountTotal > 0 ? `
                    <div class="summary-row">
                        <span>Giảm giá (mã giảm giá):</span>
                        <span>- ${formatPrice(discountTotal)}</span>
                    </div>
                    ` : ''}
                    <div class="summary-row total">
                        <span>Tổng cộng:</span>
                        <span>${formatPrice(subtotalFinal)}</span>
                    </div>
                    <div class="cart-actions">
                        <button class="btn btn-secondary" data-cart-action="continue-shopping">Tiếp tục mua sắm</button>
                        <button class="btn btn-primary" data-cart-action="checkout" ${selectedCount === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}>Thanh toán (${selectedCount})</button>
                    </div>
                </div>
            </div>`;

            container.innerHTML = html;
        }
    };

    global.CustomerCartBusiness = CustomerCartBusiness;
})(window);
