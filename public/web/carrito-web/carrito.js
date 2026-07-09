document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const emptyCartMessage = document.getElementById('emptyCartMessage');
  const cartContent = document.getElementById('cartContent');

  const summaryItems = document.getElementById('summaryItems');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryClearanceRow = document.getElementById('summaryClearanceRow');
  const summaryClearance = document.getElementById('summaryClearance');
  const summaryBulkRow = document.getElementById('summaryBulkRow');
  const summaryBulk = document.getElementById('summaryBulk');
  const summaryCouponRow = document.getElementById('summaryCouponRow');
  const summaryCouponLabel = document.getElementById('summaryCouponLabel');
  const summaryCoupon = document.getElementById('summaryCoupon');
  const summaryTotal = document.getElementById('summaryTotal');

  const couponInput = document.getElementById('couponInput');
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const removeCouponBtn = document.getElementById('removeCouponBtn');
  const couponMessage = document.getElementById('couponMessage');

  const clearCartBtn = document.getElementById('clearCartBtn');
  const finishPurchaseBtn = document.getElementById('finishPurchaseBtn');
  const receiptContainer = document.getElementById('receiptContainer');
  const themeToggle = document.getElementById('themeToggle');

  // Control de Tema Oscuro
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

  function showCouponMessage(text, type) {
    if (!couponMessage) return;

    couponMessage.textContent = text;
    couponMessage.className = `small fw-bold mt-2 text-${type}`;
  }

  function updateSummary(breakdown) {
    if (!summaryItems) return;

    summaryItems.textContent = PalmasCart.getTotalItems();
    summarySubtotal.textContent = PalmasCart.formatPrice(breakdown.subtotalBeforeDiscounts);
    summaryTotal.textContent = PalmasCart.formatPrice(breakdown.finalTotal);

    if (breakdown.clearanceTotal > 0) {
      summaryClearanceRow.classList.remove('d-none');
      summaryClearance.textContent = `- ${PalmasCart.formatPrice(breakdown.clearanceTotal)}`;
    } else {
      summaryClearanceRow.classList.add('d-none');
    }

    if (breakdown.bulkTotal > 0) {
      summaryBulkRow.classList.remove('d-none');
      summaryBulk.textContent = `- ${PalmasCart.formatPrice(breakdown.bulkTotal)}`;
    } else {
      summaryBulkRow.classList.add('d-none');
    }

    if (breakdown.couponDiscount > 0 && breakdown.appliedCoupon) {
      summaryCouponRow.classList.remove('d-none');
      summaryCouponLabel.textContent = `Cupón: ${breakdown.appliedCoupon.code}`;
      summaryCoupon.textContent = `- ${PalmasCart.formatPrice(breakdown.couponDiscount)}`;
      removeCouponBtn.classList.remove('d-none');

      if (couponInput) couponInput.value = breakdown.appliedCoupon.code;
    } else {
      summaryCouponRow.classList.add('d-none');
      removeCouponBtn.classList.add('d-none');
    }
  }

  function renderCart() {
    if (!cartItemsContainer) return;

    const cart = PalmasCart.getCart();
    const breakdown = PalmasCart.getCartBreakdown();

    PalmasCart.updateCartBadges();

    if (!cart.length) {
      if (emptyCartMessage) emptyCartMessage.classList.remove('d-none');
      if (cartContent) cartContent.classList.add('d-none');
      return;
    }

    if (emptyCartMessage) emptyCartMessage.classList.add('d-none');
    if (cartContent) cartContent.classList.remove('d-none');

    cartItemsContainer.innerHTML = '';

    breakdown.lines.forEach(({ item, unitPrice, finalLineTotal, bulkEligible, saleLabel }) => {
      const image = item.imagen_url || item.imagen || '/media/media-logos/LogoPS.png';

      let tags = '';

      if (saleLabel) {
        tags += `<span class="badge bg-danger ms-2"><i class="bi bi-tag-fill me-1"></i>${saleLabel}</span>`;
      }

      if (bulkEligible) {
        tags += `<span class="badge bg-success ms-2"><i class="bi bi-box-seam me-1"></i>15% x3 unid.</span>`;
      }

      let priceHTML = `
        <div class="d-flex align-items-center flex-wrap mt-1">
          <span class="text-dark fw-medium">${PalmasCart.formatPrice(unitPrice)} c/u</span>
          ${tags}
        </div>
      `;

      if (saleLabel || bulkEligible) {
        priceHTML = `
          <div class="d-flex align-items-center flex-wrap mt-1">
            <span class="text-muted text-decoration-line-through small me-2">${PalmasCart.formatPrice(item.precio)}</span>
            <span class="fw-bold text-danger">${PalmasCart.formatPrice(unitPrice)} c/u</span>
            ${tags}
          </div>
        `;
      }

      const card = document.createElement('div');

      card.className = 'card border-0 shadow-sm mb-3';

      card.innerHTML = `
        <div class="card-body p-3">
          <div class="d-flex gap-3 align-items-center flex-wrap">
            <img src="${PalmasCart.escapeHTML(image)}" alt="${PalmasCart.escapeHTML(item.nombre)}" class="cart-item-img">

            <div class="flex-grow-1">
              <h5 class="fw-bold mb-1">${PalmasCart.escapeHTML(item.nombre)}</h5>
              <p class="text-muted mb-0 small">
                ${PalmasCart.escapeHTML(item.marca || 'Palmas Street')} | Categoría: ${PalmasCart.escapeHTML(item.categoria || 'General')}
              </p>
              ${priceHTML}
            </div>

            <div class="d-flex align-items-center gap-2 no-print">
              <button type="button" class="btn btn-sm btn-outline-secondary btn-minus">-</button>
              <input type="text" class="form-control form-control-sm text-center item-qty" value="${Number(item.cantidad)}" readonly style="width: 50px;">
              <button type="button" class="btn btn-sm btn-outline-secondary btn-plus">+</button>
            </div>

            <div class="text-end" style="min-width: 90px;">
              <strong class="fs-5 text-dark">${PalmasCart.formatPrice(finalLineTotal)}</strong>
              <button type="button" class="btn btn-sm btn-link text-danger d-block ms-auto no-print btn-remove">Eliminar</button>
            </div>
          </div>
        </div>
      `;

      card.querySelector('.btn-minus').addEventListener('click', () => {
        const newQuantity = Number(item.cantidad) - 1;

        if (newQuantity <= 0) {
          PalmasCart.removeFromCart(item.id);
        } else {
          PalmasCart.updateQuantity(item.id, newQuantity);
        }

        renderCart();
      });

      card.querySelector('.btn-plus').addEventListener('click', () => {
        PalmasCart.updateQuantity(item.id, Number(item.cantidad) + 1);
        renderCart();
      });

      card.querySelector('.btn-remove').addEventListener('click', () => {
        PalmasCart.removeFromCart(item.id);
        renderCart();
      });

      cartItemsContainer.appendChild(card);
    });

    updateSummary(breakdown);
  }

  // Eventos de Cupón
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', () => {
      const currentInputVal = document.getElementById('couponInput').value;
      const result = PalmasCart.applyCoupon(currentInputVal);

      showCouponMessage(result.message, result.success ? 'success' : 'danger');
      renderCart();
    });
  }

  if (removeCouponBtn) {
    removeCouponBtn.addEventListener('click', () => {
      PalmasCart.removeCoupon();

      if (couponInput) couponInput.value = '';

      showCouponMessage('Cupón removido.', 'secondary');
      renderCart();
    });
  }

  function generateReceiptNumber() {
    const datePart = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);

    return `BV-${datePart}-${randomPart}`;
  }

  // ===============================================
  // BOLETA BLINDADA + GUARDADO DE DESCUENTOS EN BD
  // ===============================================
  async function finishPurchase(e) {
    if (e) e.preventDefault();

    const cart = PalmasCart.getCart();

    console.log('CARRITO PARA VENTA:', cart);

    const breakdownInicial = PalmasCart.getCartBreakdown();

    console.log('RESUMEN DEL CARRITO:', breakdownInicial);
    console.log('LINEAS CON DESCUENTO:', breakdownInicial.lines);

    if (!cart.length) {
      alert('Tu carrito está vacío.');
      return;
    }

    try {
      const breakdown = PalmasCart.getCartBreakdown();

      /*
        IMPORTANTE:
        finalLineTotal es el total de cada producto después de liquidación/remate
        o descuento por cantidad, pero antes del cupón general.

        Ejemplo:
        Precio original: 79.00
        Liquidación 10%: -7.90
        finalLineTotal: 71.10

        Luego distribuimos el cupón sobre cada línea.
      */

      const totalLineasAntesCupon = breakdown.lines.reduce((acc, { finalLineTotal }) => {
        return acc + Number(finalLineTotal || 0);
      }, 0);

      const descuentoCuponTotal = Number(breakdown.couponDiscount || 0);
      let descuentoCuponAcumulado = 0;

      const itemsParaBD = breakdown.lines.map(({ item, finalLineTotal }, index) => {
        const cantidad = Number(item.cantidad || 1);
        const lineaAntesCupon = Number(finalLineTotal || 0);

        let descuentoCuponLinea = 0;

        if (descuentoCuponTotal > 0 && totalLineasAntesCupon > 0) {
          if (index === breakdown.lines.length - 1) {
            // Ajuste para que no haya diferencia por redondeo en el último producto
            descuentoCuponLinea = Number((descuentoCuponTotal - descuentoCuponAcumulado).toFixed(2));
          } else {
            descuentoCuponLinea = Number(
              ((lineaAntesCupon / totalLineasAntesCupon) * descuentoCuponTotal).toFixed(2)
            );

            descuentoCuponAcumulado += descuentoCuponLinea;
          }
        }

        const precioUnitario = Number((lineaAntesCupon / cantidad).toFixed(2));

        const precioCuponDescuento = Number(
          (descuentoCuponLinea / cantidad).toFixed(2)
        );

        const precioFinalUnitario = Number(
          ((lineaAntesCupon - descuentoCuponLinea) / cantidad).toFixed(2)
        );

        return {
          producto_id: Number(item.id),
          cantidad,
          precio_unitario: precioUnitario,

          // Columnas nuevas creadas en Supabase
          PrecioCuponDescuento: precioCuponDescuento,
          Precio_Final_Unitario: precioFinalUnitario
        };
      });

      const ventaParaBD = {
        total: Number(Number(breakdown.finalTotal).toFixed(2)),
        items: itemsParaBD
      };

      console.log('VENTA QUE SE ENVIARÁ A BD:', ventaParaBD);

      const respuestaVenta = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ventaParaBD)
      });

      const dataVenta = await respuestaVenta.json();

      if (!respuestaVenta.ok) {
        throw new Error(dataVenta.error || 'No se pudo guardar la venta en la base de datos');
      }

      console.log('VENTA GUARDADA EN BD:', dataVenta);

      const receiptNumber = generateReceiptNumber();
      const dateObj = new Date();
      const formattedDate = `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;

      const rows = breakdown.lines.map(({ item, unitPrice, finalLineTotal }) => {
        return `
          <tr>
            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: left;">
              <strong style="color: #2c3e50;">${PalmasCart.escapeHTML(item.nombre)}</strong><br>
              <small style="color: #7f8c8d;">${PalmasCart.escapeHTML(item.marca)} | ${PalmasCart.escapeHTML(item.categoria || 'General')}</small>
            </td>

            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center; color: #2c3e50;">
              ${Number(item.cantidad)}
            </td>

            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right; color: #2c3e50;">
              ${PalmasCart.formatPrice(unitPrice)}
            </td>

            <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #1a252f;">
              ${PalmasCart.formatPrice(finalLineTotal)}
            </td>
          </tr>
        `;
      }).join('');

      const discountRows = [];

      if (breakdown.clearanceTotal > 0) {
        discountRows.push(`
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #dc3545; font-size: 0.95rem;">
            <span>Liquidaciones / remates:</span>
            <strong>- ${PalmasCart.formatPrice(breakdown.clearanceTotal)}</strong>
          </div>
        `);
      }

      if (breakdown.bulkTotal > 0) {
        discountRows.push(`
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #198754; font-size: 0.95rem;">
            <span>Descuento 3+ unidades (15%):</span>
            <strong>- ${PalmasCart.formatPrice(breakdown.bulkTotal)}</strong>
          </div>
        `);
      }

      if (breakdown.couponDiscount > 0 && breakdown.appliedCoupon) {
        discountRows.push(`
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #0d6efd; font-size: 0.95rem;">
            <span>Cupón ${breakdown.appliedCoupon.code}:</span>
            <strong>- ${PalmasCart.formatPrice(breakdown.couponDiscount)}</strong>
          </div>
        `);
      }

      const htmlBoleta = `
        <div class="receipt-box" style="background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; font-family: Arial, sans-serif;">

          <div style="text-align: center; border-bottom: 2px dashed #cccccc; padding-bottom: 25px; margin-bottom: 25px;">
            <h2 style="font-weight: 900; margin-bottom: 5px; color: #1a252f; text-transform: uppercase; letter-spacing: 2px; font-size: 2rem;">
              Palmas Street
            </h2>

            <p style="color: #7f8c8d; margin-bottom: 20px; font-size: 0.95rem;">
              Frescura, atrevimiento y moda.
            </p>

            <div style="display: inline-block; background: #f8f9fa; padding: 12px 25px; border-radius: 8px; border: 1px solid #eeeeee;">
              <h4 style="margin: 0 0 5px 0; font-weight: 800; color: #2c3e50; font-size: 1.1rem;">
                BOLETA DE VENTA ELECTRÓNICA
              </h4>

              <p style="margin: 0; font-family: monospace; font-size: 1.2rem; color: #1a252f; letter-spacing: 1px;">
                ${receiptNumber}
              </p>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 0.95rem; color: #2c3e50;">
            <div>
              <p style="margin: 0 0 6px 0;"><strong>Fecha de Emisión:</strong> ${formattedDate}</p>
              <p style="margin: 0 0 6px 0;"><strong>Cliente:</strong> Consumidor Final</p>
            </div>

            <div style="text-align: right;">
              <p style="margin: 0 0 6px 0;"><strong>Moneda:</strong> Soles (PEN)</p>
              <p style="margin: 0 0 6px 0;"><strong>Método de Pago:</strong> Pago Digital</p>
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f1f3f5;">
                  <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057; text-transform: uppercase; font-size: 0.85rem;">
                    Producto
                  </th>

                  <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #dee2e6; color: #495057; text-transform: uppercase; font-size: 0.85rem;">
                    Cant.
                  </th>

                  <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057; text-transform: uppercase; font-size: 0.85rem;">
                    Precio U.
                  </th>

                  <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057; text-transform: uppercase; font-size: 0.85rem;">
                    Subtotal
                  </th>
                </tr>
              </thead>

              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>

          <div style="border-top: 2px solid #dee2e6; padding-top: 20px; width: 65%; margin-left: auto;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 1rem;">
              <span style="color: #6c757d;">Subtotal (antes de dctos):</span>
              <strong style="color: #2c3e50;">${PalmasCart.formatPrice(breakdown.subtotalBeforeDiscounts)}</strong>
            </div>

            ${discountRows.join('')}

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 20px; border-top: 2px dashed #cccccc;">
              <span style="font-size: 1.3rem; font-weight: 900; color: #2c3e50;">
                TOTAL A PAGAR:
              </span>

              <span style="font-size: 1.8rem; font-weight: 900; color: #1a252f;">
                ${PalmasCart.formatPrice(breakdown.finalTotal)}
              </span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 5px solid #1a252f;">
            <strong style="color: #2c3e50; font-size: 1.1rem;">
              ¡Gracias por tu compra en Palmas Street!
            </strong><br>

            <span style="color: #6c757d; font-size: 0.9rem;">
              Tu estilo, tus reglas. Vuelve pronto.
            </span>
          </div>

          <div class="no-print" style="display: flex; gap: 15px; justify-content: center; margin-top: 40px;">
            <button type="button" class="btn btn-dark" onclick="window.print()" style="padding: 12px 30px; font-weight: bold; border-radius: 8px; font-size: 1.1rem;">
              <i class="bi bi-printer me-2"></i>Imprimir / Guardar PDF
            </button>

            <a href="/index.html#catalogo" class="btn btn-outline-secondary" style="padding: 12px 30px; font-weight: bold; border-radius: 8px; font-size: 1.1rem;">
              Volver al catálogo
            </a>
          </div>
        </div>
      `;

      // Vaciar memoria del carrito
      PalmasCart.clearCart();

      // Reemplazar contenido por boleta
      const mainContainer = document.querySelector('.cart-page .container');

      if (mainContainer) {
        mainContainer.innerHTML = htmlBoleta;
      } else if (receiptContainer) {
        receiptContainer.innerHTML = htmlBoleta;
        receiptContainer.classList.remove('d-none');
        receiptContainer.style.display = 'block';

        if (cartContent) cartContent.style.display = 'none';
        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error al generar la boleta:', error);
      alert('Hubo un error al generar la boleta.');
    }
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', (e) => {
      if (e) e.preventDefault();

      if (confirm('¿Seguro que deseas vaciar el carrito?')) {
        PalmasCart.clearCart();

        if (receiptContainer) {
          receiptContainer.classList.add('d-none');
          receiptContainer.innerHTML = '';
        }

        if (couponInput) couponInput.value = '';

        showCouponMessage('', '');
        renderCart();
      }
    });
  }

  // Quitamos cualquier event listener viejo del botón reemplazándolo por uno limpio
  if (finishPurchaseBtn) {
    const cleanBtn = finishPurchaseBtn.cloneNode(true);

    finishPurchaseBtn.parentNode.replaceChild(cleanBtn, finishPurchaseBtn);

    cleanBtn.addEventListener('click', finishPurchase);
  }

  renderCart();
});