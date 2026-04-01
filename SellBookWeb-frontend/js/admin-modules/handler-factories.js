// Admin handler factories: encapsulate static routers and feature callbacks.
(function attachAdminHandlerFactories(globalScope) {
    function createStaticUiRouters(deps) {
        const createRouter = (globalScope.ActionRouter && globalScope.ActionRouter.createRouter)
            ? globalScope.ActionRouter.createRouter
            : (actionMap) => (actionName, payload) => {
                const handler = actionMap[actionName];
                if (typeof handler !== 'function') {
                    return false;
                }
                handler(payload || {});
                return true;
            };

        const uiActionRouter = createRouter({
            'show-section': ({ element, event }) => {
                event.preventDefault();
                deps.showSection(element.dataset.section);
            },
            logout: ({ event }) => {
                event.preventDefault();
                deps.handleLogout();
            },
            'show-add-book-form': () => deps.showAddBookForm(),
            'hide-book-form': () => deps.hideBookForm(),
            'show-add-category-form': () => deps.showAddCategoryForm(),
            'hide-category-form': () => deps.hideCategoryForm(),
            'hide-user-form': () => deps.hideUserForm(),
            'refresh-orders': () => deps.refreshOrders(),
            'close-alert': () => deps.closeAlert()
        });

        const inputActionRouter = createRouter({
            'search-books': () => deps.searchBooks(),
            'search-orders': () => deps.searchOrders()
        });

        const changeActionRouter = createRouter({
            'filter-by-category': () => deps.filterByCategory(),
            'filter-by-status': () => deps.filterByStatus()
        });

        const submitActionRouter = createRouter({
            'save-book': ({ event }) => deps.saveBook(event),
            'save-category': ({ event }) => deps.saveCategory(event),
            'save-user': ({ event }) => deps.saveUser(event)
        });

        const bookActionRouter = createRouter({
            edit: ({ bookId }) => deps.editBook(bookId),
            delete: ({ bookId }) => deps.deleteBookConfirm(bookId)
        });

        const categoryActionRouter = createRouter({
            edit: ({ categoryId }) => deps.editCategory(categoryId),
            delete: ({ categoryId }) => deps.deleteCategoryConfirm(categoryId)
        });

        return {
            onUiAction: (actionName, element, event) => {
                uiActionRouter(actionName, { element, event });
            },
            onReviewTab: (tab, buttonElement) => {
                deps.showReviewTab(tab, buttonElement);
            },
            onBookAction: (actionName, bookId) => {
                bookActionRouter(actionName, { bookId });
            },
            onCategoryAction: (actionName, categoryId) => {
                categoryActionRouter(actionName, { categoryId });
            },
            onInputAction: (actionName, element, event) => {
                inputActionRouter(actionName, { element, event });
            },
            onChangeAction: (actionName, element, event) => {
                changeActionRouter(actionName, { element, event });
            },
            onSubmitAction: (actionName, form, event) => {
                submitActionRouter(actionName, { form, event });
            }
        };
    }

    function createReviewOrderHandlers(deps) {
        return {
            onReviewAction: (action, reviewId) => {
                if (action === 'approve') {
                    deps.approveReviewConfirm(reviewId);
                } else if (action === 'reject') {
                    deps.deleteReviewConfirm(reviewId);
                }
            },
            onOrderAction: (action, orderId) => {
                if (action === 'detail') {
                    deps.viewOrderDetails(orderId);
                } else if (action === 'update-status') {
                    deps.showUpdateStatusForm(orderId);
                }
            },
            onModalAction: (action) => {
                if (action === 'close-order-details') {
                    deps.closeOrderDetailsModal();
                } else if (action === 'close-update-status') {
                    deps.closeUpdateStatusModal();
                }
            },
            onUpdateStatusSubmit: (orderId, form, event) => {
                event.preventDefault();
                deps.updateOrderStatus(event, orderId);
            }
        };
    }

    function createUserHandlers(deps) {
        return {
            onUserAction: (action, userId, element) => {
                if (action === 'edit') {
                    deps.editUser(userId);
                    return;
                }
                if (action === 'delete') {
                    deps.deleteUserConfirm(userId);
                    return;
                }
                if (action === 'toggle-ban') {
                    const currentlyActive = element.dataset.currentActive === 'true';
                    deps.toggleUserBan(userId, currentlyActive);
                }
            }
        };
    }

    globalScope.AdminHandlerFactories = {
        createStaticUiRouters,
        createReviewOrderHandlers,
        createUserHandlers
    };
})(window);
