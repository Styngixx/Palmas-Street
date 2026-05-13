document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('productsGrid'); // Cambiado al ID de la sección damas
    const searchInput = document.getElementById('searchInput'); // Cambiado al ID de tu buscador
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    let todosLosProductos = []; // Variable para almacenar los datos de la BD

    async function cargarRopaDama() {
        try {
            // Asegúrate de que esta URL sea el endpoint correcto en tu backend para ropa de dama
            const response = await fetch('/api/productos/Mujeres'); 
            if (!response.ok) throw new Error("Error de red");

            todosLosProductos = await response.json();
            mostrarProductos(todosLosProductos); // Mostrar todo al inicio
        } catch (error) {
            console.error("❌ Error:", error);
            gridContainer.innerHTML = "<div class='col-12 text-center'><p class='text-danger'>Error al conectar con la base de datos.</p></div>";
        }
    }

    // Función encargada de inyectar las tarjetas en el HTML
    function mostrarProductos(productos) {
        gridContainer.innerHTML = ''; 

        if (productos.length === 0) {
            if (noResultsMessage) noResultsMessage.style.display = 'block';
            return;
        }

        if (noResultsMessage) noResultsMessage.style.display = 'none';

        // Recorremos los productos y armamos la estructura HTML exacta que tenías
        productos.forEach(p => {
            const card = `
                <div class="col product-item">
                    <article class="card h-100 border-0 shadow-sm hover-card">
                        <div class="overflow-hidden" style="height: 350px; background-color: #f9f9f9;">
                            <img src="${p.imagen_url}" class="card-img-top w-100 h-100"
                                style="object-fit: cover;" alt="${p.nombre}" onerror="this.src='/media/placeholder.jpg'">
                        </div>
                        <div class="card-body d-flex flex-column text-center p-4">
                            <h5 class="card-title fw-bold product-title" style="color: #d63384;">
                                ${p.nombre}
                            </h5>
                            <p class="card-text text-muted flex-grow-1" style="font-size: 14px;">
                                ${p.descripcion || 'Sin descripción disponible.'}
                            </p>
                            <div class="mt-3">
                                <span class="fs-5 fw-bold text-dark d-block mb-3">
                                    S/ ${parseFloat(p.precio).toFixed(2)}
                                </span>
                                <div class="d-flex justify-content-center align-items-center gap-3">
                                    <button class="btn btn-outline-dark btn-sm decrease-btn">-</button>
                                    <span class="fw-bold quantity">1</span>
                                    <button class="btn btn-outline-dark btn-sm increase-btn">+</button>
                                    <button class="btn btn-dark w-100 d-flex justify-content-center align-items-center gap-2 py-2 rounded-3 shadow-sm add-to-cart" aria-label="Añadir al carrito">
                                        <i class="bi bi-cart-plus-fill fs-5"></i>
                                        <span class="fw-medium">Añadir</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            `;
            gridContainer.innerHTML += card;
        });
    }

    // Lógica de búsqueda dinámica
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        
        // Filtramos sobre el array que trajimos de la BD
        const productosFiltrados = todosLosProductos.filter(p => {
            const nombre = (p.nombre || '').toLowerCase();
            const descripcion = (p.descripcion || '').toLowerCase();
            // Buscamos coincidencias en el nombre o en la descripción
            return nombre.includes(query) || descripcion.includes(query);
        });

        mostrarProductos(productosFiltrados);
    });

    // Delegación de eventos para los botones de cantidad (ya que se generan dinámicamente)
    gridContainer.addEventListener('click', function(e) {
        // Lógica para incrementar
        if (e.target.classList.contains('increase-btn') || e.target.closest('.increase-btn')) {
            const btn = e.target.classList.contains('increase-btn') ? e.target : e.target.closest('.increase-btn');
            const quantityElement = btn.parentElement.querySelector('.quantity');
            let quantity = parseInt(quantityElement.textContent);
            quantityElement.textContent = quantity + 1;
        }

        // Lógica para disminuir
        if (e.target.classList.contains('decrease-btn') || e.target.closest('.decrease-btn')) {
            const btn = e.target.classList.contains('decrease-btn') ? e.target : e.target.closest('.decrease-btn');
            const quantityElement = btn.parentElement.querySelector('.quantity');
            let quantity = parseInt(quantityElement.textContent);
            if (quantity > 1) {
                quantityElement.textContent = quantity - 1;
            }
        }
    });

    // Llamada inicial para traer los productos
    cargarRopaDama();
});