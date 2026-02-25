import { useState, useEffect } from "react";
import { 
  Paper, Typography, Box, Stack, Table, 
  TableBody, TableCell, TableHead, TableRow, 
  TableContainer, Chip, Avatar, Fade
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function MySalesPage() {
  const { user } = useAuth();
  const [misRegistros, setMisRegistros] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, esteMes: 0 });

  useEffect(() => {
    const r_guardados = JSON.parse(localStorage.getItem("registros") || "[]");
    
    // Filtro por el nombre de usuario del asesor logueado
    const filtrados = r_guardados.filter((reg: any) => reg.vendedor === user?.username);
    
    const mesActual = new Date().getMonth();
    const ventasMes = filtrados.filter((reg: any) => {
      // Intentamos obtener fecha del campo fechaFiltro o del ID (timestamp)
      const fechaReg = reg.fechaFiltro ? new Date(reg.fechaFiltro) : new Date(reg.id);
      return fechaReg.getMonth() === mesActual;
    }).length;

    setMisRegistros(filtrados);
    setStats({ total: filtrados.length, esteMes: ventasMes });
  }, [user]);

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ pb: 5 }}>
        
        {/* ENCABEZADO */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ mb: 4, gap: 2 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 1000, color: '#124a70', letterSpacing: '-1.5px' }}>
              Mi Panel de <span style={{ color: '#1d6ea5' }}>Ventas</span>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Asesor: {user?.username}
            </Typography>
          </Box>
          <Avatar sx={{ 
            width: 56, height: 56, bgcolor: '#80bc71', 
            boxShadow: '0 4px 14px rgba(128, 188, 113, 0.4)',
            fontSize: '1.5rem', fontWeight: 800
          }}>
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
        </Stack>

        {/* CARDS DE ESTADÍSTICAS USANDO BOX (Sustituyendo Grid) */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 3, 
          mb: 4 
        }}>
          {/* Card Total */}
          <Paper 
            elevation={0} 
            sx={{ 
              flex: 1, p: 3, borderRadius: '24px', 
              background: 'linear-gradient(135deg, #124a70 0%, #1d6ea5 100%)', 
              color: 'white' 
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <ShoppingBagIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700, display: 'block', lineHeight: 1 }}>
                  Ventas Totales
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>{stats.total}</Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Card Mes Actual */}
          <Paper 
            elevation={0} 
            sx={{ 
              flex: 1, p: 3, borderRadius: '24px', 
              bgcolor: 'white', border: '1px solid #e2e8f0' 
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <CalendarMonthIcon sx={{ fontSize: 40, color: '#80bc71' }} />
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', lineHeight: 1 }}>
                  Ventas de {new Date().toLocaleString('es-ES', { month: 'long' })}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#124a70' }}>{stats.esteMes}</Typography>
              </Box>
              <TrendingUpIcon sx={{ ml: 'auto', color: '#80bc71', fontSize: 30 }} />
            </Stack>
          </Paper>
        </Box>

        {/* TABLA DE DETALLES */}
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#124a70', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon sx={{ color: '#80bc71' }} /> Detalle de mis registros
        </Typography>

        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: "24px", 
            boxShadow: "0 20px 40px rgba(0,0,0,0.05)", 
            border: "1px solid #e2e8f0", 
            overflow: 'hidden' 
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "#475569" }}>FECHA</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#475569" }}>POSTULANTE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#475569" }}>MAESTRÍA</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, color: "#475569" }}>ESTADO</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {misRegistros.length > 0 ? (
                misRegistros.map((reg, index) => (
                  <TableRow key={index} sx={{ "&:hover": { bgcolor: "#f1f5f9" } }}>
                    <TableCell sx={{ color: '#64748b', fontWeight: 500 }}>
                      {reg.fechaFiltro || "---"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                      {reg.nombre} {reg.apellido}
                    </TableCell>
                    <TableCell sx={{ color: '#1d6ea5', fontWeight: 600 }}>
                      {reg.posgrado}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={reg.estado?.toUpperCase() || "INGRESADO"} 
                        sx={{ 
                          fontWeight: 900, fontSize: '0.65rem',
                          bgcolor: "#dcfce7", color: "#166534", borderRadius: '6px'
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                    <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                      No se encontraron registros asociados a tu cuenta.
                    </Typography>
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