document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('tema');
  
  const applyTheme = (isDark) => {
      if (isDark) {
          document.body.classList.add('dark'); 
          document.documentElement.setAttribute('data-bs-theme', 'dark'); 
          if(themeToggle) {
              themeToggle.innerHTML = '☀️';
          }
      } else {
          document.body.classList.remove('dark');
          document.documentElement.setAttribute('data-bs-theme', 'light');
          if(themeToggle) {
              themeToggle.innerHTML = '🌙'; 
          }
      }
  };

  if (savedTheme === 'dark') {
      applyTheme(true);
  }

  if (themeToggle) {
      themeToggle.addEventListener('click', (e) => {
          e.preventDefault(); 
          const isDark = !document.body.classList.contains('dark');
          applyTheme(isDark);
          localStorage.setItem('tema', isDark ? 'dark' : 'light');
      });
  }
});

const slider = document.getElementById('slider');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('dots');

let counter = 0;
const size = 100;
const totalSlides = slides.length;
const intervalTime = 5000; 

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
  if (counter >= totalSlides - 1) { 
    counter = 0; 
  } else { 
    counter++; 
  }
  slider.style.transform = `translateX(${-size * counter}%)`;
  updateDots();
}

function prevSlide() {
  if (counter <= 0) { 
    counter = totalSlides - 1; 
  } else { 
    counter--; 
  }
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

const bannerContainer = document.querySelector('.banner-container');
if (bannerContainer) {
  bannerContainer.addEventListener('mouseenter', () => {
    clearInterval(timer);
  });
  
  bannerContainer.addEventListener('mouseleave', () => {
    timer = setInterval(moveSlide, intervalTime);
  });
}

async function cargarProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;

    try {
        const respuesta = await fetch('/api/main_products');
        if (!respuesta.ok) {
            throw new Error('Error al conectar con la API');
        }

        const productos = await respuesta.json();
        contenedor.innerHTML = ''; 

        if (productos.length === 0) {
            contenedor.innerHTML = '<p style="text-align:center; width:100%; color: white;">No hay productos disponibles.</p>';
            return;
        }

        productos.forEach(producto => {
            const article = document.createElement('article');
            article.classList.add('product-card');

            article.innerHTML = `
                <img src="${producto.imagen_url}" alt="${producto.nombre}" loading="lazy" style="width: 100%; display: block;" />
                <div class="product-info" style="padding: 20px; background: #1a1a1a; text-align: center;">
                    <h3 style="color: #fff; margin-bottom: 10px; font-size: 1.2rem;">${producto.nombre}</h3>
                    <p style="color: #888; font-size: 0.9rem; margin-bottom: 10px;">${producto.descripcion || ''}</p>
                    <p style="color: #fff; font-weight: bold; margin-bottom: 15px;">S/ ${producto.precio}</p>
                    
                    <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 20px;">
                        <button class="btn-restar" style="background: #333; color: white; border: 1px solid #444; padding: 5px 12px; cursor: pointer; border-radius: 4px;">-</button>
                        <span class="cantidad-valor" style="color: white; font-weight: bold; font-size: 1.1rem;">1</span>
                        <button class="btn-sumar" style="background: #333; color: white; border: 1px solid #444; padding: 5px 12px; cursor: pointer; border-radius: 4px;">+</button>
                    </div>

                    <button class="btn-agregar" style="background: white !important; color: black !important; border: none; padding: 12px; width: 100%; font-weight: bold; cursor: pointer; border-radius: 4px; text-transform: uppercase; display: block !important;">
                        Agregar al carrito
                    </button>
                </div>
            `;

            const btnRestar = article.querySelector('.btn-restar');
            const btnSumar = article.querySelector('.btn-sumar');
            const cantidadTexto = article.querySelector('.cantidad-valor');
            const btnAgregar = article.querySelector('.btn-agregar');

            let cantidad = 1;

            btnSumar.onclick = () => {
                cantidad++;
                cantidadTexto.innerText = cantidad;
            };

            btnRestar.onclick = () => {
                if (cantidad > 1) {
                    cantidad--;
                    cantidadTexto.innerText = cantidad;
                }
            };

            btnAgregar.onclick = () => {
                if (window.PalmasCart) {
                PalmasCart.addToCart(producto, cantidad);
                const originalText = btnAgregar.innerText;
                btnAgregar.innerText = '¡AÑADIDO!';
                setTimeout(() => { btnAgregar.innerText = originalText; }, 1000);
              }
            };

            contenedor.appendChild(article);
        });
    } catch (error) {
        console.error('Error:', error);
        contenedor.innerHTML = '<p style="text-align:center; color:red;">Error de carga.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
});

