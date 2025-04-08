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

      console.group('Sincronizando usuario con la base de datos');
      console.log('Datos de usuario a guardar:', {
        ...userData,
        // No mostrar el token completo por seguridad
        token: token.substring(0, 10) + '...' + token.substring(token.length - 5)
      });

      const response = await fetch('http://localhost:8000/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error en la respuesta del servidor:', data);
        throw new Error('Error al guardar usuario en la base de datos');
      }

      console.log('Respuesta del servidor:', data);
      console.log('Estado de la operación:', response.status, response.statusText);
      console.log('Usuario sincronizado correctamente con la base de datos');
      console.groupEnd();
      
      return data;
    } catch (error) {
      console.error('Error al sincronizar usuario con la base de datos:', error);
      console.groupEnd();
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
      
      // Mostrar información detallada del usuario en la consola
      console.group('Inicio de sesión con Email exitoso');
      console.log('ID de usuario:', result.user.uid);
      console.log('Email:', result.user.email);
      console.log('Verificado:', result.user.emailVerified);
      console.log('Proveedor:', 'email');
      console.log('Metadata:', {
        creationTime: result.user.metadata.creationTime,
        lastSignInTime: result.user.metadata.lastSignInTime
      });
      console.log('Token:', await result.user.getIdToken(true));
      console.groupEnd();
      
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
      
      // Mostrar información detallada del usuario en la consola
      console.group('Inicio de sesión con Google exitoso');
      console.log('ID de usuario:', result.user.uid);
      console.log('Email:', result.user.email);
      console.log('Nombre:', result.user.displayName);
      console.log('Foto de perfil:', result.user.photoURL);
      console.log('Verificado:', result.user.emailVerified);
      console.log('Proveedor:', 'google');
      console.log('Metadata:', {
        creationTime: result.user.metadata.creationTime,
        lastSignInTime: result.user.metadata.lastSignInTime
      });
      
      // Datos adicionales específicos de Google
      const credential = GoogleAuthProvider.credentialFromResult(result);
      console.log('Token de acceso de Google:', credential.accessToken);
      console.log('Token de ID:', await result.user.getIdToken(true));
      console.groupEnd();
      
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