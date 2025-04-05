import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Grid,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const APPLIANCE_TYPES = [
  'Vitrocerámica',
  'Lavadora',
  'Lavavajillas',
  'Nevera',
  'Horno',
  'Microondas',
  'Otro'
];

function NewIncident() {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [applianceType, setApplianceType] = useState('');
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then(base64Photos => {
        setPhotos(prevPhotos => [...prevPhotos, ...base64Photos]);
      })
      .catch(error => {
        setError('Error al cargar las fotos: ' + error.message);
      });
  };

  const handleRemovePhoto = (indexToRemove) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!type || !description || !applianceType) {
      return setError('Por favor, complete todos los campos requeridos');
    }

    try {
      setError('');
      setLoading(true);

      const incidentData = {
        user_id: currentUser.uid,
        type,
        description,
        appliance_type: applianceType,
        photos
      };

      await axios.post('http://localhost:8000/api/incidents', incidentData);
      navigate('/incidents');
    } catch (error) {
      setError('Error al crear la incidencia: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Nueva Incidencia
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Tipo de Electrodoméstico"
                  fullWidth
                  value={applianceType}
                  onChange={(e) => setApplianceType(e.target.value)}
                  required
                >
                  {APPLIANCE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Tipo de Incidencia"
                  fullWidth
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  placeholder="Ej: No enciende, Hace ruido extraño..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describa el problema en detalle..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="photo-upload"
                    multiple
                    type="file"
                    onChange={handlePhotoChange}
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AddPhotoAlternateIcon />}
                      fullWidth
                    >
                      Subir Fotos
                    </Button>
                  </label>
                </Box>

                {photos.length > 0 && (
                  <Grid container spacing={2}>
                    {photos.map((photo, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box
                          sx={{
                            position: 'relative',
                            width: '100%',
                            paddingTop: '100%',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            overflow: 'hidden'
                          }}
                        >
                          <img
                            src={photo}
                            alt={`Vista previa ${index + 1}`}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.9)'
                              }
                            }}
                            onClick={() => handleRemovePhoto(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                >
                  Crear Incidencia
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default NewIncident; 