import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PrivateRoute({ children, adminOnly = false }) {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // Si el email es del admin, establecer isAdmin a true directamente
      if (currentUser.email === 'admin@aseguradora.com') {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      setIsAdmin(false);
      setLoading(false);
    };

    checkAdmin();
  }, [currentUser]);

  if (loading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Si es admin y está intentando acceder a rutas de usuario normal
  if (isAdmin && !adminOnly && window.location.pathname !== '/admin') {
    return <Navigate to="/admin" />;
  }

  // Si no es admin y está intentando acceder a rutas de admin
  if (!isAdmin && adminOnly) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default PrivateRoute; 