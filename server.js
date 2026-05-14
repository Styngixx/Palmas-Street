require('dotenv').config({ override: true });
const express = require('express');
const path = require('path');
const pool = require('./src/config/db'); 
const authRoutes = require('./src/routes/auth'); 

const app = express();
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARES ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Servir Bootstrap correctamente
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// --- API PRODUCTOS (Universal) ---
// Esta ruta maneja /api/productos y filtra por la query ?categoria=...
app.get('/api/productos', async (req, res) => {
    const { categoria } = req.query; // Captura lo que viene después del '?'
    try {
        let sql = 'SELECT * FROM productos';
        let params = [];

        if (categoria) {
            // ILIKE para que no importe si es "Hombres" o "hombres"
            sql += ' WHERE categoria ILIKE $1';
            params.push(categoria);
        }

        sql += ' ORDER BY id DESC';
        const result = await pool.query(sql, params);
        
        // Siempre devolver JSON, incluso si está vacío
        res.json(result.rows); 
    } catch (err) {
        console.error("❌ Error en /api/productos:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// --- API CARRITO ---
app.post('/api/carrito', async (req, res) => {
    const { usuario_id, producto_id, cantidad } = req.body;
    if (!usuario_id || !producto_id) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    try {
        const query = `
            INSERT INTO carrito (usuario_id, producto_id, cantidad) 
            VALUES ($1, $2, $3) RETURNING *;
        `;
        const resultado = await pool.query(query, [usuario_id, producto_id, cantidad || 1]);
        res.status(200).json({ mensaje: 'Añadido al carrito', item: resultado.rows[0] });
    } catch (err) {
        console.error("❌ Error al agregar al carrito:", err);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// --- FORMULARIO CONTACTO ---
app.post('/enviar-contacto', async (req, res) => {
    const { nombre, telefono, email, fecha, mensaje } = req.body;
    try {
        const querySQL = `INSERT INTO candidatos (nombre, telefono, email, fecha_reserva, mensaje) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
        await pool.query(querySQL, [nombre, telefono, email, fecha, mensaje]);
        res.send(`<h1>✅ ¡Recibido!</h1><p>Gracias ${nombre}.</p><a href="/">Volver</a>`);
    } catch (err) {
        res.status(500).send("Error al procesar solicitud.");
    }
});

app.use('/api/auth', authRoutes); 

// Manejo de errores 404 para rutas no encontradas (Evita el error de token '<')
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
});