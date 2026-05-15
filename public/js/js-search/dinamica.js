// ========================================
// BÚSQUEDA DINÁMICA DE PRODUCTOS POR NOMBRE
// ========================================

let todosLosProductos = []; // Almacenamos todos los productos

// Función para renderizar productos
function renderizarProductos(productosAMostrar) {
  const contenedor = document.getElementById('contenedor-productos');
  
  if (!contenedor) return;

  if (productosAMostrar.length === 0) {
    contenedor.innerHTML = '<p style="text-align:center; width:100%; color: var(--text-soft); grid-column: 1/-1;">No se encontraron productos.</p>';
    return;
  }

  contenedor.innerHTML = '';
  
  productosAMostrar.forEach(producto => {
    const article = document.createElement('article');
    article.classList.add('product-card');

    // AQUÍ ESTÁ LA MAGIA: Cambiamos 'white' por 'var(--text)' para que respete el modo claro/oscuro
    article.innerHTML = `
        <img src="${producto.imagen_url}" alt="${producto.nombre}" loading="lazy" style="width: 100%; height: 350px; object-fit: cover;">
        <div class="product-info" style="padding: 15px; text-align: center; background: var(--surface);">
            <h3 style="color: var(--text);">${producto.nombre}</h3>
            <p style="color: var(--text-soft); font-size: 0.9rem;">${producto.descripcion || ''}</p>
            <p style="font-weight: bold; margin-top: 10px; color: var(--text); font-size: 1.2rem;">S/ ${parseFloat(producto.precio).toFixed(2)}</p>
            
            <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin: 15px 0;">
                <button class="btn-restar" style="background: var(--surface-2); color: var(--text); border: 1px solid var(--border); padding: 5px 12px; cursor: pointer; border-radius: 4px; font-size: 1.1rem;">-</button>
                <span class="cantidad-valor" style="color: var(--text); font-weight: bold; font-size: 1.2rem;">1</span>
                <button class="btn-sumar" style="background: var(--surface-2); color: var(--text); border: 1px solid var(--border); padding: 5px 12px; cursor: pointer; border-radius: 4px; font-size: 1.1rem;">+</button>
            </div>

            <button class="btn-agregar" style="background: var(--primary); color: white; border: none; padding: 12px; width: 100%; font-weight: bold; cursor: pointer; border-radius: 4px; text-transform: uppercase;">
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

    // Botón Agregar al Carrito Global
    btnA.onclick = () => {
        if (window.PalmasCart) {
            const productoEstandar = {
                id: producto.id,
                nombre: producto.nombre,
                precio: parseFloat(producto.precio),
                imagen_url: producto.imagen_url,
                marca: producto.marca || 'Palmas Street'
            };
            
            PalmasCart.addToCart(productoEstandar, cant);
            PalmasCart.updateCartBadges(); 
        } else {
            console.error("Falta el archivo cart-utils.js o PalmasCart no está definido.");
        }

        // Feedback visual
        const textoOriginal = btnA.innerText;
        btnA.innerText = "¡AÑADIDO!";
        btnA.style.background = "#28a745"; // Un verde un poco más profesional
        setTimeout(() => {
            btnA.innerText = textoOriginal;
            btnA.style.background = "var(--primary)";
            cant = 1;
            span.innerText = "1";
        }, 1000);
    };

    contenedor.appendChild(article);
  });
}

// Función para filtrar productos por nombre
function filtrarProductos(termino) {
  const terminoBusqueda = termino.toLowerCase().trim();

  if (terminoBusqueda === '') {
    renderizarProductos(todosLosProductos);
    return;
  }

  const productosFiltrados = todosLosProductos.filter(producto =>
    (producto.nombre && producto.nombre.toLowerCase().includes(terminoBusqueda)) ||
    (producto.descripcion && producto.descripcion.toLowerCase().includes(terminoBusqueda))
  );

  renderizarProductos(productosFiltrados);
}

// Función para agregar el evento al input de búsqueda
function agregarEventoBuscador() {
  const buscador = document.getElementById('buscador-productos');

  if (buscador) {
    buscador.addEventListener('input', (e) => {
      filtrarProductos(e.target.value);
    });

    buscador.addEventListener('focus', (e) => {
      e.target.style.borderColor = 'var(--text-soft)';
      e.target.style.boxShadow = 'var(--shadow)';
    });

    buscador.addEventListener('blur', (e) => {
      e.target.style.borderColor = 'var(--border)';
      e.target.style.boxShadow = 'none';
    });
  }
}

// CARGA DE PRODUCTOS DESDE LA API
async function cargarProductos() {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;

    try {
        const respuesta = await fetch('/api/main_products');
        todosLosProductos = await respuesta.json(); 
        
        renderizarProductos(todosLosProductos); 
        
    } catch (error) {
        console.error("Error cargando productos:", error);
        contenedor.innerHTML = '<p style="text-align:center; width:100%; color:red;">Error cargando productos.</p>';
    }
}

// ARRANQUE
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    agregarEventoBuscador(); 
    
    if (window.PalmasCart) {
        PalmasCart.updateCartBadges();
    }
});