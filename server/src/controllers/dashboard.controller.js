const Platillo = require('../models/platillo.model.js');
const Contacto = require('../models/contacto.model.js');

exports.getBasicStats = async (req, res) => {
    try {
        const totalPlatillos = await Platillo.countAll();
        const totalMensajes = await Contacto.countAll();
        const mensajesNuevos = await Contacto.countByStatus('nuevo');

        res.status(200).json({
            total_platillos: totalPlatillos,
            total_mensajes: totalMensajes,
            mensajes_nuevos: mensajesNuevos
        });
    } catch (error) {
        console.error("Error al obtener estadísticas básicas:", error);
        res.status(500).json({
            message: "Error al obtener las estadísticas del dashboard.",
            error: error.message
        });
    }
}; 