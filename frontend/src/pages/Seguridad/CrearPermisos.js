import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../../components/AlertMessage';
import { isAuthenticated } from '../../utils/auth';

const CrearPermisos = () => {
  const [showAlert, setShowAlert] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();  // roleId

  const [rolName, setRolName] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [menus, setMenus] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState({});
  const apiUrl = process.env.REACT_APP_API_URL; // La URL base de la API

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    } else {
      if (id) {
        fetchRoleData(id);
      }
      fetchMenus();
    }
  }, [id, navigate]);

  const fetchRoleData = async (roleId) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const response = await axios.get(`${apiUrl}/api/roles/roledit/${roleId}`, config);
      const roleData = response.data;
      setRolName(roleData.NOMBRE);
      setDescripcion(roleData.DESCRIPCION);
    } catch (error) {
      setShowAlert({ severity: 'error', message: 'Error loading role data.' });
    }
  };

  const fetchMenus = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const response = await axios.get(`${apiUrl}/api/navigation/menu`, config);
      setMenus(response.data);
    } catch (error) {
      setShowAlert({ severity: 'error', message: 'Error al cargar los módulos.' });
    }
  };

  const handleMenuSelection = (menuId) => {
    setSelectedMenus((prevState) => {
      const updatedSelection = { ...prevState };
      updatedSelection[menuId] = !updatedSelection[menuId];
      return updatedSelection;
    });
  };

  const organizeMenus = () => {
    const mainMenus = menus.filter((menu) => menu.ParentMenuID === 0);
    const subMenus = menus.filter((menu) => menu.ParentMenuID !== 0 && menu.ParentMenuID !== menu.MenuID);
    const subSubMenus = menus.filter((menu) => menu.Accion === 1 || menu.Accion === 2);

    return mainMenus.map((mainMenu) => ({
      ...mainMenu,
      subMenus: subMenus
        .filter((subMenu) => subMenu.ParentMenuID === mainMenu.MenuID)
        .map((subMenu) => ({
          ...subMenu,
          subSubMenus: subSubMenus.filter((subSubMenu) => subSubMenu.ParentMenuID === subMenu.MenuID),
        })),
    }));
  };

  const savePermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };

      const permissionsToSave = Object.keys(selectedMenus)
        .filter(menuId => selectedMenus[menuId])
        .map(menuId => ({
          menuId: parseInt(menuId, 10), // Convertir a número
        }));

      if (permissionsToSave.length === 0) {
        setShowAlert({ severity: 'warning', message: 'No se ha seleccionado ningún menú.' });
        return;
      }

      const response = await axios.post(
        `${apiUrl}/api/navigation/permissions/`,
        { roleId: parseInt(id, 10), permissions: permissionsToSave },
        config
      );

      if (response.status === 201) {
        setShowAlert({ severity: 'success', message: 'Permisos guardados exitosamente.' });
      } else {
        setShowAlert({ severity: 'error', message: 'Error al guardar permisos.' });
      }
    } catch (error) {
      setShowAlert({ severity: 'error', message: 'Error al guardar permisos.' });
    }
  };

  const organizedMenus = organizeMenus();

  return (
    <Box sx={{ padding: 5 }}>
      {showAlert && (
        <AlertMessage
          severity={showAlert.severity}
          message={showAlert.message}
          autoHideDuration={2000}
          sx={{ mb: 4 }}
        />
      )}

      <Typography variant="h4" textAlign="center" gutterBottom>
        Asignación de permisos
      </Typography>

      <Grid container spacing={2} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Nombre del Rol"
            value={rolName}
            InputProps={{
              readOnly: true,
              style: { backgroundColor: '#f5f5f5' },
            }}
            variant="outlined"
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Descripción"
            value={descripcion}
            InputProps={{
              readOnly: true,
              style: { backgroundColor: '#f5f5f5' },
            }}
            variant="outlined"
            size="small"
          />
        </Grid>
      </Grid>

      {organizedMenus.map((menu) => (
        <Accordion key={menu.MenuID}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{menu.DisplayName}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedMenus[menu.MenuID] || false}
                  onChange={() => handleMenuSelection(menu.MenuID)}
                  color="primary"
                />
              }
              label={`Asignar modulo de ${menu.DisplayName}`}
            />

            {menu.subMenus.map((subMenu) => (
              <Accordion key={subMenu.MenuID} sx={{ ml: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{subMenu.DisplayName}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedMenus[subMenu.MenuID] || false}
                        onChange={() => handleMenuSelection(subMenu.MenuID)}
                        color="primary"
                      />
                    }
                    label={`Permitir ver ${subMenu.DisplayName}`}
                  />

                  {subMenu.subSubMenus.map((subSubMenu) => (
                    <Box key={subSubMenu.MenuID} sx={{ ml: 5 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMenus[subSubMenu.MenuID] || false}
                            onChange={() => handleMenuSelection(subSubMenu.MenuID)}
                            color="primary"
                          />
                        }
                        label={`Permitir ${subSubMenu.DisplayName}`}
                      />
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      <Button variant="contained" color="primary" onClick={savePermissions} sx={{ mt: 3 }}>
        Guardar Permisos
      </Button>
    </Box>
  );
};

export default CrearPermisos;
