(function (global) {
    'use strict';

    async function loadProfile(deps) {
        const { auth, loadProfileWithUser, logger } = deps;
        const user = auth.getUser();
        if (!user || !user.id) {
            logger.error('User not found or missing ID', user);
            const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
            if (storedUser && storedUser.id) {
                logger.log('Found user in localStorage, updating auth');
                auth.setAuth(storedUser, localStorage.getItem('token'));
                const retryUser = auth.getUser();
                if (retryUser && retryUser.id) {
                    return loadProfileWithUser(retryUser);
                }
            }
            return;
        }

        return loadProfileWithUser(user);
    }

    async function loadProfileWithUser(user, deps) {
        const {
            auth,
            getUserById,
            formatProfileDate,
            updateAccountName,
            logger
        } = deps;

        if (!user || !user.id) {
            logger.error('Invalid user provided to loadProfileWithUser', user);
            return;
        }

        try {
            const fullUserData = await getUserById(user.id);

            const profileNameEl = document.getElementById('profileName');
            const profileNameDisplayEl = document.getElementById('profileNameDisplay');
            const profileEmailEl = document.getElementById('profileEmail');
            const profilePhoneEl = document.getElementById('profilePhone');
            const profileRoleEl = document.getElementById('profileRole');
            const profileRoleBadgeEl = document.getElementById('profileRoleBadge');
            const profileCreatedAtEl = document.getElementById('profileCreatedAt');
            const profileStatusEl = document.getElementById('profileStatus');
            const profileAvatarEl = document.getElementById('profileAvatar');

            if (profileNameEl) profileNameEl.textContent = fullUserData.name || user.name || 'Chưa có';
            if (profileNameDisplayEl) profileNameDisplayEl.textContent = fullUserData.name || user.name || 'Người dùng';
            if (profileEmailEl) profileEmailEl.textContent = fullUserData.email || user.email || 'Chưa có';
            if (profilePhoneEl) profilePhoneEl.textContent = fullUserData.phone || user.phone || '-';
            if (profileRoleEl) profileRoleEl.textContent = fullUserData.role || user.role || 'CUSTOMER';
            if (profileRoleBadgeEl) {
                profileRoleBadgeEl.textContent = fullUserData.role || user.role || 'CUSTOMER';
                profileRoleBadgeEl.className = 'profile-role-badge ' + (fullUserData.role === 'ADMIN' ? 'role-admin' : 'role-customer');
            }

            if (profileCreatedAtEl && fullUserData.createdAt) {
                profileCreatedAtEl.textContent = formatProfileDate(fullUserData.createdAt);
            } else if (profileCreatedAtEl) {
                profileCreatedAtEl.textContent = 'Chưa có thông tin';
            }

            if (profileStatusEl) {
                const isActive = fullUserData.active !== false;
                profileStatusEl.innerHTML = isActive
                    ? '<span class="status-active"><i class="fas fa-check-circle"></i> Đang hoạt động</span>'
                    : '<span class="status-inactive"><i class="fas fa-times-circle"></i> Đã khóa</span>';
            }

            if (profileAvatarEl && fullUserData.avatar) {
                profileAvatarEl.innerHTML = `<img src="${fullUserData.avatar}" alt="${fullUserData.name}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>'">`;
            } else if (profileAvatarEl) {
                const initials = (fullUserData.name || user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                profileAvatarEl.innerHTML = `<span class="avatar-initials">${initials}</span>`;
            }

            const updatedUser = {
                ...user,
                ...fullUserData,
                phone: fullUserData.phone || user.phone || ''
            };
            auth.setAuth(updatedUser, auth.token);
            updateAccountName();
        } catch (error) {
            logger.error('Error loading full profile:', error);

            const profileNameEl = document.getElementById('profileName');
            const profileNameDisplayEl = document.getElementById('profileNameDisplay');
            const profileEmailEl = document.getElementById('profileEmail');
            const profilePhoneEl = document.getElementById('profilePhone');
            const profileRoleEl = document.getElementById('profileRole');
            const profileRoleBadgeEl = document.getElementById('profileRoleBadge');

            if (profileNameEl) profileNameEl.textContent = user.name || '';
            if (profileNameDisplayEl) profileNameDisplayEl.textContent = user.name || 'Người dùng';
            if (profileEmailEl) profileEmailEl.textContent = user.email || '';
            if (profilePhoneEl) profilePhoneEl.textContent = user.phone || '-';
            if (profileRoleEl) profileRoleEl.textContent = user.role || '';
            if (profileRoleBadgeEl) {
                profileRoleBadgeEl.textContent = user.role || 'CUSTOMER';
                profileRoleBadgeEl.className = 'profile-role-badge ' + (user.role === 'ADMIN' ? 'role-admin' : 'role-customer');
            }

            updateAccountName();
        }
    }

    global.CustomerProfileBusiness = {
        loadProfile,
        loadProfileWithUser
    };
})(window);
