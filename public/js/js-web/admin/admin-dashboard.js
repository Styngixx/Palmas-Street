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
    let currentBase64Image = null;
    
    // Variables para los Gráficos
    let chartInstance = null; // Barras
    let chartEvolucionInstance = null; // Lineal
    let reporteInterval = null; 

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
        reportsPanel: document.getElementById('reportsPanel'), 
        clientGrid: document.getElementById('clientGrid'),
        btnAdminView: document.getElementById('btnAdminView'),
        btnClientView: document.getElementById('btnClientView'),
        btnReportesView: document.getElementById('btnReportesView'), 
        
        // Elementos independientes para los gráficos
        filtroEvolucion: document.getElementById('filtroEvolucion'), 
        filtroTopProductos: document.getElementById('filtroTopProductos'), 
        ctxGraficoEvolucion: document.getElementById('graficoEvolucion'), // Canvas Lineal
        ctxGraficoVentas: document.getElementById('graficoVentas'), // Canvas Barras
        
        inputImagen: document.getElementById('productImagen'),
        previewContainer: document.getElementById('previewContainer'),
        imagePreview: document.getElementById('imagePreview')
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

    // ==========================================
    // LOGICA DE GRÁFICOS INDEPENDIENTES
    // ==========================================
    
    // Función para el gráfico lineal
    async function cargarReporteEvolucion() {
        try {
            const rango = elements.filtroEvolucion.value;
            const response = await AdminAuth.apiFetch(`/api/admin/reportes/ventas-tiempo?rango=${rango}`);
            if (!response.ok) throw new Error('Error al cargar datos de evolución');
            const data = await response.json();
            renderizarGraficoLineal(data);
        } catch (err) {
            showToast(err.message, 'danger');
        }
    }

    // Función para el gráfico de barras
    async function cargarReporteProductos() {
        try {
            const rango = elements.filtroTopProductos.value;
            const response = await AdminAuth.apiFetch(`/api/admin/reportes/top-productos?rango=${rango}`);
            if (!response.ok) throw new Error('Error al cargar top productos');
            const data = await response.json();
            renderizarGraficoBarras(data);
        } catch (err) {
            showToast(err.message, 'danger');
        }
    }

    // 1. Gráfico Lineal (Evolución)
    function renderizarGraficoLineal(datos) {
        const labels = datos.map(item => item.fecha);
        const ingresos = datos.map(item => parseFloat(item.total_ingresos));

        if (chartEvolucionInstance) {
            chartEvolucionInstance.data.labels = labels;
            chartEvolucionInstance.data.datasets[0].data = ingresos;
            chartEvolucionInstance.update();
        } else {
            chartEvolucionInstance = new Chart(elements.ctxGraficoEvolucion, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Ingresos Totales (S/)',
                        data: ingresos,
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#0d6efd',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 14 },
                            displayColors: false,
                            callbacks: {
                                label: function(context) { return 'S/ ' + context.parsed.y.toFixed(2); }
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false, drawBorder: false }, ticks: { color: '#6c757d' } },
                        y: { 
                            beginAtZero: true, 
                            grid: { color: '#e9ecef', borderDash: [5, 5], drawBorder: false }, 
                            ticks: { 
                                color: '#6c757d',
                                callback: function(value) { return 'S/ ' + value; }
                            } 
                        }
                    },
                    animation: { duration: 800, easing: 'easeOutQuart' }
                }
            });
        }
    }

    // 2. Gráfico de Barras (Productos)
    function renderizarGraficoBarras(datos) {
        const labels = datos.map(item => item.nombre);
        const cantidades = datos.map(item => item.total_vendido);

        if (chartInstance) {
            chartInstance.data.labels = labels;
            chartInstance.data.datasets[0].data = cantidades;
            chartInstance.update();
        } else {
            chartInstance = new Chart(elements.ctxGraficoVentas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Unidades vendidas',
                        data: cantidades,
                        backgroundColor: '#212529',
                        hoverBackgroundColor: '#495057',
                        borderRadius: 6,
                        maxBarThickness: 45
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 14 },
                            displayColors: false,
                            callbacks: {
                                label: function(context) { return context.parsed.y + ' unidades vendidas'; }
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false, drawBorder: false }, ticks: { color: '#6c757d' } },
                        y: { beginAtZero: true, grid: { color: '#e9ecef', borderDash: [5, 5], drawBorder: false }, ticks: { stepSize: 1, color: '#6c757d' } }
                    },
                    animation: { duration: 800, easing: 'easeOutQuart' }
                }
            });
        }
    }
    // ==========================================

    elements.inputImagen.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentBase64Image = e.target.result;
                elements.imagePreview.src = currentBase64Image;
                elements.previewContainer.classList.remove('d-none');
            };
            reader.readAsDataURL(file);
        } else {
            currentBase64Image = null;
            elements.imagePreview.src = '';
            elements.previewContainer.classList.add('d-none');
        }
    });

    function openProductModal(producto = null) {
        document.getElementById('productModalTitle').textContent = producto ? 'Editar producto' : 'Nuevo producto';
        document.getElementById('productId').value = producto ? producto.id : '';
        document.getElementById('productNombre').value = producto ? producto.nombre : '';
        document.getElementById('productDescripcion').value = producto ? (producto.descripcion || '') : '';
        document.getElementById('productPrecio').value = producto ? producto.precio : '';
        document.getElementById('productCategoria').value = producto ? producto.categoria : 'Mujeres';
        document.getElementById('productMarca').value = producto ? (producto.marca || '') : '';
        document.getElementById('productVisible').checked = producto ? producto.visible !== false : true;
        document.getElementById('productDestacado').checked = producto ? Boolean(producto.destacado) : false;
        document.getElementById('productEstado').value = producto ? (producto.estado || 'activo') : 'activo';

        elements.inputImagen.value = '';
        currentBase64Image = null;

        if (producto && producto.imagen_url) {
            currentBase64Image = producto.imagen_url;
            elements.imagePreview.src = producto.imagen_url;
            elements.previewContainer.classList.remove('d-none');
        } else {
            elements.imagePreview.src = '';
            elements.previewContainer.classList.add('d-none');
        }

        productModal.show();
    }

    async function saveProduct(e) {
        e.preventDefault();

        const id = document.getElementById('productId').value;
        const url = id ? `/api/admin/productos/${id}` : '/api/admin/productos';
        const method = id ? 'PUT' : 'POST';

        const payload = {
            nombre: document.getElementById('productNombre').value.trim(),
            descripcion: document.getElementById('productDescripcion').value.trim(),
            precio: parseFloat(document.getElementById('productPrecio').value),
            categoria: document.getElementById('productCategoria').value,
            marca: document.getElementById('productMarca').value.trim() || 'Palmas Street',
            imagen_url: currentBase64Image || '/media/media-logos/LogoPS.png',
            visible: document.getElementById('productVisible').checked,
            destacado: document.getElementById('productDestacado').checked,
            estado: document.getElementById('productEstado').value
        };

        try {
            const response = await AdminAuth.apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
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

    function switchView(viewName) {
        elements.btnAdminView.classList.toggle('active', viewName === 'admin');
        elements.btnClientView.classList.toggle('active', viewName === 'cliente');
        elements.btnReportesView.classList.toggle('active', viewName === 'reportes');
        
        elements.adminPanel.classList.toggle('d-none', viewName !== 'admin');
        elements.clientPreview.classList.toggle('d-none', viewName !== 'cliente');
        elements.reportsPanel.classList.toggle('d-none', viewName !== 'reportes');

        if (viewName !== 'reportes' && reporteInterval) {
            clearInterval(reporteInterval);
        }

        if (viewName === 'admin') loadProducts(false);
        if (viewName === 'cliente') loadProducts(true);
        if (viewName === 'reportes') {
            // Cargar los gráficos con el valor individual de cada select
            cargarReporteEvolucion();
            cargarReporteProductos();
            
            // Ambos gráficos se auto-actualizan cada 5s según su propio filtro actual
            if (reporteInterval) clearInterval(reporteInterval);
            reporteInterval = setInterval(() => {
                cargarReporteEvolucion();
                cargarReporteProductos();
            }, 5000); 
        }
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

    elements.btnAdminView.addEventListener('click', () => switchView('admin'));
    elements.btnClientView.addEventListener('click', () => switchView('cliente'));
    elements.btnReportesView.addEventListener('click', () => switchView('reportes'));

    // Eventos individuales cuando el usuario cambia un filtro
    elements.filtroEvolucion.addEventListener('change', cargarReporteEvolucion);
    elements.filtroTopProductos.addEventListener('change', cargarReporteProductos);

    loadProducts();
});