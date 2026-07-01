document.addEventListener('DOMContentLoaded', () => {
    if (!AdminAuth.requireAuth()) return;

    const user = AdminAuth.getUser();
    const welcomeEl = document.getElementById('adminWelcome');
    if (welcomeEl && user) {
        welcomeEl.textContent = `Hola, ${user.nombre}`;
    }

    let products = [];
    let deleteTargetId = null;
    let searchTimeout = null;

    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    const elements = {
        tableBody: document.getElementById('productsTableBody'),
        statsBar: document.getElementById('statsBar'),
        searchInput: document.getElementById('searchInput'),
        filterCategoria: document.getElementById('filterCategoria'),
        filterEstado: document.getElementById('filterEstado'),
        filterVisible: document.getElementById('filterVisible'),
        adminPanel: document.getElementById('adminPanel'),
        clientPreview: document.getElementById('clientPreview'),
        clientGrid: document.getElementById('clientGrid'),
        btnAdminView: document.getElementById('btnAdminView'),
        btnClientView: document.getElementById('btnClientView')
    };

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-bg-${type} border-0`;
        toastEl.setAttribute('role', 'alert');
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${escapeHTML(message)}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        container.appendChild(toastEl);
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    }

    function buildQueryParams(clientView = false) {
        const params = new URLSearchParams();
        const search = elements.searchInput.value.trim();
        const categoria = elements.filterCategoria.value;
        const estado = elements.filterEstado.value;
        const visible = elements.filterVisible.value;

        if (search) params.set('search', search);
        if (categoria) params.set('categoria', categoria);
        if (estado) params.set('estado', estado);
        if (visible) params.set('visible', visible);
        if (clientView) params.set('vista', 'cliente');

        return params.toString();
    }

    async function loadProducts(clientView = false) {
        try {
            const query = buildQueryParams(clientView);
            const response = await AdminAuth.apiFetch(`/api/admin/productos?${query}`);
            if (!response.ok) throw new Error('Error al cargar productos');

            products = await response.json();

            if (clientView) {
                renderClientPreview(products);
            } else {
                renderStats(products);
                renderTable(products);
            }
        } catch (err) {
            if (err.message !== 'Sesión expirada') {
                elements.tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-danger">${escapeHTML(err.message)}</td></tr>`;
            }
        }
    }

    function renderStats(items) {
        const total = items.length;
        const activos = items.filter(p => (p.estado || 'activo') === 'activo').length;
        const standby = items.filter(p => p.estado === 'standby').length;
        const ocultos = items.filter(p => p.visible === false).length;

        elements.statsBar.innerHTML = `
            <div class="col-6 col-md-3"><div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">Total</div></div></div>
            <div class="col-6 col-md-3"><div class="stat-card"><div class="stat-value text-success">${activos}</div><div class="stat-label">Activos</div></div></div>
            <div class="col-6 col-md-3"><div class="stat-card"><div class="stat-value text-warning">${standby}</div><div class="stat-label">Standby</div></div></div>
            <div class="col-6 col-md-3"><div class="stat-card"><div class="stat-value text-danger">${ocultos}</div><div class="stat-label">Ocultos</div></div></div>
        `;
    }

    function renderTable(items) {
        if (!items.length) {
            elements.tableBody.innerHTML = '<tr><td colspan="8" class="text-center py-5 text-muted">No hay productos con estos filtros.</td></tr>';
            return;
        }

        elements.tableBody.innerHTML = items.map(producto => {
            const imagen = producto.imagen_url || '/media/media-logos/LogoPS.png';
            const estado = producto.estado || 'activo';
            const visible = producto.visible !== false;
            const destacado = Boolean(producto.destacado);

            return `
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-3">
                            <img src="${escapeHTML(imagen)}" alt="" class="product-thumb" onerror="this.src='/media/media-logos/LogoPS.png'">
                            <div>
                                <div class="fw-semibold">${escapeHTML(producto.nombre)}</div>
                                <div class="text-muted small text-truncate" style="max-width: 220px;">${escapeHTML(producto.descripcion || '')}</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="badge bg-secondary">${escapeHTML(producto.categoria || '-')}</span></td>
                    <td>${escapeHTML(producto.marca || 'Palmas Street')}</td>
                    <td class="fw-bold">S/ ${Number(producto.precio || 0).toFixed(2)}</td>
                    <td>
                        <span class="badge ${estado === 'activo' ? 'badge-activo' : 'badge-standby'}">
                            ${estado === 'activo' ? 'Activo' : 'Standby'}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${visible ? 'badge-activo' : 'badge-oculto'}">
                            ${visible ? 'Visible' : 'Oculto'}
                        </span>
                    </td>
                    <td>${destacado ? '<i class="bi bi-star-fill text-warning"></i>' : '<i class="bi bi-star text-muted"></i>'}</td>
                    <td class="text-end">
                        <div class="btn-group admin-actions">
                            <button class="btn btn-outline-dark btn-sm" title="Editar" data-action="edit" data-id="${producto.id}">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" title="${visible ? 'Ocultar' : 'Mostrar'}" data-action="toggle-visible" data-id="${producto.id}">
                                <i class="bi bi-${visible ? 'eye-slash' : 'eye'}"></i>
                            </button>
                            <button class="btn btn-outline-warning btn-sm" title="${estado === 'activo' ? 'Dar de baja' : 'Reactivar'}" data-action="toggle-estado" data-id="${producto.id}">
                                <i class="bi bi-${estado === 'activo' ? 'pause-circle' : 'play-circle'}"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" title="Eliminar" data-action="delete" data-id="${producto.id}" data-name="${escapeHTML(producto.nombre)}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderClientPreview(items) {
        if (!items.length) {
            elements.clientGrid.innerHTML = '<div class="col-12 text-center text-muted py-5"><h5>No hay productos visibles para clientes</h5></div>';
            return;
        }

        elements.clientGrid.innerHTML = items.map(producto => {
            const imagen = producto.imagen_url || '/media/media-logos/LogoPS.png';
            return `
                <div class="col">
                    <div class="client-preview-card h-100">
                        <img src="${escapeHTML(imagen)}" alt="${escapeHTML(producto.nombre)}" onerror="this.src='/media/media-logos/LogoPS.png'">
                        <div class="p-3 text-center">
                            <h6 class="fw-bold mb-1">${escapeHTML(producto.nombre)}</h6>
                            <p class="text-muted small mb-2">${escapeHTML(producto.descripcion || '')}</p>
                            <span class="badge bg-secondary mb-2">${escapeHTML(producto.categoria || '')}</span>
                            <div class="fw-bold fs-5">S/ ${Number(producto.precio || 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function openProductModal(producto = null) {
        document.getElementById('productModalTitle').textContent = producto ? 'Editar producto' : 'Nuevo producto';
        document.getElementById('productId').value = producto ? producto.id : '';
        document.getElementById('productNombre').value = producto ? producto.nombre : '';
        document.getElementById('productDescripcion').value = producto ? (producto.descripcion || '') : '';
        document.getElementById('productPrecio').value = producto ? producto.precio : '';
        document.getElementById('productCategoria').value = producto ? producto.categoria : 'Mujeres';
        document.getElementById('productMarca').value = producto ? (producto.marca || '') : '';
        document.getElementById('productImagen').value = producto ? (producto.imagen_url || '') : '';
        document.getElementById('productVisible').checked = producto ? producto.visible !== false : true;
        document.getElementById('productDestacado').checked = producto ? Boolean(producto.destacado) : false;
        document.getElementById('productEstado').value = producto ? (producto.estado || 'activo') : 'activo';
        productModal.show();
    }

    async function saveProduct(e) {
        e.preventDefault();

        const id = document.getElementById('productId').value;
        const payload = {
            nombre: document.getElementById('productNombre').value.trim(),
            descripcion: document.getElementById('productDescripcion').value.trim(),
            precio: parseFloat(document.getElementById('productPrecio').value),
            categoria: document.getElementById('productCategoria').value,
            marca: document.getElementById('productMarca').value.trim() || 'Palmas Street',
            imagen_url: document.getElementById('productImagen').value.trim() || '/media/media-logos/LogoPS.png',
            visible: document.getElementById('productVisible').checked,
            destacado: document.getElementById('productDestacado').checked,
            estado: document.getElementById('productEstado').value
        };

        const url = id ? `/api/admin/productos/${id}` : '/api/admin/productos';
        const method = id ? 'PUT' : 'POST';

        try {
            const response = await AdminAuth.apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error al guardar');

            productModal.hide();
            showToast(data.mensaje || 'Producto guardado');
            loadProducts();
        } catch (err) {
            showToast(err.message, 'danger');
        }
    }

    async function toggleVisible(id, currentVisible) {
        try {
            const response = await AdminAuth.apiFetch(`/api/admin/productos/${id}/visible`, {
                method: 'PATCH',
                body: JSON.stringify({ visible: !currentVisible })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            showToast(data.mensaje);
            loadProducts();
        } catch (err) {
            showToast(err.message, 'danger');
        }
    }

    async function toggleEstado(id, currentEstado) {
        const nuevoEstado = currentEstado === 'activo' ? 'standby' : 'activo';
        try {
            const response = await AdminAuth.apiFetch(`/api/admin/productos/${id}/estado`, {
                method: 'PATCH',
                body: JSON.stringify({ estado: nuevoEstado })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            showToast(data.mensaje);
            loadProducts();
        } catch (err) {
            showToast(err.message, 'danger');
        }
    }

    async function confirmDelete() {
        if (!deleteTargetId) return;

        try {
            const response = await AdminAuth.apiFetch(`/api/admin/productos/${deleteTargetId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            deleteModal.hide();
            deleteTargetId = null;
            showToast(data.mensaje);
            loadProducts();
        } catch (err) {
            showToast(err.message, 'danger');
        }
    }

    function switchView(clientView) {
        elements.btnAdminView.classList.toggle('active', !clientView);
        elements.btnClientView.classList.toggle('active', clientView);
        elements.adminPanel.classList.toggle('d-none', clientView);
        elements.clientPreview.classList.toggle('d-none', !clientView);
        loadProducts(clientView);
    }

    elements.tableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const producto = products.find(p => String(p.id) === String(id));

        if (action === 'edit' && producto) {
            openProductModal(producto);
        } else if (action === 'toggle-visible' && producto) {
            await toggleVisible(id, producto.visible !== false);
        } else if (action === 'toggle-estado' && producto) {
            await toggleEstado(id, producto.estado || 'activo');
        } else if (action === 'delete') {
            deleteTargetId = id;
            document.getElementById('deleteProductName').textContent = btn.dataset.name || 'este producto';
            deleteModal.show();
        }
    });

    document.getElementById('btnNewProduct').addEventListener('click', () => openProductModal());
    document.getElementById('productForm').addEventListener('submit', saveProduct);
    document.getElementById('btnConfirmDelete').addEventListener('click', confirmDelete);

    document.getElementById('btnClearFilters').addEventListener('click', () => {
        elements.searchInput.value = '';
        elements.filterCategoria.value = '';
        elements.filterEstado.value = '';
        elements.filterVisible.value = '';
        loadProducts();
    });

    [elements.searchInput, elements.filterCategoria, elements.filterEstado, elements.filterVisible].forEach(el => {
        el.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => loadProducts(), 300);
        });
        el.addEventListener('change', () => loadProducts());
    });

    elements.btnAdminView.addEventListener('click', () => switchView(false));
    elements.btnClientView.addEventListener('click', () => switchView(true));

    loadProducts();
});
