const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const nodemailer = require('nodemailer');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Ruta para verificar si un usuario es admin
router.get('/check', verifyToken, verifyAdmin, (req, res) => {
  res.status(200).json({ message: 'Usuario es administrador' });
});

// Obtener todas las incidencias
router.get('/incidents', verifyToken, verifyAdmin, async (req, res) => {
  try {
    console.log('Obteniendo todas las incidencias...');
    
    // Consulta para obtener todas las incidencias con información del usuario
    const [rows] = await pool().query(`
      SELECT 
        i.*,
        u.email as user_email,
        u.id as user_id,
        u.provider as auth_provider
      FROM incidents i 
      JOIN users u ON i.user_id = u.id 
      ORDER BY i.created_at DESC
    `);

    // Procesar las fotos y añadir información adicional
    const processedRows = rows.map(row => ({
      ...row,
      photos: row.photos ? JSON.parse(row.photos) : [],
      // Añadir información sobre el proveedor de autenticación
      auth_provider: row.auth_provider || 'email',
      // Formatear fechas
      created_at: new Date(row.created_at).toISOString(),
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null
    }));

    console.log(`Se encontraron ${processedRows.length} incidencias`);
    res.json(processedRows);
  } catch (error) {
    console.error('Error al obtener incidencias:', error);
    res.status(500).json({ error: 'Error al obtener las incidencias' });
  }
});

// Actualizar una incidencia
router.put('/incidents/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, resolution } = req.body;

  try {
    // Obtener la incidencia actual para enviar notificación
    const [currentIncident] = await pool().query(
      'SELECT i.*, u.email FROM incidents i JOIN users u ON i.user_id = u.id WHERE i.id = ?',
      [id]
    );

    if (currentIncident.length === 0) {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }

    // Actualizar la incidencia
    const [result] = await pool().query(
      'UPDATE incidents SET status = ?, resolution = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, resolution, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Incidencia no encontrada' });
    }

    // Enviar correo al usuario
    const userEmail = currentIncident[0].email;
    let emailSubject = 'Actualización de su incidencia';
    let emailText = `Su incidencia ha sido actualizada.\nNuevo estado: ${status}`;

    if (resolution) {
      emailText += `\n\nResolución:\n${resolution}`;
    }

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: emailSubject,
        text: emailText
      });
      console.log('Correo de notificación enviado a:', userEmail);
    } catch (emailError) {
      console.error('Error al enviar correo:', emailError);
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
      photos: updatedIncident[0].photos ? JSON.parse(updatedIncident[0].photos) : [],
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

module.exports = router; 