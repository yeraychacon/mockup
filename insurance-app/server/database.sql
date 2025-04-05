-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS insurance_db;

-- Usar la base de datos
USE insurance_db;

-- Crear la tabla de incidencias
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
); 