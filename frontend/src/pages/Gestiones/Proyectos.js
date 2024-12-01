import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableFooter, TablePagination, TableRow, TableHead, Paper, Box, Grid, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AlertMessage from '../../components/AlertMessage';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';
import { isAuthenticated } from '../../utils/auth';

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
      <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0} aria-label="first page">
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="next page">
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1} aria-label="last page">
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

const Proyectos = ({ permissions }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProyectoId, setSelectedProyectoId] = useState(null);
  const [showAlert, setShowAlert] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const alertTimeout = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

  // Verificar si el usuario está autenticado al cargar el componente
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login'); // Redirige al login si no está autenticado
    }
  }, [navigate]);

  const handleOpenDialog = (proyectoId) => {
    setSelectedProyectoId(proyectoId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProyectoId(null);
  };
  // Handle task creation
  const handleVerPorHitos = (id) => {
    navigate(`/proyectos/hitos-pruebas/${id}`);  // Redireccion a la página de crear tarea
  };

  const fetchProyectos = async (searchTerm = '') => {
    const response = await fetch(`${apiUrl}/api/proyectos/proyectos?search=${searchTerm}`);
    const data = await response.json();
    setProyectos(data);
  };

  useEffect(() => {
    fetchProyectos(search);
  }, [search]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCrearProyecto = () => {
    navigate('/gestiones/crear-proyectos');
  };

  const handleEliminarProyecto = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/proyectos/proyectoDelete/${selectedProyectoId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setShowAlert({ severity: 'success', message: 'Proyecto eliminado exitosamente' });
        fetchProyectos(search);
      } else {
        setShowAlert({ severity: 'error', message: 'Error al eliminar el proyecto' });
      }
    } catch (error) {
      setShowAlert({ severity: 'error', message: 'Error al eliminar el proyecto' });
    }
  };

  const handleActualizarProyecto = (id) => {
    navigate(`/gestiones/editar-proyectos/${id}`);
  };

  const handleVerDetalles = (id) => {
    navigate(`/gestiones/crear-hitos/${id}`);
  };

  useEffect(() => {
    if (showAlert) {
      if (alertTimeout.current) {
        clearTimeout(alertTimeout.current);
      }
      alertTimeout.current = setTimeout(() => {
        setShowAlert(null);
      }, 3000);
    }

    return () => {
      if (alertTimeout.current) {
        clearTimeout(alertTimeout.current);
      }
    };
  }, [showAlert]);

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - proyectos.length) : 0;
  const hasCreateProyect = permissions.some(permission => permission.MenuID === 12);
  const hasCreateHito = permissions.some(permission => permission.MenuID === 14);
  const hasCreatePrueba = permissions.some(permission => permission.MenuID === 20);
  const hasEditProyect = permissions.some(permission => permission.MenuID === 13);
  const hasDeleteProyect = permissions.some(permission => permission.MenuID === 22);


  return (
    <Box sx={{ padding: 2 }}>
      {showAlert && (
        <AlertMessage severity={showAlert.severity} message={showAlert.message} autoHideDuration={1000} sx={{ mb: 5 }} />
      )}
      <Grid container spacing={2} alignItems="center" sx={{ marginBottom: '50px', width: '100%' }}>
        <Grid item>
          <TextField
            label="Buscar proyecto"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
        </Grid>
        <Grid item sx={{ marginLeft: 'auto' }}>
          <Button variant="contained" color="primary" onClick={handleCrearProyecto} disabled={!hasCreateProyect}>
            Crear proyecto
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              <TableCell>Crear hitos</TableCell>
              <TableCell align="left">Proyecto</TableCell>
              <TableCell align="left">Descripción</TableCell>
              <TableCell align="left">Fecha Inicio</TableCell>
              <TableCell align="left">Fecha de Finalización</TableCell>
              <TableCell align="left">Estado</TableCell>
              <TableCell align="left">Presupuesto</TableCell>
              <TableCell align="left">Usuario Responsable</TableCell>
              <TableCell align="left">Fecha de creación</TableCell>
              <TableCell align="left">Última Modificación</TableCell>
              <TableCell>Test Plant</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? proyectos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : proyectos
            ).map((proyecto) => (
              <TableRow key={proyecto.proyecto_id}>
                <TableCell>
                  <IconButton
                    onClick={() => handleVerDetalles(proyecto.proyecto_id)}
                    color="primary"
                    aria-label="crear hitos"
                    disabled={!hasCreateHito}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="left">{proyecto.nombre}</TableCell>
                <TableCell align="left">{proyecto.descripcion}</TableCell>
                <TableCell align="left">
                  {new Date(proyecto.fecha_inicio).toLocaleDateString()}
                </TableCell>
                <TableCell align="left">
                  {new Date(proyecto.fecha_finalizacion).toLocaleDateString()}
                </TableCell>
                <TableCell align="left">{proyecto.estado}</TableCell>
                <TableCell align="left">{proyecto.presupuesto}</TableCell>
                <TableCell align="left">{proyecto.u_usuario}</TableCell>
                <TableCell align="left">
                  {new Date(proyecto.fecha_creacion).toLocaleDateString()}
                </TableCell>
                <TableCell align="left">
                  {new Date(proyecto.fecha_actualizacion).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleVerPorHitos(proyecto.proyecto_id)}
                    color="primary"
                    aria-label="Ver pruebas"
                    disabled={!hasCreatePrueba}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <IconButton
                      onClick={() => handleActualizarProyecto(proyecto.proyecto_id)}
                      color="primary"
                      aria-label="editar"
                      sx={{ marginRight: 1 }}
                      disabled={!hasEditProyect}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenDialog(proyecto.proyecto_id)}
                      color="secondary"
                      aria-label="eliminar"
                      sx={{ marginLeft: 1 }}
                      disabled={!hasDeleteProyect}

                    >
                      <DeleteIcon />
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
                count={proyectos.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': 'Filas por página' },
                  native: true,
                }}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <ConfirmDeleteDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirm={handleEliminarProyecto}
      />
    </Box>
  );
};

export default Proyectos;
