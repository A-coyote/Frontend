import React, { useEffect, useState, useCallback } from 'react';
import { createTheme } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { Routes, Route, useNavigate, useLocation, Navigate  } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Button, Menu, MenuItem } from '@mui/material';
import Usuario from '../pages/Seguridad/usuario';
import Roles from '../pages/Seguridad/Roles';
import CrearUsuario from '../pages/Seguridad/CrearUsuario';
import EditarUsuario from '../pages/Seguridad/EditarUsuario';
import CrearRoles from '../pages/Seguridad/CrearRoles';
import EditarRol from '../pages/Seguridad/EditarRol';
import CrearPermisos from '../pages/Seguridad/CrearPermisos';
import Proyectos from '../pages/Gestiones/Proyectos';
import CrearProyecto from '../pages/Gestiones/CrearProyectos';
import EditarProyecto from '../pages/Gestiones/EditarProyecto';
import CrearHitos from '../pages/Gestiones/CrearHitos';
import EditarHito from '../pages/Gestiones/EditarHito';
import Tareas from '../pages/Proyectos/Tareas';
import EditarTarea from '../pages/Proyectos/EditarTarea';
import CrearPruebas from '../pages/Proyectos/PlanPruebas';
import VerPruebasHito from '../pages/Proyectos/Hitos';
import EditarPrueba from '../pages/Proyectos/EditarPrueba';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardChart from '../components/DashboardChart';
import DashboardChartsEstados from '../components/DashboardChartEstados';
import DashboardChartsProyecto from '../components/DashboardChartEstoPrueba';
import { isAuthenticated } from '../utils/auth';
import logo from '../assets/LogoNav.png'

const iconMap = {
    Seguridad: <SecurityIcon />,
    Roles: <PersonIcon />,
    Usuarios: <DescriptionIcon />,
    Permisos: <LockIcon />,
};

const demoTheme = createTheme({
    
    palette: {
        mode: 'light',
    },
    
});

export default function DashboardLayoutNavigationLinks() {
    const navigate = useNavigate();
    const location = useLocation(); // Hook para obtener la ruta actual
    const [menuItems, setMenuItems] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const token = localStorage.getItem('token');
    //const isAuthenticated = Boolean(token);
    const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

    const fetchMenus = useCallback(async () => {
        if (!token) return;

        const decoded = jwtDecode(token);
        const username = decoded.user.username;

        try {
            const response = await axios.get(`${apiUrl}/api/navigation/menu/${username}`);
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error al obtener los menús:', error);
        }
    }, [token]);

    const isTokenExpired = (token) => {

        if (!token) return true; // Si no hay token, consideramos que está expirado
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 3600; // Tiempo actual en segundos
    
        return decoded.expiresIn < currentTime; // Comparamos la fecha de expiración
    
    };
    

    useEffect(() => {
        if (!isAuthenticated() || isTokenExpired(token)) {
            navigate('/Login');
        } else {
            fetchMenus();
        }
    }, [isAuthenticated, fetchMenus, navigate]);

    const handleMenuClick = (url) => {
        if (url) {
            navigate(`/${url}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        setAnchorEl(null);
    };

    const handleSettingsClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const navigation = menuItems.map((item) => {
        
        if (item.ParentMenuID === 0 && item.VisibleUsuario === 1) {
            return {
                segment: item.MenuURL,
                title: item.DisplayName,
                icon: iconMap[item.DisplayName] || <DescriptionIcon />,
                children: menuItems
                    .filter((subItem) => subItem.ParentMenuID === item.MenuID)
                    .map((subItem) => ({
                        segment: subItem.MenuURL,
                        title: subItem.DisplayName,
                        icon: iconMap[subItem.DisplayName] || <DescriptionIcon />,
                        onClick: () => handleMenuClick(subItem.MenuURL),
                    })),
                onClick: () => handleMenuClick(item.MenuURL),
            };
        }
        return null;
    }).filter(Boolean);

    // Comprobar si estamos en el Dashboard o en una ruta que deba mostrar las gráficas
    const showCharts = location.pathname === '/'; // Solo mostrar en '/dashboard'

    return (
        
        <AppProvider  navigation={navigation} 
        branding={{ 

            logo: <img src={logo} alt="logo" />, 
        
            title: 'Gestor control calidad', 
        
          }} 
        theme={demoTheme}>
            
            <Button
                variant="text"
                onClick={handleSettingsClick}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 10000,
                    
                }}
            >
                <SettingsIcon />
            </Button>

            <Menu
            
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
            >
                <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
            </Menu>

            <DashboardLayout>
                {/* Contenedor de las gráficas, solo visibles si estamos en la ruta '/dashboard' */}
                {showCharts && (
                    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
                        <h1 style={{ textAlign: 'center' }}>¡Bienvenido al Gestor de pruebas!</h1>

                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                            <div style={{ width: '30%', minWidth: '250px', height: '300px' }}>
                                <DashboardChart style={{ width: '100%', height: '100%' }} />
                            </div>
                            <div style={{ width: '30%', minWidth: '250px', height: '300px' }}>
                                <DashboardChartsEstados style={{ width: '100%', height: '100%' }} />
                            </div>
                            <div style={{ width: '30%', minWidth: '250px', height: '300px' }}>
                                <DashboardChartsProyecto style={{ width: '100%', height: '100%' }} />
                            </div>
                        </div>
                    </div>

                )}


                <Routes>
                    <Route path="seguridad/usuarios" element={<ProtectedRoute requiredPermission={3}><Usuario /></ProtectedRoute>} />
                    <Route path="seguridad/crear-usuario" element={<ProtectedRoute requiredPermission={5}><CrearUsuario /></ProtectedRoute>} />
                    <Route path="seguridad/editar-usuario/:id" element={<ProtectedRoute requiredPermission={6}><EditarUsuario /></ProtectedRoute>} />
                    <Route path="seguridad/roles" element={<ProtectedRoute requiredPermission={2}><Roles /></ProtectedRoute>} />
                    <Route path="seguridad/crear-roles" element={<ProtectedRoute requiredPermission={7}><CrearRoles /></ProtectedRoute>} />
                    <Route path="seguridad/editar-roles/:id" element={<ProtectedRoute requiredPermission={8}><EditarRol /></ProtectedRoute>} />
                    <Route path="seguridad/crear-permisos/:id" element={<ProtectedRoute requiredPermission={9}><CrearPermisos /></ProtectedRoute>} />

                    {/* Gestión del Proyecto */}
                    <Route path="gestiones/proyectos" element={<ProtectedRoute requiredPermission={11}><Proyectos /></ProtectedRoute>} />
                    <Route path="gestiones/crear-proyectos" element={<ProtectedRoute requiredPermission={12}><CrearProyecto /></ProtectedRoute>} />
                    <Route path="gestiones/editar-proyectos/:id" element={<ProtectedRoute requiredPermission={13}><EditarProyecto /></ProtectedRoute>} />
                    <Route path="gestiones/crear-hitos/:id" element={<ProtectedRoute requiredPermission={14}><CrearHitos /></ProtectedRoute>} />
                    <Route path="gestiones/editar-hitos/:id" element={<ProtectedRoute requiredPermission={15}><EditarHito /></ProtectedRoute>} />

                    {/* Gestión de Tareas */}
                    <Route path="proyectos/tareas" element={<ProtectedRoute requiredPermission={17}><Tareas /></ProtectedRoute>} />
                    <Route path="proyectos/editar-tarea/:id" element={<ProtectedRoute requiredPermission={18}><EditarTarea /></ProtectedRoute>} />
                    <Route path="proyectos/crear-pruebas/:id" element={<ProtectedRoute requiredPermission={19}><CrearPruebas /></ProtectedRoute>} />
                    <Route path="proyectos/hitos-pruebas/:id" element={<ProtectedRoute requiredPermission={20}><VerPruebasHito /></ProtectedRoute>} />
                    <Route path="proyectos/editar-plan/:id" element={<ProtectedRoute requiredPermission={21}><EditarPrueba /></ProtectedRoute>} />
                </Routes>
            </DashboardLayout>
        </AppProvider>
    );
}
