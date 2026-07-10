require('dotenv').config({ override: true });
const express = require('express');
const path = require('path');

// Importaciones de tu nueva arquitectura en 'src'
const pool = require('./src/config/db'); 
const authRoutes = require('./src/routes/auth'); 
const verificarToken = require('./src/middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. MIDDLEWARES GLOBALES
// ==========================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// ==========================================
// 2. RUTAS FRONTEND (Servidor de Vistas)
// ==========================================

// Ruta principal del cliente (CORREGIDA: apunta directo a public/client/index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'client', 'index.html'));
});

// Ruta del panel de administrador
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'web', 'admin.html'));
});

// ==========================================
// 3. RUTAS BACKEND (API REST)
// ==========================================

// Rutas de autenticación delegadas a tu carpeta routes
app.use('/api/auth', authRoutes); 

// Catálogo general (con filtro opcional)
app.get('/api/productos', async (req, res) => {
    const { categoria } = req.query;
    try {
        let sql = 'SELECT * FROM productos';
        let params = [];

        if (categoria) {
            sql += ' WHERE categoria ILIKE $1';
            params.push(categoria);
        }

        sql += ' ORDER BY id DESC';
        const result = await pool.query(sql, params);
        
        console.log(`Buscando: ${categoria || 'Todo'} | Encontrados: ${result.rows.length}`);
        res.json(result.rows); 
    } catch (err) {
        console.error("Error en /api/productos:", err);
        res.status(500).json({ error: "Error en el servidor al cargar productos" });
    }
});

// Productos principales
app.get('/api/main_products', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM main_products ORDER BY created_at DESC');
        res.json(resultado.rows);
    } catch (err) {
        console.error("Error al obtener productos principales:", err);
        res.status(500).json({ error: "No se pudo obtener el catálogo." });
    }
});

// Filtro: Hombres
app.get('/api/productos/hombres', async (req, res) => {
    try {
        const query = "SELECT * FROM productos WHERE categoria ILIKE $1 ORDER BY id DESC";
        const resultado = await pool.query(query, ['%hombre%']); 
        res.json(resultado.rows);
    } catch (err) {
        console.error("Error al obtener productos de hombres:", err);
        res.status(500).json({ error: "No se pudieron obtener los productos." });
    }
});

// Filtro: Accesorios
app.get('/api/productos/accesorios', async (req, res) => {
    try {
        const querySQL = "SELECT * FROM productos WHERE categoria = 'accesorios' ORDER BY id ASC";
        const resultado = await pool.query(querySQL);
        res.json(resultado.rows);
    } catch (err) {
        console.error("Error al obtener los accesorios:", err);
        res.status(500).json({ error: "No se pudo obtener el catálogo de accesorios." });
    }
});

// Carrito de compras (Método POST seguro)
app.post('/api/carrito', async (req, res) => {
    const { usuario_id, producto_id, cantidad } = req.body;
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
        console.error("Error al agregar al carrito:", err);
        res.status(500).json({ error: "Error interno del servidor al procesar el carrito" });
    }
});

// Formulario de Contacto / Candidatos
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
        console.log(`Nuevo candidato registrado con ID: ${resultado.rows[0].id}`);
        
        res.send(`
            <div style="text-align:center; font-family:sans-serif; margin-top:50px;">
                <h1>¡Postulación Recibida!</h1>
                <p>Gracias ${nombre}, hemos guardado tu información para la entrevista del día ${fecha}.</p>
                <a href="/" style="color: black; font-weight:bold;">Volver a Palmas Street</a>
            </div>
        `);
    } catch (err) {
        console.error("Error al insertar en candidatos:", err);
        res.status(500).send("Lo sentimos, hubo un error al procesar tu solicitud.");
    }
});

// ==========================================
// 4. INICIALIZACIÓN DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor de Palmas Street volando en http://localhost:${PORT}`);
});