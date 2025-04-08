import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Mapeo de estados a colores y etiquetas
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

function IncidentDetail() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchIncidentDetail();
  }, [currentUser, id, navigate]);

  const fetchIncidentDetail = async () => {
    if (!currentUser || !id) return;

    try {
      const token = await currentUser.getIdToken();
      const response = await axios.get(
        `http://localhost:8000/api/incidents/detail/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setIncident(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching incident details:', error);
      setError('Error al cargar los detalles de la incidencia: ' + 
        (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/incidents')}
            sx={{ mt: 2 }}
          >
            Volver a mis incidencias
          </Button>
        </Box>
      </Container>
    );
  }

  if (!incident) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">No se encontró la incidencia solicitada.</Alert>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/incidents')}
            sx={{ mt: 2 }}
          >
            Volver a mis incidencias
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/incidents')}
          sx={{ mb: 2 }}
        >
          Volver a mis incidencias
        </Button>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" component="h1">
              Incidencia: {incident.appliance_type}
            </Typography>
            <Chip
              label={incident.status_text || statusLabels[incident.status]}
              color={statusColors[incident.status]}
            />
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Información General
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Tipo de incidencia:</strong> {incident.type}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Electrodoméstico:</strong> {incident.appliance_type}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Fecha de creación:</strong> {new Date(incident.created_at).toLocaleString('es-ES')}
                  </Typography>
                  {incident.updated_at && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Última actualización:</strong> {new Date(incident.updated_at).toLocaleString('es-ES')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Estado y Resolución
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Estado actual:</strong> {incident.status_text || statusLabels[incident.status]}
                  </Typography>
                  
                  {incident.resolution && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Resolución:</strong> {incident.resolution}
                    </Typography>
                  )}
                  
                  {incident.feedback && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Feedback del usuario:</strong> {incident.feedback}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Descripción del Problema
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {incident.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {incident.photos && incident.photos.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Fotografías ({incident.photos.length})
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {incident.photos.map((photo, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Box
                            component="img"
                            src={photo}
                            alt={`Foto ${index + 1}`}
                            sx={{
                              width: '100%',
                              height: 200,
                              objectFit: 'cover',
                              borderRadius: 1
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}

export default IncidentDetail; 