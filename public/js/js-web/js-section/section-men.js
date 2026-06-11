document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const themeToggle = document.getElementById('themeToggle');

  if (localStorage.getItem('tema') === 'dark') {
    document.body.classList.add('dark');
    const icon = themeToggle ? themeToggle.querySelector('i') : null;
    if (icon) icon.className = 'bi bi-sun fs-5';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      const icon = themeToggle.querySelector('i');

      if (icon) icon.className = isDark ? 'bi bi-sun fs-5' : 'bi bi-moon fs-5';
      localStorage.setItem('tema', isDark ? 'dark' : 'light');
    });
  }

  async function cargarProductos() {
    try {
      const response = await fetch('/api/productos/hombres');
      if (!response.ok) throw new Error('Error al obtener productos de hombres');

      const productos = await response.json();
      productsGrid.innerHTML = '';

      if (!productos.length) {
        productsGrid.innerHTML = '<div class="col-12 text-center text-muted"><p>No hay productos disponibles.</p></div>';
        return;
      }

      productos.forEach(producto => {
        const precioFormateado = Number(producto.precio || 0).toFixed(2);
        const imagen = producto.imagen_url || '/media/media-logos/LogoPS.png';
        const marca = producto.marca || 'Palmas Street';

        const articleCol = document.createElement('div');
        articleCol.className = 'col product-item';

        articleCol.innerHTML = `
          <div class="card h-100 border-0 shadow-sm hover-card">
            <div class="product-image-container overflow-hidden">
              <img src="${PalmasCart.escapeHTML(imagen)}" class="card-img-top w-100 h-100" style="object-fit: cover;" alt="${PalmasCart.escapeHTML(producto.nombre)}" onerror="this.src='/media/media-logos/LogoPS.png'">
            </div>

            <div class="card-body d-flex flex-column text-center p-3">
              <h5 class="card-title fw-bold product-title mb-1">${PalmasCart.escapeHTML(producto.nombre)}</h5>
              <h6 class="card-subtitle mb-2 fw-bold marca-text">Marca: ${PalmasCart.escapeHTML(marca)}</h6>
              <p class="card-text text-muted flex-grow-1 mt-2 product-description">${PalmasCart.escapeHTML(producto.descripcion || 'Sin descripción disponible.')}</p>
              <span class="fs-5 fw-bold price mb-3">S/ ${precioFormateado}</span>

              <div class="d-flex justify-content-center align-items-center mb-3 gap-2 quantity-selector">
                <button type="button" class="btn btn-qty btn-minus btn-sm">-</button>
                <input type="text" class="form-control form-control-sm text-center qty-input" value="1" readonly style="width: 50px;">
                <button type="button" class="btn btn-qty btn-plus btn-sm">+</button>
              </div>

              <button type="button" class="btn btn-primary w-100 fw-bold shadow-sm btn-cart-add">
                Añadir al Carrito
              </button>
            </div>
          </div>
        `;

        const btnMinus = articleCol.querySelector('.btn-minus');
        const btnPlus = articleCol.querySelector('.btn-plus');
        const qtyInput = articleCol.querySelector('.qty-input');
        const btnAdd = articleCol.querySelector('.btn-cart-add');

        btnPlus.addEventListener('click', () => {
          qtyInput.value = Number(qtyInput.value) + 1;
        });

        btnMinus.addEventListener('click', () => {
          const currentValue = Number(qtyInput.value);
          if (currentValue > 1) qtyInput.value = currentValue - 1;
        });

        btnAdd.addEventListener('click', () => {
          PalmasCart.addToCart(producto, Number(qtyInput.value));

          const originalText = btnAdd.innerHTML;
          btnAdd.innerHTML = '¡Añadido!';
          btnAdd.classList.remove('btn-primary');
          btnAdd.classList.add('btn-success');
          btnAdd.disabled = true;

          setTimeout(() => {
            btnAdd.innerHTML = originalText;
            btnAdd.classList.remove('btn-success');
            btnAdd.classList.add('btn-primary');
            btnAdd.disabled = false;
          }, 1200);
        });

        productsGrid.appendChild(articleCol);
      });
    } catch (error) {
      console.error('❌ Error al cargar los productos:', error);
      productsGrid.innerHTML = '<div class="col-12 text-center text-muted"><p>No se pudieron cargar los productos en este momento.</p></div>';
    }
  }

  function filterProducts(term) {
    const normalizedTerm = term.toLowerCase().trim();
    const dynamicProducts = document.querySelectorAll('.product-item');

    dynamicProducts.forEach(product => {
      const title = product.querySelector('.product-title').textContent.toLowerCase();
      product.style.display = title.includes(normalizedTerm) ? 'block' : 'none';
    });
  }

  if (searchInput && clearSearchBtn) {
    searchInput.addEventListener('input', event => {
      const searchTerm = event.target.value;
      clearSearchBtn.classList.toggle('d-none', searchTerm.length === 0);
      filterProducts(searchTerm);
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.classList.add('d-none');
      filterProducts('');
      searchInput.focus();
    });
  }

  cargarProductos();
});

