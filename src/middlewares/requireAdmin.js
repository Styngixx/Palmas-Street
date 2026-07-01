const requireAdmin = (req, res, next) => {
    if (!req.usuario) {
        return res.status(403).json({ error: 'Acceso denegado.' });
    }

    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Se requieren permisos de administrador.' });
    }

    next();
};

module.exports = requireAdmin;
