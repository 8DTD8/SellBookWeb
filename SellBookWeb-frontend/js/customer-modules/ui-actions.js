// Customer UI actions module: binds delegated click/change/submit handlers.
(function attachCustomerUiModule(globalScope) {
    function bindStaticUiHandlers(options) {
        const {
            root = document,
            onUiAction,
            onReviewSort,
            onPaymentMethod,
            onChangeAction,
            onSubmitAction
        } = options || {};

        if (typeof onUiAction === 'function') {
            root.addEventListener('click', (event) => {
                const actionElement = event.target.closest('[data-ui-action]');
                if (actionElement) {
                    onUiAction(actionElement.dataset.uiAction, actionElement, event);
                    return;
                }

                const reviewTab = event.target.closest('.review-tab[data-review-sort]');
                if (reviewTab && typeof onReviewSort === 'function') {
                    onReviewSort(reviewTab.dataset.reviewSort, reviewTab, event);
                    return;
                }

                const paymentOption = event.target.closest('.payment-method-option[data-payment-method]');
                if (paymentOption && typeof onPaymentMethod === 'function') {
                    onPaymentMethod(paymentOption.dataset.paymentMethod, paymentOption, event);
                }
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

    globalScope.CustomerUiModule = {
        bindStaticUiHandlers
    };
})(window);
