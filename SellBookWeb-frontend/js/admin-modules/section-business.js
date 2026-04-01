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
            fetchBooks,
            fetchCategories,
            fetchUsers,
            getPendingReviews,
            setStat,
            showAlert
        } = deps;

        try {
            const [booksResult, categoriesResult, usersResult, reviewsResult] = await Promise.allSettled([
                fetchBooks(),
                fetchCategories(),
                fetchUsers(),
                getPendingReviews()
            ]);

            const books = booksResult.status === 'fulfilled' && Array.isArray(booksResult.value) ? booksResult.value : [];
            const categories = categoriesResult.status === 'fulfilled' && Array.isArray(categoriesResult.value) ? categoriesResult.value : [];
            const users = usersResult.status === 'fulfilled' && Array.isArray(usersResult.value) ? usersResult.value : [];
            const reviews = reviewsResult.status === 'fulfilled' && Array.isArray(reviewsResult.value) ? reviewsResult.value : [];

            setStat('totalBooks', books.length);
            setStat('totalCategories', categories.length);
            setStat('totalUsers', users.length);
            setStat('pendingReviews', reviews.length);

            const authError = [booksResult, categoriesResult, usersResult, reviewsResult]
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