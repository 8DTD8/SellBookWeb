(function (global) {
    'use strict';

    const AdminSuppliersBusiness = {
        async loadSuppliers(deps) {
            const { fetchSuppliers, renderSuppliers, showAlert, setSuppliersData } = deps;
            try {
                const suppliers = await fetchSuppliers();
                const normalized = Array.isArray(suppliers) ? suppliers : [];
                setSuppliersData(normalized);
                renderSuppliers(normalized);
            } catch (error) {
                showAlert('Lỗi khi tải nhà cung cấp: ' + error.message);
            }
        },

        renderSuppliers(suppliers, deps) {
            const { escapeHtml, escapeJsString } = deps;
            const tbody = document.querySelector('#suppliersList tbody');
            if (!tbody) return;

            tbody.innerHTML = '';
            if (!Array.isArray(suppliers) || suppliers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;">Chưa có nhà cung cấp</td></tr>';
                return;
            }

            suppliers.forEach((supplier) => {
                const safeId = escapeJsString(supplier.id || '');
                const statusClass = supplier.active === false ? 'badge-danger' : 'badge-success';
                const statusText = supplier.active === false ? 'Tạm khóa' : 'Đang hoạt động';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHtml(supplier.name || '-')}</td>
                    <td>${escapeHtml(supplier.contactPerson || '-')}</td>
                    <td>${escapeHtml(supplier.phone || '-')}</td>
                    <td>${escapeHtml(supplier.email || '-')}</td>
                    <td><span class="badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-warning btn-sm" data-ui-action="edit-supplier" data-supplier-id="${safeId}">Sửa</button>
                            <button class="btn btn-danger btn-sm" data-ui-action="delete-supplier" data-supplier-id="${safeId}">Xóa</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        },

        async editSupplier(id, deps) {
            const { getSupplierById, showAlert } = deps;
            try {
                const supplier = await getSupplierById(id);
                document.getElementById('supplierId').value = supplier.id || '';
                document.getElementById('supplierName').value = supplier.name || '';
                document.getElementById('supplierEmail').value = supplier.email || '';
                document.getElementById('supplierPhone').value = supplier.phone || '';
                document.getElementById('supplierContactPerson').value = supplier.contactPerson || '';
                document.getElementById('supplierAddress').value = supplier.address || '';
                document.getElementById('supplierCity').value = supplier.city || '';
                document.getElementById('supplierCountry').value = supplier.country || '';
                document.getElementById('supplierBankAccount').value = supplier.bankAccount || '';
                document.getElementById('supplierActive').checked = supplier.active !== false;
                document.getElementById('supplierFormTitle').textContent = 'Cập nhật nhà cung cấp';
                document.getElementById('supplierForm').classList.remove('hidden');
            } catch (error) {
                showAlert('Không thể tải nhà cung cấp: ' + error.message);
            }
        },

        async saveSupplier(event, deps) {
            event.preventDefault();
            const { createSupplier, updateSupplier, showAlert, hideSupplierForm, reloadSuppliers } = deps;

            const supplierId = document.getElementById('supplierId').value;
            const payload = {
                name: document.getElementById('supplierName').value.trim(),
                email: document.getElementById('supplierEmail').value.trim() || null,
                phone: document.getElementById('supplierPhone').value.trim() || null,
                contactPerson: document.getElementById('supplierContactPerson').value.trim() || null,
                address: document.getElementById('supplierAddress').value.trim() || null,
                city: document.getElementById('supplierCity').value.trim() || null,
                country: document.getElementById('supplierCountry').value.trim() || null,
                bankAccount: document.getElementById('supplierBankAccount').value.trim() || null,
                active: document.getElementById('supplierActive').checked
            };

            if (!payload.name) {
                showAlert('Tên nhà cung cấp là bắt buộc');
                return;
            }

            try {
                if (supplierId) {
                    await updateSupplier(supplierId, payload);
                    showAlert('Cập nhật nhà cung cấp thành công');
                } else {
                    await createSupplier(payload);
                    showAlert('Tạo nhà cung cấp thành công');
                }
                hideSupplierForm();
                reloadSuppliers();
            } catch (error) {
                showAlert('Không thể lưu nhà cung cấp: ' + error.message);
            }
        },

        async deleteSupplierConfirm(id, deps) {
            const { deleteSupplier, showAlert, reloadSuppliers } = deps;
            if (!confirm('Bạn có chắc muốn xóa nhà cung cấp này?')) {
                return;
            }

            try {
                await deleteSupplier(id);
                showAlert('Đã xóa nhà cung cấp');
                reloadSuppliers();
            } catch (error) {
                showAlert('Không thể xóa nhà cung cấp: ' + error.message);
            }
        }
    };

    global.AdminSuppliersBusiness = AdminSuppliersBusiness;
})(window);