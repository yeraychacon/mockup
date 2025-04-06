import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import BuildIcon from '@mui/icons-material/Build';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Protección Completa",
      description: "Cubrimos todo tipo de electrodomésticos con garantías extensivas"
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Respuesta Rápida",
      description: "Atendemos sus incidencias en tiempo récord"
    },
    {
      icon: <BuildIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Técnicos Expertos",
      description: "Contamos con profesionales altamente cualificados"
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Soporte 24/7",
      description: "Estamos disponibles para ayudarte en cualquier momento"
    }
  ];

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pt: 4, pb: 6 }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box 
          sx={{
            textAlign: 'center',
            py: isMobile ? 4 : 8,
            px: 2,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 1,
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
              textTransform: 'none'
            }}
          >
            Comenzar Ahora
          </Button>
        </Box>

        {/* Features Section */}
        <Grid 
          container 
          spacing={2}
          sx={{ 
            mx: 'auto',
            width: '100%',
            justifyContent: 'center'
          }}
        >
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} lg={3} key={index}>
              <Card 
                sx={{
                  height: '100%',
                  minHeight: 220,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  flexGrow: 1,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 600,
                      fontSize: isMobile ? '1.1rem' : '1.25rem',
                      minHeight: '2.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: isMobile ? '0.875rem' : '1rem',
                      lineHeight: 1.5,
                      flex: 1
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Services Section */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{
              fontSize: isMobile ? '2rem' : '2.5rem',
              fontWeight: 600,
              color: theme.palette.primary.main,
              mb: 4
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
              px: 2
            }}
          >
            Especializados en la protección de vitrocerámicas, lavadoras, lavavajillas y todo tipo de electrodomésticos del hogar. 
            Ofrecemos coberturas personalizadas que se adaptan a sus necesidades específicas.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Home; 