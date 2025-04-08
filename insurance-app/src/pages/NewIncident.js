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
  const [cameraLoading, setCameraLoading] = useState(false);

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
      
      // Comprimir la imagen antes de guardarla
      compressImage(imageUrl).then(compressedImage => {
        console.log('Imagen comprimida correctamente');
        setPhotos(prevPhotos => {
          const newPhotos = [...prevPhotos, compressedImage];
          console.log('Total de fotos:', newPhotos.length);
          return newPhotos;
        });
      }).catch(error => {
        console.error('Error al comprimir la imagen:', error);
        setError('Error al procesar la imagen: ' + error.message);
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

  // Función para comprimir imágenes
  const compressImage = (dataUrl) => {
    return new Promise((resolve, reject) => {
      try {
        const image = new Image();
        image.onload = () => {
          // Calcular nuevas dimensiones manteniendo la proporción
          let width = image.width;
          let height = image.height;
          
          // Limitar tamaño máximo a 1200px en cualquier dimensión
          const maxDimension = 1200;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > width && height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
          
          // Crear canvas para comprimir la imagen
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Dibujar la imagen en el canvas con las nuevas dimensiones
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, width, height);
          
          // Convertir a base64 con calidad reducida
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        
        image.onerror = (error) => {
          console.error('Error al cargar la imagen para comprimir:', error);
          reject(new Error('Error al procesar la imagen'));
        };
        
        image.src = dataUrl;
      } catch (error) {
        console.error('Error al comprimir la imagen:', error);
        reject(error);
      }
    });
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
    setCameraLoading(true);
    setIsCameraOpen(true); // Abrimos el diálogo inmediatamente
    
    try {
      // Detener cualquier stream anterior
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      console.log('Solicitando acceso a la cámara...');
      
      // Usar una configuración muy básica para empezar
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      console.log('Cámara accedida con éxito');
      streamRef.current = stream;

      // Aplicar el stream al elemento de video 
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Escuchar el evento 'loadeddata' que es más fiable que 'loadedmetadata'
        videoRef.current.onloadeddata = () => {
          console.log('Video data cargada');
          setCameraLoading(false);
        };
        
        // Intentar iniciar la reproducción
        try {
          await videoRef.current.play();
          console.log('Reproducción iniciada');
        } catch (playError) {
          console.error('Error al iniciar la reproducción del video:', playError);
          // Incluso si falla el play(), puede que el video se muestre, así que continuamos
        }
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      
      if (error.name === 'NotAllowedError') {
        setError('Permiso de cámara denegado. Por favor, permite el acceso a la cámara en tu navegador.');
      } else if (error.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara en tu dispositivo.');
      } else if (error.name === 'NotReadableError' || error.name === 'AbortError') {
        setError('No se pudo acceder a la cámara. Puede que esté siendo usada por otra aplicación.');
      } else {
        setError(`Error al acceder a la cámara: ${error.name}`);
      }
      
      setCameraLoading(false);
    }
  };

  const handleCameraClose = () => {
    console.log('Cerrando cámara...');
    
    // Detener todos los tracks de video
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Deteniendo track:', track.kind);
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Limpiar el elemento de video
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      console.log('Video element limpiado');
    }
    
    setIsCameraOpen(false);
    setCameraLoading(false);
  };

  const handleCapture = () => {
    if (!videoRef.current || !streamRef.current) {
      console.error('No hay video o stream para capturar');
      return;
    }

    try {
      console.log('Capturando foto...');
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Si el video aún no tiene dimensiones, usar valores predeterminados
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      
      console.log(`Dimensiones del video: ${width}x${height}`);
      
      // Limitar el tamaño máximo para mejor rendimiento
      let targetWidth = width;
      let targetHeight = height;
      const maxDimension = 1200;
      
      if (targetWidth > targetHeight && targetWidth > maxDimension) {
        targetHeight = (targetHeight * maxDimension) / targetWidth;
        targetWidth = maxDimension;
      } else if (targetHeight > targetWidth && targetHeight > maxDimension) {
        targetWidth = (targetWidth * maxDimension) / targetHeight;
        targetHeight = maxDimension;
      }
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext('2d');
      
      // Voltear horizontalmente si no es móvil (cámara frontal en PC)
      if (!isMobile) {
        ctx.translate(targetWidth, 0);
        ctx.scale(-1, 1);
      }
      
      // Dibujar el video en el canvas con las dimensiones reducidas
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      
      // Convertir a base64 con calidad reducida para menor tamaño
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      console.log('Imagen capturada y comprimida a base64');
      
      // Añadir la foto a la lista
      setPhotos(prevPhotos => [...prevPhotos, dataUrl]);
      console.log('Foto añadida a la lista');

      // Cerrar la cámara después de capturar
      handleCameraClose();
    } catch (error) {
      console.error('Error al capturar la foto:', error);
      setError('Error al capturar la foto: ' + error.message);
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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Las imágenes se comprimirán automáticamente para optimizar el envío.
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
                              src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
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
        BackdropProps={{
          style: { backgroundColor: 'rgba(0,0,0,0.9)' }
        }}
        PaperProps={{
          sx: {
            bgcolor: '#000',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            height: isMobile ? '90vh' : '70vh',
            margin: 0,
            maxHeight: 'none'
          }
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
          <Box sx={{ 
            position: 'relative', 
            flex: 1, 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            backgroundColor: '#000'
          }}>
            {/* Overlay de carga */}
            {cameraLoading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'rgba(0,0,0,0.8)'
              }}>
                <Box sx={{ 
                  p: 1.5,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <CameraAltIcon fontSize="large" color="primary" />
                </Box>
                <Typography variant="h6" color="white">
                  Iniciando cámara...
                </Typography>
              </Box>
            )}
            
            {/* Elemento de video */}
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#000',
                display: 'block'
              }}
              playsInline
              autoPlay
              muted
            />
            
            {/* Botón para capturar foto */}
            <Box sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1
            }}>
              <IconButton
                onClick={handleCapture}
                disabled={cameraLoading}
                sx={{
                  width: 64,
                  height: 64,
                  backgroundColor: 'white',
                  '&:hover': { 
                    backgroundColor: 'white',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <RadioButtonCheckedIcon sx={{ fontSize: 40, color: 'red' }} />
              </IconButton>
            </Box>
            
            {/* Botón para cerrar */}
            <IconButton
              onClick={handleCameraClose}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 1,
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default NewIncident; 