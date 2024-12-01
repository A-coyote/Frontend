import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
    IconButton,
    Alert,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { isAuthenticated } from '../../utils/auth';
import ConfirmDeleteDialog from '../../components/ConfirmDeleteDialog';

const CrearHito = ({ permissions }) => {
    const { proyectoId } = useParams();
    const [showAlert, setShowAlert] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [estado, setEstado] = useState('Pendiente');
    const [proyecto, setProyecto] = useState(null);
    const [hitos, setHitos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedHitoId, setSelectedHitoId] = useState(null);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la APIs

    // Verificar si el usuario está autenticado al cargar el componente
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login'); // Redirige al login si no está autenticado
        }
    }, [navigate]);


    const makeRequest = async (method, url, data = {}) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setShowAlert({
                severity: 'error',
                message: 'No se encontró el token de autenticación.',
            });
            return null;
        }

        const config = { headers: { 'x-auth-token': token } };
        try {
            const response = await axios[method](url, data, config);
            return response.data;
        } catch (error) {
            setShowAlert({
                severity: 'error',
                message: error.response?.data?.msg || error.message || 'Hubo un error inesperado con la solicitud.',
            });
            return null;
        }
    };

    const fetchProyecto = useCallback(async () => {
        const data = await makeRequest('get', `${apiUrl}/api/hitos/proyecto/${proyectoId}`);
        if (data) setProyecto(data);
    }, [proyectoId]);

    const fetchHitos = useCallback(async () => {
        setLoading(true);
        const data = await makeRequest('get', `${apiUrl}/api/hitos/hito/${proyectoId}`);
        setLoading(false);

        setHitos(data || []);
    }, [proyectoId]);

    const handleDelete = async () => {
        if (!selectedHitoId) return;

        const response = await makeRequest('delete', `${apiUrl}/api/hitos/EliminarHito/${selectedHitoId}`);
        if (response) {
            setShowAlert({
                severity: 'success',
                message: 'Hito eliminado correctamente.',
            });
            fetchHitos();
        }
        setDialogOpen(false); // Cierra el diálogo tras la eliminación
    };

    const openDeleteDialog = (id_hito) => {
        setSelectedHitoId(id_hito);
        setDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setSelectedHitoId(null);
        setDialogOpen(false);
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
        } else {
            fetchProyecto();
            fetchHitos();
        }
    }, [navigate, fetchProyecto, fetchHitos]);

    useEffect(() => {
        if (showAlert) {
            const timer = setTimeout(() => setShowAlert(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [showAlert]);

    const handleEdit = (id_hito) => {
        navigate(`/gestiones/editar-hitos/${id_hito}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!titulo || !descripcion || !fechaInicio || !fechaFin) {
            setShowAlert({
                severity: 'error',
                message: 'Todos los campos son obligatorios.',
            });
            return;
        }

        const newHito = { titulo, descripcion, fechaInicio, fechaFin, estado, proyectoId };
        const response = await makeRequest('post', `${apiUrl}/api/hitos/register`, newHito);
        if (response) {
            setShowAlert({
                severity: 'success',
                message: 'Hito creado exitosamente.',
            });
            setTitulo('');
            setDescripcion('');
            setFechaInicio('');
            setFechaFin('');
            setEstado('Pendiente');
            fetchHitos();
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const hasEditarHito = permissions.some(permission => permission.MenuID === 15);
    const hasEliminarHito = permissions.some(permission => permission.MenuID === 22);


    return (
        <Box sx={{ padding: 5 }}>
            {showAlert && (
                <Alert severity={showAlert.severity} sx={{ mb: 4 }}>
                    {showAlert.message}
                </Alert>
            )}

            <Typography variant="h5" gutterBottom>
                {proyecto ? `Proyecto: ${proyecto.nombre}` : <CircularProgress size={24} />}
            </Typography>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Título del Hito"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Descripción"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Fecha de inicio"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Fecha de finalización"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Estado</InputLabel>
                            <Select value={estado} onChange={(e) => setEstado(e.target.value)} label="Estado">
                                <MenuItem value="Pendiente">Pendiente</MenuItem>
                                <MenuItem value="En Proceso">En Proceso</MenuItem>
                                <MenuItem value="Finalizado">Finalizado</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Crear Hito
                        </Button>
                    </Grid>
                </Grid>
            </form>

            <Paper sx={{ mt: 4, p: 3 }}>
                <Typography variant="h6" gutterBottom>Hitos del Proyecto</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Hito</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell>Fecha de Inicio</TableCell>
                                <TableCell>Fecha de Finalización</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                hitos.length > 0 ? (
                                    hitos.map((hito) => (
                                        <TableRow key={hito.id_hito}>
                                            <TableCell>{hito.nombre_hito}</TableCell>
                                            <TableCell>{hito.descripcion}</TableCell>
                                            <TableCell>{formatDate(hito.fecha_inicio)}</TableCell>
                                            <TableCell>{formatDate(hito.fecha_fin)}</TableCell>
                                            <TableCell>{hito.estado}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    onClick={() => handleEdit(hito.id_hito)}
                                                    color="primary"
                                                    disabled={!hasEditarHito}
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => openDeleteDialog(hito.id_hito)}
                                                    color="secondary"
                                                    disabled={!hasEliminarHito}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No hay hitos registrados.
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <ConfirmDeleteDialog
                open={dialogOpen}
                onConfirm={handleDelete}
                onClose={closeDeleteDialog}
            />
        </Box>
    );
};

export default CrearHito;
