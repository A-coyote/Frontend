import React, { useState, useEffect, useRef } from 'react';
import { TextField, Table, TableBody, TableCell, TableContainer, TableFooter, TablePagination, TableRow, TableHead, Paper, Box, Grid, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AlertMessage from '../../components/AlertMessage'; 

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

const Tareas = ({ permissions }) => {
  const [showAlert, setShowAlert] = useState(null); // Estado de la alerta
  const [tareas, setTareas] = useState([]);  // Cambio de 'roles' a 'tareas'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

  // Temporizador para limpiar la alerta después de 3 segundos
  const alertTimeout = useRef(null);

  const fetchTareas = async (searchTerm = '') => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const response = await fetch(`${apiUrl}/api/tareas/tarea?search=${searchTerm}`, config);

      // Comprobar si el estado de la respuesta es OK
      if (!response.ok) {
        if (response.status === 401) {
          // Manejar el caso de 401 (No autorizado)
          throw new Error('No autorizado. Por favor, inicie sesión.');
        }
        throw new Error('Error al obtener las tareas. El servidor respondió con el código ' + response.status);
      }

      // Comprobar si la respuesta es en formato JSON
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La respuesta del servidor no es JSON. Content-Type: ' + contentType);
      }

      const data = await response.json();  // Ahora puedes parsear el JSON de forma segura
      setTareas(data);  // Actualiza el estado con los datos obtenidos

    } catch (error) {
      // Muestra una alerta con el mensaje de error
      setShowAlert({ severity: 'error', message: error.message || 'Error al obtener las tareas' });
    }
  };



  useEffect(() => {
    fetchTareas(search);
  }, [search]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle task creation
  const handleCrearPlanPrueba = (id) => {
    navigate(`/proyectos/crear-pruebas/${id}`);  // Redireccion a la página de crear tarea
  };

  // Handle task creation
  const handleVerPorHitos = (id) => {
    navigate(`/proyectos/hitos-pruebas/${id}`);  // Redireccion a la página de crear tarea
  };

  // Handle task update
  const handleActualizarTarea = (id) => {
    navigate(`/proyectos/editar-tarea/${id}`); // Redireccion para actualizar una tarea
  };

  // Set up the timeout to clear the alert after 3 seconds
  useEffect(() => {
    if (showAlert) {
      // Clear the previous timeout if any
      if (alertTimeout.current) {
        clearTimeout(alertTimeout.current);
      }

      // Set the new timeout to clear the alert
      alertTimeout.current = setTimeout(() => {
        setShowAlert(null); // Hide the alert after 3 seconds
      }, 3000);
    }

    // Cleanup the timeout when the component unmounts
    return () => {
      if (alertTimeout.current) {
        clearTimeout(alertTimeout.current);
      }
    };
  }, [showAlert]);

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tareas.length) : 0;

    const hasHItos = permissions.some(permission => permission.MenuID === 20);
    const hasPlan = permissions.some(permission => permission.MenuID === 19);
    const haseditarProyecto = permissions.some(permission => permission.MenuID === 18);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 2 }}>

      {/* Mostrar la alerta si hay algún mensaje */}
      {showAlert && (
        <AlertMessage
          severity={showAlert.severity}
          message={showAlert.message}
          autoHideDuration={1000} // La alerta se cierra después de 3 segundos
          sx={{ mb: 4 }} // Agregar margen inferior a la alerta
        />
      )}

      <Grid container spacing={2} alignItems="center" sx={{ marginBottom: '50px', width: '100%' }}>
        <Grid item>
          <TextField
            label="Buscar Tarea"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              <TableCell>Test Plant</TableCell>
              <TableCell>Hitos</TableCell>
              <TableCell align="left">Nombre</TableCell>
              <TableCell align="left">Descripción</TableCell>
              <TableCell align="left">Fecha Inicio</TableCell>
              <TableCell align="left">Fecha de Finalización</TableCell>
              <TableCell align="left">Estado</TableCell>
              <TableCell align="left">Presupuesto</TableCell>
              <TableCell align="left">Usuario Responsable</TableCell>
              <TableCell align="left">Fecha de creación</TableCell>
              <TableCell align="left">Última modificación</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {(rowsPerPage > 0
              ? tareas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : tareas
            ).map((tarea) => (
              <TableRow key={tarea.proyecto_id}>
                 <TableCell>
                  <IconButton
                    onClick={() => handleCrearPlanPrueba(tarea.proyecto_id)}
                    color="primary"
                    aria-label="crear pruebas"
                    disabled={!hasPlan}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleVerPorHitos(tarea.proyecto_id)}
                    color="primary"
                    aria-label="Ver pruebas"
                    disabled={!hasHItos}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
                <TableCell>{tarea.nombre}</TableCell>
                <TableCell>{tarea.descripcion}</TableCell>
                <TableCell> {new Date(tarea.fecha_inicio).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(tarea.fecha_finalizacion).toLocaleDateString()}</TableCell>
                <TableCell>{tarea.estado}</TableCell>
                <TableCell>{tarea.presupuesto}</TableCell>
                <TableCell>{tarea.u_usuario}</TableCell>
                <TableCell> {new Date(tarea.fecha_creacion).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(tarea.fecha_actualizacion).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleActualizarTarea(tarea.proyecto_id)}
                      aria-label="editar"
                      disabled={!haseditarProyecto}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>


          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                colSpan={3}
                count={tareas.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Tareas;
