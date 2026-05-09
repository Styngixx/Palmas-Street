# 📚 Documentación Técnica - Palmas Street

> Documentación técnica detallada del proyecto **Palmas Street**, incluyendo arquitectura, configuración de base de datos, APIs, JavaScript y estilos responsivos. Este documento explica línea por línea cada componente crítico del sistema.

**Autor**: Styngixx  
**Versión**: 1.0.0  
**Última Actualización**: 09/05/2026

---

## 📋 Tabla de Contenidos

1. [Estructura General del Proyecto](#-estructura-general-del-proyecto)
2. [Configuración del Servidor Backend](#-configuración-del-servidor-backend)
3. [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
4. [Base de Datos: Supabase & PostgreSQL](#-base-de-datos-supabase--postgresql)
5. [API REST - Endpoints](#-api-rest---endpoints)
6. [Lógica de JavaScript - Frontend](#-lógica-de-javascript---frontend)
7. [Diseño CSS Responsivo](#-diseño-css-responsivo)
8. [Flujo de Datos Cliente-Servidor](#-flujo-de-datos-cliente-servidor)

---

## 🏗️ Estructura General del Proyecto

```
Palmas-Street/
├── server.js                    # Servidor Express principal
├── package.json                 # Dependencias y scripts
├── .env                         # Variables de entorno (no se sube a GitHub)
├── .gitignore                   # Archivos ignorados por Git
├── vercel.json                  # Configuración de despliegue Vercel
├── public/                      # Archivos estáticos
│   ├── index.html              # Página principal
│   ├── css/                    # Estilos CSS
│   │   └── styles.css
│   └── js/                     # Scripts JavaScript
│       └── index.js            # Lógica principal del cliente
└── src/                        # Código fuente adicional (futuro)
```

### Explicación de Estructura:
- **server.js**: Archivo central que maneja todas las rutas y conexiones a BD
- **public/**: Archivos que se sirven al navegador (HTML, CSS, JS, imágenes)
- **.env**: Archivo secreto que NO se versionea en Git (contiene credenciales)
- **vercel.json**: Configuración para desplegar automáticamente en Vercel

---

## 🔧 Configuración del Servidor Backend

### Archivo: `server.js`

```javascript
// Línea 1-2: Importar librerías necesarias
require('dotenv').config(); // Lee el archivo .env
const express = require('express');
```

**¿Qué hace?**
- `require('dotenv').config()`: Carga variables del archivo `.env` en `process.env`
- Esto permite que el servidor acceda a `process.env.DATABASE_URL` sin exponer contraseñas

```javascript
// Línea 3-4: Importar módulos del sistema y libreríasconst path = require('path');
const { Pool } = require('pg');
```

**Variables importadas:**
- `path`: Maneja rutas de archivos del sistema operativo
- `Pool`: Clase de conexión a PostgreSQL (la BD que usa Supabase)

```javascript
// Línea 7-8: Crear instancia de Express y definir puerto
const app = express();
const PORT = process.env.PORT || 3000;
```

**Explicación:**
- `app = express()`: Crea la aplicación web
- `PORT`: Si existe `process.env.PORT` (en producción), úsalo; sino usa puerto 3000 (desarrollo local)
- En **Vercel**, el puerto se asigna automáticamente

---

## 🗄️ Configuración de la Base de Datos

### Conexión a Supabase con Pool de PostgreSQL

```javascript
// Líneas 10-16: Configurar conexión a Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
```

**Desglose detallado:**

| Variable | Qué es | Ejemplo |
|----------|--------|---------|
| `Pool` | Gestor de conexiones a PostgreSQL | `new Pool({...})` |
| `connectionString` | URL de conexión a Supabase | `postgresql://user:pass@host:port/db` |
| `ssl` | Conexión segura | `{ rejectUnauthorized: false }` |

**¿Por qué `rejectUnauthorized: false`?**
- Supabase usa certificados SSL autofirmados
- Sin esto, la conexión falla por validación de certificado
- En producción está bien porque Supabase es confiable

### Probar la Conexión al Iniciar

```javascript
// Líneas 18-25: Test de conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a Supabase:', err.stack);
  } else {
    console.log('✅ Conexión exitosa a la base de datos');
  }
});
```

**¿Qué sucede?**
1. `pool.query()`: Ejecuta una consulta SQL
2. `'SELECT NOW()'`: Obtiene la hora actual del servidor (prueba simple)
3. Si hay error → muestra mensaje en rojo
4. Si funciona → muestra mensaje en verde

---

## 📡 Configuración de Variables de Entorno

### Archivo: `.env`

```dotenv
# Línea 1-2: URL de conexión a Supabase
DATABASE_URL=postgresql://postgres.ayoscbdgrnvnvvpptpmk:Ch4pit02026@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

**Desglose de la URL:**

```
postgresql://usuario:contraseña@host:puerto/base_de_datos
           ↑      ↑      ↑      ↑    ↑      ↑    ↑
         |usuario |      |      |    |      |    └─ Nombre de BD
         |        |      |      |    |      └────── Puerto (5432)
         |        |      |      |    └───────────── Host (servidor)
         |        |      |      └────────────────── Contraseña
         |        |      └─────────────────────── Usuario
         └─────────────────────────────────────── Tipo de BD
```

**Variables específicas:**
- `usuario`: `postgres.ayoscbdgrnvnvvpptpmk` (usuario de Supabase)
- `contraseña`: `Ch4pit02026` (NUNCA compartir)
- `host`: `aws-1-sa-east-1.pooler.supabase.com` (servidor en AWS)
- `puerto`: `5432` (estándar PostgreSQL)
- `BD`: `postgres` (base de datos)

### ⚠️ Seguridad: Por qué `.env` no se sube a GitHub

```gitignore
# Archivo: .gitignore
node_modules
.env
.env.local
```

**Motivos:**
1. La contraseña estaría visible públicamente
2. Cualquiera podría acceder a la BD
3. Violación grave de seguridad

**Solución en Vercel:**
- Se configuran variables de entorno en el dashboard
- Vercel las inyecta automáticamente en tiempo de ejecución
- El código nunca expone las credenciales

---

## 💻 Instalación de Dependencias

### Archivo: `package.json`

```json
{
  "name": "palmas-street",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "pg": "^8.20.0"
  }
}
```

**Explicación de cada dependencia:**

| Paquete | Versión | Función |
|---------|---------|---------|
| `dotenv` | 17.4.2 | Lee variables del archivo `.env` |
| `express` | 5.2.1 | Framework web (maneja rutas HTTP) |
| `pg` | 8.20.0 | Driver PostgreSQL (conexión a BD) |

### Scripts disponibles:
```bash
npm start     # Inicia el servidor: node server.js
```

---

## 🌐 API REST - Endpoints

### Middlewares (Procesamiento de datos)

```javascript
// Líneas 27-33: Configurar middlewares
app.use(express.urlencoded({ extended: true }));  // Formularios HTML
app.use(express.json());                           // JSON en el body
app.use(express.static(path.join(__dirname, 'public'))); // Archivos estáticos
```

**¿Qué hace cada uno?**

1. **`urlencoded({ extended: true })`**
   - Permite procesar datos de formularios HTML
   - Ejemplo: `nombre=Juan&email=juan@gmail.com`

2. **`express.json()`**
   - Permite procesar JSON en las peticiones
   - Ejemplo: `{ "nombre": "Juan", "email": "juan@gmail.com" }`

3. **`express.static()`**
   - Sirve archivos estáticos sin procesarlos
   - Rutas como `/css/styles.css` → apunta a `public/css/styles.css`

---

### Endpoint 1: Cargar Página Principal

```javascript
// Líneas 36-38
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

**¿Qué sucede?**
- **Ruta**: `GET /` (cuando abres `http://localhost:3000/`)
- **Acción**: Envía el archivo `index.html`
- **Resultado**: El navegador muestra la página principal

---

### Endpoint 2: Enviar Formulario de Contacto

```javascript
// Líneas 42-73
/**
 * POST /enviar-contacto
 * Procesa el formulario de contacto y guarda al usuario en la tabla 'candidatos'
 */
app.post('/enviar-contacto', async (req, res) => {
    const { nombre, telefono, email, fecha, mensaje } = req.body;
```

**Desglose:**
- **Tipo**: `POST` (envía datos)
- **Ruta**: `/enviar-contacto`
- **Datos extraídos** del `req.body`:
  - `nombre`: Nombre de la persona
  - `telefono`: Su teléfono
  - `email`: Su email
  - `fecha`: Fecha de reserva
  - `mensaje`: Mensaje adicional

#### Construir la consulta SQL:

```javascript
// Líneas 50-54
const querySQL = `
    INSERT INTO candidatos (nombre, telefono, email, fecha_reserva, mensaje) 
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
`;
const values = [nombre, telefono, email, fecha, mensaje];
```

**Explicación de la consulta:**
- `INSERT INTO candidatos`: Inserta en la tabla `candidatos`
- `($1, $2, $3, $4, $5)`: Placeholders para evitar inyección SQL
- `RETURNING id`: Devuelve el ID del registro creado
- `values`: Array con los valores en el mismo orden

**¿Por qué placeholders ($1, $2, $3)?**
- Previene ataques de **SQL Injection**
- PostgreSQL reemplaza automáticamente los valores de forma segura

#### Ejecutar la consulta:

```javascript
// Líneas 57-59
const resultado = await pool.query(querySQL, values);
console.log(`👤 Nuevo candidato registrado con ID: ${resultado.rows[0].id}`);
```

**Qué ocurre:**
- `await pool.query()`: Espera a que se ejecute la consulta
- `resultado.rows[0].id`: Obtiene el ID del nuevo registro
- Se muestra en consola para debugging

#### Respuesta al usuario:

```javascript
// Líneas 62-68
res.send(`
    <div style="text-align:center; font-family:sans-serif; margin-top:50px;">
        <h1>✅ ¡Postulación Recibida!</h1>
        <p>Gracias ${nombre}, hemos guardado tu información para la entrevista del día ${fecha}.</p>
        <a href="/" style="color: black; font-weight:bold;">Volver a Palmas Street</a>
    </div>
`);
```

**Qué ve el usuario:**
- Mensaje de confirmación con su nombre
- Fecha de entrevista confirmada
- Botón para volver a la página principal

#### Manejo de errores:

```javascript
// Líneas 69-72
} catch (err) {
    console.error("❌ Error al insertar en candidatos:", err);
    res.status(500).send("Lo sentimos, hubo un error al procesar tu solicitud.");
}
```

**¿Cuándo ocurre?**
- Base de datos fuera de servicio
- Tabla no existe
- Falta de permisos
- **Respuesta**: Error 500 + mensaje al usuario

---

### Endpoint 3: Obtener Catálogo de Productos (JSON)

```javascript
// Líneas 75-88
/**
 * GET /api/main_products
 * Devuelve todos los productos en formato JSON
 */
app.get('/api/main_products', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT * FROM main_products ORDER BY created_at DESC'
        );
        res.json(resultado.rows);
    } catch (err) {
        console.error("❌ Error al obtener productos:", err);
        res.status(500).json({ error: "No se pudo obtener el catálogo." });
    }
});
```

**Explicación paso a paso:**

1. **Ruta**: `GET /api/main_products`
2. **Consulta SQL**: `SELECT * FROM main_products ORDER BY created_at DESC`
   - `SELECT *`: Obtiene todos los campos
   - `FROM main_products`: De la tabla de productos
   - `ORDER BY created_at DESC`: Ordenados por fecha (más recientes primero)

3. **Respuesta exitosa**: JSON con array de productos
   ```json
   [
     {
       "id": 1,
       "nombre": "Camisa Palma",
       "descripcion": "Camisa estilo palma",
       "precio": 89.99,
       "imagen_url": "https://...",
       "created_at": "2026-05-09T00:00:00Z"
     }
   ]
   ```

4. **Respuesta en error**: JSON con mensaje de error
   ```json
   {
     "error": "No se pudo obtener el catálogo."
   }
   ```

---

### Iniciar el Servidor

```javascript
// Líneas 90-93
app.listen(PORT, () => {
    console.log(`🚀 Servidor ACTUALIZADO corriendo en http://localhost:${PORT}`);
});
```

**¿Qué sucede?**
- El servidor se inicia en el puerto especificado
- Se muestra URL en consola para acceder
- El servidor queda escuchando peticiones HTTP

**En consola verás:**
```
✅ Conexión exitosa a la base de datos
🚀 Servidor ACTUALIZADO corriendo en http://localhost:3000
```

---

## 🎨 Lógica de JavaScript - Frontend

### Archivo: `public/js/index.js`

#### 1. Sistema de Tema Oscuro

```javascript
// Líneas 1-14: Tema oscuro con localStorage
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
```

**Variables:**
- `themeToggle`: Elemento HTML del botón para cambiar tema
- `savedTheme`: Lee el tema guardado en localStorage
- `localStorage`: Almacenamiento local del navegador (persiste después de cerrar)

**Flujo:**
1. ¿Existe tema guardado en localStorage?
2. Sí → Aplicar tema oscuro + emoji ☀️
3. No → Mantener tema claro + emoji 🌙
4. Al hacer click → Alternar tema + guardar preferencia

**localStorage vs sessionStorage:**
- `localStorage`: Persiste incluso después de cerrar el navegador
- `sessionStorage`: Se borra al cerrar el navegador

---

#### 2. Slider/Carrusel de Imágenes

```javascript
// Líneas 20-30: Variables del slider
const slider = document.getElementById('slider');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('dots');

let counter = 0;              // Índice actual de la diapositiva
const size = 100;             // Ancho de cada slide (100%)
const totalSlides = slides.length;  // Cantidad total de diapositivas
const intervalTime = 8000;    // Tiempo entre cambios automáticos (8 segundos)
```

**Variables explicadas:**

| Variable | Tipo | Valor | Uso |
|----------|------|-------|-----|
| `slider` | HTMLElement | Contenedor | Elemento que se mueve |
| `slides` | NodeList | Múltiples | Todas las diapositivas |
| `prevBtn` | HTMLElement | Botón ◄ | Pasar a diapositiva anterior |
| `nextBtn` | HTMLElement | Botón ► | Pasar a diapositiva siguiente |
| `counter` | Number | 0 | Índice actual (0 = primera) |
| `size` | Number | 100 | Ancho en porcentaje |
| `intervalTime` | Number | 8000 | Milisegundos (8 segundos) |

#### Crear Puntos de Navegación (Dots):

```javascript
// Líneas 31-37: Generar dots para cada slide
slides.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});
```

**¿Qué sucede?**
1. Por cada slide, crear un `<div>` (punto)
2. Agregar clase `dot` para estilos CSS
3. Si es el primero (i === 0), marcar como `active`
4. Al hacer click → ir a esa diapositiva
5. Insertar el punto en el contenedor HTML

**HTML generado:**
```html
<div id="dots">
  <div class="dot active"></div>
  <div class="dot"></div>
  <div class="dot"></div>
</div>
```

#### Actualizar Puntos Activos:

```javascript
// Líneas 41-44: Función de actualización
function updateDots() {
  dots.forEach(dot => dot.classList.remove('active'));
  dots[counter].classList.add('active');
}
```

**Lógica:**
1. Quitar `active` de todos los puntos
2. Agregar `active` solo al punto actual

#### Mover Diapositiva Automáticamente:

```javascript
// Líneas 46-50: Movimiento automático
function moveSlide() {
  if (counter >= totalSlides - 1) { counter = 0; } else { counter++; }
  slider.style.transform = `translateX(${-size * counter}%)`;
  updateDots();
}
```

**Explicación:**
- Si llegamos al final (counter >= totalSlides - 1) → volver al inicio (counter = 0)
- Sino → incrementar counter en 1
- `transform: translateX()` → desplazar slider en X
- Ejemplo: Si counter = 1 y size = 100:
  - `translateX(-100%)` → desplaza una diapositiva a la izquierda

```
Visualmente:
Slide 0 | Slide 1 | Slide 2
        ^
        Posición visible
        
Después de moveSlide():
Slide 0 | Slide 1 | Slide 2
               ^
               Nueva posición
```

#### Navegación Manual:

```javascript
// Líneas 52-62: Botones anterior/siguiente
function prevSlide() {
  if (counter <= 0) { counter = totalSlides - 1; } else { counter--; }
  slider.style.transform = `translateX(${-size * counter}%)`;
  updateDots();
  resetTimer();  // Reiniciar timer automático
}

function nextSlide() {
  moveSlide();
  resetTimer();
}
```

**¿Qué diferencia hay?**
- `prevSlide`: Ir atrás (si estamos al inicio → ir al final)
- `nextSlide`: Llama a `moveSlide()` + reinicia timer
- `resetTimer()`: Reinicia el intervalo automático (para que no se adelante)

#### Event Listeners para Botones:

```javascript
// Líneas 71-72: Escuchar clicks
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);
```

**¿Qué sucede?**
- Cuando hace click en botón siguiente → ejecutar `nextSlide()`
- Cuando hace click en botón anterior → ejecutar `prevSlide()`

#### Movimiento Automático con Timer:

```javascript
// Líneas 74-78: Intervalo automático
let timer = setInterval(moveSlide, intervalTime);

function resetTimer() {
  clearInterval(timer);  // Detener timer anterior
  timer = setInterval(moveSlide, intervalTime);  // Reiniciar
}
```

**¿Cómo funciona?**
- `setInterval(moveSlide, 8000)`: Cada 8 segundos, cambiar slide
- Al hacer click → `resetTimer()` para evitar desfase
- Ejemplo: Sin resetTimer, si haces click a los 7s:
  - Timer original se ejecutaría 1s después
  - Timer manual + automático al mismo tiempo = caos

---

#### 3. Cargar Productos Dinámicamente (Conexión a BD)

```javascript
// Líneas 80-129: Función principal de carga
async function cargarProductos() {
  const contenedor = document.getElementById('contenedor-productos');
  
  if (!contenedor) return;  // Si no existe el elemento, salir
```

**Explicación:**
- `async`: La función es asincrónica (puede esperar respuestas del servidor)
- `getElementById('contenedor-productos')`: Buscar el div donde irán los productos
- `if (!contenedor) return`: Si no existe ese div, no continuar (evitar errores)

#### Realizar Petición HTTP (Fetch API):

```javascript
// Líneas 91-93
try {
    const respuesta = await fetch('/api/main_products');
    
    if (respuesta.ok) {
        const productos = await respuesta.json();
```

**Desglose detallado:**

1. **`fetch('/api/main_products')`**
   - Realiza petición GET a nuestro servidor
   - Espera la respuesta con `await`

2. **`respuesta.ok`**
   - True si status HTTP es 200-299
   - False si es 4xx (cliente) o 5xx (servidor)

3. **`respuesta.json()`**
   - Convierte respuesta a objeto JavaScript
   - Espera con `await`

**Ejemplo de respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Camisa Azul",
    "descripcion": "Camisa 100% algodón",
    "precio": 89.99,
    "imagen_url": "https://example.com/img1.jpg",
    "created_at": "2026-05-09T00:00:00Z"
  }
]
```

#### Inyectar HTML Dinámicamente:

```javascript
// Líneas 98-99
contenedor.innerHTML = '';  // Limpiar contenedor

if (productos.length === 0) {
    contenedor.innerHTML = '<p>No hay productos disponibles.</p>';
    return;
}
```

**¿Por qué limpiar `innerHTML`?**
- Evitar duplicados si la función se ejecuta múltiples veces
- En este caso, muestra mensaje si BD está vacía

#### Recorrer y Crear Tarjetas:

```javascript
// Líneas 108-121
productos.forEach(producto => {
    const tarjetaHTML = `
        <article class="product-card">
            <img src="${producto.imagen_url}" alt="${producto.nombre}" loading="lazy" />
            <div class="product-info">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <p style="font-weight: bold; margin-top: 10px;">S/ ${producto.precio}</p>
            </div>
        </article>
    `;
    contenedor.innerHTML += tarjetaHTML;
});
```

**Variables de producto inyectadas:**
- `${producto.imagen_url}`: URL de la imagen
- `${producto.nombre}`: Nombre del producto
- `${producto.descripcion}`: Descripción
- `${producto.precio}`: Precio

**HTML generado (ejemplo):**
```html
<article class="product-card">
    <img src="https://example.com/camisa.jpg" alt="Camisa Azul" loading="lazy" />
    <div class="product-info">
        <h3>Camisa Azul</h3>
        <p>Camisa 100% algodón</p>
        <p style="...">S/ 89.99</p>
    </div>
</article>
```

#### Manejo de Errores:

```javascript
// Líneas 122-128
} else {
    contenedor.innerHTML = '<p style="color:red;">Error al cargar el catálogo.</p>';
}

} catch (error) {
    console.error('Error de red:', error);
    contenedor.innerHTML = '<p style="color:red;">No se pudo conectar con el servidor.</p>';
}
```

**Dos tipos de errores:**
1. **Respuesta no OK**: Servidor respondió pero con error
2. **Error de conexión**: Red caída, servidor offline, etc.

#### Ejecutar al Cargar la Página:

```javascript
// Líneas 131-134
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
});
```

**¿Por qué `DOMContentLoaded`?**
- Espera a que el HTML esté completamente cargado
- Si ejecutamos antes, el elemento `#contenedor-productos` no existiría
- Orden correcto:
  1. HTML se carga → 2. DOMContentLoaded se dispara → 3. Ejecutar JS

---

## 🎨 Diseño CSS Responsivo

### Principios de Diseño Responsivo

```css
/* Mobile-First: Empezar con estilos para móviles */
.product-card {
  width: 100%;  /* Ancho completo en móvil */
  margin: 10px 0;
  padding: 15px;
}

/* Luego escalar para pantallas más grandes */
@media (min-width: 768px) {
  .product-card {
    width: calc(50% - 10px);  /* 2 columnas en tablet */
    display: inline-block;
  }
}

@media (min-width: 1024px) {
  .product-card {
    width: calc(25% - 10px);  /* 4 columnas en desktop */
  }
}
```

### Sistema de Grid para Catálogo

```css
#contenedor-productos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}
```

**Explicación:**
- `display: grid`: Sistema de malla
- `repeat(auto-fill, minmax(250px, 1fr))`: 
  - Auto-fill: Llenar el ancho disponible
  - minmax(250px, 1fr): Ancho mínimo 250px, máximo flexible
  - Resultado: Tantas columnas como quepan

### Flexbox para Header y Footer

```css
header {
  display: flex;
  justify-content: space-between;  /* Logo a izquierda, nav a derecha */
  align-items: center;              /* Centrado vertical */
  padding: 20px;
  background-color: #f5f5f5;
}
```

### Tema Oscuro con CSS

```css
/* Estilos normales */
body {
  background-color: #ffffff;
  color: #000000;
}

/* Estilos en modo oscuro */
body.dark {
  background-color: #1a1a1a;
  color: #ffffff;
}

body.dark .product-card {
  background-color: #2a2a2a;
  border-color: #444;
}
```

---

## 🔄 Flujo de Datos Cliente-Servidor

### Diagrama del Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                         NAVEGADOR (Cliente)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. HTML carga →  index.html                                │
│  2. JS ejecuta → cargarProductos()                          │
│  3. Fetch API  → fetch('/api/main_products')               │
│     (Petición GET)                                          │
│                          │                                   │
│                          ▼                                   │
└─────────────────────────────────────────────────────────────┘
                           HTTP REQUEST
                   GET /api/main_products
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVIDOR (Backend)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  4. Recibe petición en Express                             │
│  5. Ruta GET /api/main_products                           │
│  6. pool.query() →  "SELECT * FROM main_products"        │
│     (Conexión a Supabase)                                 │
│                          │                                   │
│                          ▼                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Base de Datos)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  7. PostgreSQL ejecuta consulta                            │
│  8. Retorna filas de la tabla main_products              │
│                          │                                   │
│                          ▼                                   │
└─────────────────────────────────────────────────────────────┘
                      HTTP RESPONSE
          [{ id: 1, nombre: "Camisa", ... }, ...]
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                         NAVEGADOR (Cliente)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  9. Recibe JSON con respuesta.json()                       │
│  10. forEach(producto) → crear tarjetas HTML              │
│  11. Inyectar en DOM con innerHTML +=                    │
│  12. Usuario ve catálogo dinámico en pantalla            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Timing de Ejecución

```javascript
// Orden exacto de ejecución:
1. document.addEventListener('DOMContentLoaded', ...)
   └─> Se ejecuta cuando el HTML esté completamente cargado

2. cargarProductos()
   └─> async function

3. fetch('/api/main_products')
   └─> await: espera respuesta del servidor (es lo más lento)

4. respuesta.json()
   └─> await: convierte el texto a objeto JavaScript

5. productos.forEach(...)
   └─> Itera cada producto (rápido, es local)

6. contenedor.innerHTML += tarjetaHTML
   └─> Inyecta HTML en el DOM (navegador renderiza)

7. Usuario ve productos en pantalla ✓
```

### Manejo de Errores en el Flujo

```
┌─────────────────────────────────────────────────────────────┐
│  Cliente intenta cargar productos                           │
└─────────────────────────────────────────────────────────────┘
                           │
                try / catch │
                 /          │          \
                /           │           \
           ✓ OK          ✗ No OK      ✗ Error Red
          /             /               /
         │             │               │
    respuesta.ok   respuesta   catch(error)
    === true       no = true
        │             │               │
        │             │               │
        ▼             ▼               ▼
    JSON OK     Mostrar error   Mostrar error
     ✓ OK       en pantalla      en pantalla
               "Error al        "No se pudo
                cargar"         conectar"
```

---

## 📊 Estructura de Datos - Base de Datos

### Tabla: `candidatos`

```sql
CREATE TABLE candidatos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(100),
  fecha_reserva DATE,
  mensaje TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | ID único (auto-incremento) |
| `nombre` | VARCHAR(100) | Nombre del candidato |
| `telefono` | VARCHAR(20) | Teléfono |
| `email` | VARCHAR(100) | Email |
| `fecha_reserva` | DATE | Fecha de entrevista |
| `mensaje` | TEXT | Mensaje adicional |
| `created_at` | TIMESTAMP | Fecha de creación |

### Tabla: `main_products`

```sql
CREATE TABLE main_products (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2),
  imagen_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Campos:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | SERIAL | ID único |
| `nombre` | VARCHAR(100) | Nombre del producto |
| `descripcion` | TEXT | Descripción |
| `precio` | DECIMAL(10, 2) | Precio |
| `imagen_url` | VARCHAR(255) | URL de la imagen |
| `created_at` | TIMESTAMP | Fecha de creación |

---

## 🔐 Medidas de Seguridad

### 1. Validación de Variables de Entorno

```javascript
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en .env');
}
```

### 2. Prevención de SQL Injection

```javascript
// ❌ MALO (vulnerable):
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ BIEN (seguro):
const query = 'SELECT * FROM users WHERE email = $1';
pool.query(query, [email]);
```

### 3. HTTPS en Producción

- Vercel proporciona certificados SSL automáticamente
- Todas las conexiones a Supabase usan `ssl: true`

### 4. Variables Sensibles

- `.env` no se versiona
- Contraseñas NO en el código
- Variables de entorno en Vercel dashboard

---

## 🚀 Despliegue en Vercel

### Archivo: `vercel.json`

```json
{
  "buildCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database_url"
  },
  "functions": {
    "server.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

**Configuración:**
- `buildCommand`: Instalar dependencias antes de desplegar
- `env`: Variables de entorno (se definen en dashboard)
- `runtime`: Versión de Node.js

### Flujo de Despliegue

```
1. Git push a GitHub
         │
         ▼
2. Vercel detecta cambios (webhook)
         │
         ▼
3. Ejecuta buildCommand (npm install)
         │
         ▼
4. Inyecta variables de entorno
         │
         ▼
5. Inicia server.js
         │
         ▼
6. Asigna URL pública (ej: palmas-street.vercel.app)
         │
         ▼
✅ Aplicación en vivo
```

---

## 📝 Resumen de Tecnologías

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Node.js | 18.x | Runtime del servidor |
| Express | 5.2.1 | Framework web |
| PostgreSQL | (Supabase) | Base de datos |
| Supabase | Cloud | Hosting de BD |
| Vercel | Cloud | Hosting de servidor |
| Git | - | Control de versiones |
| JavaScript ES6+ | - | Lógica del cliente |
| CSS3 | - | Diseño responsivo |
| HTML5 | - | Estructura semántica |

---

## 🎯 Próximos Pasos de Mejora

1. **Autenticación de usuarios**
   - Login/Registro con Supabase Auth
   - Tokens JWT

2. **Carrito de compras avanzado**
   - Almacenar en localStorage o BD
   - Cálculo de totales

3. **Sistema de pagos**
   - Integrar Stripe o Paypal
   - Validación de tarjetas

4. **Testing**
   - Jest para pruebas unitarias
   - Cypress para testing E2E

5. **Optimización**
   - Caché en el cliente
   - Compresión de imágenes
   - Minificación de CSS/JS

---

## 📞 Soporte y Contacto

**Desarrollador**: Styngixx  
**Email**: francisinchee@gmail.com  
**GitHub**: https://github.com/Styngixx  
**Repositorio**: https://github.com/Styngixx/Palmas-Street

---

<div align="center">

### 📚 Documentación Completa Finalizada

**Palmas Street - Documentación Técnica v1.0**  
*Hecho con ❤️ para desarrolladores*

</div>
