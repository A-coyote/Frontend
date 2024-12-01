import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const estadosPosibles = ['Aprobado', 'Rechazada', 'Pendiente', 'Bloqueado', 'Desconocido', 'Requiere más pruebas', 'No aplicable'];

const DashboardChartsPrueba = () => {
    const [proyectos, setProyectos] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProyecto, setSelectedProyecto] = useState('');
    const [noData, setNoData] = useState(false);

    const token = localStorage.getItem('token');
    const isAuthenticated = Boolean(token);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API


    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [navigate, isAuthenticated]);
    
    const fetchProyectos = useCallback(async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        setNoData(false);
        setError(null);

        try {
            const decoded = jwtDecode(token);
            const id = decoded.user?.id;

            const config = {
                headers: {
                    'x-auth-token': token,
                },
            };

            const response = await axios.get(`${apiUrl}/api/grafica/EstadoPrueba/${id}`, config);
            const proyectosData = response.data;

            if (!proyectosData || Object.keys(proyectosData).length === 0) {
                setNoData(true);
                setProyectos({});
                return;
            }

            setProyectos(proyectosData);
            setSelectedProyecto(Object.keys(proyectosData)[0]); // Seleccionar el primer proyecto por defecto
            setNoData(false);
        } catch (err) {
            console.error('Error al obtener los proyectos:', err);
            setError('No se pudieron cargar los proyectos');
            setProyectos({});
            setNoData(true);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token]);

    useEffect(() => {
        fetchProyectos();
    }, [fetchProyectos]);

    // Preparar datos para el gráfico
    const chartData = {
        labels: estadosPosibles,
        datasets: [{
            data: selectedProyecto ? estadosPosibles.map(estado => proyectos[selectedProyecto][estado.toLowerCase()] || 0) : [],
            backgroundColor: ['green', 'red', 'yellow', 'orange', 'gray', 'purple', 'blue'], // Colores para cada estado
        }],
    };

    const handleProyectoChange = (e) => {
        setSelectedProyecto(e.target.value);
    };

    if (loading) return <div>Cargando datos...</div>;

    return (
        <div>
            <h2 style={{ textAlign: 'center' }}>Estado de pruebas por proyecto</h2>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <select
                    value={selectedProyecto}
                    onChange={handleProyectoChange}
                    style={{ padding: '5px', width: '200px' }}
                >
                    {Object.keys(proyectos).map(nombreProyecto => (
                        <option key={nombreProyecto} value={nombreProyecto}>{nombreProyecto}</option>
                    ))}
                </select>
            </div>

            {noData && (
                <div style={{ textAlign: 'center', fontSize: '18px', color: '#888' }}>
                    <p>No hay proyectos en el estado seleccionado. Intenta con otro estado.</p>
                </div>
            )}

            {error && (
                <div style={{ textAlign: 'center', fontSize: '18px', color: 'red' }}>
                    <p>{error}</p>
                </div>
            )}

            <Pie
                data={chartData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: (tooltipItem) => {
                                    const index = tooltipItem.dataIndex;
                                    const label = chartData.labels[index] || 'Desconocido';
                                    const value = tooltipItem.raw;
                                    return `${label}: ${value} Prueba`;
                                },
                            },
                        },
                    },
                }}
            />
        </div>
    );
};

export default DashboardChartsPrueba;