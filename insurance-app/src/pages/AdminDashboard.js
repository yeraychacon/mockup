import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ImageList,
  ImageListItem,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import { ZoomIn as ZoomInIcon, Google as GoogleIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Check as CheckIcon, Edit as EditIcon } from '@mui/icons-material';

function AdminDashboard() {
  const { currentUser } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchIncidents = async () => {
    try {
      console.log('Obteniendo token...');
      const token = await currentUser.getIdToken();
      console.log('Token obtenido, realizando petición...');
      
      const response = await fetch('http://localhost:8000/api/admin/incidents', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Datos recibidos:', data);
      
      // Parsear las fotos JSON si vienen como string
      const processedData = data.map(incident => ({
        ...incident,
        photos: typeof incident.photos === 'string' ? JSON.parse(incident.photos) : incident.photos || []
      }));
      console.log('Incidencias obtenidas:', processedData);
      
      setIncidents(processedData);
      setError(null);
    } catch (error) {
      console.error('Error detallado al obtener incidencias:', error);
      setError('Error al cargar las incidencias. Por favor, intente de nuevo.');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      console.log('Usuario autenticado, iniciando carga de incidencias...');
      fetchIncidents();
    }
  }, [currentUser]);

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      const token = await currentUser.getIdToken();
      await fetch(`http://localhost:8000/api/admin/incidents/${incidentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchIncidents(); // Recargar la lista después de actualizar
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
    }
  };

  const handleOpenResolution = (incident) => {
    setSelectedIncident(incident);
    setResolution(incident.resolution || '');
    setOpenDialog(true);
  };

  const handleCloseResolution = () => {
    setOpenDialog(false);
    setSelectedIncident(null);
    setResolution('');
  };

  const handleSaveResolution = async () => {
    try {
      const token = await currentUser.getIdToken();
      await fetch(`http://localhost:8000/api/admin/incidents/${selectedIncident.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: selectedIncident.status,
          resolution: resolution
        })
      });
      fetchIncidents();
      handleCloseResolution();
    } catch (error) {
      console.error('Error al guardar la resolución:', error);
    }
  };

  const handleOpenPhoto = (photo) => {
    setSelectedPhoto(photo);
    setOpenPhotoDialog(true);
  };

  const handleClosePhoto = () => {
    setSelectedPhoto(null);
    setOpenPhotoDialog(false);
  };

  if (loading) {
    return <Typography>Cargando...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Panel de Administración
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && incidents.length === 0 && !error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No hay incidencias disponibles en este momento.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Fotos</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Resolución</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.map((incident) => (
              <TableRow 
                key={incident.id}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                }}
              >
                <TableCell>{incident.id}</TableCell>
                <TableCell>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="primary">
                        {incident.user_email}
                      </Typography>
                      {incident.auth_provider === 'google' && (
                        <GoogleIcon fontSize="small" color="action" />
                      )}
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      ID: {incident.user_id}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{incident.type}</TableCell>
                <TableCell style={{ maxWidth: '200px', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                  {incident.description}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {incident.photos && incident.photos.map((photo, index) => (
                      <IconButton 
                        key={index}
                        size="small"
                        onClick={() => handleOpenPhoto(photo)}
                      >
                        <img 
                          src={photo} 
                          alt={`Foto ${index + 1}`} 
                          style={{ 
                            width: 50, 
                            height: 50, 
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      </IconButton>
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={incident.status}
                      onChange={(e) => handleStatusChange(incident.id, e.target.value)}
                      sx={{
                        '& .MuiSelect-select': {
                          color: incident.status === 'resolved' ? 'success.main' :
                                incident.status === 'rejected' ? 'error.main' :
                                incident.status === 'in_progress' ? 'info.main' : 'warning.main'
                        }
                      }}
                    >
                      <MenuItem value="pending">Pendiente</MenuItem>
                      <MenuItem value="in_progress">En Proceso</MenuItem>
                      <MenuItem value="resolved">Resuelto</MenuItem>
                      <MenuItem value="rejected">Rechazado</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(incident.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(incident.created_at).toLocaleTimeString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenResolution(incident)}
                    startIcon={incident.resolution ? <CheckIcon /> : <EditIcon />}
                    color={incident.resolution ? "success" : "primary"}
                  >
                    {incident.resolution ? 'Ver Resolución' : 'Añadir Resolución'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseResolution} maxWidth="md" fullWidth>
        <DialogTitle>Resolución de la Incidencia</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Resolución"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResolution}>Cancelar</Button>
          <Button onClick={handleSaveResolution} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openPhotoDialog} 
        onClose={handleClosePhoto}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px'
            }}
          >
            <img
              src={selectedPhoto}
              alt="Foto de la incidencia"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhoto}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminDashboard; 