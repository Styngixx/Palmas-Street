document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const emptyCartMessage = document.getElementById('emptyCartMessage');
  const cartContent = document.getElementById('cartContent');
  const summaryItems = document.getElementById('summaryItems');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryTotal = document.getElementById('summaryTotal');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const finishPurchaseBtn = document.getElementById('finishPurchaseBtn');
  const receiptContainer = document.getElementById('receiptContainer');
  const themeToggle = document.getElementById('themeToggle');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');

      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = document.body.classList.contains('dark')
          ? 'bi bi-sun fs-5'
          : 'bi bi-moon fs-5';
      }

      localStorage.setItem('tema', document.body.classList.contains('dark') ? 'dark' : 'light');
    });

    if (localStorage.getItem('tema') === 'dark') {
      document.body.classList.add('dark');
      const icon = themeToggle.querySelector('i');
      if (icon) icon.className = 'bi bi-sun fs-5';
    }
  }

  function renderCart() {
    const cart = PalmasCart.getCart();

    PalmasCart.updateCartBadges();

    if (!cart.length) {
      emptyCartMessage.classList.remove('d-none');
      cartContent.classList.add('d-none');

      summaryItems.textContent = '0';
      summarySubtotal.textContent = 'S/ 0.00';
      summaryTotal.textContent = 'S/ 0.00';

      return;
    }

    emptyCartMessage.classList.add('d-none');
    cartContent.classList.remove('d-none');
    cartItemsContainer.innerHTML = '';

    cart.forEach(item => {
      const itemTotal = Number(item.precio || 0) * Number(item.cantidad || 0);

      const card = document.createElement('div');
      card.className = 'card border-0 shadow-sm';

      card.innerHTML = `
        <div class="card-body p-3">
          <div class="d-flex gap-3 align-items-center">
            <img
              src="${PalmasCart.escapeHTML(item.imagen_url)}"
              alt="${PalmasCart.escapeHTML(item.nombre)}"
              class="cart-item-img"
              onerror="this.src='/media/media-logos/LogoPS.png'"
            >

            <div class="flex-grow-1">
              <h5 class="fw-bold mb-1">${PalmasCart.escapeHTML(item.nombre)}</h5>
              <p class="text-muted mb-1">${PalmasCart.escapeHTML(item.marca || 'Palmas Street')}</p>
              <p class="mb-0">${PalmasCart.formatPrice(item.precio)} c/u</p>
            </div>

            <div class="d-flex align-items-center gap-2 no-print">
              <button type="button" class="btn btn-sm btn-outline-secondary btn-minus" data-id="${PalmasCart.escapeHTML(item.id)}">-</button>
              <input type="text" class="form-control form-control-sm text-center item-qty" value="${Number(item.cantidad)}" readonly style="width: 50px;">
              <button type="button" class="btn btn-sm btn-outline-secondary btn-plus" data-id="${PalmasCart.escapeHTML(item.id)}">+</button>
            </div>

            <div class="text-end" style="min-width: 90px;">
              <strong>${PalmasCart.formatPrice(itemTotal)}</strong>
              <button type="button" class="btn btn-sm btn-link text-danger d-block ms-auto no-print btn-remove" data-id="${PalmasCart.escapeHTML(item.id)}">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      `;

      const btnMinus = card.querySelector('.btn-minus');
      const btnPlus = card.querySelector('.btn-plus');
      const btnRemove = card.querySelector('.btn-remove');

      btnMinus.addEventListener('click', () => {
        const currentItem = PalmasCart.getCart().find(product => String(product.id) === String(item.id));

        if (!currentItem) return;

        const newQuantity = Number(currentItem.cantidad) - 1;

        if (newQuantity <= 0) {
          PalmasCart.removeFromCart(item.id);
        } else {
          PalmasCart.updateQuantity(item.id, newQuantity);
        }

        renderCart();
      });

      btnPlus.addEventListener('click', () => {
        const currentItem = PalmasCart.getCart().find(product => String(product.id) === String(item.id));

        if (!currentItem) return;

        PalmasCart.updateQuantity(item.id, Number(currentItem.cantidad) + 1);
        renderCart();
      });

      btnRemove.addEventListener('click', () => {
        PalmasCart.removeFromCart(item.id);
        renderCart();
      });

      cartItemsContainer.appendChild(card);
    });

    summaryItems.textContent = PalmasCart.getTotalItems();
    summarySubtotal.textContent = PalmasCart.formatPrice(PalmasCart.getTotalPrice());
    summaryTotal.textContent = PalmasCart.formatPrice(PalmasCart.getTotalPrice());
  }

  function generateReceiptNumber() {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replaceAll('-', '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);

    return `BV-${datePart}-${randomPart}`;
  }

  function finishPurchase() {
    const cart = PalmasCart.getCart();

    if (!cart.length) {
      alert('Tu carrito está vacío.');
      return;
    }

    const receiptNumber = generateReceiptNumber();
    const date = new Date();
    const formattedDate = date.toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    const total = PalmasCart.getTotalPrice();

    const rows = cart.map(item => {
      const subtotal = Number(item.precio || 0) * Number(item.cantidad || 0);

      return `
        <tr>
          <td>${PalmasCart.escapeHTML(item.nombre)}</td>
          <td class="text-center">${Number(item.cantidad)}</td>
          <td class="text-end">${PalmasCart.formatPrice(item.precio)}</td>
          <td class="text-end">${PalmasCart.formatPrice(subtotal)}</td>
        </tr>
      `;
    }).join('');

    receiptContainer.innerHTML = `
      <div class="receipt-box">
        <div class="text-center mb-4">
          <h2 class="fw-bold mb-1">Boleta de venta</h2>
          <p class="mb-1"><strong>Palmas Street</strong></p>
          <p class="mb-0 text-muted">Frescura, atrevimiento y moda.</p>
        </div>

        <div class="row mb-4">
          <div class="col-md-6">
            <p class="mb-1"><strong>N.º de boleta:</strong> ${receiptNumber}</p>
            <p class="mb-1"><strong>Fecha:</strong> ${formattedDate}</p>
          </div>

          <div class="col-md-6 text-md-end">
            <p class="mb-1"><strong>Cliente:</strong> Consumidor final</p>
            <p class="mb-1"><strong>Moneda:</strong> Soles peruanos</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Producto</th>
                <th class="text-center">Cantidad</th>
                <th class="text-end">Precio</th>
                <th class="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>

        <div class="text-end fs-4 fw-bold mt-4">
          Total pagado: ${PalmasCart.formatPrice(total)}
        </div>

        <div class="alert alert-success mt-4 mb-0">
          Compra finalizada correctamente. Gracias por comprar en Palmas Street.
        </div>

        <div class="d-flex gap-2 justify-content-end mt-4 no-print">
          <button type="button" class="btn btn-outline-dark" onclick="window.print()">
            <i class="bi bi-printer me-2"></i>Imprimir boleta
          </button>

          <a href="/index.html#catalogo" class="btn btn-dark">
            Volver al catálogo
          </a>
        </div>
      </div>
    `;

    receiptContainer.classList.remove('d-none');

    PalmasCart.clearCart();
    renderCart();

    receiptContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      const confirmClear = confirm('¿Seguro que deseas vaciar el carrito?');

      if (confirmClear) {
        PalmasCart.clearCart();
        receiptContainer.classList.add('d-none');
        receiptContainer.innerHTML = '';
        renderCart();
      }
    });
  }

  if (finishPurchaseBtn) {
    finishPurchaseBtn.addEventListener('click', finishPurchase);
  }

  renderCart();
});