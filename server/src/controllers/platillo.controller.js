const Platillo = require('../models/platillo.model.js');

exports.create = async (req, res) => {
  if (!req.body.nombre || !req.body.precio) {
    res.status(400).send({
      message: "El nombre y el precio son obligatorios!"
    });
    return;
  }

  const platillo = {
    nombre: req.body.nombre,
    descripcion: req.body.descripcion || null,
    imagen: req.body.imagen || null,
    precio: req.body.precio,
    categoria: req.body.categoria || null
  };

  try {
    const data = await Platillo.create(platillo);
    res.status(201).send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al crear el Platillo."
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const data = await Platillo.getAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al obtener los platillos."
    });
  }
};

exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const data = await Platillo.findById(id);
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({
        message: `No se encontró un Platillo con id=${id}.`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error obteniendo Platillo con id=" + id
    });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;

  if (!req.body) {
    return res.status(400).send({
      message: "¡Los datos para actualizar no pueden estar vacíos!"
    });
  }

  try {
    const data = await Platillo.updateById(id, req.body);
    if (data) {
      res.send({ message: "Platillo actualizado exitosamente.", data });
    } else {
      res.status(404).send({
        message: `No se puede actualizar el Platillo con id=${id}. ¡Quizás no se encontró el Platillo o req.body está vacío!`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error actualizando Platillo con id=" + id
    });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await Platillo.remove(id);
    if (result.deleted) {
      res.send({ message: result.message });
    } else {
      res.status(404).send({ message: result.message });
    }
  } catch (err) {
    res.status(500).send({
      message: "No se pudo eliminar el Platillo con id=" + id
    });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const data = await Platillo.removeAll();
    res.send({ message: data.message });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Ocurrió un error al eliminar todos los platillos."
    });
  }
}; 