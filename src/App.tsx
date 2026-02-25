import { 
  AppBar, Box, Button, Container, Toolbar, Typography, 
  CssBaseline, Avatar, Stack, IconButton, Tooltip, Divider 
} from "@mui/material";
import { NavLink, Route, Routes, useLocation, Navigate } from "react-router-dom";
import LogoutIcon from '@mui/icons-material/Logout';

// IMPORTACIÓN DE CONTEXTO Y PROTECCIÓN
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// IMPORTACIÓN DE ASSETS
import gescoLogo from "./assets/gesco-logo.png";

// IMPORTACIÓN DE PÁGINAS
import HomePage from "./pages/HomePage"; 
import RegisterPage from "./pages/SumPage"; 
import MultiplyPage from "./pages/MultiplyPage";
import SellersPage from "./pages/SellersPage";
import LoginPage from "./pages/LoginPage"; 
import MySalesPage from "./pages/MySalesPage";

const linkBtnSx = {
  color: "rgba(255,255,255,0.85)",
  textTransform: "none",
  borderRadius: "12px",
  px: 2.5,
  mx: 0.5,
  fontWeight: 700,
  fontSize: "0.85rem",
  transition: "all 0.3s ease",
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

  // Ocultar Navbar en el Login
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

          {/* MENÚ DINÁMICO SEGÚN ROL */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: "rgba(0,0,0,0.1)", p: 0.6, borderRadius: "16px" }}>
            <Button component={NavLink} to="/" end sx={linkBtnSx}>Inicio</Button>
            <Button component={NavLink} to="/registro" sx={linkBtnSx}>Registro Maestría</Button>
            
            {/* Solo SuperAdmin y Admin ven Base de Datos y Asesores */}
            {(user?.rol === 'superadmin' || user?.rol === 'admin') && (
              <>
                <Button component={NavLink} to="/seguimiento" sx={linkBtnSx}>Base de Datos</Button>
                <Button component={NavLink} to="/vendedores" sx={linkBtnSx}>Asesores</Button>
              </>
            )}

            {/* Solo el Asesor ve su panel de ventas */}
            {user?.rol === 'asesor' && (
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

            {/* RUTAS ACCESIBLES PARA TODOS LOS LOGUEADOS */}
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/registro" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />

            {/* RUTAS RESTRINGIDAS (Solo Admin y SuperAdmin) */}
            <Route path="/seguimiento" element={
              <ProtectedRoute>
                {user?.rol === 'superadmin' || user?.rol === 'admin' ? <MultiplyPage /> : <Navigate to="/" />}
              </ProtectedRoute>
            } />
            <Route path="/vendedores" element={
              <ProtectedRoute>
                {user?.rol === 'superadmin' || user?.rol === 'admin' ? <SellersPage /> : <Navigate to="/" />}
              </ProtectedRoute>
            } />

            {/* RUTA RESTRINGIDA (Solo Asesor) */}
            <Route path="/mis-ventas" element={
              <ProtectedRoute>
                {user?.rol === 'asesor' ? <MySalesPage /> : <Navigate to="/" />}
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          </Routes>
        </Container>
      </Box>
    </>
  );
}