// DashboardLayoutNavigationLinks.js
import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useNavigate, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Usuario from '../pages/Seguridad/usuario';
import { jwtDecode } from 'jwt-decode';

const demoTheme = createTheme({
    palette: {
        mode: 'light',
    },
});

const iconMap = {
    Seguridad: <SecurityIcon />,
    Roles: <DescriptionIcon />,
    Usuarios: <PersonIcon />,
    Permisos: <LockIcon />,
};

export default function DashboardLayoutNavigationLinks() {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const token = localStorage.getItem('token');
    const isAuthenticated = Boolean(token);
    //const location = useLocation(); // Obtener la ubicación actual
    const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

    const fetchMenus = useCallback(async () => {
        if (!token) return;

        const decoded = jwtDecode(token);
        const username = decoded.user.username;

        try {
            const response = await axios.get(`${apiUrl}/api/navigation/menu/${username}`);
            const data = response.data.map((item) => ({
                ...item,
                MenuURL: `/dashboard/${item.MenuURL}` // Agregar el prefijo /dashboard
            }));
            setMenuItems(data);
        } catch (error) {
            console.error('Error fetching menus:', error);
        }
    }, [token]);


    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            fetchMenus();
        }
    }, [isAuthenticated, fetchMenus, navigate]);

    const handleMenuClick = (url) => {
        if (url) {
            const fullUrl = url.startsWith('seguridad') ? `/dashboard/${url}` : url; 
            navigate(fullUrl);
        }
    };
    


    const navigation = menuItems.map((item) => {
        if (item.ParentMenuID === 0) {
            return {
                segment: item.DisplayName,
                title: item.DisplayName,
                icon: iconMap[item.DisplayName] || <DescriptionIcon />,
                children: menuItems
                    .filter((subItem) => subItem.ParentMenuID === item.MenuID)
                    .map((subItem) => ({
                        segment: subItem.DisplayName,
                        title: subItem.DisplayName,
                        icon: iconMap[subItem.DisplayName] || <DescriptionIcon />,
                        onClick: () => {
                            handleMenuClick(subItem.MenuURL);
                        },
                    })),
                onClick: () => {
                    handleMenuClick(item.MenuURL);
                },
            };
        }
        return null;
    }).filter(Boolean);

    return (
        <AppProvider navigation={navigation} theme={demoTheme}>
            <DashboardLayout>
                <Routes>
                    {menuItems.map((item) => (
                        <Route
                            key={item.MenuID}
                            path={`/dashboard/${item.MenuURL}`} 
                            element={
                                item.MenuURL === 'seguridad/usuarios' ? <Usuario /> : <Welcome />
                            }
                        />
                    ))}
                    <Route path="*" element={<Welcome />} />
                </Routes>

            </DashboardLayout>
        </AppProvider>
    );
}

function Welcome() {
    return (
        <Box
            sx={{
                py: 35,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
            }}
        >
            <Typography variant="h4">Bienvenido al Gestor de Control de Calidad!</Typography>
        </Box>
    );
}