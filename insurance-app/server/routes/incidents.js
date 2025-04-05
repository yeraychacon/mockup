const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Obtener todas las incidencias de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const [incidents] = await pool.query(
      'SELECT * FROM incidents WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.userId]
    );
    
    // Parsear las fotos antes de enviar la respuesta
    incidents.forEach(incident => {
      if (incident.photos) {
        try {
          incident.photos = JSON.parse(incident.photos);
        } catch (e) {
          console.error('Error al parsear fotos:', e);
          incident.photos = [];
        }
      }
    });
    
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las incidencias', error: error.message });
  }
});

// Obtener una incidencia específica
router.get('/detail/:id', async (req, res) => {
  try {
    const [incidents] = await pool.query(
      'SELECT * FROM incidents WHERE id = ?',
      [req.params.id]
    );
    
    if (incidents.length === 0) {
      return res.status(404).json({ message: 'Incidencia no encontrada' });
    }
    
    // Parsear las fotos antes de enviar la respuesta
    const incident = incidents[0];
    if (incident.photos) {
      try {
        incident.photos = JSON.parse(incident.photos);
      } catch (e) {
        console.error('Error al parsear fotos:', e);
        incident.photos = [];
      }
    }
    
    res.json(incident);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la incidencia', error: error.message });
  }
});

// Crear una nueva incidencia
router.post('/', async (req, res) => {
  const { user_id, type, description, appliance_type, photos } = req.body;
  
  try {
    // Asegurarse de que photos sea un array antes de guardarlo
    const photosToSave = Array.isArray(photos) ? photos : [];
    
    const [result] = await pool.query(
      'INSERT INTO incidents (user_id, type, description, appliance_type, photos) VALUES (?, ?, ?, ?, ?)',
      [user_id, type, description, appliance_type, JSON.stringify(photosToSave)]
    );
    
    res.status(201).json({
      message: 'Incidencia creada correctamente',
      incident_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la incidencia', error: error.message });
  }
});

// Actualizar el estado de una incidencia
router.patch('/:id/status', async (req, res) => {
  const { status, feedback } = req.body;
  
  try {
    await pool.query(
      'UPDATE incidents SET status = ?, feedback = ? WHERE id = ?',
      [status, feedback, req.params.id]
    );
    
    res.json({ message: 'Estado de la incidencia actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
  }
});

module.exports = router; 