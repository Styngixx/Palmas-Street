(function () {
  const CART_KEY = 'palmasStreetCart';
  const COUPON_KEY = 'palmasCoupon';

  // Cupones definidos
  const COUPONS = {
    'UTP20': 0.20,
    'MARCOWEB': 0.10,
    'MUNDIAL26': 0.26
  };

  function getCart() {
    try {
      const rawCart = localStorage.getItem(CART_KEY);
      return rawCart ? JSON.parse(rawCart) : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadges();
  }

  function normalizeProduct(product) {
    return {
      id: String(product.id),
      nombre: product.nombre || 'Producto sin nombre',
      descripcion: product.descripcion || 'Sin descripción',
      precio: Number(product.precio || 0),
      imagen_url: product.imagen_url || product.imagen || '/media/media-logos/LogoPS.png',
      marca: product.marca || 'Palmas Street',
      categoria: product.categoria || 'General' 
    };
  }

  function addToCart(product, quantity = 1) {
    const parsedQuantity = Math.max(1, Number(quantity) || 1);
    const normalizedProduct = normalizeProduct(product);
    const cart = getCart();
    const existingItem = cart.find(item => String(item.id) === String(normalizedProduct.id));
    if (existingItem) {
      existingItem.cantidad = Number(existingItem.cantidad || 0) + parsedQuantity;
    } else {
      cart.push({ ...normalizedProduct, cantidad: parsedQuantity });
    }
    saveCart(cart);
    return cart;
  }

  function updateQuantity(productId, quantity) {
    const parsedQuantity = Math.max(1, Number(quantity) || 1);
    const updatedCart = getCart().map(item => {
      if (String(item.id) === String(productId)) return { ...item, cantidad: parsedQuantity };
      return item;
    });
    saveCart(updatedCart);
    return updatedCart;
  }

  function removeFromCart(productId) {
    const updatedCart = getCart().filter(item => String(item.id) !== String(productId));
    saveCart(updatedCart);
    return updatedCart;
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(COUPON_KEY);
    updateCartBadges();
  }

  function applyCoupon(code) {
    const upperCode = (code || '').toUpperCase().trim();
    if (COUPONS[upperCode]) {
      localStorage.setItem(COUPON_KEY, upperCode);
      return { success: true, message: `¡Cupón ${upperCode} aplicado exitosamente!` };
    }
    return { success: false, message: 'Cupón inválido o expirado.' };
  }

  function removeCoupon() {
    localStorage.removeItem(COUPON_KEY);
  }

  function getCartBreakdown() {
    const cart = getCart();
    let subtotalBeforeDiscounts = 0;
    let clearanceTotal = 0;
    let bulkTotal = 0;

    const lines = cart.map(item => {
      const qty = Number(item.cantidad || 0);
      const basePrice = Number(item.precio || 0);
      const lineBaseTotal = basePrice * qty;
      subtotalBeforeDiscounts += lineBaseTotal;

      let saleLabel = null;
      let clearanceDiscountPercentage = 0;
      
      // MOTOR INTELIGENTE: Si la categoría vino vacía, la saca del nombre
      let cat = item.categoria || '';
      const nombreLower = (item.nombre || '').toLowerCase();
      
      if (!cat || cat === 'General' || cat === 'Otros' || cat === 'Varios') {
          if(nombreLower.includes('polo')) cat = 'Polo';
          else if(nombreLower.includes('casaca')) cat = 'Casaca';
          else if(nombreLower.includes('vestido')) cat = 'Vestido';
          else if(nombreLower.includes('chaqueta') || nombreLower.includes('bomber')) cat = 'Chaqueta';
          else if(nombreLower.includes('gorra') || nombreLower.includes('sombrero')) cat = 'Gorras y Sombreros';
          else if(nombreLower.includes('anillo') || nombreLower.includes('collar') || nombreLower.includes('pulsera')) cat = 'Joyería';
      }

      // TERCER DESCUENTO: Etiquetas con el texto del porcentaje
      if (cat === 'Polo') {
        saleLabel = 'Mundial 2026 (-10%)'; clearanceDiscountPercentage = 0.10;
      } else if (cat === 'Casaca') {
        saleLabel = 'Fiestas Patrias (-15%)'; clearanceDiscountPercentage = 0.15;
      } else if (cat === 'Vestido') {
        saleLabel = 'Fiestas Patrias (-15%)'; clearanceDiscountPercentage = 0.15;
      } else if (cat === 'Chaqueta' || cat === 'Bomber') {
        saleLabel = 'Look Invernal Fashion (-20%)'; clearanceDiscountPercentage = 0.20;
      } else if (cat === 'Gorras y Sombreros') {
        saleLabel = 'Liquidación Accesorios (-30%)'; clearanceDiscountPercentage = 0.30;
      } else if (cat === 'Joyería') {
        saleLabel = 'Remate Exclusivo (-10%)'; clearanceDiscountPercentage = 0.10;
      }

      let lineClearanceDiscount = lineBaseTotal * clearanceDiscountPercentage;
      clearanceTotal += lineClearanceDiscount;
      let priceAfterClearance = lineBaseTotal - lineClearanceDiscount;
      let clearanceUnitPrice = priceAfterClearance / qty; 

      // PRIMER DESCUENTO: 15% por 3+ unidades
      let bulkEligible = false;
      let lineBulkDiscount = 0;
      if (qty >= 3) {
        bulkEligible = true;
        lineBulkDiscount = priceAfterClearance * 0.15; 
        bulkTotal += lineBulkDiscount;
      }

      let finalLineTotal = priceAfterClearance - lineBulkDiscount;

      return {
        item,
        unitPrice: clearanceUnitPrice, 
        finalLineTotal,
        bulkEligible,
        saleLabel
      };
    });

    let totalAfterItemDiscounts = subtotalBeforeDiscounts - clearanceTotal - bulkTotal;

    // SEGUNDO DESCUENTO: Cupones
    let couponDiscount = 0;
    let appliedCoupon = null;
    const appliedCouponCode = localStorage.getItem(COUPON_KEY);
    
    if (appliedCouponCode && COUPONS[appliedCouponCode]) {
      couponDiscount = totalAfterItemDiscounts * COUPONS[appliedCouponCode];
      appliedCoupon = { code: appliedCouponCode, percentage: COUPONS[appliedCouponCode] };
    }

    let finalTotal = totalAfterItemDiscounts - couponDiscount;

    return {
      subtotalBeforeDiscounts,
      clearanceTotal,
      bulkTotal,
      couponDiscount,
      appliedCoupon,
      finalTotal,
      lines
    };
  }

  function getTotalItems() {
    return getCart().reduce((total, item) => total + Number(item.cantidad || 0), 0);
  }

  function getTotalPrice() {
    return getCartBreakdown().finalTotal;
  }

  function updateCartBadges() {
    const totalItems = getTotalItems();
    document.querySelectorAll('.js-cart-count, #cartBadge, #cart-count, #contador-carrito').forEach(badge => {
      badge.textContent = totalItems;
    });
  }

  function formatPrice(value) {
    return `S/ ${Number(value || 0).toFixed(2)}`;
  }

  function escapeHTML(value) {
    return String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
  }

  window.PalmasCart = {
    getCart, saveCart, addToCart, updateQuantity, removeFromCart, clearCart,
    getTotalItems, getTotalPrice, updateCartBadges, formatPrice, escapeHTML,
    applyCoupon, removeCoupon, getCartBreakdown
  };

  document.addEventListener('DOMContentLoaded', updateCartBadges);
})();