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

const initPlatillosTable = async (retries = 5, interval = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      await connection.query(`
        CREATE TABLE IF NOT EXISTS platillos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(255) NOT NULL,
          descripcion TEXT,
          imagen VARCHAR(255),
          precio DECIMAL(10, 2) NOT NULL,
          categoria VARCHAR(100),
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      console.log("Tabla 'platillos' verificada/creada exitosamente.");
      connection.release();

      return;
    } catch (error) {
      console.error(`Error al crear/verificar la tabla 'platillos' (intento ${i + 1}/${retries}):`, error.code);
      
      if (i < retries - 1) {
        console.log(`Reintentando en ${interval / 1000} segundos...`);
        await delay(interval);
      } else {
        console.error("No se pudo conectar a la base de datos después de varios intentos. El servidor podría no funcionar correctamente.");
      }
    }
  }
};

initPlatillosTable();

const Platillo = {};

Platillo.create = async (nuevoPlatillo) => {
  const sql = "INSERT INTO platillos (nombre, descripcion, imagen, precio, categoria) VALUES (?, ?, ?, ?, ?)";
  const [result] = await pool.query(sql, [nuevoPlatillo.nombre, nuevoPlatillo.descripcion, nuevoPlatillo.imagen, nuevoPlatillo.precio, nuevoPlatillo.categoria]);
  return { id: result.insertId, ...nuevoPlatillo };
};

Platillo.getAll = async () => {
  const sql = "SELECT * FROM platillos";
  const [rows] = await pool.query(sql);
  return rows;
};

Platillo.findById = async (id) => {
  const sql = "SELECT * FROM platillos WHERE id = ?";
  const [rows] = await pool.query(sql, [id]);
  if (rows.length) {
    return rows[0];
  }

  return null;
};

Platillo.updateById = async (id, platilloData) => {
  const fieldsToUpdate = {};
  if (platilloData.nombre !== undefined) fieldsToUpdate.nombre = platilloData.nombre;
  if (platilloData.descripcion !== undefined) fieldsToUpdate.descripcion = platilloData.descripcion;
  if (platilloData.imagen !== undefined) fieldsToUpdate.imagen = platilloData.imagen; 
  if (platilloData.precio !== undefined) fieldsToUpdate.precio = platilloData.precio;
  if (platilloData.categoria !== undefined) fieldsToUpdate.categoria = platilloData.categoria;

  if (Object.keys(fieldsToUpdate).length === 0) {
    const currentPlatillo = await Platillo.findById(id);
    return currentPlatillo ? { id: id, ...currentPlatillo } : null;
  }

  const setClauses = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
  const values = Object.values(fieldsToUpdate);
  values.push(id); 

  const sql = `UPDATE platillos SET ${setClauses} WHERE id = ?`;
  
  const [result] = await pool.query(sql, values);

  if (result.affectedRows === 0) {
    return null;
  }

  return { id: id, ...fieldsToUpdate };
};

Platillo.remove = async (id) => {
  const sql = "DELETE FROM platillos WHERE id = ?";
  const [result] = await pool.query(sql, [id]);
  
  if (result.affectedRows === 0) {
    return { message: "Platillo no encontrado", deleted: false };
  }

  return { message: "Platillo eliminado exitosamente", deleted: true };
};

Platillo.removeAll = async () => {
  const sql = "DELETE FROM platillos";
  const [result] = await pool.query(sql);
  return { message: `${result.affectedRows} platillos fueron eliminados.` };
};


Platillo.countAll = async () => {
  const sql = "SELECT COUNT(*) as total_platillos FROM platillos";
  const [rows] = await pool.query(sql);
  return rows[0].total_platillos;
};

module.exports = Platillo; 