const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verificarToken = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');

router.use(verificarToken, requireAdmin);

// Gráfico 1: Top Productos (Barras)
router.get('/top-productos', async (req, res) => {
    const { rango } = req.query; 
    
    let interval = '1 month'; 
    if (rango === 'dia') interval = '1 day';
    if (rango === 'semana') interval = '1 week';

    try {
        const query = `
            SELECT p.nombre, SUM(dv.cantidad) as total_vendido
            FROM detalles_venta dv
            JOIN ventas v ON dv.venta_id = v.id
            JOIN productos p ON dv.producto_id = p.id
            WHERE v.created_at >= NOW() - INTERVAL '${interval}'
            GROUP BY p.id, p.nombre
            ORDER BY total_vendido DESC
            LIMIT 10;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error generando reporte de productos:', error);
        res.status(500).json({ error: 'Error al generar el reporte' });
    }
});

// Gráfico 2: Evolución de Ingresos (Lineal)
router.get('/ventas-tiempo', async (req, res) => {
    const { rango } = req.query; 
    let query = '';

    try {
        if (rango === 'dia') {
            // Últimas 24 horas: Se agrupa por la Hora exacta (Ej: 14:00, 15:00)
            query = `
                SELECT TO_CHAR(created_at, 'HH24:00') as fecha, SUM(total) as total_ingresos
                FROM ventas
                WHERE created_at >= NOW() - INTERVAL '1 day'
                GROUP BY TO_CHAR(created_at, 'HH24:00')
                ORDER BY fecha ASC;
            `;
        } else if (rango === 'semana') {
            // Última semana: Se agrupa por la Fecha exacta (Ej: 2026-07-08)
            query = `
                SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as fecha, SUM(total) as total_ingresos
                FROM ventas
                WHERE created_at >= NOW() - INTERVAL '1 week'
                GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
                ORDER BY fecha ASC;
            `;
        } else {
            // Último mes: Se agrupa por Fecha
            query = `
                SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as fecha, SUM(total) as total_ingresos
                FROM ventas
                WHERE created_at >= NOW() - INTERVAL '1 month'
                GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
                ORDER BY fecha ASC;
            `;
        }

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error generando reporte de ventas en el tiempo:', error);
        res.status(500).json({ error: 'Error al generar el reporte' });
    }
});

module.exports = router;