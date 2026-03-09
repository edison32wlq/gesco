import { useState, useEffect } from "react";
import { 
  Paper, TextField, Typography, Button, Box, Stack, 
  InputAdornment, IconButton, Fade, Divider, Alert
} from "@mui/material";
import { 
  Visibility, VisibilityOff, LockOutlined, PersonOutline 
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom"; 
import { useAuth, type RolOficial } from "../context/AuthContext"; 
import logoUte from "../assets/logo-ute-wp.png";
import gescoLogo from "../assets/gesco-logo.png";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState({ show: false, msg: "" });
  const [credentials, setCredentials] = useState({ user: "", pass: "" });
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Si el usuario ya está logueado, lo mandamos al inicio automáticamente
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError({ show: false, msg: "" });

    const { user, pass } = credentials;

    // --- 1. CUENTA SUPERADMIN MAESTRA ---
    if (user === "god_gesco" && pass === "super2026") {
      login({ 
        username: "Director General", 
        email: "admin@gesco.com", // Agregamos email para cumplir con la interfaz
        rol: "superadmin" 
      });
      const origin = location.state?.from?.pathname || "/";
      navigate(origin, { replace: true });
      return;
    }

    // --- 2. BÚSQUEDA EN LOCALSTORAGE ---
    const usuariosRaw = localStorage.getItem("usuarios_sistema");
    const usuariosGuardados: any[] = usuariosRaw ? JSON.parse(usuariosRaw) : [];

    const usuarioEncontrado = usuariosGuardados.find(u => 
      (u.email === user || u.username === user) && u.password === pass
    );

    if (usuarioEncontrado) {
      if (usuarioEncontrado.estado === 'BLOQUEADO') {
        setError({ show: true, msg: "Su cuenta ha sido inhabilitada temporalmente." });
        return;
      }

      const rolesValidos: RolOficial[] = ["superadmin", "ute", "usuario", "asesor"];
      const rolFinal: RolOficial = rolesValidos.includes(usuarioEncontrado.rol) 
        ? usuarioEncontrado.rol 
        : "usuario";

      // Login con la estructura completa requerida por el Contexto
      login({ 
        id: usuarioEncontrado.id,
        username: usuarioEncontrado.username, 
        email: usuarioEncontrado.email || user, // Aseguramos que el email exista
        rol: rolFinal 
      });

      // Redirigir a donde intentaba ir o al inicio
      const origin = location.state?.from?.pathname || "/";
      navigate(origin, { replace: true });
    } else {
      setError({ show: true, msg: "Credenciales incorrectas o cuenta inexistente." });
    }
  };

  return (
    <Fade in={true} timeout={1000}>
      <Box sx={{ 
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", p: 2 
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 6 }, width: '100%', maxWidth: 450, borderRadius: "32px", 
            textAlign: 'center', background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 40px 100px rgba(18, 74, 112, 0.15)"
          }}
        >
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 5 }}>
            <img src={gescoLogo} alt="GESCO" style={{ height: 45 }} />
            <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 2, height: 30, my: 'auto' }} />
            <img src={logoUte} alt="UTE" style={{ height: 35, opacity: 0.8 }} />
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 1000, color: '#124a70', letterSpacing: '-1.5px', mb: 1 }}>
            Panel de <span style={{ color: '#1d6ea5' }}>Control</span>
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>
            Ingrese sus credenciales para continuar
          </Typography>

          {error.show && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontWeight: 600 }}>
              {error.msg}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <Stack spacing={3}>
              <TextField 
                label="Usuario o Correo" 
                fullWidth variant="filled" required
                InputProps={{ 
                  disableUnderline: true, sx: { borderRadius: '16px' },
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline sx={{ color: '#1d6ea5' }} />
                    </InputAdornment>
                  ),
                }}
                value={credentials.user}
                onChange={(e) => setCredentials({...credentials, user: e.target.value})}
              />

              <TextField 
                label="Contraseña" 
                type={showPassword ? "text" : "password"}
                fullWidth variant="filled" required
                InputProps={{ 
                  disableUnderline: true, sx: { borderRadius: '16px' },
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: '#1d6ea5' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                value={credentials.pass}
                onChange={(e) => setCredentials({...credentials, pass: e.target.value})}
              />

              <Button 
                type="submit" variant="contained" size="large" 
                sx={{ 
                  py: 2, borderRadius: "16px", fontWeight: 900, textTransform: 'none',
                  background: "linear-gradient(135deg, #1d6ea5 0%, #2a88ca 40%, #80bc71 100%)",
                  boxShadow: "0 10px 20px rgba(29, 110, 165, 0.2)",
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: "0 15px 25px rgba(29, 110, 165, 0.3)" }, 
                  transition: "all 0.3s"
                }}
              >
                Acceder al Sistema
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
}