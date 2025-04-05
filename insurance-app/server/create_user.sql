-- Crear usuario si no existe
CREATE USER IF NOT EXISTS 'insurance_user'@'localhost' IDENTIFIED BY 'insurance_password';

-- Otorgar privilegios al usuario
GRANT ALL PRIVILEGES ON insurance_db.* TO 'insurance_user'@'localhost';

-- Actualizar privilegios
FLUSH PRIVILEGES; 