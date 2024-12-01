import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

const ProtectedRoute = ({ children, requiredPermission }) => {
    const token = localStorage.getItem('token');
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;  // Si no hay token, no intentamos obtener permisos
        }

        const fetchPermissions = async () => {
            try {
                const decoded = jwtDecode(token);
                const userRoleId = decoded.user.rol;

                // Realiza la solicitud a la API para obtener los permisos del usuario
                const response = await axios.get(`${apiUrl}/api/auth/permisosUser/${userRoleId}`);

                if (response.data && Array.isArray(response.data)) {
                    setPermissions(response.data);  // Establece los permisos del usuario
                } else {
                    setPermissions([]);
                }
            } catch (error) {
                setError("Error al obtener los permisos");
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, [token]);

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <Navigate to="/login" />;
    }

    if (!token) {
        return <Navigate to="/login" />;
    }

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
            return <Navigate to="/login" />;
        }

        // Verificación de permisos solo después de comprobar que el token es válido
        const hasPermission = permissions.some(permission => permission.MenuID === requiredPermission);

        if (!hasPermission) {
            return <Navigate to="/login" />;
        }

        
       return React.cloneElement(children, { permissions }); // Pasa los permisos como props a los hijos
       
    } catch (error) {
        return <Navigate to="/login" />;
    }
};

export default ProtectedRoute;
