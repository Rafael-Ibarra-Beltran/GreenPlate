const Contacto = require('../models/contacto.model.js');

exports.create = async (req, res) => {
  if (!req.body.nombre || !req.body.correo || !req.body.mensaje) {
    return res.status(400).send({
      message: "Nombre, correo y mensaje son obligatorios."
    });
  }

  const contacto = {
    nombre: req.body.nombre,
    correo: req.body.correo,
    telefono: req.body.telefono || null,
    asunto: req.body.asunto || 'Sin asunto',
    mensaje: req.body.mensaje
  };

  try {
    const data = await Contacto.create(contacto);
    res.status(201).send({ message: "Mensaje enviado correctamente.", data });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al guardar el mensaje."
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const data = await Contacto.getAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al obtener los mensajes."
    });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await Contacto.findById(id);
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({ message: `No se encontró mensaje con id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({ message: "Error obteniendo mensaje con id=" + id });
  }
};

exports.updateStatus = async (req, res) => {
  const id = req.params.id;
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).send({ message: "El nuevo estado es obligatorio." });
  }

  try {
    const data = await Contacto.updateStatusById(id, estado);
    if (data) {
      res.send({ message: "Estado del mensaje actualizado.", data });
    } else {
      res.status(404).send({
        message: `No se pudo actualizar el estado del mensaje con id=${id}. Quizás no se encontró.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error actualizando estado del mensaje con id=" + id
    });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await Contacto.remove(id);
    if (result.deleted) {
      res.send({ message: result.message });
    } else {
      res.status(404).send({ message: result.message });
    }
  } catch (err) {
    res.status(500).send({
      message: "No se pudo eliminar el mensaje con id=" + id
    });
  }
}; 