const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken } = require('../middleware/auth');

// Crear o actualizar usuario
router.post('/', verifyToken, async (req, res) => {
  try {
    const { id, email, provider, name, photo_url } = req.body;

    // Verificar que el token coincide con el usuario
    if (req.user.uid !== id) {
      return res.status(403).json({
        message: 'No autorizado para crear/actualizar este usuario'
      });
    }

    // Solo procesar usuarios de Google
    if (provider !== 'google') {
      console.log('Usuario no es de Google, no se procesa:', { id, email, provider });
      return res.status(200).json({ message: 'Usuario no procesado (no es de Google)' });
    }

    // Verificar si el usuario ya existe
    const [existingUsers] = await pool().query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length > 0) {
      // Si el usuario ya existe, no hacer nada
      console.log('Usuario ya existe, no se actualiza:', { id, email, provider });
      return res.status(200).json({ message: 'Usuario ya existe, no se actualiza' });
    } else {
      // Crear nuevo usuario solo si es de Google y no existe
      await pool().query(
        `INSERT INTO users (id, email, provider, name, photo_url, role) 
         VALUES (?, ?, ?, ?, ?, 'user')`,
        [id, email, provider, name, photo_url]
      );

      console.log('Nuevo usuario de Google creado:', { id, email, provider });
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