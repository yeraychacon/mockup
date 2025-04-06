import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) return;
      
      // Si el usuario es de Google, nunca será admin
      if (currentUser.providerData[0]?.providerId === 'google.com') {
        setIsAdmin(false);
        return;
      }
      
      try {
        const response = await fetch('http://localhost:8000/api/admin/check', {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`
          }
        });
        setIsAdmin(response.ok);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      handleClose();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = !currentUser ? [
    { label: 'Inicio', path: '/' },
    { label: 'Iniciar Sesión', path: '/login' },
    { label: 'Registrarse', path: '/register' }
  ] : isAdmin && currentUser.providerData[0]?.providerId !== 'google.com' ? [
    { label: 'Panel de Administración', path: '/admin' }
  ] : [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Nueva Incidencia', path: '/new-incident' },
    { label: 'Mis Incidencias', path: '/incidents' }
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Aseguradora de Electrodomésticos
        </Typography>
        
        {isMobile ? (
          <Box>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {menuItems.map((item) => (
                <MenuItem 
                  key={item.path} 
                  onClick={() => handleMenuItemClick(item.path)}
                >
                  {item.label}
                </MenuItem>
              ))}
              {currentUser && (
                <MenuItem onClick={handleLogout}>
                  Cerrar Sesión
                </MenuItem>
              )}
            </Menu>
          </Box>
        ) : (
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
            ) : isAdmin && currentUser.providerData[0]?.providerId !== 'google.com' ? (
              <>
                <Button color="inherit" onClick={() => navigate('/admin')}>
                  Panel de Administración
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Cerrar Sesión
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
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Header; 