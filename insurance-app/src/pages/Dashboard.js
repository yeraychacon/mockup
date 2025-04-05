import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert
} from '@mui/material';
import { Add as AddIcon, List as ListIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const statusColors = {
  pending: 'warning',
  in_progress: 'info',
  resolved: 'success',
  rejected: 'error'
};

const statusLabels = {
  pending: 'Pendiente',
  in_progress: 'En Proceso',
  resolved: 'Resuelto',
  rejected: 'Rechazado'
};

function Dashboard() {
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchRecentIncidents();
  }, [currentUser, navigate]);

  const fetchRecentIncidents = async () => {
    if (!currentUser) return;
    
    try {
      const response = await axios.get(`http://localhost:8000/api/incidents/${currentUser.uid}`);
      setRecentIncidents(response.data.slice(0, 3)); // Mostrar solo las 3 incidencias más recientes
      setLoading(false);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setError('Error al cargar las incidencias recientes: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography>Cargando...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Acciones Rápidas */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Acciones Rápidas
              </Typography>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/new-incident')}
                  >
                    Nueva Incidencia
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<ListIcon />}
                    onClick={() => navigate('/incidents')}
                  >
                    Ver Todas las Incidencias
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Incidencias Recientes */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Incidencias Recientes
              </Typography>
              <Grid container spacing={3}>
                {recentIncidents.length > 0 ? (
                  recentIncidents.map((incident) => (
                    <Grid item xs={12} md={4} key={incident.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {incident.appliance_type}
                          </Typography>
                          <Typography color="textSecondary" gutterBottom>
                            Tipo: {incident.type}
                          </Typography>
                          <Typography variant="body2" noWrap>
                            {incident.description}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Chip
                              label={statusLabels[incident.status]}
                              color={statusColors[incident.status]}
                              size="small"
                            />
                          </Box>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => navigate('/incidents')}
                          >
                            Ver Detalles
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Box textAlign="center">
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        No hay incidencias recientes
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/new-incident')}
                        sx={{ mt: 2 }}
                      >
                        Crear Primera Incidencia
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Dashboard; 