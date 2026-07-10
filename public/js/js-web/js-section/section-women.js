document.addEventListener('DOMContentLoaded', () => {
  cargarProductosMujeres('Mujeres');
  const themeToggleBtn = document.getElementById('themeToggle');
  const applyTheme = (isDark) => {
    if (isDark) {
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-bs-theme', 'light');
    }
  };

  if (localStorage.getItem('tema') === 'dark') {
    applyTheme(true);
    const icon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    if (icon) {
      if (icon.classList.contains('bi-moon-fill')) icon.className = 'bi bi-sun-fill text-warning fs-5';
      else icon.className = 'bi bi-sun fs-5';
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = !document.body.classList.contains('dark');
      applyTheme(isDark);
      localStorage.setItem('tema', isDark ? 'dark' : 'light');
      const icon = themeToggleBtn.querySelector('i');
      if (icon) {
        if (icon.classList.contains('bi-moon-fill') || icon.classList.contains('bi-sun-fill')) {
          icon.className = isDark ? 'bi bi-sun-fill text-warning fs-5' : 'bi bi-moon-fill fs-5';
        } else {
          icon.className = isDark ? 'bi bi-sun fs-5' : 'bi bi-moon fs-5';
        }
      }
    });
  }

  let filtrosActivos = { categorias: [], marcas: [], minPrice: 0, maxPrice: Infinity };

  function inicializarFiltros() {
    const btnFiltrar = document.getElementById('btnFiltrar');
    const btnQuitarFiltros = document.getElementById('btnQuitarFiltros');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    function renderizarFiltros() {
      const searchTerm = (searchInput ? searchInput.value : '').toLowerCase().trim();
      const products = document.querySelectorAll('.product-item');
      let hasResults = false;
      products.forEach(product => {
        const cat = product.getAttribute('data-categoria');
        const marca = product.getAttribute('data-marca');
        const precio = parseFloat(product.getAttribute('data-precio'));
        const title = product.querySelector('.product-title').textContent.toLowerCase();
        
        const matchCat = filtrosActivos.categorias.length === 0 || filtrosActivos.categorias.includes(cat);
        const matchBrand = filtrosActivos.marcas.length === 0 || filtrosActivos.marcas.includes(marca);
        const matchPrice = precio >= filtrosActivos.minPrice && precio <= filtrosActivos.maxPrice;
        const matchSearch = title.includes(searchTerm);
        
        if (matchCat && matchBrand && matchPrice && matchSearch) {
          product.style.display = 'block';
          hasResults = true;
        } else {
          product.style.display = 'none';
        }
      });
      
      let noResultsMsg = document.getElementById('noResultsMessage');
      if (!hasResults) {
        if (!noResultsMsg) {
          const grid = document.getElementById('productsGrid');
          if (grid) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'col-12 text-center text-muted mt-5 mb-5 w-100';
            noResultsMsg.innerHTML = '<h4>No se encontraron productos con estos filtros.</h4>';
            grid.appendChild(noResultsMsg);
          }
        } else {
          noResultsMsg.style.display = 'block';
        }
      } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none';
      }
    }

    if (btnFiltrar) {
      btnFiltrar.addEventListener('click', () => {
        filtrosActivos.categorias = Array.from(document.querySelectorAll('.filter-category:checked')).map(cb => cb.value);
        filtrosActivos.marcas = Array.from(document.querySelectorAll('.filter-brand:checked')).map(cb => cb.value);
        filtrosActivos.minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
        filtrosActivos.maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
        renderizarFiltros();
      });
    }

    if (btnQuitarFiltros) {
      btnQuitarFiltros.addEventListener('click', () => {
        document.querySelectorAll('.filter-category, .filter-brand').forEach(cb => cb.checked = false);
        if(document.getElementById('minPrice')) document.getElementById('minPrice').value = '';
        if(document.getElementById('maxPrice')) document.getElementById('maxPrice').value = '';
        if(searchInput) {
          searchInput.value = '';
          if(clearSearchBtn) clearSearchBtn.classList.add('d-none');
        }
        filtrosActivos = { categorias: [], marcas: [], minPrice: 0, maxPrice: Infinity };
        renderizarFiltros();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        if (clearSearchBtn) clearSearchBtn.classList.toggle('d-none', e.target.value.length === 0);
        renderizarFiltros();
      });
      if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
          searchInput.value = '';
          clearSearchBtn.classList.add('d-none');
          renderizarFiltros();
          searchInput.focus();
        });
      }
    }
  }

  async function cargarProductosMujeres(categoria) {
    const grid = document.getElementById('productsGrid');
    try {
      const response = await fetch(`/api/productos?categoria=${encodeURIComponent(categoria)}`);
      if (!response.ok) throw new Error('Error en la ruta de la API');
      const productos = await response.json();
      grid.innerHTML = '';
      if (!productos.length) {
        grid.innerHTML = '<div class="col-12 text-center text-muted mt-5"><p>No se encontraron productos.</p></div>';
        return;
      }
      
      productos.forEach(prod => {
        const imgUrl = prod.imagen_url || '/media/media-logos/LogoPS.png';
        const marca = prod.marca || 'Palmas Street';
        const nombreLower = (prod.nombre || '').toLowerCase();
        
        let categoriaItem = 'Otros';
        if(nombreLower.includes('blusa')) categoriaItem = 'Blusa';
        else if(nombreLower.includes('conjunto')) categoriaItem = 'Conjunto';
        else if(nombreLower.includes('crop')) categoriaItem = 'Crop';
        else if(nombreLower.includes('pantalón') || nombreLower.includes('pantalon')) categoriaItem = 'Pantalón';
        else if(nombreLower.includes('top')) categoriaItem = 'Top';
        else if(nombreLower.includes('bomber')) categoriaItem = 'Bomber';
        else if(nombreLower.includes('chaqueta')) categoriaItem = 'Chaqueta';
        else if(nombreLower.includes('vestido')) categoriaItem = 'Vestido';
        else if(nombreLower.includes('body')) categoriaItem = 'Body';

        let originalPrice = Number(prod.precio || 0);
        let finalPrice = originalPrice;
        let badgeHtml = '';
        let priceHtml = `<span class="fs-5 fw-bold d-block mb-3 price-text">S/ ${originalPrice.toFixed(2)}</span>`;

        if (categoriaItem === 'Vestido') {
          finalPrice = originalPrice * 0.85; 
          badgeHtml = `<span class="badge bg-warning text-dark position-absolute top-0 start-0 m-2 z-3 shadow-sm" style="font-size: 0.8rem;">Fiestas Patrias (-15%)</span>`;
          priceHtml = `
            <div class="mb-3">
              <span class="text-muted text-decoration-line-through me-2">S/ ${originalPrice.toFixed(2)}</span>
              <span class="fs-5 fw-bold text-danger d-inline-block">S/ ${finalPrice.toFixed(2)}</span>
            </div>`;
        } else if (categoriaItem === 'Chaqueta' || categoriaItem === 'Bomber') {
          finalPrice = originalPrice * 0.80; 
          badgeHtml = `<span class="badge bg-info text-dark position-absolute top-0 start-0 m-2 z-3 shadow-sm" style="font-size: 0.8rem;">Look Invernal (-20%)</span>`;
          priceHtml = `
            <div class="mb-3">
              <span class="text-muted text-decoration-line-through me-2">S/ ${originalPrice.toFixed(2)}</span>
              <span class="fs-5 fw-bold text-danger d-inline-block">S/ ${finalPrice.toFixed(2)}</span>
            </div>`;
        }

        const col = document.createElement('div');
        col.className = 'col product-item';
        col.setAttribute('data-categoria', categoriaItem);
        col.setAttribute('data-marca', marca);
        col.setAttribute('data-precio', prod.precio);
        
        col.innerHTML = `
          <article class="card h-100 custom-card text-center shadow-sm hover-card border-0 position-relative">
            ${badgeHtml}
            <div class="card-img-wrapper" style="height: 250px; background-color: #f9f9f9; overflow: hidden;">
              <img src="${PalmasCart.escapeHTML(imgUrl)}" class="card-img-top w-100 h-100" style="object-fit: cover; transition: transform 0.5s ease;" alt="${PalmasCart.escapeHTML(prod.nombre)}" onerror="this.src='/media/media-logos/LogoPS.png'">
            </div>
            <div class="card-body d-flex flex-column p-3">
              <h6 class="card-title fw-bold product-title mb-1 text-dark">${PalmasCart.escapeHTML(prod.nombre)}</h6>
              <small class="mb-2 d-block text-muted">Marca: ${PalmasCart.escapeHTML(marca)}</small>
              <p class="card-text flex-grow-1 text-secondary" style="font-size: 0.85rem;">${PalmasCart.escapeHTML(prod.descripcion || 'Sin descripción disponible.')}</p>
              <div class="mt-auto pt-2">
                ${priceHtml}
                <div class="d-flex justify-content-center align-items-center mb-3 gap-2">
                  <button type="button" class="btn btn-outline-secondary btn-sm btn-minus" style="width: 32px; height: 32px;">-</button>
                  <span class="qty-val fw-bold fs-6" style="min-width: 20px;">1</span>
                  <button type="button" class="btn btn-outline-secondary btn-sm btn-plus" style="width: 32px; height: 32px;">+</button>
                </div>
                <button type="button" class="btn btn-dark w-100 fw-semibold btn-add-cart">Añadir al Carrito</button>
              </div>
            </div>
          </article>
        `;

        const btnMinus = col.querySelector('.btn-minus');
        const btnPlus = col.querySelector('.btn-plus');
        const qtyVal = col.querySelector('.qty-val');
        const btnAdd = col.querySelector('.btn-add-cart');
        
        btnPlus.addEventListener('click', () => { qtyVal.textContent = Number(qtyVal.textContent) + 1; });
        btnMinus.addEventListener('click', () => {
          if (Number(qtyVal.textContent) > 1) qtyVal.textContent = Number(qtyVal.textContent) - 1;
        });
        
        btnAdd.addEventListener('click', () => {
          // INYECCIÓN DE LA CATEGORÍA PARA QUE EL CARRITO APLIQUE DESCUENTO
          const productoCarrito = { ...prod, categoria: categoriaItem };
          PalmasCart.addToCart(productoCarrito, Number(qtyVal.textContent));
          
          const originalText = btnAdd.innerHTML;
          btnAdd.innerHTML = '¡Añadido!';
          btnAdd.classList.remove('btn-dark');
          btnAdd.classList.add('btn-success');
          btnAdd.disabled = true;
          setTimeout(() => {
            btnAdd.innerHTML = originalText;
            btnAdd.classList.remove('btn-success');
            btnAdd.classList.add('btn-dark');
            btnAdd.disabled = false;
          }, 1200);
        });

        grid.appendChild(col);
      });
      inicializarFiltros();
    } catch (error) {
      grid.innerHTML = '<div class="col-12 text-center text-danger mt-5"><p>Error al cargar productos.</p></div>';
    }
  }
});