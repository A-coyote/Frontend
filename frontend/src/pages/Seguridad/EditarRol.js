import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import { isAuthenticated } from '../../utils/auth';

const EditarRol = () => {
  const [showAlert, setShowAlert] = useState(null); // Estado de la alerta
  const navigate = useNavigate();
  const { id } = useParams(); // Obtener el id del rol desde la URL

  // Estados para los campos del formulario
  const [rolName, setRolName] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

  // Verificar si el usuario está autenticado al cargar el componente
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login'); // Redirige al login si no está autenticado
    } else {
      // Cargar los datos del rol si estamos editando
      if (id) {
        fetchRoleData(id);
      }
    }
  }, [id, navigate]);

  // Función para cargar los datos del rol
  const fetchRoleData = async (roleId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setShowAlert({
          severity: 'error',
          message: 'No se encontró el token de autenticación.',
        });
        return;
      }

      const config = {
        headers: {
          'x-auth-token': token, // Enviar el token JWT en la cabecera
        },
      };

      const response = await axios.get(`${apiUrl}/api/roles/roledit/${roleId}`, config);
      const roleData = response.data;

      // Llenar los campos del formulario con los datos del rol
      setRolName(roleData.NOMBRE);
      setDescripcion(roleData.DESCRIPCION);
    } catch (error) {
      setShowAlert({
        severity: 'error',
        message: 'Hubo un error al cargar los datos del rol.',
      });
    }
  };

  // Función para manejar el envío del formulario (actualizar rol)
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

    const updatedRole = { rolName, descripcion };

    try {
      // Obtener el token JWT desde el almacenamiento
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

      // Hacer la solicitud PUT para actualizar el rol
      const response = await axios.put(`${apiUrl}/api/roles/rol/${id}`, updatedRole, config);

      // Verificar la respuesta de la API
      if (response.data.msg === 'Rol actualizado correctamente') {
        setShowAlert({
          severity: 'success',
          message: response.data.msg, // Mostrar el mensaje de éxito
        });

        // Limpiar los campos del formulario si el rol se actualizó con éxito
        setRolName('');
        setDescripcion('');

        // Redirigir a la lista de roles después de 2 segundos
        setTimeout(() => {
          navigate('/seguridad/roles');
        }, 2000);
      } else {
        setShowAlert({
          severity: 'error',
          message: response.data.msg || 'Error al actualizar el rol.',
        });
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.msg) {
        setShowAlert({
          severity: 'error',
          message: error.response.data.msg,
        });
      } else {
        setShowAlert({
          severity: 'error',
          message: 'Hubo un error al actualizar el rol. Inténtalo de nuevo.',
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
        Editar Rol
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
              Actualizar Rol
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default EditarRol;
