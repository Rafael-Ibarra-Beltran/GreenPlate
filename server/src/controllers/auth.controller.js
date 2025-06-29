const Usuario = require('../models/usuario.model.js');

exports.register = async (req, res) => {
  const { nombre_usuario, password, rol } = req.body;

  if (!nombre_usuario || !password) {
    return res.status(400).send({ message: "Nombre de usuario y contraseña son obligatorios." });
  }

  try {
    const nuevoUsuario = await Usuario.create({ nombre_usuario, password, rol: rol || 'cliente' });
    res.status(201).send({ message: "Usuario registrado exitosamente.", usuario: {id: nuevoUsuario.id, nombre_usuario: nuevoUsuario.nombre_usuario, rol: nuevoUsuario.rol} });
  } catch (error) {
    if (error.message === 'El nombre de usuario ya existe.') {
        return res.status(409).send({ message: error.message }); 
    }

    res.status(500).send({ message: error.message || "Error al registrar el usuario." });
  }
};

exports.login = async (req, res) => {
  const { nombre_usuario, password } = req.body;

  if (!nombre_usuario || !password) {
    return res.status(400).send({ message: "Nombre de usuario y contraseña son obligatorios." });
  }

  try {
    const usuario = await Usuario.findByNombreUsuario(nombre_usuario);
    if (!usuario) {
      return res.status(401).send({ message: "Credenciales inválidas." }); 
    }

    const passwordValida = await Usuario.comparePassword(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).send({ message: "Credenciales inválidas." }); 
    }

    req.session.regenerate(function (err) {
        if (err) {
            console.error('Error al regenerar la sesión:', err);
            return res.status(500).send({ message: "Error al iniciar sesión." });
        }

        req.session.usuario = {
            id: usuario.id,
            nombre_usuario: usuario.nombre_usuario,
            rol: usuario.rol
        };

        console.log('Sesión creada:', req.session.usuario);

        res.status(200).send({
            message: "Inicio de sesión exitoso.",
            usuario: req.session.usuario
        });
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error al iniciar sesión." });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send({ message: "Error al cerrar sesión." });
    }
    res.clearCookie('connect.sid'); 
    res.status(200).send({ message: "Sesión cerrada exitosamente." });
  });
};

exports.checkSession = (req, res) => {
  if (req.session && req.session.usuario) {
    res.status(200).send({ 
        isLoggedIn: true, 
        usuario: req.session.usuario 
    });
  } else {
    res.status(200).send({ isLoggedIn: false });
  }
}; 