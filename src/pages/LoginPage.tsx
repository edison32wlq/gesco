import { useState } from "react";
import { 
  Paper, TextField, Typography, Button, Box, Stack, 
  InputAdornment, IconButton, Fade, Divider, Alert
} from "@mui/material";
import { 
  Visibility, VisibilityOff, LockOutlined, PersonOutline 
} from "@mui/icons-material";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext"; 
import logoUte from "../assets/logo-ute-wp.png";
import gescoLogo from "../assets/gesco-logo.png";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [credentials, setCredentials] = useState({ user: "", pass: "" });
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    const { user, pass } = credentials;

    // LÓGICA DE MULTI-CUENTAS SEGÚN ROL
    if (user === "god_gesco" && pass === "super2026") {
      login({ username: "Director General", rol: "superadmin" });
      navigate("/"); 
    } 
    else if (user === "admin_ute" && pass === "ute2026") {
      login({ username: "Coord. Admisiones", rol: "admin" });
      navigate("/");
    } 
    // NUEVA CUENTA PARA EL ROL DE ASESOR
    else if (user === "asesor_test" && pass === "asesor2026") {
      login({ username: "Asesor Comercial", rol: "asesor" });
      navigate("/");
    }
    // CUENTA DE USUARIO ESTÁNDAR (Opcional)
    else if (user === "user_test" && pass === "user2026") {
      login({ username: "Usuario Invitado", rol: "usuario" });
      navigate("/");
    } 
    else {
      setError(true);
    }
  };

  return (
    <Fade in={true} timeout={1000}>
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        p: 2 
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, md: 6 }, 
            width: '100%', 
            maxWidth: 450,
            borderRadius: "32px", 
            textAlign: 'center',
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 40px 100px rgba(18, 74, 112, 0.15)"
          }}
        >
          {/* LOGOS */}
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 5 }}>
            <img src={gescoLogo} alt="GESCO" style={{ height: 45 }} />
            <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 2, height: 30, my: 'auto' }} />
            <img src={logoUte} alt="UTE" style={{ height: 35, opacity: 0.8 }} />
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 1000, color: '#124a70', letterSpacing: '-1.5px', mb: 1 }}>
            Panel de <span style={{ color: '#1d6ea5' }}>Control</span>
          </Typography>
          
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, fontWeight: 500 }}>
            Ingrese sus credenciales corporativas para acceder.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontWeight: 600 }}>
              Acceso denegado. Revise sus datos.
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <Stack spacing={3}>
              <TextField 
                label="Usuario / ID" 
                fullWidth 
                variant="filled"
                required
                InputProps={{ 
                  disableUnderline: true, 
                  sx: { borderRadius: '16px' },
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
                fullWidth 
                variant="filled"
                required
                InputProps={{ 
                  disableUnderline: true, 
                  sx: { borderRadius: '16px' },
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
                type="submit"
                variant="contained" 
                size="large" 
                sx={{ 
                  py: 2, 
                  borderRadius: "16px", 
                  fontWeight: 900,
                  fontSize: '1rem',
                  textTransform: 'none',
                  background: "linear-gradient(135deg, #1d6ea5 0%, #2a88ca 40%, #80bc71 100%)",
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    filter: "brightness(1.05)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Acceder al Sistema
              </Button>
            </Stack>
          </Box>

          <Box sx={{ mt: 5, pt: 2, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <VerifiedUserIcon sx={{ fontSize: 16, color: '#80bc71' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              SISTEMA PROTEGIDO POR GESCO CORPORATIVO
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
}