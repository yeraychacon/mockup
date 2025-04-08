import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  Alert,
  useTheme
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Primero verificamos si es el admin
      if (email === 'admin@aseguradora.com') {
        const result = await login(email, password);
        console.log('Login de administrador detectado');
        console.log('==============================');
        console.log('Bienvenido, Administrador!');
        console.log('==============================');
        navigate('/admin');
        return;
      }

      // Para usuarios normales
      const result = await login(email, password);
      console.log('==============================');
      console.log(`Bienvenido, ${result.user.email}!`);
      console.log('Redirigiendo al dashboard...');
      console.log('==============================');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      let errorMessage = 'Error al iniciar sesión: ';
      
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Por favor, intenta más tarde';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await loginWithGoogle();
      // Los usuarios de Google siempre van al dashboard normal
      console.log('==============================');
      console.log(`Bienvenido, ${result.user.displayName || result.user.email}!`);
      console.log('Redirigiendo al dashboard...');
      console.log('==============================');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      let errorMessage = 'Error al iniciar sesión con Google: ';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Por favor, permite las ventanas emergentes para iniciar sesión con Google';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Inicio de sesión cancelado';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper 
          elevation={5}
          sx={{
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          }}
        >
          {/* Cabecera con fondo negro */}
          <Box 
            sx={{ 
              bgcolor: theme.palette.primary.main, 
              p: 3, 
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Typography component="h1" variant="h4" gutterBottom>
              Iniciar Sesión
            </Typography>
            <Typography variant="body2">
              Accede a tu cuenta para gestionar tus electrodomésticos
            </Typography>
          </Box>

          {/* Contenido con fondo blanco y bordes morados */}
          <Box 
            sx={{ 
              p: 4, 
              borderTop: `4px solid ${theme.palette.secondary.main}`,
              bgcolor: 'white'
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleLogin}
              disabled={loading}
              startIcon={<GoogleIcon />}
              sx={{ 
                mb: 2,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                borderColor: theme.palette.secondary.main,
                color: theme.palette.secondary.main,
                '&:hover': {
                  borderColor: theme.palette.secondary.dark,
                  backgroundColor: 'rgba(106, 27, 154, 0.05)',
                }
              }}
            >
              Continuar con Google
            </Button>

            <Divider sx={{ my: 2 }}>o</Divider>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Correo Electrónico"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.secondary.main,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.palette.secondary.main,
                  }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.secondary.main,
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.palette.secondary.main,
                  }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  bgcolor: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: '#333333',
                  }
                }}
              >
                Iniciar Sesión
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                ¿No tienes una cuenta?{' '}
                <Button
                  onClick={() => navigate('/register')}
                  sx={{ 
                    textTransform: 'none',
                    color: theme.palette.secondary.main,
                    fontWeight: 'bold'
                  }}
                >
                  Regístrate aquí
                </Button>
              </Typography>
            </Box>
          </Box>
          
          {/* Pie con fondo morado */}
          <Box 
            sx={{ 
              bgcolor: theme.palette.secondary.main, 
              p: 2, 
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Typography variant="body2">
              Seguro de Electrodomésticos - Tu mejor opción
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login; 