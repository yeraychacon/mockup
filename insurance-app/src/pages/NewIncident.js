import React, { useState, useRef, useEffect } from 'react';
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
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CloseIcon from '@mui/icons-material/Close';
import LensIcon from '@mui/icons-material/Lens';

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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    return () => {
      // Cleanup: detener la cámara cuando el componente se desmonte
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No se seleccionó ningún archivo');
      return;
    }

    console.log('Archivo seleccionado:', file.name);
    processFile(file);
  };

  const processFile = (file) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      console.log('Imagen cargada correctamente');
      const imageUrl = reader.result;
      console.log('URL de la imagen:', imageUrl.substring(0, 50) + '...');
      setPhotos(prevPhotos => {
        const newPhotos = [...prevPhotos, imageUrl];
        console.log('Total de fotos:', newPhotos.length);
        return newPhotos;
      });
    };

    reader.onerror = (error) => {
      console.error('Error al leer el archivo:', error);
      setError('Error al cargar la imagen: ' + error.message);
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error al iniciar la lectura del archivo:', error);
      setError('Error al procesar la imagen');
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    console.log('Eliminando foto en índice:', indexToRemove);
    setPhotos(prevPhotos => {
      const newPhotos = prevPhotos.filter((_, index) => index !== indexToRemove);
      console.log('Fotos restantes:', newPhotos.length);
      return newPhotos;
    });
  };

  const handleCameraOpen = async () => {
    setError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
          } catch (playError) {
            console.error('Error al reproducir el video:', playError);
            setError('Error al iniciar la cámara. Por favor, recarga la página.');
          }
        };
      }

      setIsCameraOpen(true);
    } catch (error) {
      console.error('Error al abrir la cámara:', error);
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
  };

  const handleCameraClose = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleCapture = async () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Usar las dimensiones reales del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      
      // Dibujar el video en el canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir a blob para mejor manejo de memoria
      canvas.toBlob((blob) => {
        const newPhoto = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhotos(prevPhotos => [...prevPhotos, newPhoto]);
      }, 'image/jpeg', 0.9);

      handleCameraClose();
    } catch (error) {
      console.error('Error al capturar la foto:', error);
      setError('Error al capturar la foto. Por favor, intenta de nuevo.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Iniciando envío de incidencia...');
      
      // Las fotos ya están en formato base64 o URL de datos
      const processedPhotos = photos.filter(photo => {
        if (typeof photo === 'string') {
          return photo.startsWith('data:image/') || photo.startsWith('blob:');
        }
        return false;
      });

      console.log('Número de fotos a enviar:', processedPhotos.length);

      if (!currentUser?.uid) {
        throw new Error('No se encontró el ID del usuario');
      }

      const formData = {
        user_id: currentUser.uid,
        type,
        description,
        appliance_type: applianceType,
        photos: processedPhotos
      };

      console.log('Enviando datos al servidor:', {
        ...formData,
        photos: `${formData.photos.length} fotos`
      });

      const response = await axios.post('http://localhost:8000/api/incidents', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });

      console.log('Respuesta del servidor:', response.data);
      
      // Limpiar los objetos URL
      processedPhotos.forEach(photo => {
        if (photo.startsWith('blob:')) {
          URL.revokeObjectURL(photo);
        }
      });

      // Mostrar mensaje de éxito antes de navegar
      setError('');
      navigate('/incidents');
    } catch (error) {
      console.error('Error detallado al crear incidencia:', error);
      let errorMessage = 'Error al crear la incidencia: ';
      
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
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
                <Typography variant="subtitle1" gutterBottom>
                  Añadir Fotos
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ width: '200px' }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="photo-upload"
                      type="file"
                      onChange={handlePhotoChange}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <label htmlFor="photo-upload" style={{ flex: 1 }}>
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<AddPhotoAlternateIcon />}
                          size="small"
                          fullWidth
                        >
                          Galería
                        </Button>
                      </label>
                      {!isMobile && (
                        <Button
                          variant="outlined"
                          startIcon={<CameraAltIcon />}
                          size="small"
                          onClick={handleCameraOpen}
                        >
                          Cámara
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>

                {photos.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={1}>
                      {photos.map((photo, index) => (
                        <Grid item key={index}>
                          <Box
                            sx={{
                              position: 'relative',
                              width: 100,
                              height: 100,
                            }}
                          >
                            <img
                              src={photo instanceof File ? URL.createObjectURL(photo) : photo}
                              alt={`Foto ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px',
                              }}
                              onError={(e) => {
                                console.error('Error al cargar la imagen:', index);
                                e.target.src = 'https://via.placeholder.com/100x100?text=Error';
                              }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                bgcolor: 'background.paper',
                                '&:hover': {
                                  bgcolor: 'error.light',
                                  color: 'white',
                                },
                              }}
                              onClick={() => handleRemovePhoto(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  Crear Incidencia
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

      <Dialog
        open={isCameraOpen}
        onClose={handleCameraClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'black',
            position: 'relative',
            overflow: 'hidden',
            height: '80vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', height: '100%' }}>
          <Box sx={{ 
            width: '100%', 
            height: '100%',
            position: 'relative',
            bgcolor: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: isMobile ? 'none' : 'scaleX(-1)'
              }}
              playsInline
              autoPlay
            />
          </Box>
          <Box sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
            zIndex: 1
          }}>
            <IconButton
              onClick={handleCapture}
              sx={{
                bgcolor: 'white',
                color: 'error.main',
                '&:hover': { 
                  bgcolor: 'white',
                  transform: 'scale(1.1)'
                },
                width: 64,
                height: 64,
                transition: 'transform 0.2s'
              }}
            >
              <RadioButtonCheckedIcon sx={{ fontSize: 40 }} />
            </IconButton>
          </Box>
          <IconButton
            onClick={handleCameraClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default NewIncident; 