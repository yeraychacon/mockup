const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// Crear o actualizar usuario
router.post('/', verifyToken, async (req, res) => {
  try {
    const { id, email, provider, name, photo_url, created_at } = req.body;

    // Verificar que el token coincide con el usuario
    if (req.user.uid !== id) {
      return res.status(403).json({
        message: 'No autorizado para crear/actualizar este usuario'
      });
    }

    // Verificar si el usuario ya existe
    const [existingUsers] = await pool().query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length > 0) {
      // Actualizar usuario existente
      await pool().query(
        `UPDATE users 
         SET email = ?, 
             provider = ?,
             name = ?,
             photo_url = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [email, provider, name, photo_url, id]
      );

      console.log('Usuario actualizado:', { id, email, provider });
      res.json({ message: 'Usuario actualizado correctamente' });
    } else {
      // Crear nuevo usuario
      await pool().query(
        `INSERT INTO users (id, email, provider, name, photo_url, role, created_at) 
         VALUES (?, ?, ?, ?, ?, 'user', ?)`,
        [id, email, provider, name, photo_url, created_at]
      );

      console.log('Nuevo usuario creado:', { id, email, provider });
      res.status(201).json({ message: 'Usuario creado correctamente' });
    }
  } catch (error) {
    console.error('Error en la ruta de usuarios:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud',
      error: error.message 
    });
  }
});

module.exports = router; 