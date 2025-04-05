import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyB9Izilpp73DmKvwMOFWbnQ8eiGbD0sFjw",
    authDomain: "insurance-app-c52d0.firebaseapp.com",
    projectId: "insurance-app-c52d0",
    storageBucket: "insurance-app-c52d0.firebasestorage.app",
    messagingSenderId: "958910861547",
    appId: "1:958910861547:web:2d83db54a4252e27bdeeae",
    measurementId: "G-BM580CPQZV"
  };
  
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener la instancia de autenticación
export const auth = getAuth(app);
export default app; 