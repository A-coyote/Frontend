// src/components/Welcome.js
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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
            <Typography variant ="h4" component="h1" sx={{ mb: 2 }}>
                Bienvenido al Dashboard
            </Typography>
            <Typography variant="h6" component="p" sx={{ mb: 2 }}>
                Aquí podrás gestionar tus usuarios y otros recursos.
            </Typography>
        </Box>
    );
}

export default Welcome;