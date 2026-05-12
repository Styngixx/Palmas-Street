// Ruta: server.js
require('dotenv').config({ override: true });
const express = require('express');
const path = require('path');

// --- IMPORTACIONES MODULARES ---
const pool = require('./src/config/db'); 
const authRoutes = require('./src/routes/auth'); 
const verificarToken = require('./src/middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- RUTAS DE NAVEGACIÓN ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- RUTAS MODULARES (AUTENTICACIÓN) ---
app.use('/api/auth', authRoutes); 

// --- RUTAS DE LÓGICA (BACKEND PÚBLICO) ---

// Ruta para el catálogo general y filtrado por categoría
app.get('/api/productos', async (req, res) => {
    const { categoria } = req.query;
    try {
        let sql = 'SELECT * FROM productos';
        let params = [];

        if (categoria) {
            // ILIKE es vital para que 'Femenina' o 'femenina' funcionen igual
            sql += ' WHERE categoria ILIKE $1';
            params.push(categoria);
        }

        sql += ' ORDER BY created_at DESC';
        const result = await pool.query(sql, params);
        
        // Console log para que veas en la terminal si encuentra productos
        console.log(`🔍 Buscando: ${categoria || 'Todo'} | Encontrados: ${result.rows.length}`);
        
        res.json(result.rows); 
    } catch (err) {
        console.error("❌ Error en /api/productos:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

app.get('/api/main_products', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM main_products ORDER BY created_at DESC');
        res.json(resultado.rows);
    } catch (err) {
        console.error("❌ Error al obtener productos principales:", err);
        res.status(500).json({ error: "No se pudo obtener el catálogo." });
    }
});

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

// --- RUTAS PROTEGIDAS (Requieren Token) ---

app.post('/api/carrito', verificarToken, async (req, res) => {
    const { producto_id, cantidad } = req.body;
    const usuario_id = req.usuario.id; 

    try {
        const query = `
            INSERT INTO carrito (usuario_id, producto_id, cantidad) 
            VALUES ($1, $2, $3) RETURNING *;
        `;
        const resultado = await pool.query(query, [usuario_id, producto_id, cantidad || 1]);
        
        res.status(200).json({ 
            mensaje: 'Producto añadido al carrito exitosamente',
            item: resultado.rows[0]
        });
    } catch (err) {
        console.error("❌ Error al agregar al carrito:", err);
        res.status(500).json({ error: "Error interno del servidor al procesar el carrito" });
    }
});

// --- INICIO DEL SERVIDOR ---
// El listen SIEMPRE debe ser lo último para registrar todas las rutas anteriores
app.listen(PORT, () => {
    console.log(`🚀 Servidor CORREGIDO corriendo en http://localhost:${PORT}`);
});