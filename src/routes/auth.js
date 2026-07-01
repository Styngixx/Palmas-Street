// Ruta: routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Importamos la conexión de BD

require('dotenv').config({ override: true });
const JWT_SECRET = process.env.JWT_SECRET;

// POST /api/auth/registro
router.post('/registro', async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO usuarios (nombre, email, password) 
            VALUES ($1, $2, $3) RETURNING id, nombre, email, rol;
        `;
        const result = await pool.query(query, [nombre, email, hashedPassword]);
        
        res.status(201).json({ 
            mensaje: "Usuario creado exitosamente", 
            usuario: result.rows[0] 
        });
    } catch (err) {
        console.error("❌ Error en registro:", err);
        if (err.code === '23505') {
            return res.status(400).json({ error: "El email ya está registrado." });
        }
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// GET /api/auth/me — verificar sesión activa
router.get('/me', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No autenticado.' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const userResult = await pool.query(
            'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1',
            [payload.id]
        );

        if (!userResult.rows.length) {
            return res.status(401).json({ error: 'Usuario no encontrado.' });
        }

        res.json({ usuario: userResult.rows[0] });
    } catch (err) {
        res.status(401).json({ error: 'Token inválido o expirado.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const usuario = userResult.rows[0];
        const validPassword = await bcrypt.compare(password, usuario.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ 
            mensaje: "Login exitoso", 
            token: token,
            usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
        });
    } catch (err) {
        console.error("❌ Error en login:", err);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

module.exports = router;