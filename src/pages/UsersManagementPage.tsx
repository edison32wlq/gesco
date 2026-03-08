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

// 1. DEFINICIÓN DE ROLES OFICIALES
type RolOficial = 'superadmin' | 'ute' | 'usuario' | 'asesor';

interface Usuario {
  id: string | number;
  username: string;
  email: string;
  password?: string;
  rol: RolOficial;
  estado: 'ACTIVO' | 'BLOQUEADO';
}

export default function UsersManagementPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  
  // Estado para nuevo usuario con roles oficiales
  const [newUser, setNewUser] = useState<Omit<Usuario, 'id' | 'estado'>>({
    username: '',
    email: '',
    password: '',
    rol: 'usuario' // Valor por defecto
  });

  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [mensaje, setMensaje] = useState({ 
    open: false, 
    texto: "", 
    color: "success" as "success" | "error" 
  });

  // CARGA INICIAL
  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem("usuarios_sistema") || "[]");
    setUsuarios(savedUsers);
  }, []);

  const actualizarLocalStorage = (listaActualizada: Usuario[]) => {
    setUsuarios(listaActualizada);
    localStorage.setItem("usuarios_sistema", JSON.stringify(listaActualizada));
  };

  // CREAR USUARIO
  const handleCreateUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setMensaje({ open: true, texto: "Todos los campos son obligatorios", color: "error" });
      return;
    }

    const nuevoUsuario: Usuario = {
      ...newUser,
      id: Date.now(),
      estado: 'ACTIVO'
    };

    const listaActualizada = [...usuarios, nuevoUsuario];
    actualizarLocalStorage(listaActualizada);
    setOpenCreate(false);
    
    setNewUser({ username: '', email: '', password: '', rol: 'usuario' });
    setMensaje({ open: true, texto: "Usuario creado exitosamente", color: "success" });
  };

  // BLOQUEAR / ACTIVAR
  const toggleEstado = (id: string | number) => {
    const nuevos: Usuario[] = usuarios.map(u => 
      u.id === id ? { ...u, estado: u.estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO' } : u
    );
    actualizarLocalStorage(nuevos);
    setMensaje({ open: true, texto: "Estado de cuenta actualizado", color: "success" });
  };

  // GUARDAR EDICIÓN DE ROL
  const handleSaveRol = () => {
    if (selectedUser) {
      const nuevos: Usuario[] = usuarios.map(u => 
        u.id === selectedUser.id ? (selectedUser as Usuario) : u
      );
      actualizarLocalStorage(nuevos);
      setOpenEdit(false);
      setMensaje({ open: true, texto: "Permisos actualizados", color: "success" });
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ pb: 5 }}>
        {/* CABECERA ESTILO CORPORATIVO */}
        <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: "24px", background: "linear-gradient(45deg, #124a70 30%, #1d6ea5 90%)", color: "white" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <ShieldIcon sx={{ fontSize: 40, color: '#80bc71' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-1px' }}>Gestión de Cuentas</Typography>
                <Typography sx={{ opacity: 0.8, fontWeight: 500 }}>Control de acceso y niveles de seguridad</Typography>
              </Box>
            </Stack>
            
            <Button 
              variant="contained" 
              startIcon={<PersonAddIcon />}
              onClick={() => setOpenCreate(true)}
              sx={{ bgcolor: '#80bc71', '&:hover': { bgcolor: '#6ea35f' }, borderRadius: '12px', fontWeight: 800, textTransform: 'none', px: 3, py: 1.5 }}
            >
              Nuevo Usuario
            </Button>
          </Stack>
        </Paper>

        {/* TABLA PRINCIPAL */}
        <TableContainer component={Paper} sx={{ borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>IDENTIDAD</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>NIVEL DE ACCESO</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>ESTADO</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b' }}>ACCIONES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((user) => (
                <TableRow key={user.id} sx={{ 
                  opacity: user.estado === 'BLOQUEADO' ? 0.6 : 1,
                  '&:hover': { bgcolor: '#f1f5f9' }, transition: '0.2s'
                }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: '#1d6ea5', fontWeight: 700, width: 40, height: 40 }}>{user.username.charAt(0)}</Avatar>
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
                      sx={{ fontWeight: 800, bgcolor: '#e2e8f0', color: '#124a70', px: 1 }} 
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
                  <TableCell align="right">
                    <Tooltip title="Ajustar Rol">
                      <IconButton onClick={() => { setSelectedUser({...user}); setOpenEdit(true); }} sx={{ color: '#1d6ea5' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={user.estado === 'ACTIVO' ? "Inhabilitar" : "Reactivar"}>
                      <IconButton onClick={() => toggleEstado(user.id)} sx={{ color: user.estado === 'ACTIVO' ? '#ef4444' : '#80bc71' }}>
                        {user.estado === 'ACTIVO' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                    <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No hay usuarios adicionales registrados.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* MODAL CREACIÓN */}
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 900, color: '#124a70', textAlign: 'center' }}>Nuevo Registro de Acceso</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField fullWidth label="Usuario" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} variant="outlined" />
              <TextField fullWidth label="Email corporativo" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} />
              <TextField 
                fullWidth type="password" label="Contraseña" value={newUser.password} 
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                InputProps={{ startAdornment: <InputAdornment position="start"><KeyIcon sx={{ color: '#1d6ea5' }} /></InputAdornment> }}
              />
              <TextField select fullWidth label="Rol Asignado" value={newUser.rol} onChange={(e) => setNewUser({...newUser, rol: e.target.value as RolOficial})}>
                <MenuItem value="usuario">USUARIO</MenuItem>
                <MenuItem value="asesor">ASESOR</MenuItem>
                <MenuItem value="ute">UTE</MenuItem>
                <MenuItem value="superadmin">SUPERADMIN</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
            <Button onClick={() => setOpenCreate(false)} sx={{ color: '#64748b', fontWeight: 700 }}>Cancelar</Button>
            <Button onClick={handleCreateUser} variant="contained" sx={{ bgcolor: '#124a70', borderRadius: '12px', px: 4, fontWeight: 800 }}>Crear Cuenta</Button>
          </DialogActions>
        </Dialog>

        {/* MODAL EDICIÓN DE ROL */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px' } }}>
          <DialogTitle sx={{ fontWeight: 900 }}>Actualizar Nivel de Acceso</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>Modificando permisos para: <b>{selectedUser?.username}</b></Typography>
            <TextField select fullWidth label="Rol" value={selectedUser?.rol || ''} onChange={(e) => selectedUser && setSelectedUser({...selectedUser, rol: e.target.value as RolOficial})}>
              <MenuItem value="usuario">USUARIO</MenuItem>
              <MenuItem value="asesor">ASESOR</MenuItem>
              <MenuItem value="ute">UTE</MenuItem>
              <MenuItem value="superadmin">SUPERADMIN</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenEdit(false)}>Cerrar</Button>
            <Button onClick={handleSaveRol} variant="contained" sx={{ bgcolor: '#124a70', fontWeight: 800 }}>Guardar Cambios</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={mensaje.open} autoHideDuration={3000} onClose={() => setMensaje({...mensaje, open: false})}>
          <Alert severity={mensaje.color} variant="filled" sx={{ width: '100%', borderRadius: '12px', fontWeight: 700 }}>{mensaje.texto}</Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
}