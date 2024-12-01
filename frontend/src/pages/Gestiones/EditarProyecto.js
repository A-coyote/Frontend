import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid, Typography, MenuItem, Select, InputLabel, FormControl, CircularProgress } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import { isAuthenticated } from '../../utils/auth';

const EditarProyecto = () => {
  const [showAlert, setShowAlert] = useState(null);
  const [responsables, setResponsables] = useState([]);
  const [loadingResponsables, setLoadingResponsables] = useState(true);
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [estado, setEstado] = useState('');
  const [responsable, setResponsable] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

  // Verificar si el usuario está autenticado al cargar el componente
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login'); // Redirige al login si no está autenticado
    }
  }, [navigate]);

  // Obtener la lista de responsables desde la API
  useEffect(() => {
    const fetchResponsables = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/proyectos/responsables`);
        setResponsables(response.data);
      } catch (error) {
        setShowAlert({
          severity: 'error',
          message: 'Hubo un error al cargar los responsables.',
        });
      } finally {
        setLoadingResponsables(false);
      }
    };

    fetchResponsables();
  }, []);

  useEffect(() => {
    const fetchProyecto = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/proyectos/proyecto/${id}`);
        const proyecto = response.data;

        const formatoFechaInicio = new Date(proyecto.fecha_inicio).toISOString().split('T')[0];
        const formatoFechaFin = new Date(proyecto.fecha_finalizacion).toISOString().split('T')[0];

        setNombreProyecto(proyecto.nombre);
        setDescripcion(proyecto.descripcion);
        setFechaInicio(formatoFechaInicio);
        setFechaFin(formatoFechaFin);
        setPresupuesto(proyecto.presupuesto);
        setEstado(proyecto.estado);
        setResponsable(proyecto.id_responsable);
      } catch (error) {
        setShowAlert({
          severity: 'error',
          message: 'Hubo un error al cargar los datos del proyecto.',
        });
      }
    };

    if (id) {
      fetchProyecto();
    }
  }, [id]);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombreProyecto || !descripcion || !fechaInicio || !fechaFin || !presupuesto || !estado || !responsable) {
      setShowAlert({
        severity: 'error',
        message: 'Todos los campos son obligatorios.',
      });
      return;
    }

    const updatedProyecto = { nombreProyecto, descripcion, fechaInicio, fechaFin, presupuesto, estado, responsable };

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
          'x-auth-token': token,
        },
      };

      const response = await axios.put(`${apiUrl}/api/proyectos/editProyecto/${id}`, updatedProyecto, config);

      if (response.data.msg === 'El proyecto ya existe') {
        setShowAlert({
          severity: 'error',
          message: response.data.msg,
        });
      } else if (response.data.msg === 'Proyecto actualizado correctamente') {
        setShowAlert({
          severity: 'success',
          message: response.data.msg,
        });

        // Redirigir a la lista de proyectos después de 2 segundos
        setTimeout(() => {
          navigate('/gestiones/proyectos');
        }, 2000);
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
          message: 'Hubo un error al actualizar el proyecto. Inténtalo de nuevo.',
        });
      }
    }
  };

  return (
    <Box sx={{ padding: 5, maxWidth: 1000, margin: 'auto' }}>
      {/* Mostrar la alerta si hay alguna */}
      {showAlert && (
        <AlertMessage
          severity={showAlert.severity}
          message={showAlert.message}
          autoHideDuration={2000}
          sx={{ mb: 4 }}
        />
      )}

      <Typography variant="h4" gutterBottom align="center">
        Editar Proyecto
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Campo para Nombre del Proyecto */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre del Proyecto"
              value={nombreProyecto}
              onChange={(e) => setNombreProyecto(e.target.value)}
              required
              variant="outlined"
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
              variant="outlined"
            />
          </Grid>

          {/* Campo para Fecha de Inicio */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha de Inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          {/* Campo para Fecha de Fin */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Fecha de Fin"
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          {/* Campo para Presupuesto */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Presupuesto"
              value={presupuesto}
              onChange={(e) => setPresupuesto(e.target.value)}
              required
              type="number"
              variant="outlined"
            />
          </Grid>

          {/* Campo para Estado del Proyecto */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel>Estado del Proyecto</InputLabel>
              <Select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                label="Estado del Proyecto"
              >
                <MenuItem value="En progreso">En Progreso</MenuItem>
                <MenuItem value="Finalizado">Finalizado</MenuItem>
                <MenuItem value="Suspendido">Suspendido</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Campo para Responsable */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel>Responsable</InputLabel>
              <Select
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                label="Responsable"
              >
                {loadingResponsables ? (
                  <MenuItem disabled>
                    <CircularProgress size={24} />
                  </MenuItem>
                ) : (
                  responsables.map((resp) => (
                    <MenuItem key={resp.id} value={resp.id}>
                      {resp.u_usuario}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Botón de Enviar */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Actualizar Proyecto
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default EditarProyecto;
