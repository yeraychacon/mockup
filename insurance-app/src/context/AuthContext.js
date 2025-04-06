import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para crear/actualizar usuario en la base de datos
  async function createOrUpdateUser(user, provider = 'email') {
    try {
      const token = await user.getIdToken();
      const userData = {
        id: user.uid,
        email: user.email,
        provider: provider,
        name: user.displayName || null,
        photo_url: user.photoURL || null,
        created_at: new Date().toISOString()
      };

      console.log('Guardando datos de usuario:', { ...userData, token: '***' });

      const response = await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Error al guardar usuario en la base de datos');
      }

      const data = await response.json();
      console.log('Usuario guardado correctamente:', data);
      
      return data;
    } catch (error) {
      console.error('Error al crear/actualizar usuario en la base de datos:', error);
      throw error;
    }
  }

  // Función para registrarse con email y contraseña
  async function signup(email, password) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await createOrUpdateUser(result.user);
      return result;
    } catch (error) {
      console.error('Error en signup:', error);
      setError(error.message);
      throw error;
    }
  }

  // Función para iniciar sesión con email y contraseña
  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createOrUpdateUser(result.user);
      return result;
    } catch (error) {
      console.error('Error en login:', error);
      setError(error.message);
      throw error;
    }
  }

  // Función para iniciar sesión con Google
  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Iniciando proceso de login con Google...');
      const result = await signInWithPopup(auth, provider);
      console.log('Login con Google exitoso, guardando datos...');
      
      await createOrUpdateUser(result.user, 'google');
      return result;
    } catch (error) {
      console.error('Error en loginWithGoogle:', error);
      setError(error.message);
      throw error;
    }
  }

  // Función para cerrar sesión
  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error en logout:', error);
      setError(error.message);
      throw error;
    }
  }

  // Efecto para manejar el estado de la autenticación
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('Estado de autenticación cambiado:', user ? 'Usuario autenticado' : 'No autenticado');
        if (user) {
          try {
            await createOrUpdateUser(user, user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email');
          } catch (error) {
            console.error('Error al actualizar usuario en la base de datos:', error);
          }
        }
        setCurrentUser(user);
        setLoading(false);
      }, (error) => {
        console.error('Error en onAuthStateChanged:', error);
        setError(error.message);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error al configurar el observador de autenticación:', error);
      setError(error.message);
      setLoading(false);
    }
  }, []);

  const value = {
    currentUser,
    error,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 