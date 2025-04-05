const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'insurance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Crear las tablas necesarias si no existen
const initDatabase = async () => {
  const promisePool = pool.promise();

  try {
    // Tabla de incidencias
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('pending', 'in_progress', 'resolved', 'rejected') DEFAULT 'pending',
        appliance_type VARCHAR(100) NOT NULL,
        photos JSON,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

module.exports = {
  pool: pool.promise(),
  initDatabase
}; 