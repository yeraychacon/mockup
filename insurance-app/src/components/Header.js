import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Aseguradora de Electrodomésticos
        </Typography>
        <Box>
          {!currentUser ? (
            <>
              <Button color="inherit" onClick={() => navigate('/')}>
                Inicio
              </Button>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Registrarse
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={() => navigate('/new-incident')}>
                Nueva Incidencia
              </Button>
              <Button color="inherit" onClick={() => navigate('/incidents')}>
                Mis Incidencias
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 