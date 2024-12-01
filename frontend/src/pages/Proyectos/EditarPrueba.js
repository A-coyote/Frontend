import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Grid, Typography, MenuItem, Select, InputLabel } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage'; // Componente de alerta
import { isAuthenticated } from '../../utils/auth'; // Función para validar autenticación

const CrearPlanDePrueba = () => {
    const [showAlert, setShowAlert] = useState(null); // Estado para la alerta
    const [prueba, setPrueba] = useState('');
    const [resultadoEsperado, setResultadoEsperado] = useState('');
    const [pruebaRealizada, setPruebaRealizada] = useState('');
    const [criterioAceptacion, setCriterioAceptacion] = useState('');
    const [estadoPrueba, setEstadoPrueba] = useState('');
    const [imagenPrueba, setImagenPrueba] = useState({ file: null, base64: '' });
    const navigate = useNavigate();
    const { id } = useParams();
    const alertRef = useRef(null);
    const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

    const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB en bytes

    // Redirige al login si no está autenticado
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
        }
    }, [navigate]);

    // Manejar la subida de imágenes
    const handleImagenChange = (e) => {
        const file = e.target.files[0]; // Obtén el archivo seleccionado
        if (file) {
            // Verificar el tamaño del archivo
            if (file.size > MAX_IMAGE_SIZE) {
                setShowAlert({
                    severity: 'error',
                    message: 'La imagen es demasiado grande. El tamaño máximo permitido es de 2 MB.',
                });
                setImagenPrueba({ file: null, base64: '' }); // Limpiar el estado de la imagen
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                setImagenPrueba({ file, base64: reader.result }); // Guarda el archivo y la cadena Base64 en el estado
            };
            reader.onerror = (error) => {
                console.error("Error al convertir la imagen a Base64:", error);
            };
            reader.readAsDataURL(file); // Convierte el archivo a Base64
        }
    };

    // Cargar los datos del plan de prueba existente
    useEffect(() => {
        const fetchPlanDePrueba = async () => {
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

                const response = await axios.get(
                    `${apiUrl}/api/pruebas/pruebas/${id}`,
                    config
                );

                const data = response.data;

                // Asignar valores recuperados a los estados del formulario
                setPrueba(data.id_plan || '');
                setResultadoEsperado(data.resultado_esperado || '');
                setPruebaRealizada(data.prueba_realizada || '');
                setEstadoPrueba(data.estado_prueba || '');
                setCriterioAceptacion(data.criterio_aceptacion || '');
                setImagenPrueba({ file: data.imagen_prueba, base64: data.imagen_prueba });
            } catch (error) {
                setShowAlert({
                    severity: 'error',
                    message: 'Hubo un error al cargar el plan de prueba.',
                });
            }
        };

        if (id) {
            fetchPlanDePrueba();
        }
    }, [id]);

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!resultadoEsperado || !pruebaRealizada || !estadoPrueba || !criterioAceptacion) {
            setShowAlert({
                severity: 'error',
                message: 'Todos los campos del plan de prueba son obligatorios.',
            });
            return;
        }

        const planDePrueba = {
            prueba,
            resultadoEsperado,
            pruebaRealizada,
            estadoPrueba,
            criterioAceptacion,
            imagenPrueba: imagenPrueba.base64, // Solo se envía la representación en Base64
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

            const response = await axios.put(
                `${apiUrl}/api/pruebas/updatePlan/${prueba}`,
                planDePrueba,
                config
            );

            if (response.data.msg) {
                setShowAlert({ severity: 'success', message: response.data.msg });
                setTimeout(() => navigate('/gestiones/proyectos'), 2000);
            }
        } catch (error) {
            console.error('Error al crear el plan de prueba:', error.response || error);
            setShowAlert({
                severity: 'error',
                message: 'Hubo un error al crear el plan de prueba. Inténtalo de nuevo.',
            });
        } finally {
            if (alertRef.current) {
                alertRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <Box sx={{ padding: 5 }}>
            <Typography variant="h4" gutterBottom align="center">
                Edición de la prueba
            </Typography>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={2} mt={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Número de Prueba"
                            value={prueba}
                            variant="outlined"
                            required
                            InputProps={{
                                readOnly: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={6}>
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

                    <Grid item xs={6}>
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

                    <Grid item xs={12}>
                        <InputLabel>Estado de la Prueba</InputLabel>
                        <Select
                            fullWidth
                            value={estadoPrueba}
                            onChange={(e) => setEstadoPrueba(e.target.value)}
                            required
                        >
                            <MenuItem value="" disabled>Selecciona el estado...</MenuItem>
                            <MenuItem value="Aprobado">Aprobado</MenuItem>
                            <MenuItem value="Rechazada">Rechazado</MenuItem>
                            <MenuItem value="Pendiente">Pendiente</MenuItem>
                            <MenuItem value="Bloqueado">Bloqueado</MenuItem>
                            <MenuItem value="Desconocido">Desconocido</MenuItem>
                            <MenuItem value="Requiere más pruebas">Requiere más pruebas</MenuItem>
                            <MenuItem value="No aplicable">No aplicable</MenuItem>
                        </Select>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Criterio de Aceptación"
                            value={criterioAceptacion}
                            onChange={(e) => setCriterioAceptacion(e.target.value)}
                            variant="outlined"
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button
                            variant="contained"
                            component="label" fullWidth
                        >
                            Subir Imagen
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleImagenChange}
                            />
                        </Button>
                        {imagenPrueba.file && (
                            <Typography variant="body2" mt={1}>
                                Imagen seleccionada: {imagenPrueba.file.name}
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Guardar Prueba
                        </Button>
                    </Grid>
                </Grid>
            </form>
            {showAlert && <AlertMessage ref={alertRef} severity={showAlert.severity} message={showAlert.message} />}
        </Box>
    );
};

export default CrearPlanDePrueba;