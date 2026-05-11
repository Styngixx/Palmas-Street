const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("tema");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const darkModeActive = document.body.classList.contains("dark");
  themeToggle.textContent = darkModeActive ? "☀️" : "🌙";
  localStorage.setItem("tema", darkModeActive ? "dark" : "light");
});





const slider = document.getElementById('slider');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('dots');

let counter = 0;
const size = 100;
const totalSlides = slides.length;
const intervalTime = 8000;

slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function updateDots() {
  dots.forEach(dot => dot.classList.remove('active'));
  dots[counter].classList.add('active');
}

function moveSlide() {
  if (counter >= totalSlides - 1) { counter = 0; } else { counter++; }
  slider.style.transform = `translateX(${-size * counter}%)`;
  updateDots();
}

function prevSlide() {
  if (counter <= 0) { counter = totalSlides - 1; } else { counter--; }
  slider.style.transform = `translateX(${-size * counter}%)`;
  updateDots();
  resetTimer();
}

function nextSlide() {
  moveSlide();
  resetTimer();
}

function goToSlide(index) {
  counter = index;
  slider.style.transform = `translateX(${-size * counter}%)`;
  updateDots();
  resetTimer();
}

nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

let timer = setInterval(moveSlide, intervalTime);
function resetTimer() {
  clearInterval(timer);
  timer = setInterval(moveSlide, intervalTime);
}

// =========================================================
// LÓGICA DEL CATÁLOGO DINÁMICO (CONEXIÓN A LA BASE DE DATOS)
// =========================================================

async function cargarProductos() {
  // Buscamos el div vacío que dejamos en el HTML
  const contenedor = document.getElementById('contenedor-productos');
  
  // Si no estamos en el index.html (por ejemplo, en la página de Nosotros), no hace nada
  if (!contenedor) return;

  try {
      // Le pedimos a nuestro servidor Node.js que nos traiga la ropa de Supabase
      const respuesta = await fetch('/api/main_products');
      
      if (respuesta.ok) {
          const productos = await respuesta.json();
          
          // Borramos el texto de "Cargando colección..."
          contenedor.innerHTML = '';

          // Si la base de datos está vacía
          if (productos.length === 0) {
              contenedor.innerHTML = '<p style="text-align:center; width:100%;">No hay productos disponibles por ahora.</p>';
              return;
          }

          // Si hay productos, los dibujamos uno por uno
          productos.forEach(producto => {
              const tarjetaHTML = `
                  <article class="product-card">
                      <img src="${producto.imagen_url}" alt="${producto.nombre}" loading="lazy" />
                      <div class="product-info">
                          <h3>${producto.nombre}</h3>
                          <p>${producto.descripcion}</p>
                          <p style="font-weight: bold; margin-top: 10px; color: #333;">S/ ${producto.precio}</p>
                          <button class="btn-add-cart" data-id="${producto.id}" data-name="${producto.nombre}" data-price="${producto.precio}" data-image="${producto.imagen_url}">Agregar al Carrito</button>
                      </div>
                  </article>
              `;
              // Inyectamos el HTML de la tarjeta dentro del contenedor
              contenedor.innerHTML += tarjetaHTML;
          });

          // Agregar event listeners a los botones de agregar al carrito
          document.querySelectorAll('.btn-add-cart').forEach(button => {
              button.addEventListener('click', addToCart);
          });
      } else {
          contenedor.innerHTML = '<p style="text-align:center; color:red; width:100%;">Error al cargar el catálogo.</p>';
      }
  } catch (error) {
      console.error('Error de red al cargar productos:', error);
      contenedor.innerHTML = '<p style="text-align:center; color:red; width:100%;">No se pudo conectar con el servidor.</p>';
  }
}

function addToCart(event) {
  const button = event.target;
  const id = button.getAttribute('data-id');
  const name = button.getAttribute('data-name');
  const price = parseFloat(button.getAttribute('data-price'));
  const image = button.getAttribute('data-image');

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, image, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${name} agregado al carrito!`);
}

// Escuchamos el evento para que la función arranque apenas cargue la página
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
});

/* 
const botonesComprar = document.querySelectorAll('.btn-comprar');
const resumenCarrito = document.getElementById('carrito-resumen');
const formCompra = document.getElementById('formulario-compra');
let productoSeleccionado = null;

botonesComprar.forEach(boton => {
  boton.addEventListener('click', (e) => {
    const nombre = e.target.getAttribute('data-nombre');
    const precio = e.target.getAttribute('data-precio');
    productoSeleccionado = { nombre, precio };

   
    resumenCarrito.innerHTML = `<strong>Prenda seleccionada:</strong> ${nombre} <br> <strong>Total a pagar:</strong> S/ ${precio}`;
    formCompra.style.display = 'block';

    document.getElementById('carrito-section').scrollIntoView({ behavior: 'smooth' });
  });
});

formCompra.addEventListener('submit', (e) => {
  e.preventDefault();

  const nombreCliente = document.getElementById('cliente-nombre').value;
  const tipoTarjeta = document.getElementById('cliente-tarjeta').value;

 
  let numTarjeta = '';
  for (let i = 0; i < 16; i++) {
    numTarjeta += Math.floor(Math.random() * 10);
  }

  alert("Comprando...");

  const fechaActual = new Date().toLocaleString();
  const mensajeRecibo = `==========================
🛒 TICKET DE COMPRA
==========================
Fecha y Hora: ${fechaActual}
Cliente: ${nombreCliente}
Producto: ${productoSeleccionado.nombre}
Monto Pagado: S/ ${productoSeleccionado.precio}
Método de Pago: Tarjeta ${tipoTarjeta} (Terminada en **** ${numTarjeta.slice(-4)})
==========================
¡Gracias por tu compra en Palmas Street!`;

  alert(mensajeRecibo);

 
  formCompra.reset();
  formCompra.style.display = 'none';
  resumenCarrito.innerHTML = 'No hay prendas seleccionadas.';
  productoSeleccionado = null;
});
*/

