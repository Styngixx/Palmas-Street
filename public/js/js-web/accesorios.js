document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const body = document.body;
    const gridContainer = document.getElementById('accesoriosGrid');
    const searchInput = document.getElementById('accessorySearch');
    let todosLosProductos = [];

    // --- 1. LÓGICA MODO OSCURO ---
    if (localStorage.getItem("tema") === "dark") {
        body.classList.add("dark");
        if(themeIcon) themeIcon.className = "fa-solid fa-sun";
    }

    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark");
        const isDark = body.classList.contains("dark");
        themeIcon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
        localStorage.setItem("tema", isDark ? "dark" : "light");
    });

    // --- 2. CARGAR DESDE API ---
    async function cargarAccesorios() {
        try {
            const response = await fetch('/api/productos/accesorios');
            todosLosProductos = await response.json();
            mostrarProductos(todosLosProductos);
        } catch (error) {
            console.error("Error:", error);
            gridContainer.innerHTML = "<p>Error al conectar con el servidor.</p>";
        }
    }

    // --- 3. MOSTRAR TARJETAS ---
    function mostrarProductos(productos) {
        gridContainer.innerHTML = '';
        productos.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${p.imagen_url}" class="card-img-top" alt="${p.nombre}">
                <div class="card-body text-center">
                    <h5 class="fw-bold">${p.nombre}</h5>
                    <p class="card-text-desc">${p.descripcion || 'Sin descripción'}</p>
                    <p class="price fw-bold mb-3" style="font-size: 1.2rem;">S/ ${parseFloat(p.precio).toFixed(2)}</p>
                    
                    <div class="d-flex align-items-center justify-content-center mb-3">
                        <button class="btn-qty btn-minus">-</button>
                        <span class="quantity mx-3 fw-bold" style="font-size: 1.1rem;">1</span>
                        <button class="btn-qty btn-plus">+</button>
                    </div>
                    
                    <button class="btn btn-primary w-100 add-to-cart">
                        <i class="fa-solid fa-cart-plus me-2"></i>Añadir al Carrito
                    </button>
                </div>
            `;

            // Lógica interna de botones + y -
            const btnMinus = card.querySelector('.btn-minus');
            const btnPlus = card.querySelector('.btn-plus');
            const qtySpan = card.querySelector('.quantity');

            btnPlus.addEventListener('click', () => {
                qtySpan.textContent = parseInt(qtySpan.textContent) + 1;
            });

            btnMinus.addEventListener('click', () => {
                let qty = parseInt(qtySpan.textContent);
                if (qty > 1) qtySpan.textContent = qty - 1;
            });

            gridContainer.appendChild(card);
        });
    }

    // --- 4. BUSCADOR DINÁMICO ---
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filtrados = todosLosProductos.filter(p => 
            p.nombre.toLowerCase().includes(query) || 
            (p.descripcion || '').toLowerCase().includes(query)
        );
        mostrarProductos(filtrados);
    });

    cargarAccesorios();
});