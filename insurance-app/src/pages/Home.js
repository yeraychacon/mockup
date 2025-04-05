import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import { Security, Build, Speed, Support } from '@mui/icons-material';

function Home() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom>
          Bienvenido a Su Seguro de Electrodomésticos
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Protegemos sus electrodomésticos con la mejor cobertura y servicio
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Security sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Protección Completa
              </Typography>
              <Typography variant="body2">
                Cubrimos todo tipo de electrodomésticos con garantías extensivas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Speed sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Respuesta Rápida
              </Typography>
              <Typography variant="body2">
                Atendemos sus incidencias en tiempo récord
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Build sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Técnicos Expertos
              </Typography>
              <Typography variant="body2">
                Contamos con profesionales altamente cualificados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Support sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Soporte 24/7
              </Typography>
              <Typography variant="body2">
                Estamos disponibles para ayudarte en cualquier momento
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={6} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Nuestros Servicios
        </Typography>
        <Typography variant="body1" paragraph>
          Especializados en la protección de vitrocerámicas, lavadoras, lavavajillas y todo tipo de electrodomésticos del hogar.
          Ofrecemos coberturas personalizadas que se adaptan a sus necesidades específicas.
        </Typography>
      </Box>
    </Container>
  );
}

export default Home; 