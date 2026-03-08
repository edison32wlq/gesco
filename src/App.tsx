import { 
  AppBar, Box, Button, Container, Toolbar, Typography, 
  CssBaseline, Avatar, Stack, IconButton, Tooltip, Divider,
  Menu, MenuItem, Fade
} from "@mui/material";
import { NavLink, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useState } from "react"; 
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import gescoLogo from "./assets/gesco-logo.png";

import HomePage from "./pages/HomePage"; 
import RegisterPage from "./pages/SumPage"; 
import MultiplyPage from "./pages/MultiplyPage";
import SellersPage from "./pages/SellersPage";
import LoginPage from "./pages/LoginPage"; 
import MySalesPage from "./pages/MySalesPage";
import UsersManagementPage from "./pages/UsersManagementPage";

const linkBtnSx = {
  color: "rgba(255,255,255,0.85)",
  textTransform: "none",
  borderRadius: "12px",
  px: 2.5,
  mx: 0.5,
  fontWeight: 700,
  fontSize: "0.85rem",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  "&:hover": { 
    bgcolor: "rgba(255,255,255,0.12)",
    color: "#fff",
    transform: "translateY(-1px)"
  },
  "&.active": { 
    bgcolor: "rgba(255, 255, 255, 0.2)", 
    color: "#fff",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
};

export default function App() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // --- SOLUCIÓN AL ERROR DEL EVENTO ---
  // Cambiamos 'event' por 'e' para evitar conflictos con variables globales
  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
    if (e && e.currentTarget) {
      setAnchorEl(e.currentTarget);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const isAdminPath = ["/seguimiento", "/vendedores", "/gestion-cuentas"].includes(location.pathname);

  if (location.pathname === "/login") {
    return (
      <>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <CssBaseline />
      
      <AppBar position="sticky" elevation={0} sx={{ 
          background: "linear-gradient(135deg, #124a70 0%, #1d6ea5 50%, #80bc71 100%)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}>
        <Toolbar sx={{ height: 80, justifyContent: 'space-between' }}>
          
          <Stack direction="row" alignItems="center" spacing={2} component={NavLink} to="/" sx={{ textDecoration: 'none' }}>
            <Box component="img" src={gescoLogo} alt="Gesco Logo" sx={{ height: 48 }} />
            <Box sx={{ width: "1px", height: "30px", bgcolor: "rgba(255,255,255,0.3)" }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                PORTAL<span style={{ color: '#80bc71' }}>ADMISSIONS</span>
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                By GESCO Management
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: "rgba(0,0,0,0.1)", p: 0.6, borderRadius: "16px" }}>
            <Button component={NavLink} to="/" end sx={linkBtnSx}>Inicio</Button>
            <Button component={NavLink} to="/registro" sx={linkBtnSx}>Registro Maestría</Button>
            
            {(user?.rol === 'superadmin' || user?.rol === 'ute') && (
              <>
                <Button 
                  onClick={handleOpenMenu}
                  sx={{ 
                    ...linkBtnSx, 
                    ...(isAdminPath ? linkBtnSx["&.active"] : {}) 
                  }}
                >
                  Administración <KeyboardArrowDownIcon sx={{ ml: 0.5 }} />
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={handleCloseMenu}
                  TransitionComponent={Fade}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      bgcolor: "#1d6ea5",
                      backgroundImage: "linear-gradient(135deg, #124a70 0%, #1d6ea5 100%)",
                      color: "#fff",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                      "& .MuiMenuItem-root": {
                        px: 3,
                        py: 1.5,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                        "&.active": { color: "#80bc71" }
                      }
                    }
                  }}
                >
                  <MenuItem onClick={handleCloseMenu} component={NavLink} to="/seguimiento">Base de Datos</MenuItem>
                  <MenuItem onClick={handleCloseMenu} component={NavLink} to="/vendedores">Asesores</MenuItem>
                  <MenuItem onClick={handleCloseMenu} component={NavLink} to="/gestion-cuentas">Gestión Cuentas</MenuItem>
                </Menu>
              </>
            )}

            {/* ACTUALIZADO: Superadmin y Asesor ven este botón */}
            {(user?.rol === 'asesor' || user?.rol === 'superadmin') && (
              <Button component={NavLink} to="/mis-ventas" sx={linkBtnSx}>Mis Ventas</Button>
            )}
          </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', fontWeight: 800 }}>
                        {user?.rol?.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700 }}>
                        {user?.username}
                    </Typography>
                </Box>
                <Avatar sx={{ bgcolor: "#fff", color: "#124a70", fontWeight: 900, border: "2px solid #80bc71" }}>
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
            </Stack>

            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />

            <Tooltip title="Cerrar Sesión">
              <IconButton onClick={logout} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,0,0,0.2)' } }}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ position: 'relative', minHeight: "100vh", bgcolor: "#f8fafc" }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 5, pb: 8 }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/registro" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />

            <Route path="/seguimiento" element={
              <ProtectedRoute>
                {user?.rol === 'superadmin' || user?.rol === 'ute' ? <MultiplyPage /> : <Navigate to="/" />}
              </ProtectedRoute>
            } />
            <Route path="/vendedores" element={
              <ProtectedRoute>
                {user?.rol === 'superadmin' || user?.rol === 'ute' ? <SellersPage /> : <Navigate to="/" />}
              </ProtectedRoute>
            } />

            <Route path="/gestion-cuentas" element={
              <ProtectedRoute>
                {user?.rol === 'superadmin' || user?.rol === 'ute' ? <UsersManagementPage /> : <Navigate to="/" />}
              </ProtectedRoute>
            } />

            {/* ACTUALIZADO: Permiso en la ruta para superadmin */}
            <Route path="/mis-ventas" element={
              <ProtectedRoute>
                {(user?.rol === 'asesor' || user?.rol === 'superadmin') ? <MySalesPage /> : <Navigate to="/" />}
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          </Routes>
        </Container>
      </Box>
    </>
  );
}