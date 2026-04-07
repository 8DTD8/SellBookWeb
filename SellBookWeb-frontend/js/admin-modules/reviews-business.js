(function (global) {
    'use strict';

    async function loadReviews(deps) {
        const {
            currentReviewsView,
            getPendingReviews,
            showAllReviews,
            renderReviews,
            showAlert
        } = deps;

        try {
            if (currentReviewsView === 'pending') {
                const reviews = await getPendingReviews();
                renderReviews(reviews);
            } else {
                await showAllReviews();
            }
        } catch (error) {
            showAlert('Lỗi khi tải đánh giá: ' + error.message);
        }
    }

    async function showAllReviews(deps) {
        const { fetchAdminBooks, getReviewsByBook, renderReviews, showAlert } = deps;

        try {
            const books = await fetchAdminBooks(0, 1000);
            let allReviews = [];

            if (Array.isArray(books)) {
                for (const book of books) {
                    const reviews = await getReviewsByBook(book.id);
                    if (Array.isArray(reviews)) {
                        allReviews = allReviews.concat(reviews);
                    }
                }
            }

            renderReviews(allReviews);
        } catch (error) {
            showAlert('Lỗi khi tải đánh giá: ' + error.message);
        }
    }

    function renderReviews(reviews, deps) {
        const { escapeHtml, escapeJsString } = deps;

        const container = document.getElementById('reviewsList');
        if (!container) {
            return;
        }

        container.innerHTML = '';

        if (!Array.isArray(reviews) || reviews.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">Không có đánh giá</p>';
            return;
        }

        reviews.forEach(review => {
            const card = document.createElement('div');
            card.className = 'review-card';
            const stars = '⭐'.repeat(review.rating || 0);
            const reviewDate = review.createdAt
                ? new Date(review.createdAt).toLocaleDateString('vi-VN')
                : '--';
            const safeReviewId = escapeJsString(review.id);
            const safeUserName = escapeHtml(review.userName || 'Người dùng');
            const safeReviewDate = escapeHtml(reviewDate);
            const safeComment = escapeHtml(review.comment || 'Không có bình luận');

            let actionButtons = `<button class="btn btn-danger btn-sm" data-review-action="reject" data-review-id="${safeReviewId}">Từ chối</button>`;
            if (!review.approved) {
                actionButtons = `
                <button class="btn btn-success btn-sm" data-review-action="approve" data-review-id="${safeReviewId}">Duyệt</button>
                <button class="btn btn-danger btn-sm" data-review-action="reject" data-review-id="${safeReviewId}">Từ chối</button>
            `;
            }

            card.innerHTML = `
            <div class="review-header">
                <div class="review-user-block">
                    <div class="review-avatar"></div>
                    <div>
                        <p class="review-user">${safeUserName}</p>
                        <p class="review-meta">${safeReviewDate}</p>
                        <p class="review-rating">${stars}</p>
                    </div>
                </div>
                <div class="review-buttons">
                    ${actionButtons}
                </div>
            </div>
            <p class="review-comment">${safeComment}</p>
        `;

            container.appendChild(card);
        });
    }

    async function approveReviewConfirm(id, deps) {
        const { approveReview, showAlert, reloadReviews } = deps;

        if (!confirm('Bạn chắc chắn muốn duyệt đánh giá này?')) {
            return;
        }

        try {
            await approveReview(id);
            showAlert('Duyệt đánh giá thành công!');
            await reloadReviews();
        } catch (error) {
            showAlert('Lỗi: ' + error.message);
        }
    }

    async function deleteReviewConfirm(id, deps) {
        const { deleteReview, showAlert, reloadReviews } = deps;

        if (!confirm('Bạn chắc chắn muốn xóa đánh giá này?')) {
            return;
        }

        try {
            await deleteReview(id);
            showAlert('Xóa đánh giá thành công!');
            await reloadReviews();
        } catch (error) {
            showAlert('Lỗi: ' + error.message);
        }
    }

    global.AdminReviewsBusiness = {
        loadReviews,
        showAllReviews,
        renderReviews,
        approveReviewConfirm,
        deleteReviewConfirm
    };
})(window);
