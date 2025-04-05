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
      const response = await axios.get(`http://localhost:8000/api/incidents/${currentUser.uid}`);
      setIncidents(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error al cargar las incidencias: ' + error.message);
      setLoading(false);
    }
  };

  const handleViewDetails = async (incidentId) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/incidents/detail/${incidentId}`);
      setSelectedIncident(response.data);
      setOpenDialog(true);
    } catch (error) {
      setError('Error al cargar los detalles de la incidencia: ' + error.message);
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
    if (!photos) return [];
    try {
      return typeof photos === 'string' ? JSON.parse(photos) : photos;
    } catch (e) {
      console.error('Error al parsear fotos:', e);
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
            sx: { maxHeight: '90vh' }
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
                {selectedIncident.feedback && (
                  <Typography gutterBottom>
                    <strong>Feedback:</strong> {selectedIncident.feedback}
                  </Typography>
                )}
                {selectedIncident.photos && (
                  <Box sx={{ mt: 2 }}>
                    <Typography gutterBottom>
                      <strong>Fotos:</strong>
                    </Typography>
                    <Grid container spacing={2}>
                      {parsePhotos(selectedIncident.photos).map((photo, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          {!imageLoadError[index] ? (
                            <Box
                              sx={{
                                position: 'relative',
                                width: '100%',
                                paddingTop: '75%', // Aspecto 4:3
                                backgroundColor: '#f5f5f5',
                                borderRadius: '8px',
                                overflow: 'hidden'
                              }}
                            >
                              <img
                                src={photo}
                                alt={`Foto ${index + 1}`}
                                onError={() => handleImageError(index)}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                width: '100%',
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '8px'
                              }}
                            >
                              <Typography color="text.secondary">
                                Error al cargar la imagen
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cerrar</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
}

export default IncidentList; 