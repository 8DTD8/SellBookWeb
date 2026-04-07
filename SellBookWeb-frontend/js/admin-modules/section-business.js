(function (global) {
    'use strict';

    function createSectionNavigator(deps) {
        const {
            setCurrentSection,
            loadDashboard,
            loadBooks,
            loadCategories,
            loadCoupons,
            loadUsers,
            loadSuppliers,
            loadPurchaseOrders,
            loadPayments,
            loadReviews,
            loadOrders
        } = deps;

        return function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });

            const selectedSection = document.getElementById(sectionId);
            if (selectedSection) {
                selectedSection.classList.add('active');
            }

            setCurrentSection(sectionId);

            switch (sectionId) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'books':
                    loadBooks();
                    break;
                case 'categories':
                    loadCategories();
                    break;
                case 'coupons':
                    loadCoupons();
                    break;
                case 'users':
                    loadUsers();
                    break;
                case 'suppliers':
                    loadSuppliers();
                    break;
                case 'purchaseOrders':
                    loadPurchaseOrders();
                    break;
                case 'payments':
                    loadPayments();
                    break;
                case 'reviews':
                    loadReviews();
                    break;
                case 'orders':
                    loadOrders();
                    break;
                default:
                    break;
            }
        };
    }

    async function loadDashboardStats(deps) {
        const {
            fetchAdminDashboardStats,
            fetchCategories,
            fetchUsers,
            getPendingReviews,
            setStat,
            showAlert
        } = deps;

        try {
            const [dashboardResult, categoriesResult, usersResult, reviewsResult] = await Promise.allSettled([
                fetchAdminDashboardStats(),
                fetchCategories(),
                fetchUsers(),
                getPendingReviews()
            ]);

            const totalBooks = dashboardResult.status === 'fulfilled'
                ? Number(dashboardResult.value?.totalBooks || 0)
                : 0;
            const categories = categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value) ? categoriesResult.value : [];
            const users = usersResult.status === 'fulfilled' && Array.isArray(usersResult.value) ? usersResult.value : [];
            const reviews = reviewsResult.status === 'fulfilled' && Array.isArray(reviewsResult.value) ? reviewsResult.value : [];

            setStat('totalBooks', totalBooks);
            setStat('totalCategories', categories.length);
            setStat('totalUsers', users.length);
            setStat('pendingReviews', reviews.length);

            const authError = [dashboardResult, categoriesResult, usersResult, reviewsResult]
                .filter(result => result.status === 'rejected')
                .map(result => result.reason?.message || '')
                .find(message => message.toLowerCase().includes('không có quyền') || message.toLowerCase().includes('đăng nhập'));

            if (authError) {
                showAlert(authError);
            }
        } catch (error) {
            showAlert('Lỗi khi tải bảng điều khiển: ' + error.message);
        }
    }

    global.AdminSectionBusiness = {
        createSectionNavigator,
        loadDashboardStats
    };
})(window);