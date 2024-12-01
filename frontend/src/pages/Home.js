// src/pages/Home.js
import React from 'react';
//import Navbar from '../components/Navbar'; // Asegúrate de que la ruta sea correcta

import { Container, Typography, Button } from '@mui/material';

const Home = () => {
  return (
    <>
      <Container maxWidth="sm" style={{ marginTop: '50px' }}>
        <Typography variant="h4" gutterBottom>
          Welcome to MyApp
        </Typography>
        <Button variant="contained" color="primary" size="large">
          Get Started
        </Button>
      </Container>
    </>
  );
};

export default Home;
