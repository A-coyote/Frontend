import React, { useState, useEffect } from 'react';
import { Box, TextField, MenuItem, Select, InputLabel, FormControl, Button, Grid, Typography, Switch, FormControlLabel } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import { isAuthenticated } from '../../utils/auth';

const EditarUsuario = () => {
  const [showAlert, setShowAlert] = useState(null);
  const navigate = useNavigate();
  const { userId } = useParams(); // Obtener el ID del usuario de la URL

  console.log("userId:", userId);  // Verifica el valor del userId extraído

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');
  const [estado, setEstado] = useState(true); // Estado por defecto en "Activo" (true)
  const [roles, setRoles] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

  // Verificar si el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login'); // Redirige al login si no está autenticado
    } else {
      // Verifica que el userId sea válido antes de proceder con las solicitudes
      if (userId) {
        fetchRoles(); // Si está autenticado, carga los roles
        fetchUsuario(userId); // Obtiene los datos del usuario a editar
      } else {
        setShowAlert({ severity: 'error', message: 'El ID de usuario es inválido.' });
      }
    }
  }, [navigate, userId]);

  // Función para obtener los roles desde la API
  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/roles/rol`);
      setRoles(response.data);
    } catch (error) {
      setShowAlert({ severity: 'error', message: 'Error al cargar los roles.' });
    }
  };

  // Función para obtener los datos del usuario a editar
  const fetchUsuario = async (userId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/auth/usersedit/${userId}`);
      const usuario = response.data;

      // Pre-cargar los datos del formulario con los datos del usuario
      setNombre(usuario.u_nombre);
      setApellido(usuario.u_apellido);
      setUsername(usuario.u_usuario);
      setRol(usuario.u_rolId);  // Asegúrate de que el campo 'u_rolId' es el correcto
      setEstado(usuario.u_estado === 1); // Asignamos el valor de estado (1 -> true, 0 -> false)
    } catch (error) {
      setShowAlert({ severity: 'error', message: 'Hubo un error al obtener los datos del usuario.' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validar campos requeridos
    if (!nombre || !apellido || !username || !rol) {
      setShowAlert({ severity: 'warning', message: 'Por favor complete todos los campos' });
      return;
    }

    const usuarioActualizado = {
      nombre,
      apellido,
      username,
      rol,
      estado: estado ? 1 : 0, // Convertimos el estado booleano en 1 (activo) o 0 (inactivo)
      password: password ? password : undefined,  // Solo enviar password si no está vacío
    };

    try {
      // Realiza la solicitud PUT para actualizar el usuario
      const response = await axios.put(`${apiUrl}/api/auth/users/${userId}`, usuarioActualizado);

      // Verificar si el backend devuelve un mensaje de éxito
      if (response.data && response.data.msg === 'Usuario actualizado correctamente') {
        setShowAlert({ severity: 'success', message: response.data.msg });

        // Redirige después de 3 segundos
        setTimeout(() => navigate('/seguridad/usuarios'), 500);
      } else {
        // En caso de error en la respuesta de la API, mostramos el error
        setShowAlert({ severity: 'error', message: response.data.msg || 'Error al actualizar el usuario. Inténtalo de nuevo.' });
      }
    } catch (error) {
      // Si la respuesta de error tiene un mensaje específico
      if (error.response && error.response.data && error.response.data.msg) {
        setShowAlert({ severity: 'error', message: error.response.data.msg }); // Mostrar el mensaje específico de la API
      } else {
        setShowAlert({ severity: 'error', message: 'Hubo un error al actualizar el usuario. Inténtalo de nuevo.' });
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
          autoHideDuration={100}
          sx={{ mb: 4 }}
        />
      )}

      <Typography variant="h5" sx={{ textAlign: 'center', mb: 4 }}>Atualiza la información del usuario</Typography>

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

          {/* Campo Estado (Activo/Inactivo) */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={estado} // Si el estado es true, el Switch estará activado (activo)
                  onChange={(e) => setEstado(e.target.checked)} // Cambiar el estado
                  color="primary"
                />
              }
              label="Estado"
            />
          </Grid>

          {/* Botón para actualizar el usuario */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Actualizar Usuario
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default EditarUsuario;
