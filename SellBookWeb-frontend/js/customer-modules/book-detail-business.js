/**
 * CustomerBookDetailBusiness — book grid rendering, book detail view,
 * and product reviews for the customer panel.
 * Exposed on window.CustomerBookDetailBusiness.
 */
(function (global) {
    'use strict';

    const CustomerBookDetailBusiness = {

        // ──────────────── Book grid (home view) ────────────────

        /**
         * Render the books grid with pagination.
         * deps: { escapeJsString, escapeHtml, sanitizeUrl, formatPrice, renderStars,
         *         renderPagination, currentPage, productsPerPage, totalPages (setter) }
         */
        renderBooks(books, deps) {
            const {
                escapeJsString, escapeHtml, sanitizeUrl, formatPrice, renderStars,
                renderPagination, currentPage, productsPerPage, setTotalPages,
                isInWishlist
            } = deps;

            const container = document.getElementById('booksList');
            container.innerHTML = '';

            if (!Array.isArray(books) || books.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1; padding: 3rem;">Không tìm thấy sách</p>';
                return;
            }

            const totalPagesCalc = Math.ceil(books.length / productsPerPage);
            if (typeof setTotalPages === 'function') setTotalPages(totalPagesCalc);

            const startIndex = currentPage * productsPerPage;
            const booksToShow = books.slice(startIndex, startIndex + productsPerPage);

            booksToShow.forEach(book => {
                const card = document.createElement('div');
                card.className = 'book-card';
                card.dataset.bookId = book.id;

                const safeBookId = escapeJsString(book.id);
                const safeBookTitle = escapeHtml(book.title || '');
                const safeImageUrl = sanitizeUrl(book.image || '');

                const hasDiscount = book.discount && book.discount > 0;
                const discount = hasDiscount ? book.discount : 0;
                const originalPrice = book.price;
                const finalPrice = hasDiscount ? originalPrice * (1 - discount / 100) : originalPrice;
                const quantity = Number(book.quantity) || 0;
                const isOutOfStock = quantity <= 0;
                const wished = typeof isInWishlist === 'function' ? isInWishlist(book.id) : false;

                card.innerHTML = `
                    <div class="book-image">
                        ${safeImageUrl
                            ? `<img src="${safeImageUrl}" alt="${safeBookTitle}">`
                            : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5; color: #999; font-size: 3rem;">📚</div>'}
                        ${hasDiscount ? `<div class="discount-badge">-${discount}%</div>` : ''}
                        <div class="book-stock-badge ${isOutOfStock ? 'out' : 'in'}">${isOutOfStock ? 'Chưa có hàng' : `Còn ${quantity}`}</div>
                    </div>
                    <div class="book-info">
                        <div class="book-title">${safeBookTitle}</div>
                        <div class="book-rating">${renderStars(book.rating || 0)}</div>
                        <div class="book-price-container">
                            <span class="book-price">${formatPrice(finalPrice)}</span>
                            ${hasDiscount ? `<span class="book-original-price">${formatPrice(originalPrice)}</span>` : ''}
                        </div>
                        <div class="book-actions">
                            <button class="btn btn-primary btn-sm" data-action="detail" data-book-id="${safeBookId}">Chi tiết</button>
                            <button class="btn btn-success btn-sm" data-action="add-cart" data-book-id="${safeBookId}" ${isOutOfStock ? 'disabled' : ''}>${isOutOfStock ? 'Chưa có hàng' : 'Thêm 🛒'}</button>
                            <button class="btn btn-outline-danger btn-sm wishlist-card-btn ${wished ? 'active' : ''}" data-action="toggle-wishlist" data-book-id="${safeBookId}">${wished ? 'Đã lưu' : 'Yêu thích'}</button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

            renderPagination();
        },

        // ──────────────── Book detail ────────────────

        /**
         * Fetch book and show detail section.
         * deps: { getBookById, renderBookDetail, loadProductReviews, showSection, showAlert, setCurrentBook, setProductQuantity }
         */
        async showBookDetail(bookId, deps) {
            const { getBookById, renderBookDetail, loadProductReviews, showSection, showAlert, setCurrentBook, setProductQuantity } = deps;
            try {
                const book = await getBookById(bookId);
                if (typeof setCurrentBook === 'function') setCurrentBook(book);
                if (typeof setProductQuantity === 'function') {
                    setProductQuantity((Number(book?.quantity) || 0) > 0 ? 1 : 0);
                }
                renderBookDetail(book);
                await loadProductReviews(bookId);
                showSection('bookDetail');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                showAlert('Lỗi khi tải chi tiết sách: ' + error.message);
            }
        },

        /**
         * Full DOM render of the book detail page.
         * deps: { escapeHtml, sanitizeUrl, formatPrice, formatNumber, renderStars, auth, getCategoryName }
         */
        renderBookDetail(book, deps) {
            const { escapeHtml, sanitizeUrl, formatPrice, formatNumber, renderStars, auth, getCategoryName, isInWishlist } = deps;

            const hasDiscount = book.discount && book.discount > 0;
            const discount = hasDiscount ? book.discount : 0;
            const originalPrice = book.price;
            const finalPrice = hasDiscount ? originalPrice * (1 - discount / 100) : originalPrice;

            const categoryName = getCategoryName ? getCategoryName(book.categoryId) : 'Sách';
            const safeBookTitle = escapeHtml(book.title || 'Sách');
            const safeCategoryName = escapeHtml(categoryName || 'Sách');
            const safeBookImage = sanitizeUrl(book.image || '');
            const safeSupplierName = escapeHtml(book.supplierName || 'Đinh Tị');
            const safePublisher = escapeHtml(book.publisher || 'Văn Học');
            const safeAuthor = escapeHtml(book.author || 'Chưa có');
            const safeCoverType = escapeHtml(book.coverType || 'Bìa Mềm');
            const safeTranslator = escapeHtml(book.translator || 'N/A');
            const safeBookCode = escapeHtml(book.id || 'N/A');

            // Breadcrumbs
            const breadcrumbs = document.getElementById('breadcrumbs');
            if (breadcrumbs) {
                breadcrumbs.innerHTML = `
                    <a href="#" data-ui-action="show-section" data-section="home">Trang chủ</a>
                    <span>></span>
                    <span>${safeCategoryName}</span>
                    <span>></span>
                    <span>${safeBookTitle}</span>
                `;
            }

            // Main image
            const mainImage = document.getElementById('mainProductImage');
            if (mainImage) {
                mainImage.src = safeBookImage;
                mainImage.alt = safeBookTitle;
                mainImage.onerror = function () {
                    this.style.display = 'none';
                    this.parentElement.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5; color: #999; font-size: 3rem;">📚</div>';
                };
            }

            // Promo banner
            const promoBanner = document.getElementById('promoBanner');
            if (promoBanner) {
                if (hasDiscount) {
                    promoBanner.textContent = 'FREESHIP 20K CHO ĐƠN 120K';
                    promoBanner.style.display = 'block';
                } else {
                    promoBanner.style.display = 'none';
                }
            }

            // Thumbnails
            const thumbnailContainer = document.getElementById('thumbnailContainer');
            if (thumbnailContainer) {
                thumbnailContainer.innerHTML = '';
                thumbnailContainer.appendChild(CustomerBookDetailBusiness.createThumbnail(safeBookImage, 0, true));
                for (let i = 1; i < 3; i++) {
                    thumbnailContainer.appendChild(CustomerBookDetailBusiness.createThumbnail(safeBookImage, i, false));
                }
                const moreThumbs = document.createElement('div');
                moreThumbs.className = 'thumbnail-more';
                moreThumbs.textContent = '+8';
                thumbnailContainer.appendChild(moreThumbs);
            }

            // Title
            const productTitle = document.getElementById('productTitle');
            if (productTitle) productTitle.textContent = book.title || 'Sách';

            // Basic info
            const basicInfo = document.getElementById('productBasicInfo');
            if (basicInfo) {
                basicInfo.innerHTML = `
                    <div class="basic-info-item"><span class="basic-info-label">Nhà cung cấp:</span><span>${safeSupplierName}</span></div>
                    <div class="basic-info-item"><span class="basic-info-label">Nhà xuất bản:</span><span>${safePublisher}</span></div>
                    <div class="basic-info-item"><span class="basic-info-label">Tác giả:</span><span>${safeAuthor}</span></div>
                    <div class="basic-info-item"><span class="basic-info-label">Hình thức bìa:</span><span>${safeCoverType}</span></div>
                `;
            }

            // Rating & sales
            const ratingSales = document.getElementById('productRatingSales');
            if (ratingSales) {
                const salesCount = book.salesCount || 0;
                ratingSales.innerHTML = `
                    <div class="sales-count">Đã bán ${formatNumber(salesCount)}</div>
                `;
            }

            // Trend badge
            const trendBadge = document.getElementById('trendBadge');
            if (trendBadge) {
                const salesCount = book.salesCount || 0;
                if (salesCount > 50) {
                    trendBadge.style.display = 'inline-block';
                    trendBadge.textContent = 'Xu hướng';
                } else {
                    trendBadge.style.display = 'none';
                }
            }

            // Pricing
            const pricing = document.getElementById('productPricing');
            if (pricing) {
                pricing.innerHTML = `
                    <div class="price-container">
                        <span class="current-price">${formatPrice(finalPrice)}</span>
                        ${hasDiscount ? `<span class="original-price">${formatPrice(originalPrice)}</span>` : ''}
                        ${hasDiscount ? `<span class="discount-badge-large">-${discount}%</span>` : ''}
                    </div>
                    ${hasDiscount ? '<div class="promo-note">Chính sách khuyến mãi trên chỉ áp dụng tại sellbookweb.com ></div>' : ''}
                `;
            }

            // Availability
            const availability = document.getElementById('productAvailability');
            if (availability) {
                const quantity = book.quantity || 0;
                availability.textContent = quantity > 0 ? 'Còn hàng' : 'Chưa có hàng';
                availability.style.color = quantity > 0 ? '#28a745' : '#dc3545';
            }

            const wishlistActionContainer = document.getElementById('wishlistActionContainer');
            if (wishlistActionContainer) {
                const wished = typeof isInWishlist === 'function' ? isInWishlist(book.id) : false;
                const quantity = Number(book.quantity) || 0;
                const label = wished
                    ? 'Đã theo dõi'
                    : (quantity > 0 ? 'Thêm vào wishlist' : 'Theo dõi khi có hàng');
                wishlistActionContainer.innerHTML = `
                    <button type="button" id="wishlistDetailButton" class="btn-wishlist-detail ${wished ? 'active' : ''}" onclick="toggleWishlistFromDetail()">
                        <i class="fas fa-heart"></i>
                        <span>${escapeHtml(label)}</span>
                    </button>
                `;
            }

            // Offer badges / coupons
            const relatedOffersSection = document.querySelector('.related-offers');
            const offerBadges = document.getElementById('offerBadges');
            if (relatedOffersSection && offerBadges) {
                const discountCodes = book.discountCode
                    ? book.discountCode.split(',').map(c => c.trim()).filter(c => c.length > 0)
                    : [];
                let badgesHTML = '';
                if (hasDiscount && discount > 0) {
                    badgesHTML += `<span class="offer-badge">Giảm ${discount}% từ giá gốc</span>`;
                }
                discountCodes.forEach(code => {
                    let couponText = code;
                    if (code.match(/^[A-Z]+\d+$/i)) {
                        const match = code.match(/^([A-Z]+)(\d+)$/i);
                        if (match) couponText = `Mã giảm ${match[2]}k - ${match[1]}`;
                    }
                    badgesHTML += `<span class="offer-badge">${escapeHtml(couponText)}</span>`;
                });
                if (badgesHTML.trim() !== '') {
                    offerBadges.innerHTML = badgesHTML;
                    relatedOffersSection.style.display = 'block';
                } else {
                    offerBadges.innerHTML = '';
                    relatedOffersSection.style.display = 'none';
                }
            }

            // Info table
            const infoTable = document.getElementById('infoTable');
            if (infoTable) {
                infoTable.innerHTML = `
                    <tr><td>Mã hàng</td><td>${safeBookCode}</td></tr>
                    <tr><td>Tên Nhà Cung Cấp</td><td>${safeSupplierName}</td></tr>
                    <tr><td>Tác giả</td><td>${safeAuthor}</td></tr>
                    <tr><td>Người Dịch</td><td>${safeTranslator}</td></tr>
                    <tr><td>NXB</td><td>${safePublisher}</td></tr>
                    <tr><td>Số lượng</td><td>${book.quantity || 0} quyển</td></tr>
                `;
            }

            // Quantity input
            const quantityInput = document.getElementById('productQuantity');
            if (quantityInput) quantityInput.value = (Number(book.quantity) || 0) > 0 ? 1 : 0;

            // Review login prompt / write-review button
            const reviewLoginPrompt = document.getElementById('reviewLoginPrompt');
            const writeReviewBtn = document.getElementById('writeReviewBtn');
            const user = auth.getUser();
            
            if (reviewLoginPrompt && writeReviewBtn) {
                if (user && user.id) {
                    // User is logged in
                    reviewLoginPrompt.style.display = 'none';
                    writeReviewBtn.style.display = 'block';
                    const btn = document.getElementById('openReviewModalBtn');
                    if (btn) btn.onclick = function () { window.openReviewModal(book.id); };
                } else {
                    // User is not logged in
                    reviewLoginPrompt.style.display = 'block';
                    writeReviewBtn.style.display = 'none';
                }
            }
        },

        /** Create a thumbnail element. */
        createThumbnail(imageSrc, index, isActive) {
            const safeImageSrc = (typeof sanitizeUrl === 'function') ? sanitizeUrl(imageSrc || '') : (imageSrc || '');
            const thumb = document.createElement('div');
            thumb.className = `thumbnail-item ${isActive ? 'active' : ''}`;
            thumb.onclick = () => {
                document.querySelectorAll('.thumbnail-item').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                const mainImage = document.getElementById('mainProductImage');
                if (mainImage) mainImage.src = safeImageSrc;
            };
            const img = document.createElement('img');
            img.src = safeImageSrc;
            img.alt = `Thumbnail ${index + 1}`;
            img.onerror = function () {
                this.parentElement.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5; color: #999;">📚</div>';
            };
            thumb.appendChild(img);
            return thumb;
        },

        // ──────────────── Product reviews ────────────────

        /**
         * Load reviews for a book and render summary + list.
         * deps: { getReviewsByBook, renderReviewsSummary, filterReviews, reviewSortType }
         */
        async loadProductReviews(bookId, deps) {
            const { getReviewsByBook, renderReviewsSummary, filterReviews, reviewSortType, setCurrentReviews } = deps;
            try {
                const reviews = await getReviewsByBook(bookId);
                const approved = Array.isArray(reviews) ? reviews.filter(r => r.approved !== false) : [];
                if (typeof setCurrentReviews === 'function') setCurrentReviews(approved);
                renderReviewsSummary(approved);
                filterReviews(reviewSortType || 'newest');
            } catch (error) {
                console.error('Error loading reviews:', error);
                if (typeof setCurrentReviews === 'function') setCurrentReviews([]);
                renderReviewsSummary([]);
                CustomerBookDetailBusiness.renderReviewsList([]);
            }
        },

        /**
         * Render the rating summary (average, distribution bars).
         * deps: { renderStars }
         */
        renderReviewsSummary(currentReviews, deps) {
            const { renderStars } = deps;
            const avgRatingEl = document.getElementById('averageRating');
            const starsEl = document.getElementById('ratingStarsLarge');
            const countEl = document.getElementById('reviewCount');
            const distEl = document.getElementById('ratingDistribution');
            if (!avgRatingEl || !starsEl || !countEl || !distEl) return;

            if (!currentReviews || currentReviews.length === 0) {
                avgRatingEl.textContent = '0';
                starsEl.innerHTML = renderStars(0);
                countEl.textContent = '(0 đánh giá)';
                distEl.innerHTML = [5, 4, 3, 2, 1].map(star => `
                    <div class="rating-bar-item">
                        <span class="rating-bar-label">${star} sao</span>
                        <div class="rating-bar-container"><div class="rating-bar-fill" style="width: 0%"></div></div>
                        <span class="rating-bar-percentage">0%</span>
                    </div>
                `).join('');
                return;
            }

            const totalRating = currentReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
            const averageRating = totalRating / currentReviews.length;
            avgRatingEl.textContent = averageRating.toFixed(1);
            starsEl.innerHTML = renderStars(averageRating);
            countEl.textContent = `(${currentReviews.length} đánh giá)`;

            const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            currentReviews.forEach(r => {
                const rating = r.rating || 0;
                if (rating >= 5) distribution[5]++;
                else if (rating >= 4) distribution[4]++;
                else if (rating >= 3) distribution[3]++;
                else if (rating >= 2) distribution[2]++;
                else if (rating >= 1) distribution[1]++;
            });

            distEl.innerHTML = [5, 4, 3, 2, 1].map(star => {
                const count = distribution[star];
                const percentage = (count / currentReviews.length * 100).toFixed(0);
                return `
                    <div class="rating-bar-item">
                        <span class="rating-bar-label">${star} sao</span>
                        <div class="rating-bar-container"><div class="rating-bar-fill" style="width: ${percentage}%"></div></div>
                        <span class="rating-bar-percentage">${percentage}%</span>
                    </div>
                `;
            }).join('');
        },

        /**
         * Sort and render the reviews list.
         * deps: { currentReviews, renderReviewsList, setReviewSortType }
         */
        filterReviews(sortType, deps) {
            const { currentReviews, renderReviewsList, setReviewSortType } = deps;
            if (typeof setReviewSortType === 'function') setReviewSortType(sortType);

            document.querySelectorAll('.review-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.textContent.trim() === (sortType === 'newest' ? 'Mới nhất' : 'Yêu thích nhất')) {
                    tab.classList.add('active');
                }
            });

            let sorted = [...(currentReviews || [])];
            if (sortType === 'newest') {
                sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            } else if (sortType === 'mostLiked') {
                sorted.sort((a, b) => {
                    if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                });
            }
            renderReviewsList(sorted);
        },

        /**
         * Render the reviews list.
         * deps: { escapeJsString, escapeHtml, renderStars }
         */
        renderReviewsList(reviews, deps) {
            const { escapeJsString, escapeHtml, renderStars } = deps;
            const container = document.getElementById('reviewsList');
            if (!container) return;

            if (!reviews || reviews.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Chưa có đánh giá nào</p>';
                return;
            }

            container.innerHTML = reviews.map(review => {
                const date = review.createdAt ? CustomerBookDetailBusiness.formatDate(review.createdAt) : 'Chưa có ngày';
                const rating = review.rating || 0;
                const likes = review.likes || 0;
                const safeReviewId = escapeJsString(review.id);
                const safeUserName = escapeHtml(review.userName || 'Ẩn danh');
                const safeComment = escapeHtml(review.comment || 'Không có bình luận');
                const safeDate = escapeHtml(date);
                return `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="review-user-info">
                                <div class="review-user-name">${safeUserName}</div>
                                <div class="review-date">${safeDate}</div>
                            </div>
                            <div class="review-rating-stars">${renderStars(rating)}</div>
                        </div>
                        <div class="review-comment">${safeComment}</div>
                        <div class="review-actions">
                            <button class="review-action-btn" data-review-action="like" data-review-id="${safeReviewId}">
                                <i class="fas fa-thumbs-up"></i>
                                <span>Thích (${likes})</span>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        },

        /** Format ISO date string to DD/MM/YYYY. */
        formatDate(dateString) {
            if (!dateString) return 'Chưa có ngày';
            try {
                const date = new Date(dateString);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                return `${day}/${month}/${date.getFullYear()}`;
            } catch (e) {
                return 'Chưa có ngày';
            }
        }
    };

    global.CustomerBookDetailBusiness = CustomerBookDetailBusiness;
})(window);
