(function () {
  const CART_KEY = 'palmasStreetCart';

  function getCart() {
    try {
      const rawCart = localStorage.getItem(CART_KEY);
      return rawCart ? JSON.parse(rawCart) : [];
    } catch (error) {
      console.error('Error leyendo el carrito:', error);
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
      cart.push({
        ...normalizedProduct,
        cantidad: parsedQuantity
      });
    }

    saveCart(cart);
    return cart;
  }

  function updateQuantity(productId, quantity) {
    const parsedQuantity = Math.max(1, Number(quantity) || 1);
    const updatedCart = getCart().map(item => {
      if (String(item.id) === String(productId)) {
        return { ...item, cantidad: parsedQuantity };
      }

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
    updateCartBadges();
  }

  function getTotalItems() {
    return getCart().reduce((total, item) => total + Number(item.cantidad || 0), 0);
  }

  function getTotalPrice() {
    return getCart().reduce((total, item) => {
      return total + Number(item.precio || 0) * Number(item.cantidad || 0);
    }, 0);
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
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  window.PalmasCart = {
    getCart,
    saveCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    updateCartBadges,
    formatPrice,
    escapeHTML
  };

  document.addEventListener('DOMContentLoaded', updateCartBadges);
})();
