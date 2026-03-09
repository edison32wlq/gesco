import { useState, useEffect } from "react";
import { 
  Paper, Typography, Box, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  Chip, Stack, Button, Tooltip, Avatar, Fade, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Alert, Snackbar, InputAdornment
} from "@mui/material";

// ICONOS
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import ShieldIcon from '@mui/icons-material/Shield';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import KeyIcon from '@mui/icons-material/Key';

// 1. DEFINICIÓN DE TIPOS
type RolOficial = 'superadmin' | 'ute' | 'usuario' | 'asesor';

interface Usuario {
  id: string | number;
  username: string;
  email: string;
  password?: string;
  rol: RolOficial;
  estado: 'ACTIVO' | 'BLOQUEADO';
  fechaAlta: string;
}

export default function UsersManagementPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  
  // Estado para creación de usuario
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    rol: 'asesor' as RolOficial
  });

  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState({ 
    open: false, 
    texto: "", 
    color: "success" as "success" | "error" 
  });

  // --- PERSISTENCIA Y CARGA ---
  useEffect(() => {
    const cargarUsuarios = () => {
      const savedUsers = JSON.parse(localStorage.getItem("usuarios_sistema") || "[]");
      setUsuarios(savedUsers);
    };
    cargarUsuarios();
    
    // Sincronización entre pestañas
    window.addEventListener('storage', cargarUsuarios);
    return () => window.removeEventListener('storage', cargarUsuarios);
  }, []);

  const actualizarLocalStorage = (listaActualizada: Usuario[]) => {
    setUsuarios(listaActualizada);
    localStorage.setItem("usuarios_sistema", JSON.stringify(listaActualizada));
  };

  // --- LÓGICA DE USUARIOS ---
  const handleCreateUser = () => {
    const { username, email, password, rol } = newUser;

    if (!username.trim() || !email.trim() || !password) {
      setMensaje({ open: true, texto: "Todos los campos son obligatorios", color: "error" });
      return;
    }

    // Validar duplicados por username o email
    if (usuarios.some(u => u.username.toLowerCase() === username.toLowerCase().trim())) {
      setMensaje({ open: true, texto: "El nombre de usuario ya existe", color: "error" });
      return;
    }

    const nuevoUsuario: Usuario = {
      id: Date.now(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      rol: rol,
      estado: 'ACTIVO',
      fechaAlta: new Date().toLocaleDateString()
    };

    actualizarLocalStorage([...usuarios, nuevoUsuario]);
    setOpenCreate(false);
    setNewUser({ username: '', email: '', password: '', rol: 'asesor' });
    setMensaje({ open: true, texto: `Usuario ${nuevoUsuario.username} creado con éxito`, color: "success" });
  };

  const toggleEstado = (id: string | number) => {
    const nuevos = usuarios.map(u => 
      u.id === id ? { ...u, estado: u.estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO' } as Usuario : u
    );
    actualizarLocalStorage(nuevos);
    setMensaje({ open: true, texto: "Estado de acceso modificado", color: "success" });
  };

  const handleSaveRol = () => {
    if (selectedUser) {
      const nuevos = usuarios.map(u => u.id === selectedUser.id ? selectedUser : u);
      actualizarLocalStorage(nuevos);
      setOpenEdit(false);
      setMensaje({ open: true, texto: "Permisos actualizados correctamente", color: "success" });
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ pb: 5 }}>
        
        {/* HEADER CORPORATIVO */}
        <Paper elevation={0} sx={{ 
          p: 4, mb: 4, borderRadius: "24px", 
          background: "linear-gradient(45deg, #124a70 30%, #1d6ea5 90%)", 
          color: "white",
          boxShadow: '0 10px 20px rgba(18, 74, 112, 0.15)'
        }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <ShieldIcon sx={{ fontSize: 40, color: '#80bc71' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-1.5px' }}>Panel de Seguridad</Typography>
                <Typography sx={{ opacity: 0.9, fontWeight: 500 }}>Gestión de identidades y accesos del portal</Typography>
              </Box>
            </Stack>
            
            <Button 
              variant="contained" 
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenCreate(true)}
              sx={{ 
                bgcolor: '#80bc71', '&:hover': { bgcolor: '#6ea35f' }, 
                borderRadius: '12px', fontWeight: 800, px: 3, py: 1.5,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textTransform: 'none'
              }}
            >
              Nuevo Usuario
            </Button>
          </Stack>
        </Paper>

        {/* TABLA DE USUARIOS */}
        <TableContainer component={Paper} sx={{ borderRadius: "20px", border: "1px solid rgba(0,0,0,0.05)", overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>PERFIL / USUARIO</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>RANGO ACCESO</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>ESTADO</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>FECHA ALTA</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b' }}>ACCIONES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                    <Typography color="text.secondary">No hay usuarios registrados en el sistema.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((user) => (
                  <TableRow key={user.id} sx={{ 
                    opacity: user.estado === 'BLOQUEADO' ? 0.6 : 1,
                    '&:hover': { bgcolor: '#f8fafc' }, transition: '0.2s'
                  }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ 
                          bgcolor: user.rol === 'superadmin' ? '#1e293b' : user.rol === 'ute' ? '#124a70' : '#1d6ea5', 
                          fontWeight: 800, fontSize: '0.9rem' 
                        }}>
                          {user.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800, color: '#1e293b' }}>{user.username}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>{user.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.rol.toUpperCase()} 
                        size="small" 
                        sx={{ 
                          fontWeight: 900, fontSize: '0.65rem',
                          bgcolor: user.rol === 'superadmin' ? '#fee2e2' : user.rol === 'ute' ? '#dcfce7' : '#e2e8f0', 
                          color: user.rol === 'superadmin' ? '#991b1b' : user.rol === 'ute' ? '#166534' : '#124a70'
                        }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: user.estado === 'ACTIVO' ? '#80bc71' : '#ef4444' }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, color: user.estado === 'ACTIVO' ? '#80bc71' : '#ef4444' }}>
                          {user.estado}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>{user.fechaAlta}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {user.rol !== 'superadmin' ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Ajustar Permisos">
                            <IconButton onClick={() => { setSelectedUser({...user}); setOpenEdit(true); }} size="small" sx={{ color: '#1d6ea5' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.estado === 'ACTIVO' ? "Bloquear acceso" : "Activar acceso"}>
                            <IconButton onClick={() => toggleEstado(user.id)} size="small" sx={{ color: user.estado === 'ACTIVO' ? '#ef4444' : '#80bc71' }}>
                              {user.estado === 'ACTIVO' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, pr: 2 }}>
                          SISTEMA
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* DIÁLOGO: CREACIÓN */}
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px' } }}>
          <DialogTitle sx={{ fontWeight: 900, color: '#124a70', textAlign: 'center', pt: 3 }}>Nuevo Registro</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField fullWidth label="Nombre de Usuario / Asesor" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} />
              <TextField fullWidth label="Email Corporativo" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
              <TextField 
                fullWidth type="password" label="Contraseña Temporal" value={newUser.password} 
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                InputProps={{ startAdornment: <InputAdornment position="start"><KeyIcon sx={{ color: '#1d6ea5' }} /></InputAdornment> }}
              />
              <TextField select fullWidth label="Asignar Rol Inicial" value={newUser.rol} onChange={(e) => setNewUser({...newUser, rol: e.target.value as RolOficial})}>
                <MenuItem value="asesor">Asesor (Ventas)</MenuItem>
                <MenuItem value="ute">Administrador UTE</MenuItem>
                <MenuItem value="usuario">Usuario Consulta</MenuItem>
              </TextField>
              <Alert severity="info" sx={{ borderRadius: '12px', fontSize: '0.8rem' }}>
                El usuario podrá cambiar su contraseña una vez que inicie sesión por primera vez.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
            <Button onClick={() => setOpenCreate(false)} sx={{ color: '#64748b', fontWeight: 700 }}>Cancelar</Button>
            <Button onClick={handleCreateUser} variant="contained" sx={{ bgcolor: '#124a70', borderRadius: '12px', px: 4, fontWeight: 800 }}>Confirmar Alta</Button>
          </DialogActions>
        </Dialog>

        {/* DIÁLOGO: EDICIÓN */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px' } }}>
          <DialogTitle sx={{ fontWeight: 900, color: '#124a70' }}>Ajustar Permisos</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', mb: 3 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>USUARIO SELECCIONADO</Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{selectedUser?.username}</Typography>
            </Box>
            <TextField select fullWidth label="Nuevo Rol de Sistema" value={selectedUser?.rol || ''} onChange={(e) => selectedUser && setSelectedUser({...selectedUser, rol: e.target.value as RolOficial})}>
              <MenuItem value="asesor">Asesor (Ventas)</MenuItem>
              <MenuItem value="ute">Administrador UTE</MenuItem>
              <MenuItem value="usuario">Usuario (Solo Consulta)</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button onClick={() => setOpenEdit(false)} sx={{ fontWeight: 700, color: '#64748b' }}>Cerrar</Button>
            <Button onClick={handleSaveRol} variant="contained" sx={{ bgcolor: '#124a70', borderRadius: '12px', px: 3, fontWeight: 800 }}>Aplicar Cambios</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={mensaje.open} autoHideDuration={4000} onClose={() => setMensaje({...mensaje, open: false})}>
          <Alert severity={mensaje.color} variant="filled" sx={{ width: '100%', borderRadius: '12px', fontWeight: 600 }}>{mensaje.texto}</Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}