document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const body = document.body;
    const gridContainer = document.getElementById('accesoriosGrid');
    const filtrosContainer = document.getElementById('filtrosContainer');
    
    let todosLosProductos = []; 
    let categoriaActual = 'todos';
    let busquedaActual = '';

    const categoriasDefinidas = [
        { id: 'todos', nombre: 'Todos' },
        { id: 'joyeria', nombre: 'Joyería' },
        { id: 'bolsos', nombre: 'Bolsos y Mochilas' },
        { id: 'cabeza', nombre: 'Gorros y Cuello' },
        { id: 'ropa', nombre: 'Ropa' },
        { id: 'varios', nombre: 'Varios' }
    ];

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

    // --- 2. CARGAR DESDE SUPABASE Y AUTO-CLASIFICAR ---
    async function cargarAccesorios() {
        try {
            const response = await fetch('/api/productos/accesorios');
            const data = await response.json();
            
            // Aquí hacemos la magia: leemos el nombre y le asignamos tu categoría exacta
            todosLosProductos = data.map(p => {
                const nombreStr = (p.nombre || '').toLowerCase();
                let categoriaAsignada = 'varios'; // Por defecto, todo lo que no coincida va a Varios

                if (nombreStr.includes('anillo') || nombreStr.includes('arete') || nombreStr.includes('collar') || nombreStr.includes('pulsera') || nombreStr.includes('pin ')) {
                    categoriaAsignada = 'joyeria';
                } else if (nombreStr.includes('bolso') || nombreStr.includes('mochila') || nombreStr.includes('riñonera') || nombreStr.includes('cartera') || nombreStr.includes('billetera') || nombreStr.includes('tarjetero')) {
                    categoriaAsignada = 'bolsos';
                } else if (nombreStr.includes('gorra') || nombreStr.includes('gorro') || nombreStr.includes('sombrero') || nombreStr.includes('pasamontaña') || nombreStr.includes('bandana') || nombreStr.includes('bufanda')) {
                    categoriaAsignada = 'cabeza';
                } else if (nombreStr.includes('casaca')) {
                    categoriaAsignada = 'ropa'; // Solo la casaca va a ropa
                }

                // Devolvemos el producto con nuestra nueva categoría
                return { ...p, categoria_interna: categoriaAsignada };
            });
            
            construirFiltros();
            aplicarFiltros();
            
        } catch (error) {
            console.error("Error al cargar desde Supabase:", error);
            gridContainer.innerHTML = "<p>Error al conectar con la base de datos.</p>";
        }
    }

    // --- 3. CONSTRUIR UI DE FILTROS ---
    function construirFiltros() {
        let botonesHTML = categoriasDefinidas.map(cat => 
            `<button class="btn-categoria ${cat.id === 'todos' ? 'activo' : ''}" data-categoria="${cat.id}">
                ${cat.nombre}
            </button>`
        ).join('');

        filtrosContainer.innerHTML = `
            <div class="search-and-filter-wrapper">
                <div class="search-input-container">
                    <i class="fa-solid fa-magnifying-glass search-icon"></i>
                    <input id="searchInputJS" type="text" placeholder="Buscar un accesorio...">
                </div>
                <div class="categorias-container">
                    ${botonesHTML}
                </div>
            </div>
            <p id="noResultsMessage" style="display: none; text-align: center; margin-top: 20px;">No se encontraron accesorios.</p>
        `;

        document.getElementById('searchInputJS').addEventListener('input', (e) => {
            busquedaActual = e.target.value.toLowerCase();
            aplicarFiltros();
        });

        const botones = document.querySelectorAll('.btn-categoria');
        botones.forEach(boton => {
            boton.addEventListener('click', (e) => {
                botones.forEach(b => b.classList.remove('activo'));
                e.target.classList.add('activo');
                categoriaActual = e.target.getAttribute('data-categoria');
                aplicarFiltros();
            });
        });
    }

    // --- 4. APLICAR FILTROS (UTILIZANDO LA AUTO-CLASIFICACIÓN) ---
    function aplicarFiltros() {
        const filtrados = todosLosProductos.filter(p => {
            // Filtramos usando la categoría que le asignamos nosotros en base a su nombre
            const coincideCategoria = (categoriaActual === 'todos') || (p.categoria_interna === categoriaActual);
            
            const nombreProd = p.nombre ? p.nombre.toLowerCase() : '';
            const descProd = p.descripcion ? p.descripcion.toLowerCase() : '';
            const coincideTexto = nombreProd.includes(busquedaActual) || descProd.includes(busquedaActual);
            
            return coincideCategoria && coincideTexto;
        });

        const msg = document.getElementById('noResultsMessage');
        msg.style.display = filtrados.length === 0 ? 'block' : 'none';
        
        mostrarProductos(filtrados);
    }

    // --- 5. MOSTRAR TARJETAS (Mantiene todo centrado y estético) ---
    function mostrarProductos(productos) {
        gridContainer.innerHTML = '';
        productos.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card h-100 accesorio-card'; 
            
            card.innerHTML = `
                <div class="img-container" style="background-color: white; border-top-left-radius: 8px; border-top-right-radius: 8px; padding: 10px;">
                    <img src="${p.imagen_url}" class="card-img-top" alt="${p.nombre}" style="object-fit: contain; height: 200px; width: 100%;">
                </div>
                
                <div class="card-body d-flex flex-column align-items-center justify-content-center" style="text-align: center; width: 100%;">
                    
                    <h6 class="fw-bold mb-1" style="font-size: 1.05rem; text-align: center; width: 100%; margin: 0 auto;">${p.nombre}</h6>
                    <p class="text-secondary" style="font-size: 0.9rem; min-height: 45px; margin-bottom: 15px; text-align: center; width: 100%;">
                        ${p.descripcion || 'Sin descripción'}
                    </p>
                    
                    <div class="mt-auto d-flex flex-column align-items-center justify-content-center" style="width: 100%;">
                        
                        <p class="price fw-bold mb-2" style="font-size: 1.2rem; text-align: center; margin: 0 auto;">
                            S/ ${parseFloat(p.precio).toFixed(2)}
                        </p>
                        
                        <div class="quantity-controls-group mb-3 mt-1" style="display: flex; justify-content: center; align-items: center; gap: 15px; width: 100%;">
                            <button class="btn-qty btn-minus" type="button">-</button>
                            <span class="quantity-display quantity" style="width: 30px; text-align: center; font-weight: bold; font-size: 1.1rem;">1</span>
                            <button class="btn-qty btn-plus" type="button">+</button>
                        </div>
                        
                        <button class="btn btn-add-cart d-flex justify-content-center align-items-center gap-2" style="margin: 0 auto; padding: 8px 16px;">
                            <i class="fa-solid fa-cart-plus"></i> Añadir al Carrito
                        </button>
                        
                    </div>
                </div>
            `;

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

    cargarAccesorios();
});