/**
 * CustomerMyReviewsBusiness — my reviews section business logic for the customer panel.
 * Exposed on window.CustomerMyReviewsBusiness.
 */
(function (global) {
    'use strict';

    const CustomerMyReviewsBusiness = {

        /**
         * Submit a new review from the review form.
         * deps: { auth, createReview, showAlert, closeReviewModal, showBookDetail, reviewingBookId }
         */
        async submitReview(event, deps) {
            event.preventDefault();
            const { auth, createReview, showAlert, closeReviewModal, showBookDetail, reviewingBookId } = deps;

            const rating = document.querySelector('input[name="rating"]:checked');
            const comment = document.getElementById('reviewComment').value;

            if (!rating) {
                showAlert('Vui lòng chọn xếp hạng');
                return;
            }

            const reviewData = {
                bookId: reviewingBookId,
                userId: auth.getUser().id,
                userName: auth.getUser().name,
                rating: parseInt(rating.value),
                comment: comment,
                approved: false
            };

            try {
                await createReview(reviewData);
                showAlert('Đánh giá của bạn đã được gửi!');
                closeReviewModal();
                showBookDetail(reviewingBookId);
            } catch (error) {
                showAlert('Lỗi: ' + error.message);
            }
        },

        /**
         * Load the current user's reviews and render them.
         * deps: { auth, getUserReviews, showAlert, setMyReviews, renderMyReviews }
         */
        async loadMyReviews(deps) {
            const { auth, getUserReviews, showAlert, setMyReviews, renderMyReviews } = deps;
            try {
                const userId = auth.getUser().id;
                const reviews = await getUserReviews(userId);
                if (typeof setMyReviews === 'function') setMyReviews(reviews);
                renderMyReviews(reviews);
            } catch (error) {
                showAlert('Lỗi khi tải đánh giá: ' + error.message);
            }
        },

        /**
         * Render the user's reviews into #myReviewsList.
         * deps: { allBooks }
         */
        renderMyReviews(reviews, deps) {
            const { allBooks } = deps;
            const container = document.getElementById('myReviewsList');
            if (!container) return;

            if (!Array.isArray(reviews) || reviews.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999;">Bạn chưa có đánh giá nào</p>';
                return;
            }

            /**
             * Look up book title by id from allBooks array.
             */
            const getBookTitle = (bookId) => {
                const book = (allBooks || []).find(b => b.id === bookId);
                return book ? book.title : 'Sách chưa xác định';
            };

            /**
             * Build star icons string for a rating value.
             */
            const makeStars = (rating) => {
                const full = Math.floor(rating || 0);
                return '★'.repeat(full) + '☆'.repeat(5 - full);
            };

            container.innerHTML = '';
            reviews.forEach(review => {
                const item = document.createElement('div');
                item.className = 'review-item';
                item.innerHTML = `
                    <div class="review-header">
                        <div>
                            <div class="review-book">📖 ${getBookTitle(review.bookId)}</div>
                            <div class="review-rating">${makeStars(review.rating)}</div>
                        </div>
                        <span style="font-size: 0.85rem; color: ${review.approved ? '#48bb78' : '#f56565'};">
                            ${review.approved ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
                        </span>
                    </div>
                    <div class="review-comment">${review.comment || ''}</div>
                `;
                container.appendChild(item);
            });
        }
    };

    global.CustomerMyReviewsBusiness = CustomerMyReviewsBusiness;
})(window);
