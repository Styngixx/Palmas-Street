// ========================================
// BÚSQUEDA DINÁMICA DE PRODUCTOS POR NOMBRE
// ========================================

let todosLosProductos = []; // Almacenamos todos los productos

// Función para renderizar productos
function renderizarProductos(productosAMostrar) {
  const contenedor = document.getElementById('contenedor-productos');
  
  if (!contenedor) return;

  if (productosAMostrar.length === 0) {
    contenedor.innerHTML = '<p style="text-align:center; width:100%; color:#999; grid-column: 1/-1;">No se encontraron productos.</p>';
    return;
  }

  contenedor.innerHTML = '';
  
  productosAMostrar.forEach(producto => {
    const tarjetaHTML = `
      <article class="product-card">
        <img src="${producto.imagen_url}" alt="${producto.nombre}" loading="lazy" />
        <div class="product-info">
          <h3>${producto.nombre}</h3>
          <p>${producto.descripcion}</p>
          <p style="font-weight: bold; margin-top: 10px; color: #333;">S/ ${producto.precio}</p>
        </div>
      </article>
    `;
    contenedor.innerHTML += tarjetaHTML;
  });
}

// Función para filtrar productos por nombre
function filtrarProductos(termino) {
  const terminoBusqueda = termino.toLowerCase().trim();

  // Si el término es vacío, mostrar todos los productos
  if (terminoBusqueda === '') {
    renderizarProductos(todosLosProductos);
    return;
  }

  // Filtrar productos que contengan el término en el nombre
  const productosFiltrados = todosLosProductos.filter(producto =>
    producto.nombre.toLowerCase().includes(terminoBusqueda)
  );

  renderizarProductos(productosFiltrados);
}

// Función para agregar el evento al input de búsqueda
function agregarEventoBuscador() {
  const buscador = document.getElementById('buscador-productos');

  if (buscador) {
    // Evento mientras escribes (en tiempo real)
    buscador.addEventListener('input', (e) => {
      filtrarProductos(e.target.value);
    });

    // Opcional: agregar estilos dinámicos
    buscador.addEventListener('focus', (e) => {
      e.target.style.borderColor = '#333';
      e.target.style.boxShadow = '0 0 5px rgba(0,0,0,0.2)';
    });

    buscador.addEventListener('blur', (e) => {
      e.target.style.borderColor = '#ddd';
      e.target.style.boxShadow = 'none';
    });
  }
}

// Escuchar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
});

// 1. ESTADO GLOBAL
let carrito = JSON.parse(localStorage.getItem('carrito_palmas')) || [];

// 2. FUNCIONES DE UTILIDAD
function guardarCarrito() {
    localStorage.setItem('carrito_palmas', JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('contador-carrito');
    if (!contador) return;
    // Sumamos las cantidades de todos los productos
    const totalItems = carrito.reduce((total, producto) => total + producto.cantidad, 0);
    contador.innerText = totalItems;
}

// 3. CARGA DE PRODUCTOS DESDE LA API
async function cargarProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;

    try {
        const respuesta = await fetch('/api/main_products');
        const productos = await respuesta.json();
        
        contenedor.innerHTML = ''; 

        productos.forEach(producto => {
            const article = document.createElement('article');
            article.classList.add('product-card');

            // Diseño de la tarjeta (Cambiamos estilos para que coincida con tu imagen)
            article.innerHTML = `
                <img src="${producto.imagen_url}" alt="${producto.nombre}" loading="lazy">
                <div class="product-info" style="padding: 15px; text-align: center;">
                    <h3 style="color: white;">${producto.nombre}</h3>
                    <p style="color: #aaa; font-size: 0.8rem;">${producto.descripcion || ''}</p>
                    <p style="font-weight: bold; margin-top: 10px; color: #fff;">S/ ${producto.precio}</p>
                    
                    <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin: 15px 0;">
                        <button class="btn-restar" style="background: #333; color: white; border: 1px solid #444; padding: 5px 12px; cursor: pointer; border-radius: 4px;">-</button>
                        <span class="cantidad-valor" style="color: #00ff00; font-weight: bold; font-size: 1.2rem;">1</span>
                        <button class="btn-sumar" style="background: #333; color: white; border: 1px solid #444; padding: 5px 12px; cursor: pointer; border-radius: 4px;">+</button>
                    </div>

                    <button class="btn-agregar" style="background: white; color: black; border: none; padding: 12px; width: 100%; font-weight: bold; cursor: pointer; border-radius: 4px; text-transform: uppercase;">
                        Agregar al carrito
                    </button>
                </div>
            `;

            const span = article.querySelector('.cantidad-valor');
            const btnS = article.querySelector('.btn-sumar');
            const btnR = article.querySelector('.btn-restar');
            const btnA = article.querySelector('.btn-agregar');
            let cant = 1;

            // Botones de cantidad
            btnS.onclick = () => { cant++; span.innerText = cant; };
            btnR.onclick = () => { if(cant > 1) { cant--; span.innerText = cant; } };

            // Botón Agregar
            btnA.onclick = () => {
                const productoParaCarrito = {
                    id: producto.id,
                    nombre: producto.nombre,
                    precio: parseFloat(producto.precio),
                    imagen: producto.imagen_url,
                    cantidad: cant
                };

                const indice = carrito.findIndex(item => item.id === productoParaCarrito.id);
                if (indice !== -1) {
                    carrito[indice].cantidad += cant;
                } else {
                    carrito.push(productoParaCarrito);
                }

                // GUARDAR Y ACTUALIZAR EL "0" DE LA CABECERA
                guardarCarrito();
                actualizarContadorCarrito();

                // Feedback visual
                const textoOriginal = btnA.innerText;
                btnA.innerText = "¡AÑADIDO!";
                btnA.style.background = "#00ff00";
                setTimeout(() => {
                    btnA.innerText = textoOriginal;
                    btnA.style.background = "white";
                    cant = 1;
                    span.innerText = "1";
                }, 1000);
            };

            contenedor.appendChild(article);
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
    }
}

// 4. ARRANQUE
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    actualizarContadorCarrito();
});