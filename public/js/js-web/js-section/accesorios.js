document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const body = document.body;
  const gridContainer = document.getElementById('accesoriosGrid');
  const searchInput = document.getElementById('accessorySearch');
  const noResultsMessage = document.getElementById('noResultsMessage');

  let todosLosProductos = [];

  if (localStorage.getItem('tema') === 'dark') {
    body.classList.add('dark');
    if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      body.classList.toggle('dark');

      const isDark = body.classList.contains('dark');

      if (themeIcon) {
        themeIcon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }

      localStorage.setItem('tema', isDark ? 'dark' : 'light');
    });
  }

  async function cargarAccesorios() {
    try {
      const response = await fetch('/api/productos/accesorios');

      if (!response.ok) {
        throw new Error('Error al obtener accesorios');
      }

      todosLosProductos = await response.json();
      mostrarProductos(todosLosProductos);
    } catch (error) {
      console.error('Error:', error);
      gridContainer.innerHTML = '<p class="text-center text-danger">Error al conectar con el servidor.</p>';
    }
  }

  function mostrarProductos(productos) {
    gridContainer.innerHTML = '';

    if (noResultsMessage) {
      noResultsMessage.style.display = productos.length ? 'none' : 'block';
    }

    if (!productos.length) {
      return;
    }

    productos.forEach(producto => {
      const imagen = producto.imagen_url || '/media/media-logos/LogoPS.png';
      const nombre = producto.nombre || 'Producto sin nombre';
      const descripcion = producto.descripcion || 'Sin descripción';
      const precio = Number(producto.precio || 0).toFixed(2);

      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <img
          src="${PalmasCart.escapeHTML(imagen)}"
          class="card-img-top"
          alt="${PalmasCart.escapeHTML(nombre)}"
          onerror="this.src='/media/media-logos/LogoPS.png'"
        >

        <div class="card-body text-center">
          <h5 class="fw-bold">${PalmasCart.escapeHTML(nombre)}</h5>

          <p class="card-text-desc">
            ${PalmasCart.escapeHTML(descripcion)}
          </p>

          <p class="price fw-bold mb-3" style="font-size: 1.2rem;">S/ ${precio}</p>

          <div class="d-flex align-items-center justify-content-center mb-3">
            <button type="button" class="btn-qty btn-minus">-</button>
            <span class="quantity mx-3 fw-bold" style="font-size: 1.1rem;">1</span>
            <button type="button" class="btn-qty btn-plus">+</button>
          </div>

          <button type="button" class="btn btn-primary w-100 add-to-cart">
            <i class="fa-solid fa-cart-plus me-2"></i>Añadir al carrito
          </button>
        </div>
      `;

      const btnMinus = card.querySelector('.btn-minus');
      const btnPlus = card.querySelector('.btn-plus');
      const qtySpan = card.querySelector('.quantity');
      const btnAddCart = card.querySelector('.add-to-cart');

      btnPlus.addEventListener('click', () => {
        qtySpan.textContent = Number(qtySpan.textContent) + 1;
      });

      btnMinus.addEventListener('click', () => {
        const qty = Number(qtySpan.textContent);
        if (qty > 1) qtySpan.textContent = qty - 1;
      });

      btnAddCart.addEventListener('click', () => {
        PalmasCart.addToCart(producto, Number(qtySpan.textContent));

        const originalText = btnAddCart.innerHTML;

        btnAddCart.innerHTML = '<i class="fa-solid fa-check me-2"></i>Producto añadido';
        btnAddCart.classList.remove('btn-primary');
        btnAddCart.classList.add('btn-success');
        btnAddCart.disabled = true;

        setTimeout(() => {
          btnAddCart.innerHTML = originalText;
          btnAddCart.classList.remove('btn-success');
          btnAddCart.classList.add('btn-primary');
          btnAddCart.disabled = false;
        }, 1500);
      });

      gridContainer.appendChild(card);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();

      const filtrados = todosLosProductos.filter(producto => {
        const nombre = String(producto.nombre || '').toLowerCase();
        const descripcion = String(producto.descripcion || '').toLowerCase();
        const marca = String(producto.marca || '').toLowerCase();

        return nombre.includes(query) || descripcion.includes(query) || marca.includes(query);
      });

      mostrarProductos(filtrados);
    });
  }

  cargarAccesorios();
});