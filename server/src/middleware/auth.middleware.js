const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.usuario) {
        return next();
    }
    return res.status(401).send({ message: 'Acceso no autorizado. Por favor, inicia sesión.' });
};

const isAdmin = (req, res, next) => {
    if (!req.session || !req.session.usuario) {
        return res.status(401).send({ message: 'Acceso no autorizado. Por favor, inicia sesión.' });
    }
    if (req.session.usuario.rol === 'admin') {
        return next(); 
    }
    
    return res.status(403).send({ message: 'Acceso prohibido. No tienes permisos de administrador.' });
};

module.exports = {
    isLoggedIn,
    isAdmin
}; 