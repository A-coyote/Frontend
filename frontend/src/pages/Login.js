import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';
import logo from '../assets/LogoPrincipal.png';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const CircularLogo = styled('img')({
    width: '350px',
    height: '200px',
    borderRadius: '50%',
    display: 'block',
    margin: '0 auto',
});

const Login = () => {
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/Login');
        }
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const newErrors = {};
        if (!usuario) newErrors.usuario = 'El usuario es requerido';
        if (!password) newErrors.password = 'La contraseña es requerida';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API
            const response = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: usuario, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrors({
                    submit: errorData.errors ? errorData.errors.map(err => err.msg).join(', ') : errorData.msg || 'Error en la conexión.'
                });
                return;
            }

            const data = await response.json();
            localStorage.setItem('token', data.token); // Almacena el token en localStorage
            navigate('/')
        } catch (error) {
            console.error('Error en la conexión:', error);
            setErrors({ submit: 'Error en la conexión. Inténtalo más tarde.' });
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <CircularLogo src={logo} alt="Logo" />
            <Typography variant="h4" align="center" gutterBottom>
                Iniciar Sesión
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                    required
                    fullWidth
                    label="Usuario"
                    margin="normal"
                    value={usuario}
                    onChange={(e) => {
                        setUsuario(e.target.value);
                        if (errors.usuario) {
                            setErrors({ ...errors, usuario: undefined });
                        }
                    }}
                    error={Boolean(errors.usuario)}
                    helperText={errors.usuario}
                />
                <TextField
                    required
                    fullWidth
                    label="Contraseña"
                    type="password"
                    margin="normal"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                            setErrors({ ...errors, password: undefined });
                        }
                    }}
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                />
                {errors.submit && <Typography color="error">{errors.submit}</Typography>}
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Iniciar Sesión
                </Button>
            </Box>
        </Container>
    );
};

export default Login;

