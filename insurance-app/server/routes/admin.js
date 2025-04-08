const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Ruta para verificar si un usuario es admin
router.get('/check', verifyToken, verifyAdmin, (req, res) => {
  res.status(200).json({ message: 'Usuario es administrador' });
});

// Obtener todas las incidencias
router.get('/incidents', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('Obteniendo todas las incidencias...');
    
    // Consulta mejorada para obtener todas las incidencias con información detallada del usuario
    const [rows] = await pool().query(`
      SELECT 
        i.*,
        u.email as user_email,
        u.id as user_id,
        u.name as user_name,
        u.provider as auth_provider,
        u.created_at as user_created_at
      FROM incidents i 
      LEFT JOIN users u ON i.user_id = u.id 
      ORDER BY i.created_at DESC
    `);

    // Procesar las fotos y añadir información adicional
    const processedRows = rows.map(row => {
      let photos = [];
      if (row.photos) {
        try {
          // Intentar parsear como JSON primero
          const parsedPhotos = JSON.parse(row.photos);
          photos = Array.isArray(parsedPhotos) ? parsedPhotos : [parsedPhotos];
        } catch (e) {
          // Si falla el parseo JSON, asumir que es un string de base64
          photos = [row.photos];
        }
      }

      return {
        ...row,
        photos,
        // Añadir información sobre el proveedor de autenticación
        auth_provider: row.auth_provider || 'email',
        // Formatear fechas
        created_at: new Date(row.created_at).toISOString(),
        updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
        user_created_at: row.user_created_at ? new Date(row.user_created_at).toISOString() : null
      };
    });

    console.log(`Se encontraron ${processedRows.length} incidencias`);
    res.json(processedRows);
  } catch (error) {
    console.error('Error al obtener incidencias:', error);
    res.status(500).json({ 
      error: 'Error al obtener las incidencias',
      details: error.message 
    });
  }
});

// Actualizar una incidencia
router.put('/incidents/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, resolution } = req.body;

  try {
    // Actualizar la incidencia
    const [result] = await pool().query(
      'UPDATE incidents SET status = ?, resolution = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, resolution, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }

    // Obtener la incidencia actualizada con la información del usuario
    const [updatedIncident] = await pool().query(`
      SELECT 
        i.*,
        u.email as user_email,
        u.id as user_id,
        u.provider as auth_provider
      FROM incidents i 
      JOIN users u ON i.user_id = u.id 
      WHERE i.id = ?
    `, [id]);

    // Procesar la respuesta
    const processedIncident = {
      ...updatedIncident[0],
      photos: processPhotos(updatedIncident[0].photos),
      auth_provider: updatedIncident[0].auth_provider || 'email',
      created_at: new Date(updatedIncident[0].created_at).toISOString(),
      updated_at: updatedIncident[0].updated_at ? new Date(updatedIncident[0].updated_at).toISOString() : null
    };

    res.json(processedIncident);
  } catch (error) {
    console.error('Error al actualizar la incidencia:', error);
    res.status(500).json({ error: 'Error al actualizar la incidencia' });
  }
});

// Función auxiliar para procesar las fotos que pueden venir en diferentes formatos
function processPhotos(photos) {
  if (!photos) return [];
  
  // Si ya es un array, retornarlo directamente
  if (Array.isArray(photos)) return photos;
  
  // Si comienza con 'data:image', es una foto en base64, retornarla como array
  if (typeof photos === 'string' && photos.startsWith('data:image')) {
    return [photos];
  }
  
  // Intentar parsear como JSON si es una cadena que no es una imagen base64
  if (typeof photos === 'string') {
    try {
      const parsed = JSON.parse(photos);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      // Si falla el parseo, retornar como un array con un solo elemento
      return [photos];
    }
  }
  
  // Por defecto, retornar array vacío
  return [];
}

module.exports = router; 