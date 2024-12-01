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

const Roles = ({ permissions }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [showAlert, setShowAlert] = useState(null);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const alertTimeout = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

  useEffect(() => {

  }, [permissions]);

  const handleOpenDialog = (roleId) => {
    setSelectedRoleId(roleId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRoleId(null);
  };

  const fetchRoles = async (searchTerm = '') => {
    const response = await fetch(`${apiUrl}/api/roles/rol?search=${searchTerm}`);
    const data = await response.json();
    setRoles(data);
  };

  useEffect(() => {
    fetchRoles(search);
  }, [search]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCrearRol = () => {
    navigate('/seguridad/crear-roles');
  };

  const handleEliminarRol = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/roles/roldelete/${selectedRoleId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setShowAlert({ severity: 'success', message: 'Rol eliminado exitosamente' });
        fetchRoles(search);
      } else {
        setShowAlert({ severity: 'error', message: 'Hubo un error al eliminar el rol' });
      }
    } catch (error) {
      console.error('Error al eliminar el rol:', error);
      setShowAlert({ severity: 'error', message: 'Hubo un error al eliminar el rol' });
    }
  };

  const handleActualizarRol = (id) => {
    navigate(`/seguridad/editar-roles/${id}`);
  };

  const handlePermisosRol = (id) => {
    navigate(`/seguridad/crear-permisos/${id}`);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - roles.length) : 0;

  //Activacion segun permisos
  const hasCreateRoles = permissions.some(permission => permission.MenuID === 7);
  const hasEditPermission= permissions.some(permission => permission.MenuID === 9); 
  const hasEditRol= permissions.some(permission => permission.MenuID === 8); 
  const hasDeletePermission = permissions.some(permission => permission.MenuID === 22); 

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 2 }}>
      {showAlert && (
        <AlertMessage
          severity={showAlert.severity}
          message={showAlert.message}
          autoHideDuration={1000}
          sx={{ mb: 4 }}
        />
      )}

      <Grid container spacing={2} alignItems="center" sx={{ marginBottom: '50px', width: '100%' }}>
        <Grid item>
          <TextField
            label="Buscar Rol"
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
            onClick={handleCrearRol}
            disabled={!hasCreateRoles}
          >
            Crear Rol
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell align="left">Descripción</TableCell>
              <TableCell align="left">Fecha Creacion</TableCell>
              <TableCell align="left">Creación</TableCell>
              <TableCell align="center">Permisos</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {(rowsPerPage > 0
              ? roles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : roles
            ).map((rol) => (
              <TableRow key={rol.ROL_ID}>
                <TableCell component="th" scope="row">
                  {rol.NOMBRE}
                </TableCell>
                <TableCell style={{ width: 160 }} align="left">
                  {rol.DESCRIPCION}
                </TableCell>
                <TableCell style={{ width: 160 }} align="left">
                  {rol.FECHA_CREACION}
                </TableCell>
                <TableCell style={{ width: 160 }} align="left">
                  {rol.USUARIO_CREA}
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handlePermisosRol(rol.ROL_ID)} color="primary" aria-label="editar" disabled={!hasEditPermission}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleActualizarRol(rol.ROL_ID)} color="primary" aria-label="editar" disabled={!hasEditRol}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDialog(rol.ROL_ID)} color="secondary" aria-label="eliminar" disabled={!hasDeletePermission}>
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
                count={roles.length}
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

      <ConfirmDeleteDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirm={handleEliminarRol}
      />
    </Box>
  );
};

export default Roles;