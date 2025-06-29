const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config.js');

const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: dbConfig.pool.max,
  queueLimit: 0
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const initContactosTable = async (retries = 5, interval = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      await connection.query(`
        CREATE TABLE IF NOT EXISTS contactos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          correo VARCHAR(255) NOT NULL,
          telefono VARCHAR(20),
          asunto VARCHAR(255),
          mensaje TEXT NOT NULL,
          fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          estado VARCHAR(50) DEFAULT 'nuevo' COMMENT 'Ej: nuevo, leido, en progreso, resuelto'
        )
      `);
      console.log("Tabla 'contactos' verificada/creada exitosamente.");
      connection.release();
      return;
    } catch (error) {
      console.error(`Error al crear/verificar la tabla 'contactos' (intento ${i + 1}/${retries}):`, error.code);
      if (i < retries - 1) {
        console.log(`Reintentando en ${interval / 1000} segundos...`);
        await delay(interval);
      } else {
        console.error("No se pudo conectar a la base de datos para inicializar la tabla 'contactos'.");
      }
    }
  }
};

initContactosTable();

const Contacto = {};

Contacto.create = async (nuevoContacto) => {
  const sql = "INSERT INTO contactos (nombre, correo, telefono, asunto, mensaje) VALUES (?, ?, ?, ?, ?)";
  const { nombre, correo, telefono, asunto, mensaje } = nuevoContacto;
  const [result] = await pool.query(sql, [nombre, correo, telefono, asunto, mensaje]);
  return { id: result.insertId, ...nuevoContacto, fecha_envio: new Date(), estado: 'nuevo' };
};

Contacto.getAll = async () => {
  const sql = "SELECT * FROM contactos ORDER BY fecha_envio DESC";
  const [rows] = await pool.query(sql);
  return rows;
};

Contacto.findById = async (id) => {
  const sql = "SELECT * FROM contactos WHERE id = ?";
  const [rows] = await pool.query(sql, [id]);
  return rows.length ? rows[0] : null;
};

Contacto.updateStatusById = async (id, estado) => {
  const sql = "UPDATE contactos SET estado = ? WHERE id = ?";
  const [result] = await pool.query(sql, [estado, id]);
  if (result.affectedRows === 0) {
    return null; 
  }
  return { id, estado };
};

Contacto.remove = async (id) => {
  const sql = "DELETE FROM contactos WHERE id = ?";
  const [result] = await pool.query(sql, [id]);
  if (result.affectedRows === 0) {
    return { message: "Mensaje de contacto no encontrado", deleted: false };
  }
  return { message: "Mensaje de contacto eliminado exitosamente", deleted: true };
};

Contacto.countAll = async () => {
  const sql = "SELECT COUNT(*) as total_mensajes FROM contactos";
  const [rows] = await pool.query(sql);
  return rows[0].total_mensajes;
};

Contacto.countByStatus = async (estado) => {
  const sql = "SELECT COUNT(*) as total_mensajes_estado FROM contactos WHERE estado = ?";
  const [rows] = await pool.query(sql, [estado]);
  return rows[0].total_mensajes_estado;
};

module.exports = Contacto; 