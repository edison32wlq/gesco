import { useState, useEffect, useMemo } from "react";
import { 
  Paper, TextField, Typography, Stack, Table, 
  TableBody, TableCell, TableHead, TableRow, 
  Box, TableContainer, Chip, Avatar, Fade,
  MenuItem, Button
} from "@mui/material";

// ICONOS
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import StarsIcon from '@mui/icons-material/Stars';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import EventNoteIcon from '@mui/icons-material/EventNote';

export default function SellersPage() {
  // Ahora manejamos los usuarios del sistema que tengan rol 'asesor'
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);

  // ESTADOS DE FILTRO
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("ventas"); 
  const [filtroFecha, setFiltroFecha] = useState("");

  const cargarDatos = () => {
    // 1. Obtenemos las cuentas generales del sistema
    const usuariosSistema = JSON.parse(localStorage.getItem("usuarios_sistema") || "[]");
    // 2. Filtramos para mostrar solo a los que son 'asesor'
    const soloAsesores = usuariosSistema.filter((u: any) => u.rol === "asesor");
    
    const r_guardados = JSON.parse(localStorage.getItem("registros") || "[]");

    setVendedores(soloAsesores);
    setRegistros(r_guardados);
  };

  useEffect(() => { cargarDatos(); }, []);

  // --- LÓGICA DE VENTAS ---
  const obtenerVentas = (nombre: string) => {
    return registros.filter(reg => {
      const coincideVendedor = reg.vendedor === nombre;
      const coincideFecha = filtroFecha === "" || reg.fechaFiltro === filtroFecha;
      return coincideVendedor && coincideFecha;
    }).length;
  };

  const vendedoresFiltrados = useMemo(() => {
    let resultado = vendedores.filter(v => 
      v.username.toLowerCase().includes(busqueda.toLowerCase())
    );

    return resultado.sort((a, b) => {
      if (orden === "ventas") return obtenerVentas(b.username) - obtenerVentas(a.username);
      if (orden === "estado") {
        // Ordenar por estado: ACTIVO primero
        return a.estado === "ACTIVO" ? -1 : 1;
      }
      return a.username.localeCompare(b.username);
    });
  }, [vendedores, busqueda, orden, registros, filtroFecha]);

  const filtrosActivos = busqueda !== "" || orden !== "nombre" || filtroFecha !== "";

  const limpiarFiltros = () => {
    setBusqueda("");
    setOrden("nombre");
    setFiltroFecha("");
  };

  // Lógica para el Top Seller (basado en los filtros actuales)
  const topVendedor = useMemo(() => {
    if (vendedores.length === 0) return null;
    return [...vendedores].sort((a, b) => obtenerVentas(b.username) - obtenerVentas(a.username))[0];
  }, [vendedores, registros, filtroFecha]);

  const totalVentasTop = topVendedor ? obtenerVentas(topVendedor.username) : 0;

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ pb: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 1000, color: '#124a70', mb: 4, letterSpacing: '-1.5px' }}>
          Panel de <span style={{ color: '#80bc71' }}>Asesores Corporativos</span>
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          {/* CARD TOP SELLER */}
          <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: "24px", background: "linear-gradient(135deg, #124a70 0%, #1d6ea5 100%)", color: "white", position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 2 }}>
            <StarsIcon sx={{ position: 'absolute', right: -10, top: -10, fontSize: 120, opacity: 0.1 }} />
            <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)', border: '2px solid #80bc71' }}>
              <LeaderboardIcon sx={{ color: '#80bc71' }} />
            </Avatar>
            <Box>
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>
                {filtroFecha ? `Líder del día (${filtroFecha})` : `Líder Actual`}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {totalVentasTop > 0 ? topVendedor?.username : "Sin registros"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>{totalVentasTop} ventas en este periodo</Typography>
            </Box>
          </Paper>

          {/* ESPACIO INFORMATIVO (Reemplaza al formulario de creación) */}
          <Paper elevation={0} sx={{ flex: 1.5, p: 3, borderRadius: "24px", bgcolor: "#f8fafc", border: "1px dashed #cbd5e1", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              La gestión de nombres y estados se realiza desde el <b>Panel de Configuración de Cuentas</b>.
            </Typography>
          </Paper>
        </Box>

        {/* BARRA DE FILTROS */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems="center">
          <Paper elevation={0} sx={{ flex: 1.5, p: 1, px: 2, borderRadius: "16px", border: "1px solid #e2e8f0", display: 'flex', alignItems: 'center', width: '100%' }}>
            <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
            <TextField 
              placeholder="Buscar por nombre..." 
              variant="standard" 
              fullWidth 
              InputProps={{ disableUnderline: true }}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Paper>

          <Paper elevation={0} sx={{ flex: 1, p: 1, px: 2, borderRadius: "16px", border: "1px solid #e2e8f0", display: 'flex', alignItems: 'center', width: '100%' }}>
            <EventNoteIcon sx={{ color: '#124a70', mr: 1 }} />
            <TextField 
              type="date"
              label="Filtrar por fecha" 
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
              label="Ordenar por" 
              variant="standard" 
              fullWidth 
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              InputProps={{ disableUnderline: true }}
            >
              <MenuItem value="ventas">Mayor número de ventas</MenuItem>
              <MenuItem value="nombre">Orden Alfabético</MenuItem>
              <MenuItem value="estado">Estado de la cuenta</MenuItem>
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
                fontWeight: 700,
                color: '#64748b',
                borderColor: '#e2e8f0',
                '&:hover': { bgcolor: '#f1f5f9' }
              }}
            >
              Limpiar
            </Button>
          </Fade>
        </Stack>

        <TableContainer component={Paper} sx={{ borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>IDENTIDAD</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>VENTAS {filtroFecha ? `(${filtroFecha})` : `TOTALES`}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>ESTADO SISTEMA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendedoresFiltrados.map((v) => {
                const ventas = obtenerVentas(v.username);
                const esBloqueado = v.estado === "BLOQUEADO";

                return (
                  <TableRow key={v.id} sx={{ "&:hover": { bgcolor: "#f1f5f9" }, opacity: esBloqueado ? 0.6 : 1 }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: esBloqueado ? '#94a3b8' : '#1d6ea5', width: 38, height: 38, fontWeight: 800 }}>
                          {v.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, textDecoration: esBloqueado ? 'line-through' : 'none' }}>
                            {v.username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{v.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 800, color: ventas > 0 ? '#1d6ea5' : '#94a3b8', fontSize: '1.1rem' }}>
                        {ventas}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip 
                        label={v.estado} 
                        color={esBloqueado ? "error" : "success"} 
                        size="small" 
                        sx={{ fontWeight: 900, borderRadius: '6px', fontSize: '0.65rem' }} 
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {vendedoresFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No se encontraron asesores registrados.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Fade>
  );
}