require('dotenv').config({ override: true });
const express = require('express');
const path = require('path');

const pool = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const adminProductsRoutes = require('./src/routes/adminProducts');
const ventasRoutes = require('./src/routes/ventas');
// 1. NUEVO: Importamos el archivo de rutas de los reportes
const adminReportesRoutes = require('./src/routes/adminReportes'); 
const { runMigrations } = require('./src/db/migrate');

const app = express();
const PORT = process.env.PORT || 3000;

const PUBLIC_FILTER = `COALESCE(visible, TRUE) = TRUE AND COALESCE(estado, 'activo') = 'activo'`;

// Aumentamos el límite a 50mb para soportar las fotos en Base64
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// CONFIGURACIÓN DE RUTAS DE LA API
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/admin/productos', adminProductsRoutes);
app.use('/api/ventas', ventasRoutes);

// 2. NUEVO: Le decimos al servidor que use la ruta de reportes
app.use('/api/admin/reportes', adminReportesRoutes); 

// ==========================================
// OTRAS RUTAS PÚBLICAS
// ==========================================
app.get('/api/productos', async (req, res) => {
    const { categoria } = req.query;
    try {
        let sql = `SELECT * FROM productos WHERE ${PUBLIC_FILTER}`;
        const params = [];

        if (categoria) {
            sql += ' AND categoria ILIKE $1';
            params.push(categoria);
        }

        sql += ' ORDER BY id DESC';
        const result = await pool.query(sql, params);

        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error en /api/productos:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.get('/api/main_products', async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT * FROM main_products WHERE ${PUBLIC_FILTER} ORDER BY created_at DESC`
        );
        res.json(resultado.rows);
    } catch (err) {
        console.error('❌ Error al obtener productos principales:', err);
        res.status(500).json({ error: 'No se pudo obtener el catálogo.' });
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

        res.send(`
            <div style="text-align:center; font-family:sans-serif; margin-top:50px;">
                <h1>✅ ¡Postulación Recibida!</h1>
                <p>Gracias ${nombre}, hemos guardado tu información para la entrevista del día ${fecha}.</p>
                <a href="/" style="color: black; font-weight:bold;">Volver a Palmas Street</a>
            </div>
        `);
    } catch (err) {
        console.error('❌ Error al insertar en candidatos:', err);
        res.status(500).send('Lo sentimos, hubo un error al procesar tu solicitud.');
    }
});

app.get('/api/productos/hombres', async (req, res) => {
    try {
        const query = `
            SELECT * FROM productos
            WHERE categoria ILIKE $1 AND ${PUBLIC_FILTER}
            ORDER BY id DESC
        `;
        const resultado = await pool.query(query, ['%hombre%']);
        res.json(resultado.rows);
    } catch (err) {
        console.error('❌ Error al obtener productos de hombres:', err);
        res.status(500).json({ error: 'No se pudieron obtener los productos.' });
    }
});

app.get('/api/productos/accesorios', async (req, res) => {
    try {
        const querySQL = `
            SELECT * FROM productos
            WHERE categoria = 'accesorios' AND ${PUBLIC_FILTER}
            ORDER BY id ASC
        `;
        const resultado = await pool.query(querySQL);
        res.json(resultado.rows);
    } catch (err) {
        console.error('❌ Error al obtener los accesorios:', err);
        res.status(500).json({ error: 'No se pudo obtener el catálogo de accesorios.' });
    }
});

async function startServer() {
    try {
        await runMigrations();
    } catch (err) {
        console.warn('⚠️ Migraciones no aplicadas (¿DB conectada?):', err.message);
    }

    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`🔐 Panel admin: http://localhost:${PORT}/web/admin/login.html`);
    });
}

startServer();