const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/', async (req, res) => {
  console.log('🔥 RUTA /api/ventas ACTUALIZADA - GUARDANDO DESCUENTOS');
  const { total, items } = req.body;

  if (!total || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'El total y los productos son obligatorios'
    });
  }

  try {
    console.log('BODY RECIBIDO EN /api/ventas:', req.body);
    

    const result = await pool.query(
      `
      INSERT INTO ventas (usuario_id, total, estado, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
      `,
      [null, total, 'generada']
    );

    const venta = result.rows[0];

    for (const item of items) {
      console.log('ITEM QUE SE GUARDARÁ EN detalles_venta:', item);

      await pool.query(
        `
        INSERT INTO detalles_venta (
          venta_id,
          producto_id,
          cantidad,
          precio_unitario,
          "PrecioCuponDescuento",
          "Precio_Final_Unitario"
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          venta.id,
          Number(item.producto_id),
          Number(item.cantidad),
          Number(item.precio_unitario),
          Number(item.PrecioCuponDescuento ?? 0),
          Number(item.Precio_Final_Unitario ?? 0)
        ]
      );
    }

    res.status(201).json({
      mensaje: 'Venta guardada correctamente',
      venta
    });

  } catch (error) {
    console.error('Error guardando venta:', error);

    res.status(500).json({
      error: 'No se pudo guardar la venta',
      detalle: error.message
    });
  }
});

module.exports = router;