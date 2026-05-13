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

/**
 * GET /api/main_products
 * Devuelve todos los productos principales de la base de datos en formato JSON
 */
// --- RUTAS DE LÓGICA (BACKEND) ---
app.get('/api/main_products', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM main_products ORDER BY created_at DESC');
        res.json(resultado.rows);
    } catch (err) {
        console.error("❌ Error al obtener productos:", err);
        res.status(500).json({ error: "No se pudo obtener el catálogo." });
    }
});

app.get('/api/productos/hombres', async (req, res) => {
    try {
        // ILIKE ignora si es mayúscula o minúscula. %hombres% busca que contenga la palabra.
        const query = "SELECT * FROM productos WHERE categoria ILIKE $1 ORDER BY created_at DESC";
        const resultado = await pool.query(query, ['%hombre%']); 
        
        res.json(resultado.rows);
    } catch (err) {
        console.error("❌ Error al obtener productos de hombres:", err);
        res.status(500).json({ error: "No se pudieron obtener los productos." });
    }
});

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`🚀 Servidor ACTUALIZADO corriendo en http://localhost:${PORT}`);
});


