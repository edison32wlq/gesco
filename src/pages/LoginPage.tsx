import { useState, useEffect } from "react";
import { 
  Paper, TextField, Typography, Button, Box, Stack, 
  InputAdornment, IconButton, Fade, Divider, Alert, CircularProgress
} from "@mui/material";
import { 
  Visibility, VisibilityOff, LockOutlined, PersonOutline 
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom"; 
import { useAuth, type RolOficial } from "../context/AuthContext"; 

// IMPORTACIONES DE FIREBASE
import { auth, db } from "../firebaseConfig"; 
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// ASSETS
import logoUte from "../assets/logo-ute-wp.png";
import gescoLogo from "../assets/gesco-logo.png";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({ show: false, msg: "" });
    setLoading(true);

    const { user, pass } = credentials;

    // --- 1. CUENTA SUPERADMIN MAESTRA (ACCESO DE EMERGENCIA) ---
    if (user === "god_gesco" && pass === "super2026") {
      login({ 
        username: "Director General", 
        email: "admin@gesco.com", 
        rol: "superadmin" 
      });
      const origin = location.state?.from?.pathname || "/";
      navigate(origin, { replace: true });
      setLoading(false);
      return;
    }

    try {
      // --- 2. LOGIN CON FIREBASE AUTH (SEGURIDAD DE GOOGLE) ---
      const userCredential = await signInWithEmailAndPassword(auth, user, pass);
      const userFirebase = userCredential.user;

      // --- 3. BÚSQUEDA DE PERFIL Y ROL EN FIRESTORE ---
      const docRef = doc(db, "usuarios", userFirebase.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Verificamos si la cuenta no ha sido bloqueada en la base de datos
        if (userData.estado === 'BLOQUEADO') {
          setError({ show: true, msg: "Su cuenta ha sido inhabilitada temporalmente." });
          setLoading(false);
          return;
        }

        const rolesValidos: RolOficial[] = ["superadmin", "administrador", "usuario", "asesor"];
        const rolFinal: RolOficial = rolesValidos.includes(userData.rol) 
          ? userData.rol 
          : "usuario";

        // Inyectamos los datos reales de la nube en tu sistema
        login({ 
          id: userFirebase.uid,
          username: userData.username || userFirebase.email?.split('@')[0], 
          email: userFirebase.email || "", 
          rol: rolFinal 
        });

        // Redirigir a donde intentaba ir o al inicio
        const origin = location.state?.from?.pathname || "/";
        navigate(origin, { replace: true });
      } else {
        setError({ show: true, msg: "El usuario existe pero no tiene perfil en la base de datos." });
      }
    } catch (err: any) {
      console.error("Error en login:", err.code);
      let mensajeError = "Credenciales incorrectas o cuenta inexistente.";
      
      // Personalizamos errores comunes de Firebase
      if (err.code === "auth/invalid-credential") {
        mensajeError = "Correo o contraseña incorrectos.";
      } else if (err.code === "auth/user-not-found") {
        mensajeError = "El usuario no está registrado.";
      } else if (err.code === "auth/wrong-password") {
        mensajeError = "La contraseña es incorrecta.";
      } else if (err.code === "auth/too-many-requests") {
        mensajeError = "Demasiados intentos. Intenta más tarde.";
      }

      setError({ show: true, msg: mensajeError });
    } finally {
      setLoading(false);
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
                label="Correo Institucional" 
                fullWidth variant="filled" required
                disabled={loading}
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
                disabled={loading}
                InputProps={{ 
                  disableUnderline: true, sx: { borderRadius: '16px' },
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: '#1d6ea5' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={loading}>
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
                disabled={loading}
                sx={{ 
                  py: 2, borderRadius: "16px", fontWeight: 900, textTransform: 'none',
                  background: "linear-gradient(135deg, #1d6ea5 0%, #2a88ca 40%, #80bc71 100%)",
                  boxShadow: "0 10px 20px rgba(29, 110, 165, 0.2)",
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: "0 15px 25px rgba(29, 110, 165, 0.3)" }, 
                  transition: "all 0.3s",
                  minHeight: "64px"
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Acceder al Sistema"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
}