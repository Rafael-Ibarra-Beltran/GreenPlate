const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
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

const initUsuariosTable = async (retries = 5, interval = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      await connection.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          rol ENUM('admin', 'cliente') DEFAULT 'cliente',
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_nombre_usuario (nombre_usuario)
        )
      `);
      
      console.log("Tabla 'usuarios' verificada/creada exitosamente.");
      connection.release();

      return;
    } catch (error) {
      console.error(`Error al crear/verificar la tabla 'usuarios' (intento ${i + 1}/${retries}):`, error.code);
      
      if (i < retries - 1) {
        console.log(`Reintentando en ${interval / 1000} segundos...`);
        await delay(interval);
      } else {
        console.error("No se pudo conectar a la base de datos después de varios intentos.");
      }
    }
  }
};

initUsuariosTable();

const Usuario = {};

Usuario.create = async (nuevoUsuario) => {
  const { nombre_usuario, password, rol } = nuevoUsuario;
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const sql = "INSERT INTO usuarios (nombre_usuario, password_hash, rol) VALUES (?, ?, ?)";
  try {
    const [result] = await pool.query(sql, [nombre_usuario, password_hash, rol || 'cliente']);
    return { id: result.insertId, nombre_usuario, rol: rol || 'cliente' };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('El nombre de usuario ya existe.');
    }
    
    throw error; 
  }
};

Usuario.findByNombreUsuario = async (nombreUsuario) => {
  const sql = "SELECT * FROM usuarios WHERE nombre_usuario = ?";
  const [rows] = await pool.query(sql, [nombreUsuario]);
  return rows.length ? rows[0] : null;
};

Usuario.comparePassword = async (passwordIngresada, hashGuardado) => {
  return await bcrypt.compare(passwordIngresada, hashGuardado);
};

module.exports = Usuario; 