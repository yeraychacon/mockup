  import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Error al crear la cuenta: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper 
          elevation={5} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
          }}
        >
          {/* Cabecera con fondo morado */}
          <Box 
            sx={{ 
              bgcolor: theme.palette.secondary.main, 
              p: 3, 
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Typography component="h1" variant="h4" gutterBottom>
              Crear Cuenta
            </Typography>
            <Typography variant="body2">
              Regístrate para proteger tus electrodomésticos
            </Typography>
          </Box>

          {/* Contenido con fondo blanco y bordes negros */}
          <Box 
            sx={{ 
              p: 4, 
              borderTop: `4px solid ${theme.palette.primary.main}`,
              bgcolor: 'white'
            }}
          >
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                label="Contraseña"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
                label="Confirmar Contraseña"
                type="password"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
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
                variant="contained"
                fullWidth
                sx={{ 
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  bgcolor: theme.palette.secondary.main,
                  '&:hover': {
                    bgcolor: theme.palette.secondary.dark,
                  }
                }}
                disabled={loading}
              >
                Registrarse
              </Button>
            </form>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                ¿Ya tienes una cuenta?{' '}
                <Button
                  onClick={() => navigate('/login')}
                  sx={{ 
                    textTransform: 'none',
                    color: theme.palette.primary.main,
                    fontWeight: 'bold'
                  }}
                >
                  Inicia sesión aquí
                </Button>
              </Typography>
            </Box>
          </Box>

          {/* Pie con fondo negro */}
          <Box 
            sx={{ 
              bgcolor: theme.palette.primary.main, 
              p: 2, 
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Typography variant="body2">
              Seguro de Electrodomésticos - Protección confiable
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register; 