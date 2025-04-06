require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/db');
const incidentsRouter = require('./routes/incidents');
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');
const { verifyToken } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/incidents', verifyToken, incidentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 8000;

// Inicializar la base de datos antes de empezar a escuchar
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer(); 