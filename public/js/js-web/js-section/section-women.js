document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');
    const noResultsMessage = document.getElementById('noResultsMessage');
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    let todosLosProductos = []; 

    // 1. GESTIÓN DE TEMA
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if(themeIcon) themeIcon.classList.replace('bi-moon-fill', 'bi-sun-fill');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            if (isDark) {
                themeIcon.classList.replace('bi-moon-fill', 'bi-sun-fill');
            } else {
                themeIcon.classList.replace('bi-sun-fill', 'bi-moon-fill');
            }
        });
    }

    // 2. CARGA DE DATOS
    async function cargarProductos() {
        try {
            const response = await fetch('/api/productos/Mujeres'); 
            if (!response.ok) throw new Error("Error al obtener datos");
            const data = await response.json();
            
            // Usar la lista completa de la API
            todosLosProductos = data;
            
            // Filtrar en el frontend para asegurar categoría correcta
            const productosMujeres = todosLosProductos.filter(p => 
                p.categoria && (p.categoria.toLowerCase() === 'mujeres' || p.categoria.toLowerCase() === 'mujer')
            );
            
            // Si no hay productos, mostrar mensaje
            if (productosMujeres.length === 0) {
                 gridContainer.innerHTML = `<p class="text-muted text-center w-100 fs-5 mt-5">No hay productos disponibles en esta categoría.</p>`;
                 return;
            }

            renderizar(productosMujeres); 
        } catch (error) {
            console.error("Error:", error);
            gridContainer.innerHTML = `<p class="text-danger text-center w-100 fs-5 mt-5">No se pudo conectar con el servidor.</p>`;
        }
    }

    // 3. RENDERIZADO DINÁMICO HORIZONTAL
    function renderizar(lista) {
        gridContainer.innerHTML = '';
        noResultsMessage.style.display = lista.length === 0 ? 'block' : 'none';

        lista.forEach(p => {
            // Nueva estructura de tarjeta horizontal
            const html = `
                <div class="col product-wrapper">
                    <article class="card h-100 shadow-sm transition-theme">
                        <div class="card-content-wrapper transition-theme">
                            <div class="image-container transition-theme">
                                <img src="${p.imagen_url}" class="card-img-horizontal" alt="${p.nombre}" 
                                     onerror="this.src='/media/placeholder.jpg'">
                            </div>
                            <div class="details-container">
                                <h2 class="fw-bold product-title transition-theme">${p.nombre}</h2>
                                <p class="fw-bold price-text transition-theme mb-2">S/ ${parseFloat(p.precio).toFixed(2)}</p>
                                <p class="text-muted transition-theme description-text flex-grow-1">${p.descripcion || 'Sin descripción disponible.'}</p>
                                
                                <div class="mt-auto">
                                    <div class="mb-3 d-flex justify-content-center">
                                         <input type="number" class="quantity-input form-control transition-theme" value="1" min="1" step="1" aria-label="Cantidad">
                                    </div>
                                    
                                    <button class="btn btn-add-to-cart w-100 d-flex justify-content-center align-items-center gap-2 py-2 rounded-3 shadow-sm add-to-cart transition-theme" aria-label="Añadir al carrito">
                                        <i class="bi bi-cart3 fs-6"></i>
                                        <span class="fw-medium">Añadir al Carrito</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>`;
            gridContainer.insertAdjacentHTML('beforeend', html);
        });
    }

    // 4. BÚSQUEDA Y EVENTOS
    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        // Filtrar solo productos de la categoría correcta
        const productosMujeres = todosLosProductos.filter(p => 
                p.categoria && (p.categoria.toLowerCase() === 'mujeres' || p.categoria.toLowerCase() === 'mujer')
        );
        const filtrados = productosMujeres.filter(p => 
            p.nombre.toLowerCase().includes(query) || (p.descripcion && p.descripcion.toLowerCase().includes(query))
        );
        renderizar(filtrados);
    });

    // Delegación de eventos simplificada (solo para Añadir)
    gridContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart');
        if (!btn) return;

        // Buscar el contenedor de la tarjeta para obtener el input
        const card = btn.closest('.details-container');
        const qtyInput = card.querySelector('.quantity-input');
        const quantityValue = parseInt(qtyInput.value) || 1;

        // Alerta con cantidad del input
        alert(`Producto añadido al carrito. Cantidad: ${quantityValue}`);
    });

    initTheme();
    cargarProductos();
});