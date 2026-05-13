document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('accesoriosGrid');
    const searchInput = document.getElementById('accessorySearch');
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    let todosLosProductos = []; // Variable para almacenar los datos de la BD

    async function cargarAccesorios() {
        try {
            const response = await fetch('/api/productos/accesorios');
            if (!response.ok) throw new Error("Error de red");

            todosLosProductos = await response.json();
            mostrarProductos(todosLosProductos); // Mostrar todo al inicio
        } catch (error) {
            console.error("❌ Error:", error);
            gridContainer.innerHTML = "<p style='color:white;'>Error al conectar con la base de datos.</p>";
        }
    }

    // Función encargada de pintar las tarjetas en el HTML
    function mostrarProductos(productos) {
        gridContainer.innerHTML = ''; 

        if (productos.length === 0) {
            if (noResultsMessage) noResultsMessage.style.display = 'block';
            return;
        }

        if (noResultsMessage) noResultsMessage.style.display = 'none';

        productos.forEach(p => {
            const card = `
                <div class="card">
                    <img src="${p.imagen_url}" class="card-img-top" alt="${p.nombre}" onerror="this.src='/media/placeholder.jpg'">
                    <div class="card-body">
                        <h5 class="card-title">${p.nombre}</h5>
                        <p class="brand"><strong>${p.marca || 'Genérico'}</strong></p>
                        <p class="card-text">${p.descripcion || ''}</p>
                        <p class="price">S/ ${parseFloat(p.precio).toFixed(2)}</p>
                        <div class="quantity-controls d-flex align-items-center justify-content-center mb-2">
                            <button class="btn btn-outline-secondary btn-sm"> - </button>
                            <span class="quantity mx-2">1</span>
                            <button class="btn btn-outline-secondary btn-sm"> + </button>
                        </div>
                        <button class="btn btn-primary add-to-cart">Añadir al Carrito</button>
                    </div>
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
            const nombre = p.nombre.toLowerCase();
            const marca = (p.marca || '').toLowerCase();
            const descripcion = (p.descripcion || '').toLowerCase();
            
            return nombre.includes(query) || marca.includes(query) || descripcion.includes(query);
        });

        mostrarProductos(productosFiltrados);
    });

    cargarAccesorios();
});