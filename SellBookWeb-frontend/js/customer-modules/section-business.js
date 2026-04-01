(function (global) {
    'use strict';

    function createSectionManager(deps) {
        const {
            setActiveSection,
            loadMyReviews,
            loadMyOrders,
            loadNotifications,
            loadCart,
            logger
        } = deps;

        return function showSection(sectionId) {
            try {
                setActiveSection(sectionId);

                if (sectionId === 'myReviews') {
                    loadMyReviews();
                }

                if (sectionId === 'myOrders') {
                    loadMyOrders();
                }

                if (sectionId === 'notifications') {
                    loadNotifications();
                }

                if (sectionId === 'cart') {
                    loadCart();
                }
            } catch (error) {
                logger.error('Error in showSection:', error);
            }
        };
    }

    global.CustomerSectionBusiness = {
        createSectionManager
    };
})(window);