import { 
  AppBar, Box, Button, Container, Toolbar, Typography, 
  CssBaseline, Avatar, Stack, Divider,
  Menu, MenuItem, Fade, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Chip, Alert, Snackbar
} from "@mui/material";
import { NavLink, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useState } from "react"; 

// FIREBASE AUTH (NUEVO)
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

// ICONOS
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyIcon from '@mui/icons-material/Key';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// CONTEXTO Y COMPONENTES
import { useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// ASSETS Y PÁGINAS
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
  const [anchorElProfile, setAnchorElProfile] = useState<null | HTMLElement>(null);

  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState(false);

  const [passForm, setPassForm] = useState({ actual: "", nueva: "", confirmar: "" });
  const [errors, setErrors] = useState({ actual: "", nueva: "", confirmar: "" });

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleOpenProfileMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorElProfile(e.currentTarget);
  const handleCloseProfileMenu = () => setAnchorElProfile(null);

  /**
   * LÓGICA DE ACTUALIZACIÓN DE CONTRASEÑA EN FIREBASE
   */
  const handleUpdatePassword = async () => {
    const newErrors = { actual: "", nueva: "", confirmar: "" };
    let hasError = false;

    // 1. Validaciones básicas de interfaz
    if (passForm.nueva.length < 6) {
      newErrors.nueva = "Debe tener al menos 6 caracteres.";
      hasError = true;
    }

    if (passForm.nueva !== passForm.confirmar) {
      newErrors.confirmar = "Las contraseñas nuevas no coinciden.";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.email) {
        // Reautenticación (Requisito de seguridad de Firebase para cambios de contraseña)
        const credential = EmailAuthProvider.credential(currentUser.email, passForm.actual);
        await reauthenticateWithCredential(currentUser, credential);

        // Actualización en la nube
        await updatePassword(currentUser, passForm.nueva);

        // Reset de estados tras éxito
        setSuccessMsg(true); 
        setOpenPasswordModal(false);
        setPassForm({ actual: "", nueva: "", confirmar: "" });
        setErrors({ actual: "", nueva: "", confirmar: "" });
      }
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setErrors({ ...newErrors, actual: "La contraseña actual es incorrecta." });
      } else {
        alert("Ocurrió un error al actualizar la contraseña: " + error.message);
      }
    }
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
    <ProtectedRoute>
      <>
        <CssBaseline />
        
        <Snackbar 
          open={successMsg} 
          autoHideDuration={6000} 
          onClose={() => setSuccessMsg(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSuccessMsg(false)} 
            severity="success" 
            variant="filled"
            icon={<CheckCircleIcon fontSize="inherit" />}
            sx={{ width: '100%', borderRadius: '12px', fontWeight: 700 }}
          >
            ¡Contraseña actualizada correctamente!
          </Alert>
        </Snackbar>

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
              
              {(user?.rol === 'superadmin' || user?.rol === 'administrador') && (
                <>
                  <Button 
                    onClick={handleOpenMenu}
                    sx={{ ...linkBtnSx, ...(isAdminPath ? linkBtnSx["&.active"] : {}) }}
                  >
                    Administración <KeyboardArrowDownIcon sx={{ ml: 0.5 }} />
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    TransitionComponent={Fade}
                    PaperProps={{
                      sx: {
                        mt: 1.5, bgcolor: "#1d6ea5", color: "#fff", borderRadius: "12px",
                        backgroundImage: "linear-gradient(135deg, #124a70 0%, #1d6ea5 100%)",
                        "& .MuiMenuItem-root": { px: 3, py: 1.5, fontWeight: 700, fontSize: "0.85rem" }
                      }
                    }}
                  >
                    <MenuItem onClick={handleCloseMenu} component={NavLink} to="/seguimiento">Base de Datos</MenuItem>
                    <MenuItem onClick={handleCloseMenu} component={NavLink} to="/vendedores">Asesores</MenuItem>
                    <MenuItem onClick={handleCloseMenu} component={NavLink} to="/gestion-cuentas">Gestión Cuentas</MenuItem>
                  </Menu>
                </>
              )}

              {(user?.rol === 'asesor' || user?.rol === 'superadmin') && (
                <Button component={NavLink} to="/mis-ventas" sx={linkBtnSx}>Mis Ventas</Button>
              )}
            </Box>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack 
                direction="row" 
                spacing={1.5} 
                alignItems="center" 
                onClick={handleOpenProfileMenu}
                sx={{ cursor: 'pointer', p: 0.5, borderRadius: '12px', transition: '0.3s', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
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

              <Menu
                anchorEl={anchorElProfile}
                open={Boolean(anchorElProfile)}
                onClose={handleCloseProfileMenu}
                TransitionComponent={Fade}
                PaperProps={{ sx: { mt: 1, borderRadius: '16px', minWidth: 200, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' } }}
              >
                <MenuItem onClick={() => { handleCloseProfileMenu(); setOpenProfileModal(true); }}>
                  <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20, color: '#124a70' }} /> Ver Perfil
                </MenuItem>
                <MenuItem onClick={() => { handleCloseProfileMenu(); setOpenPasswordModal(true); }}>
                  <KeyIcon sx={{ mr: 1.5, fontSize: 20, color: '#f59e0b' }} /> Cambiar Contraseña
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={logout} sx={{ color: '#ef4444', fontWeight: 700 }}>
                  <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} /> Cerrar Sesión
                </MenuItem>
              </Menu>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: 1 }} />
            </Stack>
          </Toolbar>
        </AppBar>

        <Box sx={{ position: 'relative', minHeight: "100vh", bgcolor: "#f8fafc" }}>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pt: 5, pb: 8 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/registro" element={<RegisterPage />} />
              
              <Route path="/seguimiento" element={
                (user?.rol === 'superadmin' || user?.rol === 'administrador') ? <MultiplyPage /> : <Navigate to="/" />
              } />
              <Route path="/vendedores" element={
                (user?.rol === 'superadmin' || user?.rol === 'administrador') ? <SellersPage /> : <Navigate to="/" />
              } />
              <Route path="/gestion-cuentas" element={
                (user?.rol === 'superadmin' || user?.rol === 'administrador') ? <UsersManagementPage /> : <Navigate to="/" />
              } />
              <Route path="/mis-ventas" element={
                (user?.rol === 'asesor' || user?.rol === 'superadmin') ? <MySalesPage /> : <Navigate to="/" />
              } />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>
        </Box>

        <Dialog open={openProfileModal} onClose={() => setOpenProfileModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px' } }}>
          <DialogTitle sx={{ fontWeight: 900, textAlign: 'center', color: '#124a70', pt: 4 }}>Perfil de Usuario</DialogTitle>
          <DialogContent>
            <Stack alignItems="center" spacing={2} sx={{ py: 1 }}>
              <Avatar sx={{ width: 80, height: 80, bgcolor: '#1d6ea5', fontSize: 32, fontWeight: 900, mb: 1 }}>{user?.username?.charAt(0).toUpperCase()}</Avatar>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{user?.username}</Typography>
                <Chip label={user?.rol?.toUpperCase()} size="small" sx={{ bgcolor: '#80bc71', color: '#fff', fontWeight: 800, mt: 1 }} />
              </Box>
              <Divider sx={{ width: '100%', my: 2 }} />
              <Box sx={{ width: '100%', px: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>EMAIL CORPORATIVO</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>{user?.email || "No especificado"}</Typography>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button fullWidth onClick={() => setOpenProfileModal(false)} variant="contained" sx={{ bgcolor: '#124a70', borderRadius: '12px', py: 1.5, fontWeight: 800 }}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openPasswordModal} onClose={() => { setOpenPasswordModal(false); setErrors({actual:"", nueva:"", confirmar:""}); }} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px' } }}>
          <DialogTitle sx={{ fontWeight: 900, color: '#124a70' }}>Cambiar Contraseña</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField 
                fullWidth 
                type="password" 
                label="Contraseña Actual" 
                value={passForm.actual} 
                onChange={(e) => { setPassForm({...passForm, actual: e.target.value}); setErrors({...errors, actual: ""}); }}
                error={!!errors.actual}
                helperText={errors.actual}
              />
              <TextField 
                fullWidth 
                type="password" 
                label="Nueva Contraseña" 
                value={passForm.nueva} 
                onChange={(e) => { setPassForm({...passForm, nueva: e.target.value}); setErrors({...errors, nueva: ""}); }}
                error={!!errors.nueva}
                helperText={errors.nueva}
              />
              <TextField 
                fullWidth 
                type="password" 
                label="Confirmar Nueva Contraseña" 
                value={passForm.confirmar} 
                onChange={(e) => { setPassForm({...passForm, confirmar: e.target.value}); setErrors({...errors, confirmar: ""}); }}
                error={!!errors.confirmar}
                helperText={errors.confirmar}
              />
              <Alert severity="info" sx={{ borderRadius: '12px', fontSize: '0.75rem' }}>
                Asegúrate de que la nueva contraseña sea segura y diferente a las anteriores.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button onClick={() => setOpenPasswordModal(false)} sx={{ color: '#64748b', fontWeight: 700 }}>Cancelar</Button>
            <Button 
              onClick={handleUpdatePassword} 
              variant="contained" 
              sx={{ bgcolor: '#124a70', borderRadius: '12px', px: 3, fontWeight: 800 }}
            >
              Guardar Cambios
            </Button>
          </DialogActions>
        </Dialog>
      </>
    </ProtectedRoute>
  );
}