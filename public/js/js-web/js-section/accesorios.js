document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
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

  if (localStorage.getItem('tema') === 'dark') {
    body.classList.add('dark');
    if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark');
      const isDark = body.classList.contains('dark');
      if (themeIcon) themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      localStorage.setItem('tema', isDark ? 'dark' : 'light');
    });
  }

  async function cargarAccesorios() {
    try {
      const response = await fetch('/api/productos/accesorios');
      if (!response.ok) throw new Error('Error al obtener accesorios');

      const data = await response.json();

      todosLosProductos = data.map(producto => {
        const nombreStr = (producto.nombre || '').toLowerCase();
        let categoriaAsignada = 'varios';

        if (nombreStr.includes('anillo') || nombreStr.includes('arete') || nombreStr.includes('collar') || nombreStr.includes('pulsera') || nombreStr.includes('pin ')) {
          categoriaAsignada = 'joyeria';
        } else if (nombreStr.includes('bolso') || nombreStr.includes('mochila') || nombreStr.includes('riñonera') || nombreStr.includes('cartera') || nombreStr.includes('billetera') || nombreStr.includes('tarjetero')) {
          categoriaAsignada = 'bolsos';
        } else if (nombreStr.includes('gorra') || nombreStr.includes('gorro') || nombreStr.includes('sombrero') || nombreStr.includes('pasamontaña') || nombreStr.includes('bandana') || nombreStr.includes('bufanda')) {
          categoriaAsignada = 'cabeza';
        } else if (nombreStr.includes('casaca')) {
          categoriaAsignada = 'ropa';
        }

        return { ...producto, categoria_interna: categoriaAsignada };
      });

      construirFiltros();
      aplicarFiltros();
    } catch (error) {
      console.error('Error al cargar desde Supabase:', error);
      gridContainer.innerHTML = '<p class="text-center text-danger">Error al conectar con la base de datos.</p>';
    }
  }

  function construirFiltros() {
    if (!filtrosContainer) return;

    const botonesHTML = categoriasDefinidas.map(cat => `
      <button class="btn-categoria ${cat.id === 'todos' ? 'activo' : ''}" data-categoria="${cat.id}">
        ${cat.nombre}
      </button>
    `).join('');

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

    const searchInput = document.getElementById('searchInputJS');
    if (searchInput) {
      searchInput.addEventListener('input', event => {
        busquedaActual = event.target.value.toLowerCase();
        aplicarFiltros();
      });
    }

    document.querySelectorAll('.btn-categoria').forEach(boton => {
      boton.addEventListener('click', event => {
        document.querySelectorAll('.btn-categoria').forEach(btn => btn.classList.remove('activo'));
        event.currentTarget.classList.add('activo');
        categoriaActual = event.currentTarget.getAttribute('data-categoria');
        aplicarFiltros();
      });
    });
  }

  function aplicarFiltros() {
    const filtrados = todosLosProductos.filter(producto => {
      const coincideCategoria = categoriaActual === 'todos' || producto.categoria_interna === categoriaActual;
      const nombreProd = (producto.nombre || '').toLowerCase();
      const descProd = (producto.descripcion || '').toLowerCase();
      const coincideTexto = nombreProd.includes(busquedaActual) || descProd.includes(busquedaActual);

      return coincideCategoria && coincideTexto;
    });

    const msg = document.getElementById('noResultsMessage');
    if (msg) msg.style.display = filtrados.length === 0 ? 'block' : 'none';

    mostrarProductos(filtrados);
  }

  function mostrarProductos(productos) {
    gridContainer.innerHTML = '';

    productos.forEach(producto => {
      const imagen = producto.imagen_url || '/media/media-logos/LogoPS.png';
      const nombre = producto.nombre || 'Producto sin nombre';
      const descripcion = producto.descripcion || 'Sin descripción';
      const precio = Number(producto.precio || 0).toFixed(2);

      const card = document.createElement('div');
      card.className = 'card h-100 accesorio-card';

      card.innerHTML = `
        <div class="img-container" style="background-color: white; border-top-left-radius: 8px; border-top-right-radius: 8px; padding: 10px;">
          <img src="${PalmasCart.escapeHTML(imagen)}" class="card-img-top" alt="${PalmasCart.escapeHTML(nombre)}" style="object-fit: contain; height: 200px; width: 100%;" onerror="this.src='/media/media-logos/LogoPS.png'">
        </div>

        <div class="card-body d-flex flex-column align-items-center justify-content-center" style="text-align: center; width: 100%;">
          <h6 class="fw-bold mb-1" style="font-size: 1.05rem; text-align: center; width: 100%; margin: 0 auto;">${PalmasCart.escapeHTML(nombre)}</h6>
          <p class="text-secondary" style="font-size: 0.9rem; min-height: 45px; margin-bottom: 15px; text-align: center; width: 100%;">
            ${PalmasCart.escapeHTML(descripcion)}
          </p>

          <div class="mt-auto d-flex flex-column align-items-center justify-content-center" style="width: 100%;">
            <p class="price fw-bold mb-2" style="font-size: 1.2rem; text-align: center; margin: 0 auto;">
              S/ ${precio}
            </p>

            <div class="quantity-controls-group mb-3 mt-1" style="display: flex; justify-content: center; align-items: center; gap: 15px; width: 100%;">
              <button class="btn-qty btn-minus" type="button">-</button>
              <span class="quantity-display quantity" style="width: 30px; text-align: center; font-weight: bold; font-size: 1.1rem;">1</span>
              <button class="btn-qty btn-plus" type="button">+</button>
            </div>

            <button type="button" class="btn btn-add-cart d-flex justify-content-center align-items-center gap-2" style="margin: 0 auto; padding: 8px 16px;">
              <i class="fa-solid fa-cart-plus"></i> Añadir al Carrito
            </button>
          </div>
        </div>
      `;

      const btnMinus = card.querySelector('.btn-minus');
      const btnPlus = card.querySelector('.btn-plus');
      const qtySpan = card.querySelector('.quantity');
      const btnAdd = card.querySelector('.btn-add-cart');

      btnPlus.addEventListener('click', () => {
        qtySpan.textContent = Number(qtySpan.textContent) + 1;
      });

      btnMinus.addEventListener('click', () => {
        const qty = Number(qtySpan.textContent);
        if (qty > 1) qtySpan.textContent = qty - 1;
      });

      btnAdd.addEventListener('click', () => {
        PalmasCart.addToCart(producto, Number(qtySpan.textContent));

        const originalText = btnAdd.innerHTML;
        btnAdd.innerHTML = '<i class="fa-solid fa-check"></i> ¡Añadido!';
        btnAdd.classList.add('btn-success');
        btnAdd.disabled = true;

        setTimeout(() => {
          btnAdd.innerHTML = originalText;
          btnAdd.classList.remove('btn-success');
          btnAdd.disabled = false;
        }, 1200);
      });

      gridContainer.appendChild(card);
    });
  }

  cargarAccesorios();
});
