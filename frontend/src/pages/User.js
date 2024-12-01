// UserForm.js
import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

function UserForm() {
  return (
    <Box sx={{ maxWidth: 400, margin: '0 auto', padding: 4 }}>
      <Typography variant="h5" mb={2}>Registro de Usuarios</Typography>
      <TextField label="Nombre" fullWidth margin="normal" />
      <TextField label="Correo electrónico" fullWidth margin="normal" />
      <TextField label="Contraseña" type="password" fullWidth margin="normal" />
      <Button variant="contained" color="primary" fullWidth>Registrar</Button>
    </Box>
  );
}

export default UserForm;
