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
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, List as ListIcon, Person as PersonIcon } from '@mui/icons-material';
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
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
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
      const token = await currentUser.getIdToken();
      const response = await axios.get(
        `http://localhost:8000/api/incidents/dashboard/${currentUser.uid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.incidents) {
        setRecentIncidents(response.data.incidents.slice(0, 3)); // Mostrar solo las 3 incidencias más recientes
      } else {
        setRecentIncidents([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setError('Error al cargar las incidencias recientes: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleViewDetails = async (incidentId) => {
    try {
      setDialogLoading(true);
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
      setDialogLoading(false);
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
      setDialogLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedIncident(null);
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

  // Determinar si es un usuario de Google o email
  const isGoogleUser = currentUser.providerData[0]?.providerId === 'google.com';

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
          {/* Primera fila: Información del Usuario y Acciones Rápidas */}
          <Grid item container spacing={3} xs={12}>
            {/* Información del Usuario */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || currentUser.email}
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      mr: 2,
                      bgcolor: isGoogleUser ? 'primary.main' : 'secondary.main'
                    }}
                  >
                    {!currentUser.photoURL && (currentUser.displayName?.[0] || currentUser.email?.[0])}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {currentUser.displayName || 'Usuario'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {currentUser.email}
                    </Typography>
                    <Chip 
                      size="small" 
                      color={isGoogleUser ? "primary" : "secondary"}
                      label={isGoogleUser ? "Google" : "Email"} 
                      sx={{ mt: 1, fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Acciones Rápidas */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
          </Grid>

          {/* Incidencias Recientes */}
          <Grid item xs={12} sx={{ mt: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Incidencias Recientes
              </Typography>
              <Grid container spacing={1} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                {recentIncidents.length > 0 ? (
                  recentIncidents.map((incident) => (
                    <Grid item key={incident.id} sx={{ width: '175px', m: 1 }}>
                      <Card sx={{ 
                        height: 220, 
                        width: '100%',
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between'
                      }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {incident.appliance_type}
                          </Typography>
                          <Typography color="textSecondary" gutterBottom>
                            Tipo: {incident.type}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            height: '40px'
                          }}>
                            {incident.description}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Chip
                              label={incident.status_text || statusLabels[incident.status]}
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

        {/* Diálogo para mostrar detalles de la incidencia */}
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
          {dialogLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedIncident && (
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
                    label={statusLabels[selectedIncident.status] || selectedIncident.status_text}
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
                {selectedIncident.resolution && (
                  <Typography gutterBottom>
                    <strong>Resolución:</strong> {selectedIncident.resolution}
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

export default Dashboard; 