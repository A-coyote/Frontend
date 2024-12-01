import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardChartsEstados = () => {
    const [proyectos, setProyectos] = useState({
        labels: ["En progreso", "Finalizado", "Suspendido"],
        datasets: [
            {
                label: "Cantidad de Proyectos",
                data: [0, 0, 0], // Valores por defecto
                backgroundColor: ["blue", "green", "orange"],
            }
        ]
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [noData, setNoData] = useState(false);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const isAuthenticated = Boolean(token);
    const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [navigate, isAuthenticated]);
    
    const fetchProyectos = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const decoded = jwtDecode(token);
            const id = decoded.user?.id;

            const config = {
                headers: {
                    'x-auth-token': token,
                },
                params: {
                    startDate,
                    endDate
                }
            };

            const response = await axios.get(`${apiUrl}/api/grafica/EstadoProyectos/${id}`, config);
            const { estadoProyectos } = response.data;

            if (!estadoProyectos || 
                (estadoProyectos.enProgreso === 0 && estadoProyectos.finalizados === 0 && estadoProyectos.suspendidos === 0)) {
                setNoData(true);
                setError(null);
                return;
            }

            setProyectos({
                labels: ["En progreso", "Finalizado", "Suspendido"],
                datasets: [
                    {
                        label: "Cantidad de Proyectos",
                        data: [
                            estadoProyectos.enProgreso,
                            estadoProyectos.finalizados,
                            estadoProyectos.suspendidos
                        ],
                        backgroundColor: ["blue", "green", "orange"],
                    }
                ]
            });
            setNoData(false);
        } catch (err) {
            console.error('Error al obtener los proyectos:', err);
            setError('No hay proyectos en el rango de fechas');
            setProyectos({
                labels: ["En progreso", "Finalizado", "Suspendido"],
                datasets: [
                    {
                        label: "Cantidad de Proyectos",
                        data: [0, 0, 0],
                        backgroundColor: ["blue", "green", "orange"],
                    }
                ]
            });
            setNoData(true);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token, startDate, endDate]);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchProyectos();
    }, [isAuthenticated, fetchProyectos]);

    const handleClearDates = () => {
        setStartDate('');
        setEndDate('');
        setLoading(true);
        setNoData(false);
        setError(null);
        fetchProyectos();
    };

    if (loading) return <div>Cargando datos...</div>;

    return (
        <div>
            <h2 style={{ textAlign: 'center' }}>Estados de los proyectos</h2>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <div>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Fecha de inicio"
                        style={{ padding: '5px', width: '150px' }}
                    />
                </div>
                <div>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="Fecha de fin"
                        style={{ padding: '5px', width: '150px' }}
                    />
                </div>
                <div>
                    <button onClick={handleClearDates}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            {noData && (
                <div style={{ textAlign: 'center', fontSize: '18px', color: '#888' }}>
                    <p>No hay proyectos en el rango de fechas. Intenta con otro período.</p>
                </div>
            )}

            <Pie
                data={{
                    labels: proyectos.labels,
                    datasets: proyectos.datasets,
                }}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: (tooltipItem) => {
                                    const datasetIndex = tooltipItem.datasetIndex;
                                    const datasetLabel = proyectos.datasets[datasetIndex]?.label || 'Desconocido';
                                    const state = proyectos.labels[tooltipItem.dataIndex];
                                    const value = tooltipItem.raw;
                                    return `${datasetLabel}: ${value} Proyectos (${state})`;
                                },
                            },
                        },
                    },
                }}
            />
        </div>
    );
};

export default DashboardChartsEstados;