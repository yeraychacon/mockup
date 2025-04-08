import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Button,
  IconButton,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import BuildIcon from '@mui/icons-material/Build';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CopyrightIcon from '@mui/icons-material/Copyright';

function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 60, color: theme.palette.secondary.main }} />,
      title: "Protección Completa",
      description: "Cubrimos todo tipo de electrodomésticos con garantías extensivas"
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 60, color: theme.palette.secondary.main }} />,
      title: "Respuesta Rápida",
      description: "Atendemos sus incidencias en tiempo récord"
    },
    {
      icon: <BuildIcon sx={{ fontSize: 60, color: theme.palette.secondary.main }} />,
      title: "Técnicos Expertos",
      description: "Contamos con profesionales altamente cualificados"
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 60, color: theme.palette.secondary.main }} />,
      title: "Soporte 24/7",
      description: "Estamos disponibles para ayudarte en cualquier momento"
    }
  ];

  // Rotación automática
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [features.length]);

  const handlePrev = () => {
    setActiveFeature((prev) => (prev === 0 ? features.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveFeature((prev) => (prev + 1) % features.length);
  };

  // Mostrar solo una tarjeta a la vez
  const feature = features[activeFeature];

  return (
    <Box sx={{ bgcolor: '#f8f8f8', minHeight: '100vh', pt: 4, pb: 0, overflowX: 'hidden' }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box 
          sx={{
            textAlign: 'center',
            py: isMobile ? 4 : 8,
            px: 2,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            mb: 6
          }}
        >
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{
              fontSize: isMobile ? '2rem' : '3.5rem',
              fontWeight: 700,
              color: theme.palette.primary.main
            }}
          >
            Bienvenido a Su Seguro de Electrodomésticos
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary"
            sx={{ 
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
              fontSize: isMobile ? '1.2rem' : '1.5rem'
            }}
          >
            Protegemos sus electrodomésticos con la mejor cobertura y servicio
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              textTransform: 'none',
              backgroundColor: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark,
              }
            }}
          >
            Comenzar Ahora
          </Button>
        </Box>

        {/* Features Section - Una sola tarjeta cuadrada */}
        <Box sx={{ position: 'relative', my: 4 }}>
          <IconButton 
            onClick={handlePrev}
            sx={{ 
              position: 'absolute', 
              left: { xs: -5, sm: -20 }, 
              top: '50%', 
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: '#f0f0f0' }
            }}
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'center',
              mx: 'auto',
              width: '100%',
              maxWidth: { xs: '280px', sm: '320px', md: '350px' }
            }}
          >
            <Card 
              sx={{
                width: '100%',
                aspectRatio: '1/1',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.4s ease',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                border: `1px solid ${theme.palette.secondary.light}`,
                animation: 'fadeIn 0.5s ease-in-out',
                '@keyframes fadeIn': {
                  '0%': { opacity: 0.6, transform: 'scale(0.97)' },
                  '100%': { opacity: 1, transform: 'scale(1)' }
                }
              }}
            >
              <CardContent sx={{ 
                textAlign: 'center', 
                flexGrow: 1,
                p: { xs: 2, sm: 4 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Box sx={{ mb: 3 }}>
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    mb: 2,
                    color: theme.palette.primary.main
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    lineHeight: 1.6
                  }}
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <IconButton 
            onClick={handleNext}
            sx={{ 
              position: 'absolute', 
              right: { xs: -5, sm: -20 }, 
              top: '50%', 
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              '&:hover': { bgcolor: '#f0f0f0' }
            }}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
          
          {/* Indicadores de páginas */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            {features.map((_, index) => (
              <Box
                key={index}
                onClick={() => setActiveFeature(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  mx: 0.5,
                  bgcolor: index === activeFeature ? theme.palette.secondary.main : '#ccc',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
      
      {/* Services Section */}
      <Box 
        sx={{ 
          mt: 8, 
          backgroundColor: theme.palette.secondary.main,
          py: 5,
          px: { xs: 2, md: 4 },
          borderRadius: 0,
          color: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          width: '100%'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{
              fontSize: isMobile ? '2rem' : '2.5rem',
              fontWeight: 600,
              color: 'white',
              mb: 4,
              textAlign: 'center'
            }}
          >
            Nuestros Servicios
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              maxWidth: '900px', 
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.8,
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center'
            }}
          >
            Especializados en la protección de vitrocerámicas, lavadoras, lavavajillas y todo tipo de electrodomésticos del hogar. 
            Ofrecemos coberturas personalizadas que se adaptan a sus necesidades específicas.
          </Typography>
        </Container>
      </Box>
      
      {/* Footer - Derechos de autor */}
      <Box 
        sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: 'white',
          py: 3,
          mt: 0,
          width: '100%'
        }}
      >
        <Container maxWidth="lg">
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
              <CopyrightIcon sx={{ fontSize: 18, mr: 1 }} />
              <Typography variant="body2">
                {new Date().getFullYear()} Seguro de Electrodomésticos. Todos los derechos reservados.
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.8, textAlign: { xs: 'center', sm: 'right' } }}>
                Términos y condiciones | Política de privacidad
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Home; 