import { useState, useEffect, useMemo } from "react";
import { 
  Paper, Typography, Box, Stack, Table, 
  TableBody, TableCell, TableHead, TableRow, 
  TableContainer, Chip, Avatar, Fade, TextField, Button, Divider
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

// LIBRERÍAS DE EXPORTACIÓN
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ICONOS
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export default function MySalesPage() {
  const { user } = useAuth();
  const [todosMisRegistros, setTodosMisRegistros] = useState<any[]>([]);
  
  // --- ESTADOS DE FILTRO POR RANGO ---
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
  const [fechaFin, setFechaFin] = useState(ultimoDiaMes);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const r_guardados = JSON.parse(localStorage.getItem("registros") || "[]");
    const filtradosPorUsuario = r_guardados.filter((reg: any) => reg.vendedor === user?.username);
    setTodosMisRegistros(filtradosPorUsuario);
  }, [user]);

  // --- LÓGICA DE FILTRADO DINÁMICO ---
  const registrosFiltrados = useMemo(() => {
    return todosMisRegistros.filter((reg: any) => {
      if (!reg.fechaFiltro) return false;
      return reg.fechaFiltro >= fechaInicio && reg.fechaFiltro <= fechaFin;
    });
  }, [todosMisRegistros, fechaInicio, fechaFin]);

  // --- MÉTRICAS ---
  const stats = useMemo(() => {
    const mesActualIdx = new Date().getMonth();
    const ventasMesActual = todosMisRegistros.filter((reg: any) => {
      if (!reg.fechaFiltro) return false;
      const fecha = new Date(reg.fechaFiltro + "T00:00:00");
      return fecha.getMonth() === mesActualIdx;
    }).length;

    return {
      totalEnRango: registrosFiltrados.length,
      esteMes: ventasMesActual
    };
  }, [todosMisRegistros, registrosFiltrados]);

  // --- EXPORTACIONES ---
  const exportarExcel = () => {
    const dataFormateada = registrosFiltrados.map(reg => ({
      Fecha: reg.fechaFiltro,
      Nombre: reg.nombre,
      Apellido: reg.apellido,
      Programa: reg.posgrado,
      Cedula: reg.cedula || reg.Personal_identification__c || "",
      Email: reg.correo || reg.Email || "",
      Telefono: reg.telefono || reg.MobilePhone || "",
      Estado: "Seguimiento"
    }));

    const ws = XLSX.utils.json_to_sheet(dataFormateada);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mis_Ventas");
    XLSX.writeFile(wb, `Mis_Ventas_${user?.username || 'asesor'}.xlsx`);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(18, 74, 112);
    doc.text(`Reporte de Ventas - Asesor: ${user?.username || 'Asesor'}`, 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Periodo: ${fechaInicio} a ${fechaFin}`, 14, 28);

    const tableData = registrosFiltrados.map(reg => [
      reg.fechaFiltro,
      `${reg.nombre} ${reg.apellido}`,
      reg.posgrado,
      "Seguimiento"
    ]);

    autoTable(doc, {
      head: [['Fecha', 'Postulante', 'Maestría', 'Estado']],
      body: tableData,
      startY: 35,
      headStyles: { fillColor: [18, 74, 112], fontStyle: 'bold' },
      styles: { fontSize: 9 }
    });

    doc.save(`Mis_Reportes_${user?.username || 'asesor'}.pdf`);
  };

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ pb: 5, maxWidth: '1400px', margin: '0 auto' }}>
        
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
              Bienvenido, {user?.username}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />} 
              onClick={exportarExcel} 
              sx={{ bgcolor: '#124a70', borderRadius: '12px', textTransform: 'none' }}
            >
              Excel
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />} 
              onClick={exportarPDF} 
              sx={{ color: '#124a70', borderColor: '#124a70', borderRadius: '12px', textTransform: 'none' }}
            >
              PDF
            </Button>
          </Stack>
        </Stack>

        {/* FILTROS DE FECHA */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', mb: 4, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* AQUÍ SE CORRIGIÓ: fontSize en lugar de size */}
              <CalendarMonthIcon fontSize="small" /> FILTRAR PERIODO:
            </Typography>
            
            <TextField 
              type="date" size="small" label="Desde" 
              value={fechaInicio} InputLabelProps={{ shrink: true }} 
              onChange={(e) => setFechaInicio(e.target.value)} 
            />
            
            <TextField 
              type="date" size="small" label="Hasta" 
              value={fechaFin} InputLabelProps={{ shrink: true }} 
              onChange={(e) => setFechaFin(e.target.value)} 
            />
            
            <Button 
              startIcon={<RestartAltIcon />} 
              onClick={() => { setFechaInicio(primerDiaMes); setFechaFin(ultimoDiaMes); }} 
              sx={{ color: '#ef4444', fontWeight: 700, textTransform: 'none' }}
            >
              Reiniciar
            </Button>
          </Stack>
        </Paper>

        {/* CARDS DE ESTADÍSTICAS */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 4 }}>
          <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: '24px', background: 'linear-gradient(135deg, #124a70 0%, #1d6ea5 100%)', color: 'white' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <ShoppingBagIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              <Box>
                <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 700 }}>Total en Rango</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>{stats.totalEnRango}</Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ flex: 1, p: 3, borderRadius: '24px', bgcolor: 'white', border: '1px solid #e2e8f0' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <CalendarMonthIcon sx={{ fontSize: 40, color: '#80bc71' }} />
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Ventas de {new Date().toLocaleString('es-ES', { month: 'long' }).toUpperCase()}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#124a70' }}>{stats.esteMes}</Typography>
              </Box>
              <TrendingUpIcon sx={{ ml: 'auto', color: '#80bc71', fontSize: 30 }} />
            </Stack>
          </Paper>
        </Box>

        {/* TABLA DE DETALLES */}
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#124a70', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon sx={{ color: '#80bc71' }} /> Mis registros en este periodo
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: "24px", border: "1px solid #e2e8f0", overflow: 'hidden' }}>
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
              {registrosFiltrados.length > 0 ? (
                registrosFiltrados.map((reg, index) => (
                  <TableRow key={index} sx={{ "&:hover": { bgcolor: "#f1f5f9" } }}>
                    <TableCell sx={{ color: '#64748b', fontWeight: 500 }}>{reg.fechaFiltro}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>{reg.nombre} {reg.apellido}</TableCell>
                    <TableCell sx={{ color: '#1d6ea5', fontWeight: 600 }}>{reg.posgrado}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label="Seguimiento" 
                        sx={{ 
                          fontWeight: 900, fontSize: '0.7rem',
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
                      No se encontraron registros en el rango de fechas seleccionado.
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