const mysql = require('mysql2');
require('dotenv').config();

let pool = null;
let isInitialized = false;

const createPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'insurance_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }).promise();
  }
  return pool;
};

const initializeDatabase = async () => {
  if (isInitialized) {
    return;
  }

  let initialPool = null;
  try {
    // Crear el pool inicial sin base de datos
    initialPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }).promise();

    // Crear la base de datos si no existe
    await initialPool.query(
      `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'insurance_db'}`
    );
    console.log('Base de datos creada o ya existente');

    // Cerrar el pool inicial
    await initialPool.end();

    // Crear el pool principal con la base de datos seleccionada
    pool = createPool();

    // Seleccionar la base de datos
    await pool.query(`USE ${process.env.DB_NAME || 'insurance_db'}`);
    console.log('Base de datos seleccionada');

    // Crear tabla de usuarios si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        role ENUM('admin', 'user') DEFAULT 'user',
        provider VARCHAR(50) DEFAULT 'email',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Tabla users creada o ya existente');

    // Crear tabla de incidencias si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('pending', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending',
        appliance_type VARCHAR(100) NOT NULL,
        photos JSON,
        resolution TEXT,
        admin_notes TEXT,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Tabla incidents creada o ya existente');

    // Insertar usuario admin por defecto si no existe
    await pool.query(`
      INSERT IGNORE INTO users (id, email, role)
      VALUES ('admin123', 'admin@aseguradora.com', 'admin')
    `);
    console.log('Usuario admin verificado/creado');

    isInitialized = true;
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    if (initialPool) {
      await initialPool.end();
    }
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    pool = createPool();
  }
  return pool;
};

module.exports = {
  pool: getPool,
  initializeDatabase
}; 