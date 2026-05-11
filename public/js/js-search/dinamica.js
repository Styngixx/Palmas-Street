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

// Función para cargar productos desde la API
async function cargarProductos() {
  const contenedor = document.getElementById('contenedor-productos');

  if (!contenedor) return;

  try {
    const respuesta = await fetch('/api/main_products');

    if (respuesta.ok) {
      todosLosProductos = await respuesta.json();

      if (todosLosProductos.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; width:100%;">No hay productos disponibles por ahora.</p>';
        return;
      }

      // Mostrar todos los productos inicialmente
      renderizarProductos(todosLosProductos);

      // Agregar evento al buscador después de cargar los productos
      agregarEventoBuscador();
    } else {
      contenedor.innerHTML = '<p style="text-align:center; color:red; width:100%;">Error al cargar el catálogo.</p>';
    }
  } catch (error) {
    console.error('Error de red al cargar productos:', error);
    contenedor.innerHTML = '<p style="text-align:center; color:red; width:100%;">No se pudo conectar con el servidor.</p>';
  }
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
