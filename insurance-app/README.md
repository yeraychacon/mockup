# Aplicación de Gestión de Incidencias de Electrodomésticos

Esta aplicación web permite a los usuarios gestionar incidencias relacionadas con electrodomésticos, especialmente vitrocerámicas y otros aparatos del hogar.

## Características

- Autenticación de usuarios (email/contraseña y Google)
- Creación y gestión de incidencias
- Subida de fotos para documentar las incidencias
- Seguimiento del estado de las incidencias
- Feedback y respuestas a las incidencias
- Interfaz moderna y responsive

## Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v8 o superior)
- Firebase (para autenticación)

## Configuración

### 1. Frontend

1. Instalar dependencias:
   ```bash
   cd insurance-app
   npm install
   ```

2. Configurar Firebase:
   - Crear un proyecto en Firebase Console
   - Obtener las credenciales de configuración
   - Actualizar las credenciales en `src/context/AuthContext.js`

### 2. Backend

1. Instalar dependencias:
   ```bash
   cd insurance-app/server
   npm install
   ```

2. Configurar la base de datos:
   - Crear una base de datos MySQL
   - Actualizar las credenciales en `server/config/db.js` o usar variables de entorno

3. Crear archivo `.env` en la carpeta `server`:
   ```
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=insurance_db
   PORT=5000
   ```

## Ejecución

### Frontend
```bash
cd insurance-app
npm start
```

### Backend
```bash
cd insurance-app/server
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
insurance-app/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── pages/          # Páginas principales
│   ├── context/        # Contextos de React
│   └── services/       # Servicios y utilidades
├── server/
│   ├── config/         # Configuración del servidor
│   ├── routes/         # Rutas de la API
│   └── server.js       # Punto de entrada del servidor
└── README.md
```

## Base de Datos

La aplicación utiliza MySQL para almacenar las incidencias con la siguiente estructura:

- Tabla `incidents`:
  - id (INT, AUTO_INCREMENT, PRIMARY KEY)
  - user_id (VARCHAR)
  - type (VARCHAR)
  - description (TEXT)
  - status (ENUM)
  - appliance_type (VARCHAR)
  - photos (JSON)
  - feedback (TEXT)
  - created_at (TIMESTAMP)
  - updated_at (TIMESTAMP)

## Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
