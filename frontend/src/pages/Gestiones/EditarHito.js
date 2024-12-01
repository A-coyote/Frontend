import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Alert,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditarHito = () => {
    const { id_hito } = useParams();
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [estado, setEstado] = useState('');
    const [showAlert, setShowAlert] = useState(null);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

    useEffect(() => {
        const fetchHito = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${apiUrl}/api/hitos/EditarHito/${id_hito}`, {
                    headers: { 'x-auth-token': token },
                });
                // Pre-carga los datos del hito en los campos del formulario
                setTitulo(data.nombre_hito);
                setDescripcion(data.descripcion);
                setFechaInicio(data.fecha_inicio.split('T')[0]);
                setFechaFin(data.fecha_fin.split('T')[0]);
                setEstado(data.estado);
            } catch (error) {
                setShowAlert({
                    severity: 'error',
                    message: error.response?.data?.msg || 'Error al cargar los datos del hito.',
                });
            }
        };
        fetchHito();
    }, [id_hito]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        // Validaciones en el frontend
        if (!titulo || !descripcion || !fechaInicio || !fechaFin || !estado) {
            setShowAlert({ severity: 'error', message: 'Todos los campos son requeridos.' });
            return;
        }

        // Enviar la solicitud PUT solo si los datos son válidos
        try {
            const token = localStorage.getItem('token');
            const updatedHito = { nombre_hito: titulo, descripcion, fecha_inicio: fechaInicio, fecha_fin: fechaFin, estado };

            await axios.put(`${apiUrl}/api/hitos/EditHito/${id_hito}`, updatedHito, {
                headers: { 'x-auth-token': token },
            });

            setShowAlert({ severity: 'success', message: 'Hito actualizado exitosamente.' });
            setTimeout(() => navigate(-1), 2000); // Regresa a la página anterior
        } catch (error) {
            setShowAlert({ severity: 'error', message: error.response?.data?.msg || 'Error al actualizar el hito.' });
        }
    };


    return (
        <Box sx={{ padding: 5 }}>
            {showAlert && (
                <Alert severity={showAlert.severity} sx={{ mb: 4 }}>
                    {showAlert.message}
                </Alert>
            )}
            <Typography variant="h5" gutterBottom>Editar Hito</Typography>
            <form onSubmit={handleUpdate}>
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
                            Actualizar Hito
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default EditarHito;
