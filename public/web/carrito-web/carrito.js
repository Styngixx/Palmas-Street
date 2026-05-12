// Esperar a que cargue el HTML del carrito
document.addEventListener('DOMContentLoaded', () => {
    renderizarCarrito();
});

function renderizarCarrito() {
    // 1. Obtener los productos guardados en LocalStorage
    const carrito = JSON.parse(localStorage.getItem('carrito_palmas')) || [];
    const contenedor = document.getElementById('lista-carrito'); // Asegúrate de tener este ID en carrito.html
    const totalElemento = document.getElementById('total-carrito');
    
    if (!contenedor) return;

    // Si el carrito está vacío
    if (carrito.length === 0) {
        contenedor.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:white;">Tu carrito está vacío.</td></tr>';
        if (totalElemento) totalElemento.innerText = '0.00';
        return;
    }

    // 2. Limpiar el contenedor antes de dibujar
    contenedor.innerHTML = '';
    let totalGeneral = 0;

    // 3. Recorrer el carrito y crear las filas
    carrito.forEach((producto, indice) => {
        const subtotal = producto.precio * producto.cantidad;
        totalGeneral += subtotal;

        const fila = document.createElement('tr');
        fila.style.borderBottom = "1px solid #444";
        fila.style.color = "white";

        fila.innerHTML = `
            <td style="padding:15px;"><img src="${producto.imagen}" width="50" style="border-radius:5px;"></td>
            <td style="padding:15px;">${producto.nombre}</td>
            <td style="padding:15px;">S/ ${producto.precio.toFixed(2)}</td>
            <td style="padding:15px;">${producto.cantidad}</td>
            <td style="padding:15px;">S/ ${subtotal.toFixed(2)}</td>
            <td style="padding:15px;">
                <button onclick="eliminarDelCarrito(${indice})" style="background:red; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">
                    Eliminar
                </button>
            </td>
        `;
        contenedor.appendChild(fila);
    });

    // 4. Actualizar el Total General
    if (totalElemento) {
        totalElemento.innerText = totalGeneral.toFixed(2);
    }
}

// Función para eliminar un producto
window.eliminarDelCarrito = function(indice) {
    let carrito = JSON.parse(localStorage.getItem('carrito_palmas')) || [];
    
    // Eliminar el producto del array según su posición
    carrito.splice(indice, 1);
    
    // Guardar el nuevo carrito y volver a dibujar
    localStorage.setItem('carrito_palmas', JSON.stringify(carrito));
    renderizarCarrito();
};

// Función para vaciar todo el carrito
window.vaciarCarrito = function() {
    if(confirm("¿Estás seguro de que quieres vaciar todo el carrito?")) {
        localStorage.removeItem('carrito_palmas');
        renderizarCarrito();
    }
};