require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./config/db');
const incidentRoutes = require('./routes/incidents');

const app = express();
const port = process.env.PORT || 8000;

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:3000', // URL del frontend
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '50mb' })); // Aumentamos el límite para las fotos
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rutas
app.use('/api/incidents', incidentRoutes);

// Inicializar base de datos
initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor corriendo en el puerto ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }); 