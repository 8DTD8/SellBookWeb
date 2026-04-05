// Customer feature-level delegated event bindings.
(function attachCustomerFeatureEventsModule(globalScope) {
    function bindFeatureEvents(options) {
        const {
            onBookAction,
            onBookCard,
            onReviewAction,
            onCartAction,
            onCartChange,
            onOrderCancel,
            onNotificationClick,
            onNotificationBookClick,
            onPriceRange
        } = options || {};

        const booksList = document.getElementById('booksList');
        if (booksList) {
            booksList.addEventListener('click', (event) => {
                const actionButton = event.target.closest('button[data-action][data-book-id]');
                if (actionButton && typeof onBookAction === 'function') {
                    event.stopPropagation();
                    onBookAction(actionButton.dataset.action, actionButton.dataset.bookId, actionButton, event);
                    return;
                }

                const card = event.target.closest('.book-card[data-book-id]');
                if (card && typeof onBookCard === 'function') {
                    onBookCard(card.dataset.bookId, card, event);
                }
            });
        }

        const reviewsList = document.getElementById('reviewsList');
        if (reviewsList) {
            reviewsList.addEventListener('click', (event) => {
                const actionButton = event.target.closest('button[data-review-action][data-review-id]');
                if (!actionButton || typeof onReviewAction !== 'function') {
                    return;
                }
                onReviewAction(actionButton.dataset.reviewAction, actionButton.dataset.reviewId, actionButton, event);
            });
        }

        const cartContent = document.getElementById('cartContent');
        if (cartContent) {
            cartContent.addEventListener('click', (event) => {
                const actionElement = event.target.closest('[data-cart-action]');
                if (!actionElement || typeof onCartAction !== 'function') {
                    return;
                }
                onCartAction(actionElement.dataset.cartAction, actionElement.dataset.bookId, actionElement, event);
            });

            cartContent.addEventListener('change', (event) => {
                const actionElement = event.target.closest('[data-cart-action]');
                if (!actionElement || typeof onCartChange !== 'function') {
                    return;
                }
                onCartChange(actionElement.dataset.cartAction, actionElement.dataset.bookId, actionElement, event);
            });
        }

        const myOrdersList = document.getElementById('myOrdersList');
        if (myOrdersList) {
            myOrdersList.addEventListener('click', (event) => {
                const cancelButton = event.target.closest('[data-order-action="cancel"][data-order-id]');
                if (!cancelButton || typeof onOrderCancel !== 'function') {
                    return;
                }
                onOrderCancel(cancelButton.dataset.orderId, cancelButton, event);
            });
        }

        const notificationsList = document.getElementById('notificationsList');
        if (notificationsList) {
            notificationsList.addEventListener('click', (event) => {
                const bookNotificationItem = event.target.closest('.notification-book-card[data-book-id]');
                if (bookNotificationItem && typeof onNotificationBookClick === 'function') {
                    event.stopPropagation();
                    onNotificationBookClick(bookNotificationItem.dataset.bookId, bookNotificationItem, event);
                    return;
                }

                const notificationItem = event.target.closest('.notification-item[data-notification-id]');
                if (notificationItem && typeof onNotificationClick === 'function') {
                    onNotificationClick(notificationItem.dataset.notificationId, notificationItem, event);
                    return;
                }
            });
        }

        const filterPriceRange = document.getElementById('filterPriceRange');
        if (filterPriceRange) {
            filterPriceRange.addEventListener('click', (event) => {
                const rangeButton = event.target.closest('.price-range-btn[data-price-range]');
                if (!rangeButton || typeof onPriceRange !== 'function') {
                    return;
                }
                onPriceRange(rangeButton.dataset.priceRange, rangeButton, event);
            });
        }
    }

    globalScope.CustomerFeatureEventsModule = {
        bindFeatureEvents
    };
})(window);
