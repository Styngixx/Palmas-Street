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
// Nota: La carga de productos ahora se maneja en dinamica.js
// para soportar búsqueda dinámica
// =========================================================

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

