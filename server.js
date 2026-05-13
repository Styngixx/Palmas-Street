// Importamos las librerías
//require('dotenv').config(); // Para leer el archivo .env
require('dotenv').config({ override: true });
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURACIÓN DE LA BASE DE DATOS (Supabase) ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requerido para conectar con servicios en la nube como Supabase
  }
});

// Probar conexión al iniciar el servidor
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a Supabase:', err.stack);
  } else {
    console.log('✅ Conexión exitosa a la base de datos de Palmas Street');
  }
});

// --- MIDDLEWARES ---
// Para que Express entienda los datos de los formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos (CSS, JS, Imágenes) desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Servir Bootstrap desde node_modules
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// --- RUTAS DE NAVEGACIÓN ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- RUTAS DE LÓGICA (BACKEND) ---

/**
 * POST /enviar-contacto
 * Procesa el formulario de contacto y guarda al postulante en la tabla 'candidatos'
 */
app.post('/enviar-contacto', async (req, res) => {
    const { nombre, telefono, email, fecha, mensaje } = req.body;
    
    try {
        const querySQL = `
            INSERT INTO candidatos (nombre, telefono, email, fecha_reserva, mensaje) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const values = [nombre, telefono, email, fecha, mensaje];
        
        const resultado = await pool.query(querySQL, values);
        
        console.log(`👤 Nuevo candidato registrado con ID: ${resultado.rows[0].id}`);
        
        // Respuesta al usuario
        res.send(`
            <div style="text-align:center; font-family:sans-serif; margin-top:50px;">
                <h1>✅ ¡Postulación Recibida!</h1>
                <p>Gracias ${nombre}, hemos guardado tu información para la entrevista del día ${fecha}.</p>
                <a href="/" style="color: black; font-weight:bold;">Volver a Palmas Street</a>
            </div>
        `);
    } catch (err) {
        console.error("❌ Error al insertar en candidatos:", err);
        res.status(500).send("Lo sentimos, hubo un error al procesar tu solicitud.");
    }
});



// API para productos principales (Inicio)
app.get('/api/main_products', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM main_products ORDER BY created_at DESC');
        res.json(resultado.rows);
    } catch (err) {
        console.error("❌ Error al obtener productos:", err);
        res.status(500).json({ error: "No se pudo obtener el catálogo." });
    }
});



// Ruta para el formulario de contacto
app.post('/enviar-contacto', async (req, res) => {
    const { nombre, telefono, email, fecha, mensaje } = req.body;
    try {
        const querySQL = `
            INSERT INTO candidatos (nombre, telefono, email, fecha_reserva, mensaje) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id;
        `;
        const values = [nombre, telefono, email, fecha, mensaje];
        const resultado = await pool.query(querySQL, values);
        res.send(`<h1>✅ ¡Postulación Recibida!</h1><p>Gracias ${nombre}.</p><a href="/">Volver</a>`);
    } catch (err) {
        console.error("❌ Error al insertar:", err);
        res.status(500).send("Error al procesar solicitud.");
    }
});


// API para obtener los productos de la categoría accesorios
app.get('/api/productos/accesorios', async (req, res) => {
    try {
        // Asegúrate de que el nombre de la categoría sea el mismo que tienes en la base de datos
        const querySQL = "SELECT * FROM productos WHERE categoria = 'accesorios' ORDER BY id ASC";
        const resultado = await pool.query(querySQL);
        res.json(resultado.rows);
    } catch (err) {
        console.error("❌ Error al obtener los accesorios:", err);
        res.status(500).json({ error: "No se pudo obtener el catálogo de accesorios." });
    }
});



// --- INICIO DEL SERVIDOR (SOLO UNA VEZ) ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});





