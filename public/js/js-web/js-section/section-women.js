document.addEventListener('DOMContentLoaded', () => {
  cargarProductosMujeres('Mujeres');

  const themeToggleBtn = document.getElementById('themeToggle');
  if (localStorage.getItem('tema') === 'dark') {
    document.body.classList.add('dark-mode');
    const icon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    if (icon) {
      icon.classList.replace('bi-moon-fill', 'bi-sun-fill');
      icon.classList.add('text-warning');
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const icon = themeToggleBtn.querySelector('i');
      const isDark = document.body.classList.contains('dark-mode');

      if (icon) {
        if (isDark) {
          icon.classList.replace('bi-moon-fill', 'bi-sun-fill');
          icon.classList.add('text-warning');
        } else {
          icon.classList.replace('bi-sun-fill', 'bi-moon-fill');
          icon.classList.remove('text-warning');
        }
      }

      localStorage.setItem('tema', isDark ? 'dark' : 'light');
    });
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', event => {
      const term = event.target.value.toLowerCase();
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
    const response = await fetch(`/api/productos?categoria=${encodeURIComponent(categoria)}`);
    if (!response.ok) throw new Error('Error en la ruta de la API');

    const productos = await response.json();
    grid.innerHTML = '';

    if (!productos.length) {
      grid.innerHTML = '<div class="col-12 text-center py-5 w-100"><h4 class="text-muted">No hay productos disponibles por ahora.</h4></div>';
      return;
    }

    productos.forEach(prod => {
      const imgUrl = prod.imagen_url
        ? (String(prod.imagen_url).startsWith('/') ? prod.imagen_url : '/' + prod.imagen_url)
        : '/media/media-logos/LogoPS.png';
      const marca = prod.marca || 'Palmas Street';
      const precio = Number(prod.precio || 0).toFixed(2);

      const col = document.createElement('div');
      col.className = 'col product-item';

      col.innerHTML = `
        <article class="card h-100 custom-card text-center">
          <div class="card-img-wrapper">
            <img src="${PalmasCart.escapeHTML(imgUrl)}" class="card-img-top w-100 h-100" alt="${PalmasCart.escapeHTML(prod.nombre)}" onerror="this.src='/media/media-logos/LogoPS.png'">
          </div>

          <div class="card-body d-flex flex-column p-4">
            <h6 class="card-title fw-bold product-title mb-0">${PalmasCart.escapeHTML(prod.nombre)}</h6>
            <small class="mb-3 d-block" style="color: var(--text-muted);">Marca: ${PalmasCart.escapeHTML(marca)}</small>
            <p class="card-text flex-grow-1" style="font-size: 0.85rem; color: var(--text-muted);">${PalmasCart.escapeHTML(prod.descripcion || 'Sin descripción disponible.')}</p>

            <div class="mt-auto pt-3 border-top" style="border-color: var(--border-color) !important;">
              <span class="fs-4 fw-bold d-block mb-3 price-text">S/ ${precio}</span>

              <div class="d-flex justify-content-center align-items-center mb-3 gap-3">
                <button type="button" class="btn qty-btn btn-minus">
                  <i class="bi bi-dash"></i>
                </button>
                <span class="qty-val fw-bold fs-5" style="min-width: 25px;">1</span>
                <button type="button" class="btn qty-btn btn-plus">
                  <i class="bi bi-plus"></i>
                </button>
              </div>

              <button type="button" class="btn custom-add-btn w-100 fw-semibold btn-add-cart">
                <i class="bi bi-cart-plus me-2"></i> Añadir al Carrito
              </button>
            </div>
          </div>
        </article>
      `;

      const btnMinus = col.querySelector('.btn-minus');
      const btnPlus = col.querySelector('.btn-plus');
      const qtyVal = col.querySelector('.qty-val');
      const btnAdd = col.querySelector('.btn-add-cart');

      btnPlus.addEventListener('click', () => {
        qtyVal.textContent = Number(qtyVal.textContent) + 1;
      });

      btnMinus.addEventListener('click', () => {
        const currentValue = Number(qtyVal.textContent);
        if (currentValue > 1) qtyVal.textContent = currentValue - 1;
      });

      btnAdd.addEventListener('click', () => {
        PalmasCart.addToCart(prod, Number(qtyVal.textContent));

        const originalText = btnAdd.innerHTML;
        btnAdd.innerHTML = '<i class="bi bi-check2-circle me-2"></i>¡Añadido!';
        btnAdd.classList.add('btn-success');
        btnAdd.disabled = true;

        setTimeout(() => {
          btnAdd.innerHTML = originalText;
          btnAdd.classList.remove('btn-success');
          btnAdd.disabled = false;
        }, 1200);
      });

      grid.appendChild(col);
    });
  } catch (error) {
    console.error('Error:', error);
    grid.innerHTML = '<h4 class="text-danger text-center w-100">Error al conectar con la base de datos</h4>';
  }
}
