import {jwtDecode} from 'jwt-decode';

// Esta función obtiene el token desde localStorage
export const getAuthToken = () => {
    return localStorage.getItem('token'); // Asumimos que el token se guarda con la clave 'token'
};

// Esta función verifica si el token está presente y es válido
export const isAuthenticated = () => {
    const token = getAuthToken();
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            // Validar que el token no esté expirado (si el token contiene una propiedad 'exp')
            const expirationTime = decodedToken.exp * 1000;
            if (Date.now() < expirationTime) {
                return true;
            }
        } catch (error) {
            console.error('Error decodificando el token:', error);
        }
    }
    return false; // Si no hay token o el token está expirado, no está autenticado
};

// Esta función obtiene el nombre de usuario del token
export const getUserFromToken = () => {
    const token = getAuthToken();
    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            return decodedToken.user.username; // Extrae el nombre de usuario desde el token
        } catch (error) {
            console.error('Error al decodificar el token:', error);
        }
    }
    return null;
};

// Esta función puede ser utilizada para cerrar sesión (eliminando el token)
export const logout = () => {
    localStorage.removeItem('token');
};
