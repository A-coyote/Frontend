import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Grid, Typography, MenuItem, Select, InputLabel } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import { isAuthenticated } from '../../utils/auth';

const CrearPlanDePrueba = () => {
  const [showAlert, setShowAlert] = useState(null);
  const [nombreProyecto, setNombreProyecto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [estado, setEstado] = useState('');
  const [responsable, setResponsable] = useState('');
  const [hitos, setHitos] = useState([]);
  const [resultadoEsperado, setResultadoEsperado] = useState('');
  const [pruebaRealizada, setPruebaRealizada] = useState('');
  const [criterioAceptacion, setCriterioAceptacion] = useState('');
  const [estadoPrueba, setEstadoPrueba] = useState('');
  const [estadonuevoHito, serEstadonuevoHito] = useState('');
  const [imagenPrueba, setImagenPrueba] = useState(null); // Estado para el archivo de imagen
  const [hitoSeleccionado, setHitoSeleccionado] = useState('');  // Valor vacío como predeterminado
  const [descripcionHito, setDescripcionHito] = useState('');
  const [estadoActualHito, setEstadoActualHito] = useState('');
  const [formularioHabilitado, setFormularioHabilitado] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

  const alertRef = useRef(null);

  // Verificar si el usuario está autenticado al cargar el componente
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login'); // Redirige al login si no está autenticado
    }
  }, [navigate]);

  // Manejar la subida de imágenes
  const handleImagenChange = (e) => {
    const file = e.target.files[0]; // obtiene el archivo seleccionado
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagenPrueba(reader.result); // Guarda la cadena Base64 en el estado
      };
      reader.onerror = (error) => {
        setShowAlert({
          severity: 'error',
          message: 'Hubo un error al converit la imagen',
        });
      };
      reader.readAsDataURL(file); // Convierte el archivo a Base64
    }
  };

  // Obtener los datos del proyecto
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
        setResponsable(proyecto.u_usuario);

        // Obtener los hitos del proyecto
        setHitos(proyecto.hitos || []); // Si 'hitos' no existe, asigna un array vacío
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

  // Obtener los hitos de la API
  useEffect(() => {
    const fetchHitos = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/pruebas/hitos/${id}`);
        setHitos(response.data || []);
      } catch (error) {
        setShowAlert({
          severity: 'error',
          message: 'Hubo un error al cargar los hitos del proyecto.',
        });
      }
    };

    if (id) {
      fetchHitos();
    }
  }, [id]);

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hitoSeleccionado || !resultadoEsperado || !pruebaRealizada || !estadoPrueba || !criterioAceptacion) {
      setShowAlert({
        severity: 'error',
        message: 'Todos los campos del plan de prueba son obligatorios.',
      });
      return;
    }

    const planDePrueba = {
      hitoSeleccionado,
      estadonuevoHito,
      resultadoEsperado,
      pruebaRealizada,
      estadoPrueba,
      criterioAceptacion,
      imagenPrueba, //  se envía como Base64
    };

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
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.post(
        `${apiUrl}/api/pruebas/registerPrueba/${id}`,
        planDePrueba,
        config
      );

      if (response.data.msg) {
        setShowAlert({ severity: 'success', message: response.data.msg });
        setTimeout(() => navigate('/proyectos/tareas'), 2000);
      }
    } catch (error) {
      console.error('Error al crear el plan de prueba:', error.response || error);
      if (error.response && error.response.data && error.response.data.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        setShowAlert({
          severity: 'error',
          message: errorMessages,
        });
      } else {
        setShowAlert({
          severity: 'error',
          message: 'Hubo un error al crear el plan de prueba. Inténtalo de nuevo.',
        });
      }
    } finally {
      // Desplazar la vista hacia la alerta
      if (alertRef.current) {
        alertRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Habilitar solo los campos debajo del primer botón
  const handleEnableForm = () => {
    setFormularioHabilitado(true);
  };

  // Manejar la selección de un hito
  const handleHitoSeleccionado = async (e) => {
    const hitoId = e.target.value;
    setHitoSeleccionado(hitoId);

    // Obtener la descripción del hito seleccionado
    const hito = hitos.find((hito) => hito.id_hito === hitoId);
    if (hito) {
      setDescripcionHito(hito.descripcion);
      setEstadoActualHito(hito.estado);
    } else {
      setDescripcionHito('');
      setEstadoActualHito('');
    }
  };


  return (
    <Box sx={{ padding: 5 }}>
      <div ref={alertRef}>
        {showAlert && (
          <AlertMessage
            severity={showAlert.severity}
            message={showAlert.message}
            autoHideDuration={2000}
            sx={{ mb: 4 }}
          />
        )}
      </div>

      <Typography variant="h4" gutterBottom align="center">
        Test Plan
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Información del Proyecto - Solo Lectura */}
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Nombre del Proyecto"
              value={nombreProyecto}
              disabled={true}  // Mantener deshabilitado
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Descripción"
              value={descripcion}
              disabled={true}  // Mantener deshabilitado
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Fecha de Inicio"
              type="date"
              value={fechaInicio}
              disabled={true}  // Mantener deshabilitado
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Fecha de Fin"
              type="date"
              value={fechaFin}
              disabled={true}  // Mantener deshabilitado
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Presupuesto"
              value={presupuesto}
              disabled={true}  // Mantener deshabilitado
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Estado"
              value={estado}
              disabled={true}  // Mantener deshabilitado
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Responsable"
              value={responsable}
              disabled={true}  // Mantener deshabilitado
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" fullWidth onClick={handleEnableForm}>
              Habilitar Formulario
            </Button>
          </Grid>
        </Grid>

        {/* Formulario del plan de prueba */}
        {formularioHabilitado && (
          <>
            <Grid container spacing={2} mt={3}>
              <Grid item xs={12} sm={12}>
                <InputLabel>Selecciona un Hito</InputLabel>
                <Select
                  fullWidth
                  value={hitoSeleccionado}
                  onChange={handleHitoSeleccionado}
                  displayEmpty
                  disabled={!formularioHabilitado} // Solo habilitar si el formulario está habilitado
                  required
                >
                  <MenuItem value="" disabled>Selecciona un hito...</MenuItem>
                  {hitos.map((hito) => (
                    <MenuItem key={hito.id_hito} value={hito.id_hito}>
                      {hito.nombre_hito}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12} sm={12}>
                <TextField
                  fullWidth
                  label="Descripción del Plan de Prueba"
                  value={descripcionHito}
                  disabled={true}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Estado actual del hito"
                  value={estadoActualHito}
                  disabled={true}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                  fullWidth
                  value={estadonuevoHito}
                  onChange={(e) => serEstadonuevoHito(e.target.value)}
                  displayEmpty
                  disabled={!formularioHabilitado}
                >
                  <MenuItem value="" disabled>Cambia el estado del hito ..</MenuItem>
                  <MenuItem value="En progreso">En Proceso</MenuItem>
                  <MenuItem value="Completado">Finalizado</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  fullWidth
                  label="Resultado Esperado"
                  value={resultadoEsperado}
                  onChange={(e) => setResultadoEsperado(e.target.value)}
                  variant="outlined"
                  required
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <TextField
                  fullWidth
                  label="Prueba Realizada"
                  value={pruebaRealizada}
                  onChange={(e) => setPruebaRealizada(e.target.value)}
                  variant="outlined"
                  required
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12} sm={12}>
                <TextField
                  fullWidth
                  label="Criterio de aceptación"
                  value={criterioAceptacion}
                  onChange={(e) => setCriterioAceptacion(e.target.value)}
                  variant="outlined"
                  required
                  multiline
                  rows={4}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Select
                  fullWidth
                  value={estadoPrueba}
                  onChange={(e) => setEstadoPrueba(e.target.value)}
                  displayEmpty
                  disabled={!formularioHabilitado}
                  required
                >
                  <MenuItem value="" disabled>Selecciona un estado...</MenuItem>
                  <MenuItem value="Aprobado">Aprobado</MenuItem>
                  <MenuItem value="Rechazada">Rechazada</MenuItem>
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="Bloqueado">Bloqueado</MenuItem>
                  <MenuItem value="Desconocido">Desconocido</MenuItem>
                  <MenuItem value="Requiere más pruebas">Requiere más pruebas</MenuItem>
                  <MenuItem value="No aplicable">No aplicable</MenuItem>
                </Select>
              </Grid>

              {/* Subida de imagen */}
              <Grid item xs={12} sm={6}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                >
                  Subir Imagen
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImagenChange}
                  />
                </Button>
                {imagenPrueba && (
                  <Typography variant="body2" mt={1}>
                    Imagen seleccionada: {imagenPrueba.name}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  type="submit"
                >
                  Enviar Plan de Prueba
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </form>
    </Box>
  );
};

export default CrearPlanDePrueba;