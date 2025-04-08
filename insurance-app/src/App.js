import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import NewIncident from './pages/NewIncident';
import IncidentList from './pages/IncidentList';
import IncidentDetail from './pages/IncidentDetail';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
      light: '#2c2c2c',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6A1B9A',
      light: '#9C27B0',
      dark: '#4A148C',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#121212',
      secondary: '#333333',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
              {/* Rutas públicas - siempre accesibles */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Rutas protegidas - requieren autenticación */}
              <Route
                path="/admin"
                element={
                  <PrivateRoute adminOnly={true}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/new-incident"
                element={
                  <PrivateRoute>
                    <NewIncident />
                  </PrivateRoute>
                }
              />
              <Route
                path="/incidents"
                element={
                  <PrivateRoute>
                    <IncidentList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/incidents/detail/:id"
                element={
                  <PrivateRoute>
                    <IncidentDetail />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
