(function () {
  const CART_KEY = 'palmasStreetCart';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
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
      imagen_url: product.imagen_url || '/media/media-logos/LogoPS.png',
      marca: product.marca || 'Palmas Street',
      categoria: product.categoria || 'General'
    };
  }

  function addToCart(product, quantity = 1) {
    const cart = getCart();
    const normalizedProduct = normalizeProduct(product);
    const parsedQuantity = Math.max(1, Number(quantity) || 1);

    const existingItem = cart.find(item => item.id === normalizedProduct.id);

    if (existingItem) {
      existingItem.cantidad += parsedQuantity;
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
    const cart = getCart();
    const parsedQuantity = Math.max(1, Number(quantity) || 1);

    const updatedCart = cart.map(item => {
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

    document.querySelectorAll('.js-cart-count, #cartBadge, #cart-count').forEach(badge => {
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