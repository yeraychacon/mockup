const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Obtener todas las incidencias de un usuario
router.get('/:userId', async (req, res) => {
  try {
    console.log('Solicitando incidencias para usuario:', req.params.userId);
    
    // Verificar que el usuario autenticado coincide con el userId solicitado
    if (req.user.uid !== req.params.userId) {
      console.error('ID de usuario no coincide:', {
        authUserId: req.user.uid,
        requestedUserId: req.params.userId
      });
      return res.status(403).json({
        message: 'No autorizado para ver las incidencias de este usuario'
      });
    }

    const [incidents] = await pool().query(
      'SELECT * FROM incidents WHERE user_id = ? ORDER BY created_at DESC',
      [req.params.userId]
    );
    
    console.log(`Se encontraron ${incidents.length} incidencias`);

    // Parsear las fotos antes de enviar la respuesta
    const processedIncidents = incidents.map(incident => {
      let photos = [];
      if (incident.photos) {
        try {
          photos = JSON.parse(incident.photos);
          if (!Array.isArray(photos)) {
            photos = [];
          }
        } catch (e) {
          console.error('Error al parsear fotos de incidencia:', incident.id, e);
        }
      }
      return {
        ...incident,
        photos,
        created_at: incident.created_at ? new Date(incident.created_at).toISOString() : null,
        updated_at: incident.updated_at ? new Date(incident.updated_at).toISOString() : null
      };
    });
    
    res.json(processedIncidents);
  } catch (error) {
    console.error('Error al obtener las incidencias:', error);
    res.status(500).json({ 
      message: 'Error al obtener las incidencias', 
      error: error.message,
      details: error.sqlMessage || 'Error interno del servidor'
    });
  }
});

// Obtener una incidencia específica
router.get('/detail/:id', async (req, res) => {
  try {
    console.log('Obteniendo detalles de incidencia:', req.params.id);
    
    // Primero obtener la incidencia con el usuario
    const [incidents] = await pool().query(
      'SELECT i.*, u.id as user_id FROM incidents i JOIN users u ON i.user_id = u.id WHERE i.id = ?',
      [req.params.id]
    );
    
    if (incidents.length === 0) {
      return res.status(404).json({ message: 'Incidencia no encontrada' });
    }

    const incident = incidents[0];

    // Verificar que el usuario autenticado es el dueño de la incidencia
    if (req.user.uid !== incident.user_id) {
      console.error('Usuario no autorizado:', {
        authUserId: req.user.uid,
        incidentUserId: incident.user_id
      });
      return res.status(403).json({
        message: 'No autorizado para ver esta incidencia'
      });
    }
    
    // Procesar las fotos
    let processedPhotos = [];
    if (incident.photos) {
      try {
        const photoData = typeof incident.photos === 'string' 
          ? incident.photos 
          : Buffer.isBuffer(incident.photos) 
            ? incident.photos.toString('utf8') 
            : JSON.stringify(incident.photos);

        processedPhotos = JSON.parse(photoData);
        
        // Asegurar que sea un array
        processedPhotos = Array.isArray(processedPhotos) ? processedPhotos : [processedPhotos];
        
        // Filtrar fotos válidas
        processedPhotos = processedPhotos.filter(photo => 
          photo && typeof photo === 'string' && photo.trim() !== ''
        );
      } catch (e) {
        console.error('Error al procesar fotos:', e);
        processedPhotos = [];
      }
    }

    // Formatear fechas
    const response = {
      ...incident,
      photos: processedPhotos,
      created_at: incident.created_at ? new Date(incident.created_at).toISOString() : null,
      updated_at: incident.updated_at ? new Date(incident.updated_at).toISOString() : null
    };

    console.log('Enviando respuesta con fotos:', processedPhotos.length);
    res.json(response);
  } catch (error) {
    console.error('Error al obtener la incidencia:', error);
    res.status(500).json({ 
      message: 'Error al obtener la incidencia', 
      error: error.message,
      details: error.sqlMessage || 'Error interno del servidor'
    });
  }
});

// Crear una nueva incidencia
router.post('/', async (req, res) => {
  try {
    console.log('Recibida solicitud para crear incidencia');
    const { user_id, type, description, appliance_type, photos } = req.body;

    // Validar que el usuario autenticado coincide con el user_id
    if (req.user.uid !== user_id) {
      console.error('ID de usuario no coincide:', { authUserId: req.user.uid, requestUserId: user_id });
      return res.status(403).json({
        message: 'No autorizado para crear incidencias para este usuario'
      });
    }

    // Validar campos requeridos
    if (!user_id || !type || !description || !appliance_type) {
      console.error('Faltan campos requeridos:', { user_id, type, description, appliance_type });
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        details: {
          user_id: !user_id ? 'ID de usuario requerido' : null,
          type: !type ? 'Tipo de incidencia requerido' : null,
          description: !description ? 'Descripción requerida' : null,
          appliance_type: !appliance_type ? 'Tipo de electrodoméstico requerido' : null
        }
      });
    }

    console.log('Datos recibidos para nueva incidencia:', {
      user_id,
      type,
      description,
      appliance_type,
      photos: Array.isArray(photos) ? `${photos.length} fotos` : 'No hay fotos'
    });

    // Procesar las fotos antes de guardar
    let photosToSave = [];
    if (photos) {
      if (Array.isArray(photos)) {
        photosToSave = photos.filter(photo => photo && typeof photo === 'string' && photo.trim() !== '');
      } else if (typeof photos === 'string') {
        try {
          const parsedPhotos = JSON.parse(photos);
          photosToSave = Array.isArray(parsedPhotos) ? parsedPhotos : [parsedPhotos];
        } catch (e) {
          console.error('Error al parsear fotos:', e);
          photosToSave = [photos];
        }
      }
    }

    // Validar el tamaño de las fotos
    const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
    const invalidPhotos = photosToSave.filter(photo => {
      const base64Size = photo.length * 0.75; // Aproximación del tamaño en bytes
      return base64Size > MAX_PHOTO_SIZE;
    });

    if (invalidPhotos.length > 0) {
      return res.status(400).json({
        message: 'Algunas fotos exceden el tamaño máximo permitido (5MB)',
        details: `${invalidPhotos.length} fotos son demasiado grandes`
      });
    }

    console.log('Fotos procesadas y validadas:', photosToSave.length);
    const photosString = JSON.stringify(photosToSave);

    // Iniciar transacción
    const connection = await pool().getConnection();
    try {
      await connection.beginTransaction();

      // Verificar que el usuario existe
      const [users] = await connection.query('SELECT id FROM users WHERE id = ?', [user_id]);
      if (users.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Insertar la incidencia
      const [result] = await connection.query(
        'INSERT INTO incidents (user_id, type, description, appliance_type, photos, status) VALUES (?, ?, ?, ?, ?, "pending")',
        [user_id, type, description, appliance_type, photosString]
      );

      // Obtener la incidencia creada
      const [savedIncident] = await connection.query(
        'SELECT * FROM incidents WHERE id = ?',
        [result.insertId]
      );

      await connection.commit();
      
      console.log('Incidente guardado:', savedIncident[0]);
      res.status(201).json({
        message: 'Incidencia creada correctamente',
        incident: savedIncident[0]
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error al crear la incidencia:', error);
    res.status(500).json({ 
      message: 'Error al crear la incidencia',
      error: error.message,
      details: error.sqlMessage || 'Error interno del servidor'
    });
  }
});

// Actualizar el estado de una incidencia
router.patch('/:id/status', async (req, res) => {
  const { status, feedback } = req.body;
  
  try {
    await pool().query(
      'UPDATE incidents SET status = ?, feedback = ? WHERE id = ?',
      [status, feedback, req.params.id]
    );
    
    res.json({ message: 'Estado de la incidencia actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    res.status(500).json({ message: 'Error al actualizar el estado', error: error.message });
  }
});

module.exports = router; 