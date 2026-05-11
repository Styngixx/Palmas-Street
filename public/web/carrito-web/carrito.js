// carrito.js - Funcionalidad del carrito de compras

document.addEventListener('DOMContentLoaded', () => {
  displayCart();
});

function displayCart() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const cartContainer = document.getElementById('cart-items');
  const cartSummary = document.getElementById('cart-summary');
  const emptyCart = document.getElementById('empty-cart');

  if (cartItems.length === 0) {
    cartContainer.innerHTML = '';
    cartSummary.style.display = 'none';
    emptyCart.style.display = 'block';
    return;
  }

  emptyCart.style.display = 'none';
  cartSummary.style.display = 'block';

  let subtotal = 0;
  cartContainer.innerHTML = cartItems.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <p>Precio: S/ ${item.price}</p>
          <div class="quantity-controls">
            <button onclick="updateQuantity(${index}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity(${index}, 1)">+</button>
          </div>
          <p>Total: S/ ${itemTotal.toFixed(2)}</p>
          <button onclick="removeItem(${index})">Eliminar</button>
        </div>
      </div>
    `;
  }).join('');

  const shipping = subtotal > 100 ? 0 : 10; // Envío gratis si subtotal > 100
  const total = subtotal + shipping;

  document.getElementById('subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('shipping').textContent = shipping.toFixed(2);
  document.getElementById('total').textContent = total.toFixed(2);
}

function updateQuantity(index, change) {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  cartItems[index].quantity += change;
  if (cartItems[index].quantity <= 0) {
    cartItems.splice(index, 1);
  }
  localStorage.setItem('cart', JSON.stringify(cartItems));
  displayCart();
}

function removeItem(index) {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  cartItems.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cartItems));
  displayCart();
}

document.getElementById('checkout-btn').addEventListener('click', () => {
  // Lógica para proceder al pago
  alert('Funcionalidad de pago no implementada aún.');
});