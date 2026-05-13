document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    // ==========================================
    // 1. CARGAR PRODUCTOS DESDE LA BASE DE DATOS
    // ==========================================
    async function cargarProductos() {
        try {
            // Llamamos al endpoint que ya tienes en server.js
            const response = await fetch('/api/productos/hombres');
            if (!response.ok) throw new Error('Error en la red');
            
            const productos = await response.json();

            // Limpiamos el grid por si hubiera contenido previo
            productsGrid.innerHTML = '';

            // Iteramos sobre los productos obtenidos de Supabase
            productos.forEach(producto => {
                // Formateamos el precio para que tenga 2 decimales
                const precioFormateado = parseFloat(producto.precio).toFixed(2);
                
                // Si no hay imagen en la BD, ponemos una por defecto
                const imagen = producto.imagen_url || '/media/media-sections/men/ropa1.jpeg';
                const marca = producto.marca || 'Palmas Street';

                // Creamos el contenedor de la columna para la cuadrícula
                const articleCol = document.createElement('div');
                articleCol.className = 'col product-item';

                // ✅ CORRECCIÓN: HTML limpio, sin estilos "en línea" (style="")
                articleCol.innerHTML = `
                    <div class="card h-100 border-0 shadow-sm hover-card">
                      <div class="product-image-container overflow-hidden">
                        <img src="${imagen}" class="card-img-top w-100 h-100" style="object-fit: cover;" alt="${producto.nombre}">
                      </div>
                      
                      <div class="card-body d-flex flex-column text-center p-3">
                        <h5 class="card-title fw-bold product-title mb-1">${producto.nombre}</h5>
                        <h6 class="card-subtitle mb-2 fw-bold marca-text">Marca: ${marca}</h6>
                        
                        <p class="card-text text-muted flex-grow-1 mt-2 product-description">${producto.descripcion || 'Sin descripción disponible.'}</p>
                        <span class="fs-5 fw-bold price mb-3">S/ ${precioFormateado}</span>
                        
                        <div class="d-flex justify-content-center align-items-center mb-3 gap-2 quantity-selector">
                          <button type="button" class="btn btn-qty btn-minus btn-sm">-</button>
                          <input type="text" class="form-control form-control-sm text-center qty-input" value="1" readonly style="width: 50px;">
                          <button type="button" class="btn btn-qty btn-plus btn-sm">+</button>
                        </div>
                        
                        <button type="button" class="btn btn-primary w-100 fw-bold shadow-sm btn-cart-add">Añadir al Carrito</button>
                      </div>
                    </div>
                `;
                
                productsGrid.appendChild(articleCol);
            });

            // Inicializamos la lógica de botones de cantidad después de que las tarjetas existen
            inicializarBotonesCantidad();

        } catch (error) {
            console.error("❌ Error al cargar los productos:", error);
            productsGrid.innerHTML = '<div class="col-12 text-center text-muted"><p>No se pudieron cargar los productos en este momento.</p></div>';
        }
    }

    // ==========================================
    // 2. LÓGICA DE CANTIDAD (+ y -)
    // ==========================================
    function inicializarBotonesCantidad() {
        document.querySelectorAll('.product-item').forEach(item => {
            const btnMinus = item.querySelector('.btn-minus');
            const btnPlus = item.querySelector('.btn-plus');
            const qtyInput = item.querySelector('.qty-input');

            if (btnPlus && btnMinus && qtyInput) {
                btnPlus.addEventListener('click', () => {
                    let currentValue = parseInt(qtyInput.value);
                    qtyInput.value = currentValue + 1;
                });

                btnMinus.addEventListener('click', () => {
                    let currentValue = parseInt(qtyInput.value);
                    if (currentValue > 1) {
                        qtyInput.value = currentValue - 1;
                    }
                });
            }
        });
    }

    // ==========================================
    // 3. LÓGICA DEL BUSCADOR
    // ==========================================
    function filterProducts(term) {
        const dynamicProducts = document.querySelectorAll('.product-item');
        
        dynamicProducts.forEach(product => {
            const title = product.querySelector('.product-title').textContent.toLowerCase();
            if (title.includes(term)) {
                product.style.display = 'block'; 
            } else {
                product.style.display = 'none';
            }
        });
    }

    if (searchInput && clearSearchBtn) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            if (searchTerm.length > 0) {
                clearSearchBtn.classList.remove('d-none');
            } else {
                clearSearchBtn.classList.add('d-none');
            }

            filterProducts(searchTerm);
        });

        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = ''; 
            clearSearchBtn.classList.add('d-none'); 
            filterProducts(''); 
            searchInput.focus(); 
        });
    }

    // Inicializamos la carga al levantar la página
    cargarProductos();
});