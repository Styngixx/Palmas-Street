const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verificarToken = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/requireAdmin');

const PUBLIC_FILTER = `COALESCE(visible, TRUE) = TRUE AND COALESCE(estado, 'activo') = 'activo'`;

router.use(verificarToken, requireAdmin);

function buildWhereClause(filters, { publicOnly = false } = {}) {
    const conditions = publicOnly ? [PUBLIC_FILTER] : [];
    const params = [];
    let paramIndex = 1;

    if (filters.search) {
        conditions.push(`(nombre ILIKE $${paramIndex} OR descripcion ILIKE $${paramIndex} OR marca ILIKE $${paramIndex})`);
        params.push(`%${filters.search}%`);
        paramIndex++;
    }

    if (filters.categoria) {
        conditions.push(`categoria ILIKE $${paramIndex}`);
        params.push(filters.categoria);
        paramIndex++;
    }

    if (filters.estado) {
        conditions.push(`COALESCE(estado, 'activo') = $${paramIndex}`);
        params.push(filters.estado);
        paramIndex++;
    }

    if (filters.visible === 'true') {
        conditions.push(`COALESCE(visible, TRUE) = TRUE`);
    } else if (filters.visible === 'false') {
        conditions.push(`COALESCE(visible, TRUE) = FALSE`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return { where, params };
}


router.get('/', async (req, res) => {
    const { search, categoria, estado, visible, vista } = req.query;
    const publicOnly = vista === 'cliente';

    try {
        const { where, params } = buildWhereClause({ search, categoria, estado, visible }, { publicOnly });
        const sql = `SELECT * FROM productos ${where} ORDER BY id DESC`;
        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error listando productos admin:', err);
        res.status(500).json({ error: 'No se pudieron obtener los productos.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos WHERE id = $1', [req.params.id]);
        if (!result.rows.length) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error obteniendo producto:', err);
        res.status(500).json({ error: 'Error al obtener el producto.' });
    }
});

router.post('/', async (req, res) => {
    const {
        nombre,
        descripcion,
        precio,
        imagen_url,
        categoria,
        marca,
        visible = true,
        estado = 'activo',
        destacado = false
    } = req.body;

    if (!nombre || precio === undefined || precio === null || !categoria) {
        return res.status(400).json({ error: 'Nombre, precio y categoría son obligatorios.' });
    }

    if (Number(precio) < 0) {
        return res.status(400).json({ error: 'El precio debe ser mayor o igual a 0.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const insertResult = await client.query(
            `INSERT INTO productos (nombre, descripcion, precio, imagen_url, categoria, marca, visible, estado, destacado, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
             RETURNING *`,
            [
                nombre.trim(),
                descripcion || '',
                Number(precio),
                imagen_url || '/media/media-logos/LogoPS.png',
                categoria.trim(),
                marca || 'Palmas Street',
                Boolean(visible),
                estado === 'standby' ? 'standby' : 'activo',
                Boolean(destacado)
            ]
        );

        const producto = insertResult.rows[0];

        if (producto.destacado && producto.estado === 'activo' && producto.visible) {
            await client.query(
                `INSERT INTO main_products (nombre, descripcion, precio, imagen_url, visible, estado)
                 VALUES ($1, $2, $3, $4, TRUE, 'activo')`,
                [producto.nombre, producto.descripcion, producto.precio, producto.imagen_url]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ mensaje: 'Producto creado exitosamente', producto });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error creando producto:', err);
        res.status(500).json({ error: 'No se pudo crear el producto.' });
    } finally {
        client.release();
    }
});

router.put('/:id', async (req, res) => {
    const {
        nombre,
        descripcion,
        precio,
        imagen_url,
        categoria,
        marca,
        visible,
        estado,
        destacado
    } = req.body;

    if (!nombre || precio === undefined || precio === null || !categoria) {
        return res.status(400).json({ error: 'Nombre, precio y categoría son obligatorios.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const updateResult = await client.query(
            `UPDATE productos
             SET nombre = $1, descripcion = $2, precio = $3, imagen_url = $4,
                 categoria = $5, marca = $6, visible = $7, estado = $8,
                 destacado = $9, updated_at = NOW()
             WHERE id = $10
             RETURNING *`,
            [
                nombre.trim(),
                descripcion || '',
                Number(precio),
                imagen_url || '/media/media-logos/LogoPS.png',
                categoria.trim(),
                marca || 'Palmas Street',
                Boolean(visible),
                estado === 'standby' ? 'standby' : 'activo',
                Boolean(destacado),
                req.params.id
            ]
        );

        if (!updateResult.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        const producto = updateResult.rows[0];

        await client.query(
            `DELETE FROM main_products WHERE nombre = $1 AND descripcion = $2`,
            [producto.nombre, producto.descripcion]
        );

        if (producto.destacado && producto.estado === 'activo' && producto.visible) {
            await client.query(
                `INSERT INTO main_products (nombre, descripcion, precio, imagen_url, visible, estado)
                 VALUES ($1, $2, $3, $4, TRUE, 'activo')`,
                [producto.nombre, producto.descripcion, producto.precio, producto.imagen_url]
            );
        }

        await client.query('COMMIT');
        res.json({ mensaje: 'Producto actualizado', producto });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error actualizando producto:', err);
        res.status(500).json({ error: 'No se pudo actualizar el producto.' });
    } finally {
        client.release();
    }
});

router.patch('/:id/visible', async (req, res) => {
    const { visible } = req.body;

    try {
        const result = await pool.query(
            `UPDATE productos SET visible = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [Boolean(visible), req.params.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        res.json({
            mensaje: visible ? 'Producto visible para clientes' : 'Producto oculto',
            producto: result.rows[0]
        });
    } catch (err) {
        console.error('❌ Error cambiando visibilidad:', err);
        res.status(500).json({ error: 'No se pudo cambiar la visibilidad.' });
    }
});

router.patch('/:id/estado', async (req, res) => {
    const { estado } = req.body;

    if (!['activo', 'standby'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido. Use activo o standby.' });
    }

    try {
        const result = await pool.query(
            `UPDATE productos SET estado = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
            [estado, req.params.id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        res.json({
            mensaje: estado === 'standby' ? 'Producto dado de baja (standby)' : 'Producto reactivado',
            producto: result.rows[0]
        });
    } catch (err) {
        console.error('❌ Error cambiando estado:', err);
        res.status(500).json({ error: 'No se pudo cambiar el estado.' });
    }
});

router.delete('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const productResult = await client.query('SELECT * FROM productos WHERE id = $1', [req.params.id]);
        if (!productResult.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        const producto = productResult.rows[0];

        await client.query('DELETE FROM productos WHERE id = $1', [req.params.id]);
        await client.query(
            'DELETE FROM main_products WHERE nombre = $1 AND descripcion = $2',
            [producto.nombre, producto.descripcion]
        );

        await client.query('COMMIT');
        res.json({ mensaje: 'Producto eliminado permanentemente.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error eliminando producto:', err);
        res.status(500).json({ error: 'No se pudo eliminar el producto.' });
    } finally {
        client.release();
    }
});

module.exports = router;
