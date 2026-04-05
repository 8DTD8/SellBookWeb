// Customer handler factories: encapsulate feature callbacks and UI action routers.
(function attachCustomerHandlerFactories(globalScope) {
    function createFeatureHandlers(deps) {
        return {
            onBookAction: (action, bookId) => {
                if (action === 'detail') {
                    deps.showBookDetail(bookId);
                    return;
                }
                if (action === 'add-cart') {
                    deps.addToCart(bookId);
                    return;
                }
                if (action === 'toggle-wishlist') {
                    deps.toggleWishlist(bookId);
                }
            },
            onBookCard: (bookId) => {
                deps.showBookDetail(bookId);
            },
            onReviewAction: (action, reviewId) => {
                if (action === 'like') {
                    deps.likeReview(reviewId);
                }
            },
            onCartAction: (action, bookId, element) => {
                if (action === 'continue-shopping') {
                    deps.showSection('home');
                    return;
                }
                if (action === 'checkout') {
                    deps.checkout();
                    return;
                }
                if (action === 'qty-dec') {
                    deps.updateCartQuantity(bookId, Number(element.dataset.nextQuantity));
                    return;
                }
                if (action === 'qty-inc') {
                    deps.updateCartQuantity(bookId, Number(element.dataset.nextQuantity));
                    return;
                }
                if (action === 'toggle-coupon') {
                    deps.toggleCartItemCoupon(bookId);
                    return;
                }
                if (action === 'remove-item') {
                    deps.removeFromCart(bookId);
                }
            },
            onCartChange: (action, bookId, element, event) => {
                if (action === 'select-all') {
                    deps.toggleSelectAllCart(event.target);
                    return;
                }
                if (action === 'select-item') {
                    deps.toggleCartItemSelect(bookId, event.target);
                }
            },
            onOrderCancel: (orderId) => {
                deps.cancelMyOrder(orderId);
            },
            onNotificationClick: (notificationId) => {
                deps.handleNotificationClick(notificationId);
            },
            onNotificationBookClick: (bookId) => {
                deps.viewBookDetail(bookId);
            },
            onPriceRange: (range) => {
                deps.filterByPrice(range);
            }
        };
    }

    function createUiRouters(deps) {
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
            'toggle-filter-panel': ({ event }) => {
                event.preventDefault();
                deps.toggleFilterPanel(event);
            },
            'focus-search': () => deps.focusSearch(),
            'toggle-account-dropdown': ({ event }) => deps.toggleAccountDropdown(event),
            'account-profile': ({ event }) => {
                event.preventDefault();
                event.stopPropagation();
                deps.showProfile();
                deps.closeAccountDropdown();
            },
            'account-orders': ({ event }) => {
                event.preventDefault();
                event.stopPropagation();
                deps.showSection('myOrders');
                deps.closeAccountDropdown();
            },
            logout: ({ event }) => {
                event.preventDefault();
                event.stopPropagation();
                deps.handleLogout();
            },
            'close-filter-panel': () => deps.closeFilterPanel(),
            'add-to-cart-from-detail': () => deps.addToCartFromDetail(),
            'buy-now': () => deps.buyNow(),
            'change-shipping-address': ({ event }) => {
                event.preventDefault();
                deps.changeShippingAddress();
            },
            'decrease-quantity': () => deps.decreaseQuantity(),
            'increase-quantity': () => deps.increaseQuantity(),
            'show-login-prompt': ({ event }) => {
                event.preventDefault();
                deps.showLoginPrompt();
            },
            'show-edit-profile': () => deps.showEditProfile(),
            'hide-edit-profile': () => deps.hideEditProfile(),
            'apply-checkout-coupon': () => deps.applyCheckoutCoupon(),
            'place-order': () => deps.placeOrder(),
            'mark-all-as-read': () => deps.markAllAsRead(),
            'close-alert': () => deps.closeAlert(),
            'close-review-modal': () => deps.closeReviewModal()
        });

        const changeActionRouter = createRouter({
            'sort-books': () => deps.sortBooks(),
            'change-product-count': () => deps.changeProductCount()
        });

        const submitActionRouter = createRouter({
            'save-profile': ({ event }) => deps.saveProfile(event),
            'submit-review': ({ event }) => deps.submitReview(event)
        });

        return {
            onUiAction: (actionName, element, event) => {
                uiActionRouter(actionName, { element, event });
            },
            onReviewSort: (sortType) => {
                deps.filterReviews(sortType);
            },
            onPaymentMethod: (method, element) => {
                deps.selectPaymentMethod(method, element);
            },
            onChangeAction: (actionName, element, event) => {
                changeActionRouter(actionName, { element, event });
            },
            onSubmitAction: (actionName, form, event) => {
                submitActionRouter(actionName, { form, event });
            }
        };
    }

    globalScope.CustomerHandlerFactories = {
        createFeatureHandlers,
        createUiRouters
    };
})(window);
