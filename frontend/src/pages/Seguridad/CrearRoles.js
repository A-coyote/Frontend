import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import { isAuthenticated } from '../../utils/auth';

const CrearRoles = () => {
  const [showAlert, setShowAlert] = useState(null); // Estado de la alerta
  const navigate = useNavigate();

  // Estados para los campos del formulario
  const [rolName, setRolName] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

  // Verificar si el usuario está autenticado al cargar el componente
  useEffect(() => {
    // Si el usuario no está autenticado, redirige al login
    if (!isAuthenticated()) {
      navigate('/login'); // Redirige al login si no está autenticado
    }
  }, [navigate]);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones simples
    if (!rolName || !descripcion) {
      setShowAlert({
        severity: 'error',
        message: 'Todos los campos son obligatorios.',
      });
      return;
    }

    const newRole = { rolName, descripcion };

    try {
      // Obtener el token JWT desde el almacenamiento local o cookies
      const token = localStorage.getItem('token');

      // Verificar si el token existe
      if (!token) {
        setShowAlert({
          severity: 'error',
          message: 'No se encontró el token de autenticación.',
        });
        return;
      }

      // Configuración del encabezado con el token
      const config = {
        headers: {
          'x-auth-token': token, // Enviar el token JWT en la cabecera
        },
      };

      const response = await axios.post(`${apiUrl}/api/roles/register`, newRole, config);

      // Verificar la respuesta de la API
      if (response.data.msg === 'El rol ya existe') {
        setShowAlert({
          severity: 'error',
          message: response.data.msg, // Mostrar el mensaje de error
        });
      } else if (response.data.msg === 'Rol registrado correctamente') {
        setShowAlert({
          severity: 'success',
          message: response.data.msg, // Mostrar el mensaje de éxito
        });

        // Limpiar los campos del formulario si el rol se creó con éxito
        setRolName('');
        setDescripcion('');

        // Redirigir a la lista de roles después de 3 segundos
        setTimeout(() => {
          navigate('/seguridad/roles');
        }, 2000);
      }
    } catch (error) {
      // Si hay un error específico de la API
      if (error.response && error.response.data && error.response.data.msg) {
        setShowAlert({
          severity: 'error',
          message: error.response.data.msg,
        });
      } else {
        setShowAlert({
          severity: 'error',
          message: 'Hubo un error al crear el rol. Inténtalo de nuevo.',
        });
      }
    }
  };

  return (
    <Box sx={{ padding: 5 }}>
      {/* Mostrar la alerta si hay alguna */}
      {showAlert && (
        <AlertMessage
          severity={showAlert.severity}
          message={showAlert.message}
          autoHideDuration={2000} // La alerta se cierra después de 3 segundos
          sx={{ mb: 4 }}
        />
      )}

      <Typography variant="h4" gutterBottom>
        Crear Nuevo Rol
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Campo para Nombre del Rol */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre del Rol"
              value={rolName}
              onChange={(e) => setRolName(e.target.value)}
              required
            />
          </Grid>

          {/* Campo para Descripción */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </Grid>

          {/* Botón para enviar el formulario */}
          <Grid item xs={6}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Crear Rol
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CrearRoles;
