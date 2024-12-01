import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TablePagination,
  TableRow,
  TableHead,
  Paper,
  IconButton,
  Dialog,
  DialogContent,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ConfirmFinDialog from '../../components/ConfirmFinalizar';
import { isAuthenticated } from '../../utils/auth';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';

const CrearPlanDePrueba = ({ permissions }) => {
  const [showAlert, setShowAlert] = useState(null);
  const [hitos, setHitos] = useState([]);
  const [hitoSeleccionado, setHitoSeleccionado] = useState('');
  const [descripcionHito, setDescripcionHito] = useState('');
  const [casos, setCasos] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [showCases, setShowCases] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [hitoFinalizar, setHitoFinalizar] = useState(null);
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

  // Verificar si el usuario está autenticado al cargar el componente
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login'); // Redirige al login si no está autenticado
    }
  }, [navigate]);

  useEffect(() => {
    const fetchHitos = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/api/pruebas/hitosporPruebas/${id}`);
        setHitos(response.data || []);
      } catch (error) {
        setShowAlert({
          severity: 'error',
          message: 'Hubo un error al cargar los hitos del proyecto.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchHitos();
    }
  }, [id]);


  const handleEliminarCaso = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/pruebas/pruebaDelete/${pruebaSeleccionada}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCasos((prevCasos) => prevCasos.filter((caso) => caso.id_plan !== pruebaSeleccionada));
        setShowAlert({ severity: 'success', message: 'Prueba eliminada exitosamente' });

      } else {
        setShowAlert({ severity: 'error', message: 'Error al eliminar el la prueba' });
      }
    } catch (error) {
      setShowAlert({ severity: 'error', message: 'Error al eliminar la prueba' });
    }
  };

  const handleHitoSeleccionado = (e) => {
    const hitoId = e.target.value;
    setHitoSeleccionado(hitoId);

    const hito = hitos.find((hito) => hito.id_hito === hitoId);
    setDescripcionHito(hito ? hito.descripcion : '');
  };

  // Handle  update
  const handleActualizarPrueba = (id_plan) => {
    if (!hitoSeleccionado) {
      setShowAlert({
        severity: 'warning',
        message: 'Por favor, selecciona un hito.',
      });
      return;
    }
    navigate(`/proyectos/editar-plan/${id_plan}`); // Redireccion para actualizar una tarea
  };

  const handleVerCasos = async () => {
    if (!hitoSeleccionado) {
      setShowAlert({
        severity: 'warning',
        message: 'Por favor, selecciona un hito.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/api/pruebas/casos/${id}/${hitoSeleccionado}`);
      setCasos(response.data || []);
      setShowAlert({
        severity: 'success',
        message: 'Casos cargados exitosamente.',
      });
      setShowCases(true);
    } catch (error) {
      setShowAlert({
        severity: 'error',
        message: 'Hubo un error al cargar los casos del hito.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredCasos = casos.filter((caso) => {
    return (
      caso.resultado_esperado?.toLowerCase().includes(search.toLowerCase()) ||
      caso.prueba_realizada?.toLowerCase.includes(search.toLowerCase())
    );
  });

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredCasos.length) : 0;

  const handleOpenImageDialog = (image) => {
    setSelectedImage(image);
    setOpenImageDialog(true);
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false);
    setSelectedImage('');
  };

  const handleOpenDialog = (id_plan) => {
    setPruebaSeleccionada(id_plan);
    setOpenDialog(true);
  };

  const handleOpenConfirmDialog = () => {
    setHitoFinalizar(hitoSeleccionado);
    setOpenConfirmDialog(true);
  };

  const handleCloseDialogDelete = () => {
    setOpenDialog(false);
    setPruebaSeleccionada(null);

  };

  const handleCloseDialog = () => {
    setOpenConfirmDialog(false);

  };

  const handleCloseConfirmDialog = async (confirmed) => {
    setOpenConfirmDialog(false);
    const token = localStorage.getItem('token');

    if (!token) {
      setShowAlert({
        severity: 'error',
        message: 'No se encontró el token de autenticación.',
      });
      return;
    }


    if (confirmed && hitoSeleccionado) {
      try {
        await axios.get(`${apiUrl}/api/pruebas/CambioEstadoHito/${hitoSeleccionado}`);
        setShowAlert({
          severity: 'success',
          message: 'Hito finalizado exitosamente.',
        });
        setHitoSeleccionado('');
      } catch (error) {
        setShowAlert({
          severity: 'error',
          message: 'Hubo un error al finalizar el hito.',
        });
      }
    } else {
      setShowAlert({
        severity: 'info',
        message: 'La acción de finalizar hito ha sido cancelada.',
      });
    }
  };

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const hasEditPrueba = permissions.some(permission => permission.MenuID === 21);
  const hasDeleteCaso = permissions.some(permission => permission.MenuID === 22);


  return (
    <Box sx={{ padding: 5 }}>
      <Typography variant="h4" gutterBottom align="center">
        Plan de Pruebas
      </Typography>

      {showAlert && (
        <AlertMessage
          severity={showAlert.severity}
          message={showAlert.message}
          onClose={() => setShowAlert(null)}
        />
      )}

      <form>
        <Grid container spacing={2} mt={3}>
          <Grid item xs={12}>
            <InputLabel>Selecciona un Hito</InputLabel>
            <Select
              fullWidth
              value={hitoSeleccionado}
              onChange={handleHitoSeleccionado}
              displayEmpty
              required
              disabled={isLoading}
            >
              <MenuItem value="" disabled>
                Selecciona un hito...
              </MenuItem>
              {hitos.map((hito) => (
                <MenuItem key={hito.id_hito} value={hito.id_hito}>
                  {hito.nombre_hito}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción del Hito"
              value={descripcionHito}
              disabled
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleVerCasos}
              disabled={isLoading}
            >
              Ver Casos
            </Button>
          </Grid>

          {showCases && (
            <>
              <Grid item xs={10}>
                <TextField
                  label="Buscar Caso"
                  variant="outlined"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  disabled={isLoading}
                />
              </Grid>

              <Grid item xs={2}>
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  sx={{ height: '52px' }}
                  onClick={handleOpenConfirmDialog}
                  disabled={isLoading || !hitoSeleccionado}
                >
                  Finalizar Hito
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </form>

      <TableContainer component={Paper} sx={{ marginTop: 3 }}>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow>
              <TableCell>Caso</TableCell>
              <TableCell align="left">Hito</TableCell>
              <TableCell align="left">Resultado Esperado</TableCell>
              <TableCell align="left">Prueba Realizada</TableCell>
              <TableCell align="left">Estado de la Prueba</TableCell>
              <TableCell align="left">Criterio de Aceptación</TableCell>
              <TableCell align="left">Fecha de creación</TableCell>
              <TableCell align="left">Ultima actualización</TableCell>
              <TableCell align="left">Evidencia</TableCell>
              <TableCell align="left">Editar Caso</TableCell>
              <TableCell align="left">Eliminar Caso</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? filteredCasos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : filteredCasos
            ).map((caso) => (
              <TableRow key={caso.id_plan}>
                <TableCell>{caso.id_plan}</TableCell>
                <TableCell>{caso.nombre_hito}</TableCell>
                <TableCell>{caso.resultado_esperado}</TableCell>
                <TableCell>{caso.prueba_realizada}</TableCell>
                <TableCell>{caso.estado_prueba}</TableCell>
                <TableCell>{caso.criterio_aceptacion}</TableCell>
                <TableCell align="left">
                  {new Date(caso.fecha_creacion).toLocaleDateString()}
                </TableCell>
                <TableCell align="left">
                  {new Date(caso.fecha_actualizacion).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenImageDialog(caso.imagen_prueba)} disabled={isLoading}>
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleActualizarPrueba(caso.id_plan)}
                      aria-label="editar"
                      disabled={!hasEditPrueba}
                    >
                      <EditIcon />
                    </IconButton>

                  </Box>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() => handleOpenDialog(caso.id_plan)}
                    color="secondary"
                    aria-label="eliminar"
                    sx={{ marginLeft: 1 }}
                    disabled={!hasDeleteCaso}

                  >
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
                rowsPerPageOptions={[5, 10, 25]}
                colSpan={7}
                count={filteredCasos.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Dialog
        open={openImageDialog}
        onClose={handleCloseImageDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogContent>
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Evidencia"
              style={{ width: '100%', height: 'auto' }}
            />
          ) : (
            <Typography>No hay evidencia disponible</Typography>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmFinDialog
        open={openConfirmDialog}
        onClose={handleCloseDialog}
        onConfirm={() => handleCloseConfirmDialog(true)}
        onCancel={() => handleCloseConfirmDialog(false)}
      />

      <ConfirmDeleteDialog
        open={openDialog}
        onClose={handleCloseDialogDelete}
        onConfirm={handleEliminarCaso}
      />
    </Box>
  );
};

export default CrearPlanDePrueba;