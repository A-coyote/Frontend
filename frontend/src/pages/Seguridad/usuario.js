import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableFooter, TablePagination, TableRow, TableHead, Paper, Box, Grid, IconButton, Switch } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AlertMessage from '../../components/AlertMessage';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';

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

const Usuario = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showAlert, setShowAlert] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

  // Temporizador para limpiar la alerta después de 3 segundos
  const alertTimeout = useRef(null);

  // Función para abrir el diálogo
  const handleOpenDialog = (userId) => {
    setSelectedUserId(userId);
    setOpenDialog(true);
  };

  // Función para cerrar el diálogo
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUserId(null);
  };

  // Recuperacion de usuarios
  const fetchUsuarios = async (searchTerm = '') => {
    const response = await fetch(`${apiUrl}/api/auth/users?search=${searchTerm}`);
    const data = await response.json();
    setUsuarios(data);
  };

  useEffect(() => {
    fetchUsuarios(search);
  }, [search]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };


  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Redirecciòn para crear usuarios
  const handleCrearUsuario = () => {
    navigate('/seguridad/crear-usuario');  // Redireccion a la pagina de crear usuario
  };

  // Handle user delete
  const handleEliminarUsuario = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/users/delete/${selectedUserId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setShowAlert({ severity: 'success', message: 'Usuario eliminado exitosamente' });
        fetchUsuarios(search); // Reload the user list
      } else {
        setShowAlert({ severity: 'error', message: 'Hubo un error al eliminar el usuario' });
      }
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      setShowAlert({ severity: 'error', message: 'Hubo un error al eliminar el usuario' });
    }
  };

  // Handle user update
  const handleActualizarUsuario = (id) => {
    navigate(`/seguridad/editar-usuario/${id}`); // Redireccion para actualizar un usuario
  };

  // Toggle user status
  const handleToggleEstado = async (id, currentEstado) => {
    const newEstado = currentEstado === 1 ? 0 : 1;

    try {
      const response = await fetch(`${apiUrl}/api/auth/users/deactivate/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ u_estado: newEstado })
      });

      if (response.ok) {
        setShowAlert({ severity: 'success', message: `Usuario ${newEstado === 1 ? 'activado' : 'desactivado'} correctamente` });
        fetchUsuarios(search);
      } else {
        setShowAlert({ severity: 'error', message: 'Hubo un error al actualizar el estado' });
      }
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
      setShowAlert({ severity: 'error', message: 'Hubo un error al actualizar el estado' });
    }
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

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - usuarios.length) : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 2 }}>

      {/* Mostrar la alerta si hay algún mensaje */}
      {showAlert && (
        <AlertMessage
          severity={showAlert.severity}
          message={showAlert.message}
          autoHideDuration={1000} // La alerta se cierra después de 3 segundos
          sx={{ mb: 4 }}
        />
      )}

      <Grid container spacing={2} alignItems="center" sx={{ marginBottom: '50px', width: '100%' }}>
        <Grid item>
          <TextField
            label="Buscar Usuario"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
        </Grid>

        <Grid item sx={{ marginLeft: 'auto' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCrearUsuario}
          >
            Crear Usuario
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell align="left">Apellido</TableCell>
              <TableCell align="left">Usuario</TableCell>
              <TableCell align="center">Inactivo / Activo</TableCell>
              <TableCell align="left">Fecha de Creación</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {(rowsPerPage > 0
              ? usuarios.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : usuarios
            ).map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell component="th" scope="row">
                  {usuario.u_nombre}
                </TableCell>
                <TableCell style={{ width: 160 }} align="left">
                  {usuario.u_apellido}
                </TableCell>
                <TableCell style={{ width: 160 }} align="left">
                  {usuario.u_usuario}
                </TableCell>
                <TableCell style={{ width: 160 }} align="center">
                  {/* Switch para activar o desactivar */}
                  <Switch
                    checked={usuario.u_estado === 1}
                    onChange={() => handleToggleEstado(usuario.id, usuario.u_estado)}
                    color="primary"
                  />
                </TableCell>
                <TableCell style={{ width: 160 }} align="left">
                  {new Date(usuario.u_fechacreacion).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleActualizarUsuario(usuario.id)} color="primary" aria-label="editar">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDialog(usuario.id)} color="secondary" aria-label="eliminar">
                    <DeleteIcon />
                  </IconButton>
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
                rowsPerPageOptions={[5, 10, 25, { label: 'Todos', value: -1 }]}
                colSpan={3}
                count={usuarios.length}
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

      {/* Dialog de confirmación para eliminar el usuario */}
      <ConfirmDeleteDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirm={handleEliminarUsuario}
      />
    </Box>
  );
};

export default Usuario;
