document.addEventListener('DOMContentLoaded', () => {
    // 1. Carga inicial desde la BD (Ajusta 'masculino' si en tu BD es diferente)
    cargarProductosHombres('masculino'); 

    // 2. Lógica de Búsqueda Instantánea
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const products = document.querySelectorAll('.product-item');

            products.forEach(product => {
                const title = product.querySelector('.product-title').textContent.toLowerCase();
                // Filtro visual: si coincide se muestra, si no se oculta
                product.style.display = title.includes(term) ? 'block' : 'none';
            });
        });
    }
});

async function cargarProductosHombres(categoria) {
    const grid = document.getElementById('productsGrid');
    try {
        const response = await fetch(`/api/productos?categoria=${categoria}`);
        const productos = await response.json();
        
        grid.innerHTML = ''; // Limpia el spinner de carga

        if (productos.length === 0) {
            grid.innerHTML = `<div class="col-12 text-center py-5 w-100">
                <h4 class="text-muted">No hay productos disponibles para hombres.</h4>
            </div>`;
            return;
        }

        productos.forEach(prod => {
            const imgUrl = prod.imagen_url.startsWith('/') ? prod.imagen_url : '/' + prod.imagen_url;
            
            grid.innerHTML += `
                <div class="col product-item">
                    <article class="card h-100 border-0 shadow-sm hover-card">
                        <div class="card-img-wrapper" style="height: 380px; overflow: hidden; position: relative;">
                            <img src="${imgUrl}" class="card-img-top w-100 h-100" style="object-fit: cover;" alt="${prod.nombre}" onerror="this.src='/media/media-logos/LogoPS.png'">
                        </div>
                        <div class="card-body d-flex flex-column text-center p-4">
                            <h5 class="card-title fw-bold product-title" style="color: #1a2b4c;">${prod.nombre}</h5>
                            <p class="card-text text-muted flex-grow-1">${prod.descripcion}</p>
                            <div class="mt-auto pt-3">
                                <span class="fs-4 fw-bold text-dark d-block mb-3">S/ ${prod.precio}</span>
                                <button class="btn btn-dark w-100 fw-semibold" onclick="agregarAlCarrito(${prod.id})">Añadir al carrito</button>
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

function agregarAlCarrito(id) {
    alert(`¡Producto ${id} añadido al carrito!`);
}