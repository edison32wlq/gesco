import { useState, useEffect, useMemo } from "react";
import { 
  Paper, TextField, Typography, Button, Stack, Table, 
  TableBody, TableCell, TableHead, TableRow, IconButton, 
  Box, TableContainer, Alert, Chip, Avatar, Fade, Tooltip,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  MenuItem
} from "@mui/material";

// ICONOS
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import StarsIcon from '@mui/icons-material/Stars';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EventNoteIcon from '@mui/icons-material/EventNote'; // Icono nuevo para fecha

interface Vendedor {
  nombre: string;
  fechaAlta: string;
  bloqueado: boolean; 
}

export default function SellersPage() {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");

  // ESTADOS DE FILTRO
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("nombre"); 
  const [filtroFecha, setFiltroFecha] = useState(""); // <-- NUEVO: Filtro por día/mes

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [indexAEliminar, setIndexAEliminar] = useState<number | null>(null);

  const cargarDatos = () => {
    let v_guardados = JSON.parse(localStorage.getItem("vendedores_pro") || "[]");
    const r_guardados = JSON.parse(localStorage.getItem("registros") || "[]");

    if (v_guardados.length === 0) {
      v_guardados = [{ 
        nombre: "Asesor Comercial", 
        fechaAlta: new Date().toLocaleDateString(),
        bloqueado: false 
      }];
      actualizarVendedores(v_guardados);
    }
    setVendedores(v_guardados);
    setRegistros(r_guardados);
  };

  useEffect(() => { cargarDatos(); }, []);

  const actualizarVendedores = (nuevos: Vendedor[]) => {
    setVendedores(nuevos);
    localStorage.setItem("vendedores_pro", JSON.stringify(nuevos));
    const nombresActivos = nuevos.filter(v => !v.bloqueado).map(v => v.nombre);
    localStorage.setItem("vendedores", JSON.stringify(nombresActivos));
  };

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO POR TIEMPO ---
  const obtenerVentas = (nombre: string) => {
    return registros.filter(reg => {
      const coincideVendedor = reg.vendedor === nombre;
      // Si hay fecha seleccionada, filtra por ella; si no, cuenta todo
      const coincideFecha = filtroFecha === "" || reg.fechaFiltro === filtroFecha;
      return coincideVendedor && coincideFecha;
    }).length;
  };

  const vendedoresFiltrados = useMemo(() => {
    let resultado = vendedores.filter(v => 
      v.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    return resultado.sort((a, b) => {
      if (orden === "ventas") return obtenerVentas(b.nombre) - obtenerVentas(a.nombre);
      if (orden === "estado") return Number(a.bloqueado) - Number(b.bloqueado);
      return a.nombre.localeCompare(b.nombre);
    });
  }, [vendedores, busqueda, orden, registros, filtroFecha]);

  const filtrosActivos = busqueda !== "" || orden !== "nombre" || filtroFecha !== "";

  const limpiarFiltros = () => {
    setBusqueda("");
    setOrden("nombre");
    setFiltroFecha("");
  };

  const agregarVendedor = () => {
    setError(null);
    const nombreTrim = nuevoNombre.trim();
    if (!nombreTrim) { setError("El nombre es obligatorio."); return; }
    if (vendedores.some(v => v.nombre.toLowerCase() === nombreTrim.toLowerCase())) {
      setError("Este asesor ya existe."); return;
    }
    const nuevos = [...vendedores, { 
        nombre: nombreTrim, 
        fechaAlta: new Date().toLocaleDateString(), 
        bloqueado: false 
    }];
    actualizarVendedores(nuevos);
    setNuevoNombre("");
  };

  const handleOpenDelete = (index: number) => {
    setIndexAEliminar(index);
    setOpenDeleteDialog(true);
  };

  const confirmarEliminacion = () => {
    if (indexAEliminar !== null) {
      const nuevos = vendedores.filter((_, i) => i !== indexAEliminar);
      actualizarVendedores(nuevos);
      setOpenDeleteDialog(false);
      setIndexAEliminar(null);
    }
  };

  const iniciarEdicion = (index: number, nombre: string) => {
    setEditandoIndex(index);
    setNombreEditado(nombre);
  };

  const guardarEdicion = (index: number) => {
    if (!nombreEditado.trim()) return;
    const nuevos = [...vendedores];
    nuevos[index].nombre = nombreEditado.trim();
    actualizarVendedores(nuevos);
    setEditandoIndex(null);
  };

  const toggleBloqueo = (index: number) => {
    const nuevos = [...vendedores];
    nuevos[index].bloqueado = !nuevos[index].bloqueado;
    actualizarVendedores(nuevos);
  };

  const topVendedor = [...vendedores].sort((a, b) => obtenerVentas(b.nombre) - obtenerVentas(a.nombre))[0];
  const totalVentasTop = topVendedor ? obtenerVentas(topVendedor.nombre) : 0;

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ pb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 1000, color: '#124a70', mb: 4, letterSpacing: '-1.5px' }}>
          Panel de <span style={{ color: '#80bc71' }}>Asesores Corporativos</span>
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
          {/* CARD TOP SELLER */}
          <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: "24px", background: "linear-gradient(135deg, #124a70 0%, #1d6ea5 100%)", color: "white", position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 2 }}>
            <StarsIcon sx={{ position: 'absolute', right: -10, top: -10, fontSize: 120, opacity: 0.1 }} />
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)', border: '2px solid #80bc71' }}>
              <LeaderboardIcon sx={{ color: '#80bc71' }} />
            </Avatar>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>{filtroFecha ? `Líder del día` : `Líder Actual`}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>{topVendedor && totalVentasTop > 0 ? topVendedor.nombre : "Sin datos"}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>{totalVentasTop} registros</Typography>
            </Box>
          </Paper>

          {/* FORMULARIO AGREGAR */}
          <Paper elevation={0} sx={{ flex: 1.5, p: 3, borderRadius: "24px", bgcolor: "white", border: "1px solid #e2e8f0", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack direction="row" spacing={2}>
              <TextField fullWidth label="Nuevo Asesor" variant="filled" InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }} value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && agregarVendedor()} />
              <Button variant="contained" onClick={agregarVendedor} sx={{ borderRadius: '12px', px: 4, fontWeight: 800, bgcolor: '#80bc71', '&:hover': { bgcolor: '#6da35f' } }}>Registrar</Button>
            </Stack>
            {error && <Alert severity="error" sx={{ mt: 1, borderRadius: '10px' }}>{error}</Alert>}
          </Paper>
        </Box>

        {/* BARRA DE FILTROS ACTUALIZADA */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems="center">
          <Paper elevation={0} sx={{ flex: 1.5, p: 1, px: 2, borderRadius: "16px", border: "1px solid #e2e8f0", display: 'flex', alignItems: 'center', width: '100%' }}>
            <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
            <TextField 
              placeholder="Nombre..." 
              variant="standard" 
              fullWidth 
              InputProps={{ disableUnderline: true }}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Paper>

          {/* NUEVO FILTRO DE FECHA (DÍA/MES) */}
          <Paper elevation={0} sx={{ flex: 1, p: 1, px: 2, borderRadius: "16px", border: "1px solid #e2e8f0", display: 'flex', alignItems: 'center', width: '100%' }}>
            <EventNoteIcon sx={{ color: '#124a70', mr: 1 }} />
            <TextField 
              type="date"
              label="Ver ventas del día" 
              variant="standard" 
              fullWidth 
              InputLabelProps={{ shrink: true }}
              InputProps={{ disableUnderline: true }}
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </Paper>

          <Paper elevation={0} sx={{ flex: 1, p: 1, px: 2, borderRadius: "16px", border: "1px solid #e2e8f0", display: 'flex', alignItems: 'center', width: '100%' }}>
            <SortIcon sx={{ color: '#124a70', mr: 1 }} />
            <TextField 
              select 
              label="Ordenar" 
              variant="standard" 
              fullWidth 
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              InputProps={{ disableUnderline: true }}
            >
              <MenuItem value="nombre">Alfabeto (A-Z)</MenuItem>
              <MenuItem value="ventas">Ventas (Rango seleccionado)</MenuItem>
              <MenuItem value="estado">Estado (Activos primero)</MenuItem>
            </TextField>
          </Paper>

          <Fade in={filtrosActivos}>
            <Button
              onClick={limpiarFiltros}
              variant="outlined"
              startIcon={<RestartAltIcon />}
              sx={{ 
                height: '56px',
                borderRadius: '16px', 
                textTransform: 'none', 
                fontWeight: 700,
                px: 3,
                color: '#64748b',
                borderColor: '#e2e8f0',
                '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' },
                whiteSpace: 'nowrap'
              }}
            >
              Limpiar
            </Button>
          </Fade>
        </Stack>

        <TableContainer component={Paper} sx={{ borderRadius: "24px", border: "1px solid #e2e8f0", overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>IDENTIDAD</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>VENTAS {filtroFecha ? `(${filtroFecha})` : `TOTALES`}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>ESTADO</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>ACCIONES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendedoresFiltrados.map((v) => {
                const realIndex = vendedores.findIndex(vend => vend.nombre === v.nombre);
                const estaEditando = editandoIndex === realIndex;
                const ventas = obtenerVentas(v.nombre);

                let chipLabel = "";
                let chipColor: "error" | "success" | "default" = "default";
                if (v.bloqueado) { chipLabel = "DE BAJA"; chipColor = "error"; } 
                else if (ventas > 0) { chipLabel = "ACTIVO"; chipColor = "success"; } 
                else { chipLabel = "SIN ACTIVIDAD"; chipColor = "default"; }

                return (
                  <TableRow key={v.nombre} sx={{ "&:hover": { bgcolor: "#f1f5f9" }, opacity: v.bloqueado ? 0.6 : 1, transition: '0.3s' }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: v.bloqueado ? '#94a3b8' : '#1d6ea5', width: 38, height: 38, fontWeight: 800 }}>
                          {v.nombre.charAt(0).toUpperCase()}
                        </Avatar>
                        {estaEditando ? (
                          <TextField size="small" variant="standard" value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} autoFocus />
                        ) : (
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: v.bloqueado ? 'text.secondary' : 'text.primary', textDecoration: v.bloqueado ? 'line-through' : 'none' }}>
                              {v.nombre}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Desde: {v.fechaAlta}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 800, color: ventas > 0 ? '#1d6ea5' : '#94a3b8' }}>{ventas}</Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip label={chipLabel} color={chipColor} size="small" sx={{ fontWeight: 900, borderRadius: '6px', fontSize: '0.65rem', px: 1 }} />
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {estaEditando ? (
                          <>
                            <IconButton onClick={() => guardarEdicion(realIndex)} sx={{ color: '#80bc71' }}><SaveIcon /></IconButton>
                            <IconButton onClick={() => setEditandoIndex(null)} sx={{ color: '#64748b' }}><CancelIcon /></IconButton>
                          </>
                        ) : (
                          <>
                            <Tooltip title={v.bloqueado ? "Reactivar" : "Dar de Baja"}>
                              <IconButton onClick={() => toggleBloqueo(realIndex)} sx={{ color: v.bloqueado ? '#80bc71' : '#f59e0b' }}>
                                {v.bloqueado ? <CheckCircleIcon /> : <BlockIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar"><IconButton onClick={() => iniciarEdicion(realIndex, v.nombre)} color="primary"><EditIcon fontSize="small" /></IconButton></Tooltip>
                            <Tooltip title="Eliminar"><IconButton onClick={() => handleOpenDelete(realIndex)} sx={{ color: '#ef4444' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* DIALOG DE CONFIRMACIÓN */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
          <DialogTitle sx={{ color: '#ef4444', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberIcon fontSize="large" /> ¿Confirmar Eliminación?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Estás a punto de borrar a <strong>{indexAEliminar !== null && vendedores[indexAEliminar]?.nombre}</strong>.
              <br /><br />
              Esta acción es irreversible y podría afectar el historial.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenDeleteDialog(false)} sx={{ color: '#64748b', fontWeight: 700 }}>Cancelar</Button>
            <Button onClick={confirmarEliminacion} variant="contained" sx={{ bgcolor: '#ef4444', borderRadius: '10px', px: 3, fontWeight: 700 }}>Sí, Eliminar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}