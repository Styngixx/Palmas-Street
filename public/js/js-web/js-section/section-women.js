document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar productos
    cargarProductosMujeres('Mujeres'); 

    // 2. Lógica del Dark Mode (Página entera)
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const icon = themeToggleBtn.querySelector('i');
            
            // Cambiar el ícono entre luna (oscuro) y sol (claro)
            if(document.body.classList.contains('dark-mode')){
                icon.classList.replace('bi-moon-fill', 'bi-sun-fill');
                icon.classList.add('text-warning'); // Sol amarillo
            } else {
                icon.classList.replace('bi-sun-fill', 'bi-moon-fill');
                icon.classList.remove('text-warning');
            }
        });
    }

    // 3. Lógica de Búsqueda local
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const products = document.querySelectorAll('.product-item');

            products.forEach(product => {
                const title = product.querySelector('.product-title').textContent.toLowerCase();
                product.style.display = title.includes(term) ? 'block' : 'none';
            });
        });
    }
});

async function cargarProductosMujeres(categoria) {
    const grid = document.getElementById('productsGrid');
    try {
        const response = await fetch(`/api/productos?categoria=${categoria}`);
        if (!response.ok) throw new Error("Error en la ruta de la API");
        
        const productos = await response.json();
        grid.innerHTML = ''; 

        if (productos.length === 0) {
            grid.innerHTML = `<div class="col-12 text-center py-5 w-100"><h4 class="text-muted">No hay productos disponibles por ahora.</h4></div>`;
            return;
        }

        // Generar las tarjetas
        productos.forEach(prod => {
            const imgUrl = prod.imagen_url.startsWith('/') ? prod.imagen_url : '/' + prod.imagen_url;
            const marca = prod.marca ? prod.marca : 'Palmas Street'; 
            
            grid.innerHTML += `
                <div class="col product-item">
                    <article class="card h-100 custom-card text-center">
                        <div class="card-img-wrapper">
                            <img src="${imgUrl}" class="card-img-top w-100 h-100" alt="${prod.nombre}" onerror="this.src='/media/media-logos/LogoPS.png'">
                        </div>
                        <div class="card-body d-flex flex-column p-4">
                            <h6 class="card-title fw-bold product-title mb-0">${prod.nombre}</h6>
                            <small class="mb-3 d-block" style="color: var(--text-muted);">Marca: ${marca}</small>
                            <p class="card-text flex-grow-1" style="font-size: 0.85rem; color: var(--text-muted);">${prod.descripcion}</p>
                            
                            <div class="mt-auto pt-3 border-top" style="border-color: var(--border-color) !important;">
                                <span class="fs-4 fw-bold d-block mb-3 price-text">S/ ${prod.precio}</span>
                                
                                <div class="d-flex justify-content-center align-items-center mb-3 gap-3">
                                    <button class="btn qty-btn" onclick="cambiarCantidad(this, -1)">
                                        <i class="bi bi-dash"></i>
                                    </button>
                                    <span class="qty-val fw-bold fs-5" style="min-width: 25px;">1</span>
                                    <button class="btn qty-btn" onclick="cambiarCantidad(this, 1)">
                                        <i class="bi bi-plus"></i>
                                    </button>
                                </div>

                                <button class="btn custom-add-btn w-100 fw-semibold" onclick="agregarAlCarrito(${prod.id}, this)">
                                    <i class="bi bi-cart-plus me-2"></i> Añadir al Carrito
                                </button>
                            </div>
                        </div>
                    </article>
                </div>`;
        });
    } catch (error) {
        console.error('Error:', error);
        grid.innerHTML = '<h4 class="text-danger text-center w-100">Error al conectar con la base de datos</h4>';
    }
}

// Función para cambiar cantidad (Asegura que no baje de 1)
window.cambiarCantidad = function(btn, cambio) {
    const span = btn.parentElement.querySelector('.qty-val');
    let valorActual = parseInt(span.innerText);
    let nuevoValor = valorActual + cambio;
    if (nuevoValor >= 1) {
        span.innerText = nuevoValor;
    }
};

// Función para registrar en el Carrito (Conectado a server.js)
window.agregarAlCarrito = async function(productoId, btn) {
    const cantidad = parseInt(btn.parentElement.querySelector('.qty-val').innerText);
    const originText = btn.innerHTML;
    
    // Cambiar estado del botón temporalmente
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Añadiendo...`;
    btn.disabled = true;

    try {
        // En tu DB asumo que un usuario_id es necesario, lo pongo fijo como 1 (ejemplo de sesión)
        const response = await fetch('/api/carrito', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario_id: 1, 
                producto_id: productoId,
                cantidad: cantidad
            })
        });

        if (response.ok) {
            // Actualizar número del carrito en el Navbar
            const badge = document.getElementById('cartBadge');
            badge.innerText = parseInt(badge.innerText) + cantidad;
            
            // Éxito
            btn.innerHTML = `<i class="bi bi-check2-circle"></i> ¡Añadido!`;
            btn.classList.replace('custom-add-btn', 'btn-success');
        } else {
            throw new Error('Error al añadir');
        }
    } catch (error) {
        console.error("Error al guardar carrito:", error);
        alert("Hubo un problema al añadir al carrito.");
    } finally {
        // Regresar el botón a la normalidad después de 2 segundos
        setTimeout(() => {
            btn.innerHTML = originText;
            btn.classList.remove('btn-success');
            btn.classList.add('custom-add-btn');
            btn.disabled = false;
        }, 2000);
    }
};