import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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

function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [imageLoadError, setImageLoadError] = useState({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchIncidents();
  }, [currentUser, navigate]);

  const fetchIncidents = async () => {
    try {
      console.log('Iniciando carga de incidencias...');
      
      if (!currentUser) {
        console.error('No hay usuario autenticado');
        setError('Debe iniciar sesión para ver las incidencias');
        setLoading(false);
        return;
      }

      const token = await currentUser.getIdToken();
      console.log('Token obtenido, realizando petición para:', currentUser.uid);

      const response = await axios.get(
        `http://localhost:8000/api/incidents/${currentUser.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Incidencias recibidas:', response.data.length);
      
      // Procesar las incidencias para asegurar que las fotos sean arrays
      const processedIncidents = response.data.map(incident => ({
        ...incident,
        photos: Array.isArray(incident.photos) ? incident.photos : []
      }));

      setIncidents(processedIncidents);
      setLoading(false);
      setError('');
    } catch (error) {
      console.error('Error al cargar las incidencias:', error);
      let errorMessage = 'Error al cargar las incidencias: ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Error desconocido';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleViewDetails = async (incidentId) => {
    try {
      console.log('Solicitando detalles de incidencia:', incidentId);
      
      const token = await currentUser.getIdToken();
      const response = await axios.get(
        `http://localhost:8000/api/incidents/detail/${incidentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Detalles recibidos:', response.data);
      
      // Procesar las fotos
      let photos = [];
      if (response.data.photos) {
        if (typeof response.data.photos === 'string') {
          try {
            photos = JSON.parse(response.data.photos);
          } catch (e) {
            console.error('Error al parsear fotos:', e);
            photos = [];
          }
        } else if (Array.isArray(response.data.photos)) {
          photos = response.data.photos;
        }
      }
      
      // Asegurar que photos sea un array y filtrar fotos inválidas
      photos = Array.isArray(photos) ? photos : [];
      photos = photos.filter(photo => photo && typeof photo === 'string' && photo.trim() !== '');
      
      console.log('Fotos procesadas:', photos.length);
      
      const updatedIncident = {
        ...response.data,
        photos: photos,
        created_at: new Date(response.data.created_at).toLocaleString(),
        updated_at: response.data.updated_at ? new Date(response.data.updated_at).toLocaleString() : null
      };
      
      setSelectedIncident(updatedIncident);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error al cargar los detalles:', error);
      let errorMessage = 'Error al cargar los detalles: ';
      
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Error desconocido';
      }
      
      setError(errorMessage);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedIncident(null);
  };

  const handleImageError = (index) => {
    setImageLoadError(prev => ({
      ...prev,
      [index]: true
    }));
  };

  const parsePhotos = (photos) => {
    console.log('Parseando fotos:', photos);
    console.log('Tipo de fotos a parsear:', typeof photos);
    
    if (!photos) {
      console.log('No hay fotos para parsear');
      return [];
    }
    
    if (Array.isArray(photos)) {
      console.log('Las fotos ya son un array:', photos);
      return photos;
    }
    
    try {
      const parsed = JSON.parse(photos);
      console.log('Fotos parseadas exitosamente:', parsed);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Error al parsear fotos en parsePhotos:', e);
      return [];
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <Container>
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Incidencias
        </Typography>

        {incidents.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No tienes incidencias registradas
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/new-incident')}
              sx={{ mt: 2 }}
            >
              Crear Nueva Incidencia
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {incidents.map((incident) => (
              <Grid item xs={12} md={6} key={incident.id}>
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
                      onClick={() => handleViewDetails(incident.id)}
                    >
                      Ver Detalles
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { 
              maxHeight: '90vh',
              overflowY: 'auto'
            }
          }}
        >
          {selectedIncident && (
            <>
              <DialogTitle>
                Detalles de la Incidencia
              </DialogTitle>
              <DialogContent>
                <Typography variant="h6" gutterBottom>
                  {selectedIncident.appliance_type}
                </Typography>
                <Typography gutterBottom>
                  <strong>Tipo:</strong> {selectedIncident.type}
                </Typography>
                <Typography gutterBottom>
                  <strong>Descripción:</strong> {selectedIncident.description}
                </Typography>
                <Typography gutterBottom>
                  <strong>Estado:</strong>{' '}
                  <Chip
                    label={statusLabels[selectedIncident.status]}
                    color={statusColors[selectedIncident.status]}
                    size="small"
                  />
                </Typography>
                <Typography gutterBottom>
                  <strong>Fecha de creación:</strong> {selectedIncident.created_at}
                </Typography>
                {selectedIncident.updated_at && (
                  <Typography gutterBottom>
                    <strong>Última actualización:</strong> {selectedIncident.updated_at}
                  </Typography>
                )}
                {selectedIncident.feedback && (
                  <Typography gutterBottom>
                    <strong>Feedback:</strong> {selectedIncident.feedback}
                  </Typography>
                )}
                
                {/* Sección de fotos */}
                {selectedIncident.photos && selectedIncident.photos.length > 0 ? (
                  <Box sx={{ mt: 3 }}>
                    <Typography gutterBottom>
                      <strong>Fotos ({selectedIncident.photos.length}):</strong>
                    </Typography>
                    <Grid container spacing={1}>
                      {selectedIncident.photos.map((photo, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Paper
                            elevation={3}
                            sx={{
                              position: 'relative',
                              height: 200,
                              width: '100%',
                              overflow: 'hidden',
                              borderRadius: 1,
                              backgroundColor: '#f5f5f5',
                              '&:hover': {
                                transform: 'scale(1.02)',
                                transition: 'transform 0.2s'
                              }
                            }}
                          >
                            <img
                              src={photo}
                              alt={`Foto ${index + 1}`}
                              onError={(e) => {
                                console.error('Error al cargar la imagen:', photo);
                                e.target.src = 'https://via.placeholder.com/400x300?text=Error+al+cargar+imagen';
                              }}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : (
                  <Box sx={{ mt: 3 }}>
                    <Typography color="text.secondary">
                      No hay fotos disponibles para esta incidencia
                    </Typography>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>
                  Cerrar
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
}

export default IncidentList; 