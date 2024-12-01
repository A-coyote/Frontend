import React from 'react';
import { Alert } from '@mui/material';
import { ErrorOutline, CheckCircleOutline, Info, Warning } from '@mui/icons-material';

// Puedes definir íconos dinámicos según la severidad
const iconMap = {
  error: <ErrorOutline />,
  success: <CheckCircleOutline />,
  info: <Info />,
  warning: <Warning />
};

// Componente AlertMessage reutilizable
const AlertMessage = ({ severity, message, action, icon, autoHideDuration = 6000 }) => {
  return (
    <Alert 
      severity={severity} 
      icon={icon || iconMap[severity]} 
      action={action ? action : null}
      sx={{
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '1rem',
        boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
      }}
      autoHideDuration={autoHideDuration}
    >
      {message}
    </Alert>
  );
};

export default AlertMessage;
