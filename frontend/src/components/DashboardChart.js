import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardCharts = () => {
    const [proyectos, setProyectos] = useState({
        labels: ["Vencidos", "No Vencidos"],
        datasets: [
            {
                data: [0, 0], // Default values
                backgroundColor: ['#FF6384', '#36A2EB'],
            },
        ],
        vencidos: 0,
        noVencidos: 0,
        vencidosNombres: [],
        noVencidosNombres: []
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

   
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [navigate, isAuthenticated]);

    const fetchProyectos = useCallback(async () => {
        if (!isAuthenticated || !token) return;

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

            const response = await axios.get(`${apiUrl}/api/grafica/VencimientoProyecto/${id}`, config);
            const { labels, vencidos, noVencidos, vencidosNombres, noVencidosNombres } = response.data;

            if (!labels || !Array.isArray(labels) || vencidos === undefined || noVencidos === undefined) {
                setError('Datos incompletos recibidos de la API.');
                setNoData(true);
                return;
            }

            setProyectos({
                labels,
                datasets: [
                    {
                        data: [vencidos, noVencidos],
                        backgroundColor: ['#FF6384', '#36A2EB'],
                    },
                ],
                vencidos,
                noVencidos,
                vencidosNombres,
                noVencidosNombres,
            });
            setNoData(false);
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'Error desconocido';
            setError(`No se pudieron cargar los datos de los proyectos: ${errorMsg}`);
            setProyectos({
                labels: ["Vencidos", "No Vencidos"],
                datasets: [
                    {
                        data: [0, 0],
                        backgroundColor: ['#FF6384', '#36A2EB'],
                    },
                ],
            });
            setNoData(true);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token, startDate, endDate]);

    useEffect(() => {
        if (!isAuthenticated) return;
        setLoading(true);
        fetchProyectos();
    }, [isAuthenticated, fetchProyectos, startDate, endDate]);

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
            <h2 style={{ textAlign: 'center' }}>Proyectos</h2>
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
                    <button
                        onClick={handleClearDates}
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

            {error && (
                <div style={{ textAlign: 'center', fontSize: '18px', color: '#f44336' }}>
                    <p>{error}</p>
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
                                    const index = tooltipItem.dataIndex;
                                    const projectNames = index === 0
                                        ? proyectos.vencidosNombres
                                        : proyectos.noVencidosNombres;
                                    return `${tooltipItem.raw} Proyectos: ${projectNames.join(', ')}`;
                                },
                            },
                        },
                    },
                }}
            />
        </div>
    );
};

export default DashboardCharts;
