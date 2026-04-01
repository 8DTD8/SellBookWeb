// Admin UI actions module: binds delegated click/input/change/submit handlers.
(function attachAdminUiModule(globalScope) {
    function bindStaticUiHandlers(options) {
        const {
            root = document,
            onUiAction,
            onReviewTab,
            onBookAction,
            onCategoryAction,
            onInputAction,
            onChangeAction,
            onSubmitAction
        } = options || {};

        root.addEventListener('click', (event) => {
            const actionElement = event.target.closest('[data-ui-action]');
            if (actionElement && typeof onUiAction === 'function') {
                onUiAction(actionElement.dataset.uiAction, actionElement, event);
                return;
            }

            const reviewTabButton = event.target.closest('.tab-button[data-review-tab]');
            if (reviewTabButton && typeof onReviewTab === 'function') {
                onReviewTab(reviewTabButton.dataset.reviewTab, reviewTabButton, event);
                return;
            }

            const bookActionButton = event.target.closest('[data-book-action][data-book-id]');
            if (bookActionButton && typeof onBookAction === 'function') {
                onBookAction(bookActionButton.dataset.bookAction, bookActionButton.dataset.bookId, bookActionButton, event);
                return;
            }

            const categoryActionButton = event.target.closest('[data-category-action][data-category-id]');
            if (categoryActionButton && typeof onCategoryAction === 'function') {
                onCategoryAction(categoryActionButton.dataset.categoryAction, categoryActionButton.dataset.categoryId, categoryActionButton, event);
            }
        });

        if (typeof onInputAction === 'function') {
            root.addEventListener('input', (event) => {
                const inputElement = event.target.closest('[data-input-action]');
                if (!inputElement) {
                    return;
                }
                onInputAction(inputElement.dataset.inputAction, inputElement, event);
            });
        }

        if (typeof onChangeAction === 'function') {
            root.addEventListener('change', (event) => {
                const changeElement = event.target.closest('[data-change-action]');
                if (!changeElement) {
                    return;
                }
                onChangeAction(changeElement.dataset.changeAction, changeElement, event);
            });
        }

        if (typeof onSubmitAction === 'function') {
            root.addEventListener('submit', (event) => {
                const submitForm = event.target.closest('form[data-submit-action]');
                if (!submitForm) {
                    return;
                }
                onSubmitAction(submitForm.dataset.submitAction, submitForm, event);
            });
        }
    }

    globalScope.AdminUiModule = {
        bindStaticUiHandlers
    };
})(window);
