import React, { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Select, InputLabel, FormControl, Button, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import { isAuthenticated } from '../../utils/auth';

const CrearUsuario = () => {
  const [showAlert, setShowAlert] = useState(null);
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');
  const [roles, setRoles] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

  // Verificar si el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login'); // Redirige al login si no está autenticado
    } else {
      fetchRoles(); // Si está autenticado, carga los roles
    }
  }, [navigate]);

  // Función para obtener los roles desde la API
  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/roles/rol`);
      setRoles(response.data);
    } catch (error) {
      setShowAlert({
        severity: 'error',
        message: 'Error al obtener los roles',
      });
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validar campos requeridos
    if (!nombre || !apellido || !username || !password || !rol) {
      setShowAlert({ severity: 'warning', message: 'Por favor complete todos los campos' });
      return;
    }

    const nuevoUsuario = {
      nombre,
      apellido,
      username,
      password,
      rol,
    };

    try {
      // Realiza la solicitud POST para crear el usuario
      const response = await axios.post(`${apiUrl}/api/auth/register`, nuevoUsuario);


      if (response.data.msg) {
        setShowAlert({ severity: 'error', message: response.data.msg }); // Mostrar el mensaje de error
      } else {
        setShowAlert({ severity: 'success', message: 'Usuario creado exitosamente' });

        // Resetea los campos del formulario
        setNombre('');
        setApellido('');
        setUsername('');
        setPassword('');
        setRol('');

        // Redirige después de 3 segundos
        setTimeout(() => navigate('/Seguridad/Usuarios'), 3000);
      }
    } catch (error) {

      // Si la respuesta de error tiene un mensaje específico
      if (error.response && error.response.data && error.response.data.msg) {
        setShowAlert({ severity: 'error', message: error.response.data.msg }); // Mostrar el mensaje específico de la API
      } else {
        setShowAlert({ severity: 'error', message: 'Hubo un error al crear el usuario. Inténtalo de nuevo.' });
      }
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto', mt: 4 }}>

      {/* Mostrar la alerta si hay alguna */}
      {showAlert && (
        <AlertMessage
          severity={showAlert.severity}
          message={showAlert.message}
          autoHideDuration={1000} // La alerta se cierra después de 5 segundos
          sx={{ mb: 4 }}
        />
      )}

      <Typography variant="h5" sx={{ textAlign: 'center', mb: 4 }}>Registra a un usuario</Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Campo Nombre */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombre"
              variant="outlined"
              fullWidth
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </Grid>

          {/* Campo Apellido */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Apellido"
              variant="outlined"
              fullWidth
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
          </Grid>

          {/* Campo Username */}
          <Grid item xs={12}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Grid>

          {/* Campo Password */}
          <Grid item xs={12}>
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Grid>

          {/* Campo Rol (con select) */}
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Rol</InputLabel>
              <Select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                label="Rol"
                required
              >
                {/* Mapea los roles obtenidos desde la API */}
                {roles.map((role) => (
                  <MenuItem key={role.ROL_ID} value={role.ROL_ID}>
                    {role.NOMBRE}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Botón para crear el usuario */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Crear Usuario
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CrearUsuario;
