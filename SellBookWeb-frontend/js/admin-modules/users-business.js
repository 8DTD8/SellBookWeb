/**
 * AdminUsersBusiness — user management business logic for admin panel.
 * Exposed on window.AdminUsersBusiness.
 */
(function (global) {
    'use strict';

    const AdminUsersBusiness = {

        /**
         * Load users from API, store via setter, and render.
         * deps: { fetchUsers, renderUsers, showAlert, setUsersData }
         */
        async loadUsers(deps) {
            const { fetchUsers, renderUsers, showAlert, setUsersData } = deps;
            try {
                const users = await fetchUsers();
                if (typeof setUsersData === 'function') setUsersData(users);
                renderUsers(users);
            } catch (error) {
                showAlert('Lỗi khi tải danh sách người dùng: ' + error.message);
            }
        },

        /**
         * Render users table.
         * deps: { escapeJsString, escapeHtml, auth, isCurrentUserSuperAdmin }
         */
        renderUsers(users, deps) {
            const { escapeJsString, escapeHtml, auth, isCurrentUserSuperAdmin } = deps;
            const tbody = document.querySelector('#usersList tbody');
            tbody.innerHTML = '';
            const currentUser = auth.getUser();
            const isSuperAdmin = isCurrentUserSuperAdmin();

            if (!Array.isArray(users) || users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">Không có người dùng</td></tr>';
                return;
            }

            users.forEach(user => {
                const safeUserId = escapeJsString(user.id);
                const safeUserName = escapeHtml(user.name || '');
                const safeUserEmail = escapeHtml(user.email || '');
                const isCurrentLoginAdmin = !!currentUser && user.id === currentUser.id;
                const isTargetSuperAdmin = (user.role || '').toUpperCase() === 'SUPER_ADMIN';
                const isTargetAdmin = (user.role || '').toUpperCase() === 'ADMIN';
                const isTargetCustomer = (user.role || '').toUpperCase() === 'CUSTOMER';
                const roleLabel = escapeHtml(isTargetSuperAdmin ? 'SUPER ADMIN' : (user.role || 'CUSTOMER'));

                let actionHtml = '<span class="action-lock">Đã khóa</span>';
                if (!isCurrentLoginAdmin) {
                    if (isSuperAdmin && !isTargetSuperAdmin) {
                        actionHtml = `<button class="btn btn-warning btn-sm" data-user-action="edit" data-user-id="${safeUserId}">Sửa</button><button class="btn btn-danger btn-sm" data-user-action="delete" data-user-id="${safeUserId}">Xóa</button>`;
                    } else if (!isSuperAdmin && isTargetCustomer) {
                        const banLabel = user.active ? 'Ban' : 'Mở khóa';
                        actionHtml = `<button class="btn btn-warning btn-sm" data-user-action="toggle-ban" data-user-id="${safeUserId}" data-current-active="${user.active === false ? 'false' : 'true'}">${banLabel}</button><button class="btn btn-danger btn-sm" data-user-action="delete" data-user-id="${safeUserId}">Xóa</button>`;
                    } else if (!isSuperAdmin && isTargetAdmin) {
                        actionHtml = '<span class="action-lock">Không đủ quyền</span>';
                    }
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${safeUserName}</td>
                    <td>${safeUserEmail}</td>
                    <td>${roleLabel}</td>
                    <td>
                        <span class="badge ${user.active ? 'badge-success' : 'badge-danger'}">
                            ${user.active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            ${actionHtml}
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        },

        /**
         * Fill form with user data for editing.
         * deps: { getUserById, showAlert, auth, isCurrentUserSuperAdmin }
         */
        async editUser(id, deps) {
            const { getUserById, showAlert, auth, isCurrentUserSuperAdmin } = deps;
            try {
                const user = await getUserById(id);
                if (!isCurrentUserSuperAdmin()) {
                    showAlert('Chỉ SUPER_ADMIN mới có quyền chỉnh sửa và nâng quyền tài khoản');
                    return;
                }

                const currentUser = auth.getUser();
                const isCurrentLoginAdmin = !!currentUser && user.id === currentUser.id;
                const isSuperAdmin = (user.role || '').toUpperCase() === 'SUPER_ADMIN';
                if (isCurrentLoginAdmin || isSuperAdmin) {
                    showAlert('Không thể chỉnh sửa tài khoản admin đang đăng nhập hoặc SUPER_ADMIN');
                    return;
                }

                document.getElementById('userId').value = user.id;
                document.getElementById('userCurrentRole').value = (user.role || 'CUSTOMER').toUpperCase();
                document.getElementById('userCurrentActive').value = user.active === false ? 'false' : 'true';
                document.getElementById('userNameDisplay').value = user.name || '';
                document.getElementById('userEmailDisplay').value = user.email || '';

                const currentRole = (user.role || 'CUSTOMER').toUpperCase();
                const promoteRadio = document.getElementById('userActionPromote');
                if (promoteRadio) {
                    promoteRadio.checked = false;
                    promoteRadio.disabled = currentRole === 'ADMIN';
                }
                const lockToggleRadio = document.getElementById('userActionLockToggle');
                if (lockToggleRadio) {
                    lockToggleRadio.checked = false;
                    lockToggleRadio.disabled = false;
                }
                const lockActionLabel = document.getElementById('userLockActionLabel');
                if (lockActionLabel) {
                    lockActionLabel.textContent = user.active === false
                        ? 'Mở khóa tài khoản (cho phép đăng nhập lại)'
                        : 'Khóa tài khoản (không cho đăng nhập)';
                }

                document.getElementById('userFormTitle').textContent = 'Chỉnh sửa người dùng';
                document.getElementById('userForm').classList.remove('hidden');
            } catch (error) {
                showAlert('Lỗi khi tải thông tin người dùng: ' + error.message);
            }
        },

        /**
         * Save (update) a user from form submission.
         * deps: { updateUser, showAlert, hideUserForm, reloadUsers, isCurrentUserSuperAdmin }
         */
        async saveUser(event, deps) {
            event.preventDefault();
            const { updateUser, showAlert, hideUserForm, reloadUsers, isCurrentUserSuperAdmin } = deps;

            if (!isCurrentUserSuperAdmin()) {
                showAlert('Chỉ SUPER_ADMIN mới có quyền chỉnh sửa và nâng quyền tài khoản');
                return;
            }

            const userId = document.getElementById('userId').value;
            if (!userId) {
                showAlert('Không hỗ trợ tạo tài khoản tại đây. Hãy chọn user có sẵn để nâng quyền.');
                return;
            }

            const currentRole = (document.getElementById('userCurrentRole').value || 'CUSTOMER').toUpperCase();
            const currentActive = (document.getElementById('userCurrentActive').value || 'true') === 'true';
            const selectedAction = document.querySelector('input[name="userAction"]:checked')?.value;

            if (!selectedAction) {
                showAlert('Vui lòng chọn 1 trong 2 thao tác');
                return;
            }

            let userData = {};
            if (selectedAction === 'PROMOTE') {
                if (currentRole === 'ADMIN') {
                    showAlert('Tài khoản này đã là ADMIN');
                    return;
                }
                userData = { role: 'ADMIN' };
            } else if (selectedAction === 'LOCK_TOGGLE') {
                userData = { active: !currentActive };
            }

            try {
                await updateUser(userId, userData);
                if (selectedAction === 'PROMOTE') {
                    showAlert('Nâng quyền ADMIN thành công. Tài khoản này cần đăng xuất và đăng nhập lại để vào trang admin.');
                } else {
                    showAlert(currentActive
                        ? 'Đã khóa tài khoản thành công!'
                        : 'Đã mở khóa tài khoản thành công!');
                }
                hideUserForm();
                reloadUsers();
            } catch (error) {
                showAlert('Lỗi: ' + error.message);
            }
        },

        /**
         * Toggle ban/unban for a user.
         * deps: { updateUser, showAlert, reloadUsers }
         */
        async toggleUserBan(id, currentlyActive, deps) {
            const { updateUser, showAlert, reloadUsers } = deps;
            const actionLabel = currentlyActive ? 'ban' : 'mở khóa';
            if (!confirm(`Bạn chắc chắn muốn ${actionLabel} tài khoản user này?`)) return;
            try {
                await updateUser(id, { active: !currentlyActive });
                showAlert(`Đã ${actionLabel} tài khoản thành công!`);
                reloadUsers();
            } catch (error) {
                showAlert('Lỗi: ' + error.message);
            }
        },

        /**
         * Confirm and delete a user.
         * deps: { deleteUser, showAlert, reloadUsers, auth, usersData }
         */
        async deleteUserConfirm(id, deps) {
            const { deleteUser, showAlert, reloadUsers, auth, usersData } = deps;
            const currentUser = auth.getUser();
            const targetUser = (usersData || []).find(user => user.id === id);
            const isCurrentLoginAdmin = !!currentUser && currentUser.id === id;
            const isSuperAdmin = !!targetUser && (targetUser.role || '').toUpperCase() === 'SUPER_ADMIN';

            if (isCurrentLoginAdmin || isSuperAdmin) {
                showAlert('Không thể xóa tài khoản admin đang đăng nhập hoặc SUPER_ADMIN');
                return;
            }

            if (confirm('Bạn chắc chắn muốn xóa người dùng này?')) {
                try {
                    await deleteUser(id);
                    showAlert('Xóa người dùng thành công!');
                    reloadUsers();
                } catch (error) {
                    showAlert('Lỗi: ' + error.message);
                }
            }
        }
    };

    global.AdminUsersBusiness = AdminUsersBusiness;
})(window);
