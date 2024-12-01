import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
//import { isAuthenticated } from './utils/auth';
import Usuario from './pages/Seguridad/usuario';
import Roles from './pages/Seguridad/Roles';
import CrearUsuario from './pages/Seguridad/CrearUsuario';
import EditarUsuario from './pages/Seguridad/EditarUsuario';
import CrearRoles from './pages/Seguridad/CrearRoles';
import EditarRol from './pages/Seguridad/EditarRol';
import CrearPermisos from './pages/Seguridad/CrearPermisos';
import Proyectos from './pages/Gestiones/Proyectos';
import CrearProyectos from './pages/Gestiones/CrearProyectos';
import EditarProyecto from './pages/Gestiones/EditarProyecto';
import CrearHitos from './pages/Gestiones/CrearHitos';
import EditarHito from './pages/Gestiones/EditarHito';
import Dashboard from './pages/Dashboard';
import Tareas from './pages/Proyectos/Tareas';
import EditarTarea from './pages/Proyectos/EditarTarea'
import CrearPruebas from './pages/Proyectos/PlanPruebas'
import VerPruebasHito from './pages/Proyectos/Hitos'
import EditarPrueba from './pages/Proyectos/EditarPrueba'
import ProtectedRoute from './components/ProtectedRoute';
// function ProtectedRoute({ children }) {
//     if (!isAuthenticated()) {
//         return <Navigate to="/login" />;
//     }
//     return children;
// }

function App() {
    return (
        <Router>
            <Routes>
                {/* Ruta para Login */}
                <Route path="/login" element={<Login />} />
                

                {/* Ruta protegida para el Dashboard */}
                <Route path="/" element={<Dashboard />}>
                    {/* Rutas internas dentro del Dashboard */}
                    {/* Rutas para modulo de seguridad */}
                    <Route path="seguridad/usuarios" element={<ProtectedRoute requiredPermission={3}><Usuario /></ProtectedRoute>} />
                    <Route path="seguridad/crear-usuario" element={<ProtectedRoute requiredPermission={5}><CrearUsuario /></ProtectedRoute>} />
                    <Route path="seguridad/editar-usuario/:userId" element={<ProtectedRoute requiredPermission={6}><EditarUsuario /></ProtectedRoute>} />
                    <Route path="seguridad/roles" element={<ProtectedRoute requiredPermission={2}><Roles /></ProtectedRoute>} />
                    <Route path="seguridad/crear-roles" element={<ProtectedRoute requiredPermission={7}><CrearRoles /></ProtectedRoute>} />
                    <Route path="seguridad/editar-roles/:rolId" element={<ProtectedRoute requiredPermission={8}><EditarRol /></ProtectedRoute>} />
                    <Route path="seguridad/crear-permisos/:rolId" element={<ProtectedRoute requiredPermission={9}><CrearPermisos /></ProtectedRoute>} />

                    {/* Gestion del proyecyo*/}
                    <Route path="gestiones/proyectos" element={<ProtectedRoute requiredPermission={11}><Proyectos /></ProtectedRoute>} />
                    <Route path="gestiones/crear-proyectos" element={<ProtectedRoute requiredPermission={12}><CrearProyectos /></ProtectedRoute>} />
                    <Route path="gestiones/editar-proyectos/:proyectoId" element={<ProtectedRoute requiredPermission={13}><EditarProyecto /></ProtectedRoute>} />
                    <Route path="gestiones/crear-hitos/:proyectoId" element={<ProtectedRoute requiredPermission={14}><CrearHitos /></ProtectedRoute>} />
                    <Route path="gestiones/editar-hitos/:id_hito" element={<ProtectedRoute requiredPermission={15}><EditarHito /></ProtectedRoute>} />

                    {/* Gestion del proyecyo*/}
                    <Route path="proyectos/tareas" element={<ProtectedRoute requiredPermission={17}><Tareas /></ProtectedRoute>} />
                    <Route path="proyectos/editar-tarea/:proyectoId" element={<ProtectedRoute requiredPermission={18}><EditarTarea /></ProtectedRoute>} />
                    <Route path="proyectos/crear-pruebas/:proyectoId" element={<ProtectedRoute requiredPermission={19}><CrearPruebas /></ProtectedRoute>} />
                    <Route path="proyectos/hitos-pruebas/:proyectoId" element={<ProtectedRoute requiredPermission={20}><VerPruebasHito /></ProtectedRoute>} />
                    <Route path="proyectos/editar-plan/:id-plan" element={<ProtectedRoute requiredPermission={21}><EditarPrueba /></ProtectedRoute>} />
                </Route>

                {/* Redirigir cualquier ruta no encontrada al login */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
