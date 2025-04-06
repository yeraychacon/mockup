const admin = require('firebase-admin');
const { pool } = require('../config/db');

// En modo desarrollo, no inicializamos Firebase Admin
const isDevelopment = process.env.NODE_ENV === 'development';

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    if (isDevelopment) {
      try {
        // En desarrollo, extraemos la información del token sin verificarlo
        const tokenParts = token.split('.');
        if (tokenParts.length > 1) {
          const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
          req.user = {
            uid: payload.user_id || payload.sub,
            email: payload.email,
            provider: payload.firebase?.sign_in_provider === 'google.com' ? 'google' : 'email'
          };
        } else {
          req.user = {
            uid: 'test-user-' + Date.now(),
            email: 'test@example.com',
            provider: 'email'
          };
        }
        return next();
      } catch (error) {
        console.error('Error al procesar token en desarrollo:', error);
        return res.status(401).json({ error: 'Token inválido' });
      }
    }

    // En producción, verificamos el token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    const provider = userRecord.providerData[0]?.providerId === 'google.com' ? 'google' : 'email';
    
    req.user = {
      ...decodedToken,
      provider
    };
    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    if (isDevelopment) {
      // En modo desarrollo, permitimos acceso admin
      return next();
    }

    // Si el usuario se autenticó con Google, nunca será admin
    if (req.user.provider === 'google') {
      return res.status(403).json({ error: 'Acceso no autorizado' });
    }

    const [rows] = await pool().query(
      'SELECT role FROM users WHERE email = ? AND provider = ?',
      [req.user.email, 'email']
    );

    if (rows.length > 0 && rows[0].role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Acceso no autorizado' });
    }
  } catch (error) {
    console.error('Error en verificación de admin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Ruta para verificar si un usuario es administrador
const checkAdmin = async (req, res) => {
  try {
    // Si el usuario se autenticó con Google, nunca será admin
    if (req.user.provider === 'google') {
      return res.status(403).json({ isAdmin: false, message: 'Los usuarios de Google no pueden ser administradores' });
    }

    const [users] = await pool().query(
      'SELECT role FROM users WHERE id = ? AND provider = ? AND email = ?', 
      [req.user.uid, 'email', req.user.email]
    );
    
    if (users.length > 0 && users[0].role === 'admin') {
      res.status(200).json({ isAdmin: true, message: 'Usuario es administrador' });
    } else {
      res.status(403).json({ isAdmin: false, message: 'Usuario no es administrador' });
    }
  } catch (error) {
    console.error('Error al verificar rol de administrador:', error);
    res.status(500).json({ isAdmin: false, message: 'Error al verificar permisos', error: error.message });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  checkAdmin
}; 