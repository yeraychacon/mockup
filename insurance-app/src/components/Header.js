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
  useMediaQuery,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // URL del logo de camaleón
  const logoUrl = "https://cdn-icons-png.flaticon.com/512/196/196669.png";

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

  const handleOpenLogoutDialog = () => {
    setOpenLogoutDialog(true);
    handleClose();
  };

  const handleCloseLogoutDialog = () => {
    setOpenLogoutDialog(false);
  };

  const handleLogout = async () => {
    try {
      // Almacenar la referencia a navigate antes de cerrar sesión
      const navigateToHome = navigate;
      
      // Cerrar sesión
      await logout();
      setOpenLogoutDialog(false);
      
      // Usar setTimeout para asegurar que la navegación ocurra después
      // de que todos los componentes se actualicen con currentUser = null
      setTimeout(() => {
        // Navegar a la página de inicio usando la referencia almacenada
        navigateToHome('/', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setOpenLogoutDialog(false);
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
    <>
      <AppBar position="static">
        <Toolbar>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexGrow: 1,
              cursor: 'pointer' 
            }}
            onClick={() => navigate(currentUser ? '/dashboard' : '/')}
          >
            <Avatar
              src={logoUrl}
              alt="Logo Camaleón"
              sx={{ 
                width: 40, 
                height: 40, 
                marginRight: 2,
                backgroundColor: 'white',
                padding: '5px'
              }}
            />
            <Typography variant="h6" component="div">
              Grupo Camaleón
            </Typography>
          </Box>
          
          {isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {currentUser && (
                <Avatar
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || currentUser.email}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    mr: 1,
                    bgcolor: currentUser.providerData[0]?.providerId === 'google.com' 
                      ? 'primary.main' 
                      : 'secondary.main',
                    border: '2px solid white'
                  }}
                >
                  {!currentUser.photoURL && (currentUser.displayName?.[0] || currentUser.email?.[0])}
                </Avatar>
              )}
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
                  <MenuItem onClick={handleOpenLogoutDialog}>
                    Cerrar Sesión
                  </MenuItem>
                )}
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                  <Button color="inherit" onClick={handleOpenLogoutDialog}>
                    Cerrar Sesión
                  </Button>
                  <Avatar
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || currentUser.email}
                    sx={{ 
                      width: 36, 
                      height: 36,
                      ml: 1,
                      cursor: 'pointer',
                      bgcolor: 'secondary.main',
                      border: '2px solid white'
                    }}
                    onClick={() => navigate('/dashboard')}
                  >
                    {!currentUser.photoURL && (currentUser.displayName?.[0] || currentUser.email?.[0])}
                  </Avatar>
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
                  <Button color="inherit" onClick={handleOpenLogoutDialog}>
                    Cerrar Sesión
                  </Button>
                  <Avatar
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || currentUser.email}
                    sx={{ 
                      width: 36, 
                      height: 36,
                      ml: 1,
                      cursor: 'pointer',
                      bgcolor: 'primary.main',
                      border: '2px solid white'
                    }}
                    onClick={() => navigate('/dashboard')}
                  >
                    {!currentUser.photoURL && (currentUser.displayName?.[0] || currentUser.email?.[0])}
                  </Avatar>
                </>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Diálogo de confirmación para cerrar sesión */}
      <Dialog
        open={openLogoutDialog}
        onClose={handleCloseLogoutDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Cerrar sesión"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que quieres cerrar la sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogoutDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleLogout} color="error" autoFocus>
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Header; 