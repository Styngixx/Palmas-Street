// Ruta: middleware/authMiddleware.js
require('dotenv').config({ override: true });
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrae el token del formato "Bearer TOKEN"

    if (!token) {
        return res.status(403).json({ error: "Acceso denegado. Token no proporcionado." });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.usuario = payload; // Guarda el id y rol del usuario para usarlo después
        next(); // Deja pasar a la ruta solicitada
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o expirado." });
    }
};

module.exports = verificarToken;