// Admin feature-level delegated event bindings.
(function attachAdminFeatureEventsModule(globalScope) {
    function bindReviewOrderEvents(options) {
        const {
            onReviewAction,
            onOrderAction,
            onModalAction,
            onUpdateStatusSubmit
        } = options || {};

        const reviewsContainer = document.getElementById('reviewsList');
        if (reviewsContainer) {
            reviewsContainer.addEventListener('click', (event) => {
                const actionButton = event.target.closest('[data-review-action][data-review-id]');
                if (!actionButton || typeof onReviewAction !== 'function') {
                    return;
                }
                onReviewAction(actionButton.dataset.reviewAction, actionButton.dataset.reviewId, actionButton, event);
            });
        }

        const ordersBody = document.querySelector('#ordersList tbody');
        if (ordersBody) {
            ordersBody.addEventListener('click', (event) => {
                const actionButton = event.target.closest('[data-order-action][data-order-id]');
                if (!actionButton || typeof onOrderAction !== 'function') {
                    return;
                }
                onOrderAction(actionButton.dataset.orderAction, actionButton.dataset.orderId, actionButton, event);
            });
        }

        document.addEventListener('click', (event) => {
            const closeButton = event.target.closest('[data-modal-action]');
            if (!closeButton || typeof onModalAction !== 'function') {
                return;
            }
            onModalAction(closeButton.dataset.modalAction, closeButton, event);
        });

        document.addEventListener('submit', (event) => {
            const updateForm = event.target.closest('#updateStatusForm[data-order-id]');
            if (!updateForm || typeof onUpdateStatusSubmit !== 'function') {
                return;
            }
            onUpdateStatusSubmit(updateForm.dataset.orderId, updateForm, event);
        });
    }

    function bindUserActionEvents(options) {
        const { onUserAction } = options || {};
        const tbody = document.querySelector('#usersList tbody');
        if (!tbody) {
            return;
        }

        tbody.addEventListener('click', (event) => {
            const actionButton = event.target.closest('button[data-user-action][data-user-id]');
            if (!actionButton || typeof onUserAction !== 'function') {
                return;
            }
            onUserAction(actionButton.dataset.userAction, actionButton.dataset.userId, actionButton, event);
        });
    }

    globalScope.AdminFeatureEventsModule = {
        bindReviewOrderEvents,
        bindUserActionEvents
    };
})(window);
