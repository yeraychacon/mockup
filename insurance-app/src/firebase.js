import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Inicializar Firebase con manejo de errores
let app;
let auth;

try {
  console.log('Inicializando Firebase...');
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Configuración para desarrollo local
  if (window.location.hostname === 'localhost' || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(window.location.hostname)) {
    console.log('Configurando Firebase para desarrollo local...');
    auth.useDeviceLanguage();
    // Configuraciones adicionales para desarrollo local si son necesarias
  }
  
  console.log('Firebase inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
  // Aquí podrías mostrar un mensaje de error al usuario o manejar el error de otra manera
}

export { auth };
export default app; 