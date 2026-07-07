document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('accesoriosGrid');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const themeToggle = document.getElementById('themeToggle');

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
    const icon = themeToggle ? themeToggle.querySelector('i') : null;
    if (icon) {
      if (icon.classList.contains('bi-moon-fill')) icon.className = 'bi bi-sun-fill text-warning fs-5';
      else icon.className = 'bi bi-sun fs-5';
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = !document.body.classList.contains('dark');
      applyTheme(isDark);
      localStorage.setItem('tema', isDark ? 'dark' : 'light');
      const icon = themeToggle.querySelector('i');
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
          noResultsMsg = document.createElement('div');
          noResultsMsg.id = 'noResultsMessage';
          noResultsMsg.className = 'col-12 text-center text-muted mt-5 mb-5 w-100';
          noResultsMsg.innerHTML = '<h4>No se encontraron productos con estos filtros.</h4>';
          gridContainer.appendChild(noResultsMsg);
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

  async function cargarAccesorios() {
    try {
      const response = await fetch('/api/productos/accesorios');
      if (!response.ok) throw new Error('Error al obtener accesorios');
      const productos = await response.json();
      gridContainer.innerHTML = '';
      if (!productos.length) {
          gridContainer.innerHTML = '<div class="col-12 text-center text-muted"><p>No hay productos disponibles.</p></div>';
          return;
      }
      
      productos.forEach(producto => {
        const imagen = producto.imagen_url || '/media/media-logos/LogoPS.png';
        const marca = producto.marca || 'Genérico';
        const nombreLower = (producto.nombre || '').toLowerCase();
        
        let categoriaItem = 'Varios';
        if(nombreLower.includes('gorra') || nombreLower.includes('gorro') || nombreLower.includes('sombrero') || nombreLower.includes('pasamontaña') || nombreLower.includes('beanie')) categoriaItem = 'Gorras y Sombreros';
        else if(nombreLower.includes('lentes') || nombreLower.includes('estuche')) categoriaItem = 'Lentes';
        else if(nombreLower.includes('reloj')) categoriaItem = 'Relojes';
        else if(nombreLower.includes('mochila') || nombreLower.includes('bolso') || nombreLower.includes('riñonera')) categoriaItem = 'Mochilas y Bolsos';
        else if(nombreLower.includes('cartera') || nombreLower.includes('billetera') || nombreLower.includes('tarjetero')) categoriaItem = 'Carteras y Billeteras';
        else if(nombreLower.includes('cinturón') || nombreLower.includes('cinturon')) categoriaItem = 'Cinturones';
        else if(nombreLower.includes('bufanda') || nombreLower.includes('bandana') || nombreLower.includes('corbata')) categoriaItem = 'Cuellos y Corbatas';
        else if(nombreLower.includes('pulsera') || nombreLower.includes('anillo') || nombreLower.includes('collar') || nombreLower.includes('aretes')) categoriaItem = 'Joyería';
        else if(nombreLower.includes('calcetines') || nombreLower.includes('guantes') || nombreLower.includes('casaca')) categoriaItem = 'Ropa';

        let originalPrice = Number(producto.precio || 0);
        let finalPrice = originalPrice;
        let badgeHtml = '';
        let priceHtml = `<span class="fs-5 fw-bold price mb-3 text-dark">S/ ${originalPrice.toFixed(2)}</span>`;

        if (categoriaItem === 'Gorras y Sombreros') {
          finalPrice = originalPrice * 0.70; 
          badgeHtml = `<span class="badge bg-danger position-absolute top-0 start-0 m-2 z-3 shadow-sm" style="font-size: 0.8rem;">Liquidación -30%</span>`;
          priceHtml = `
            <div class="mb-3">
              <span class="text-muted text-decoration-line-through me-2">S/ ${originalPrice.toFixed(2)}</span>
              <span class="fs-5 fw-bold text-danger">S/ ${finalPrice.toFixed(2)}</span>
            </div>`;
        } else if (categoriaItem === 'Joyería') {
          finalPrice = originalPrice * 0.90; 
          badgeHtml = `<span class="badge bg-dark text-white position-absolute top-0 start-0 m-2 z-3 shadow-sm" style="font-size: 0.8rem;">Remate Exclusivo -10%</span>`;
          priceHtml = `
            <div class="mb-3">
              <span class="text-muted text-decoration-line-through me-2">S/ ${originalPrice.toFixed(2)}</span>
              <span class="fs-5 fw-bold text-danger">S/ ${finalPrice.toFixed(2)}</span>
            </div>`;
        }

        const articleCol = document.createElement('div');
        articleCol.className = 'col product-item';
        articleCol.setAttribute('data-categoria', categoriaItem);
        articleCol.setAttribute('data-marca', marca);
        articleCol.setAttribute('data-precio', producto.precio);
        
        articleCol.innerHTML = `
          <div class="card h-100 border-0 shadow-sm hover-card position-relative">
            ${badgeHtml}
            <div class="product-image-container overflow-hidden">
              <img src="${PalmasCart.escapeHTML(imagen)}" class="card-img-top w-100 h-100" style="object-fit: contain;" alt="${PalmasCart.escapeHTML(producto.nombre)}" onerror="this.src='/media/media-logos/LogoPS.png'">
            </div>
            <div class="card-body d-flex flex-column text-center p-3">
              <h5 class="card-title fw-bold product-title mb-1">${PalmasCart.escapeHTML(producto.nombre)}</h5>
              <h6 class="card-subtitle mb-2 fw-bold marca-text">Marca: ${PalmasCart.escapeHTML(marca)}</h6>
              <p class="card-text text-muted flex-grow-1 mt-2 product-description">${PalmasCart.escapeHTML(producto.descripcion || 'Sin descripción disponible.')}</p>
              ${priceHtml}
              <div class="d-flex justify-content-center align-items-center mb-3 gap-2 quantity-selector">
                <button type="button" class="btn btn-qty btn-minus btn-sm">-</button>
                <input type="text" class="form-control form-control-sm text-center qty-input" value="1" readonly style="width: 50px;">
                <button type="button" class="btn btn-qty btn-plus btn-sm">+</button>
              </div>
              <button type="button" class="btn btn-primary w-100 fw-bold shadow-sm btn-cart-add">Añadir al Carrito</button>
            </div>
          </div>
        `;
        const btnMinus = articleCol.querySelector('.btn-minus');
        const btnPlus = articleCol.querySelector('.btn-plus');
        const qtyInput = articleCol.querySelector('.qty-input');
        const btnAdd = articleCol.querySelector('.btn-cart-add');
        
        btnPlus.addEventListener('click', () => { qtyInput.value = Number(qtyInput.value) + 1; });
        btnMinus.addEventListener('click', () => {
          if (Number(qtyInput.value) > 1) qtyInput.value = Number(qtyInput.value) - 1;
        });
        
        btnAdd.addEventListener('click', () => {
          // INYECCIÓN DE LA CATEGORÍA PARA QUE EL CARRITO APLIQUE DESCUENTO
          const productoCarrito = { ...producto, categoria: categoriaItem };
          PalmasCart.addToCart(productoCarrito, Number(qtyInput.value));
          
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
        gridContainer.appendChild(articleCol);
      });
      inicializarFiltros();
    } catch (error) {
      gridContainer.innerHTML = '<div class="col-12 text-center text-muted"><p>No se pudieron cargar los accesorios en este momento.</p></div>';
    }
  }
  cargarAccesorios();
});