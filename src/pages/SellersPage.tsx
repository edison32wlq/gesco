import { useState, useEffect, useMemo } from "react";
import { 
  Paper, TextField, Typography, Stack, Table, 
  TableBody, TableCell, TableHead, TableRow, 
  Box, TableContainer, Chip, Avatar, Fade,
  MenuItem, Button, Divider
} from "@mui/material";

// LIBRERÍAS (npm install xlsx jspdf jspdf-autotable)
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ICONOS
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import StarsIcon from '@mui/icons-material/Stars';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DownloadIcon from '@mui/icons-material/Download';
import DateRangeIcon from '@mui/icons-material/DateRange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function SellersPage() {
  // --- ESTADOS DE DATOS ---
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);

  // --- ESTADOS DE FILTRO POR RANGO ---
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("ventas"); 
  
  // Inicializamos con el primer y último día del mes actual para que no aparezca vacío
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fechaInicio, setFechaInicio] = useState(primerDiaMes);
  const [fechaFin, setFechaFin] = useState(ultimoDiaMes);

  // --- CARGA DE DATOS ---
  const cargarDatos = () => {
    const usuariosSistema = JSON.parse(localStorage.getItem("usuarios_sistema") || "[]");
    const soloAsesores = usuariosSistema.filter((u: any) => u.rol === "asesor");
    const r_guardados = JSON.parse(localStorage.getItem("registros") || "[]");
    
    setVendedores(soloAsesores);
    setRegistros(r_guardados);
  };

  useEffect(() => { 
    cargarDatos(); 
  }, []);

  // --- MOTOR DE FILTRADO POR RANGO ---
  const registroCumpleRango = (reg: any) => {
    if (!reg.fechaFiltro) return false;
    // Comparación directa de strings YYYY-MM-DD
    return reg.fechaFiltro >= fechaInicio && reg.fechaFiltro <= fechaFin;
  };

  const obtenerVentas = (nombre: string) => {
    return registros.filter(reg => 
      reg.vendedor === nombre && registroCumpleRango(reg)
    ).length;
  };

  const vendedoresFiltrados = useMemo(() => {
    let resultado = vendedores.filter(v => 
      v.username.toLowerCase().includes(busqueda.toLowerCase())
    );

    return resultado.sort((a, b) => {
      if (orden === "ventas") return obtenerVentas(b.username) - obtenerVentas(a.username);
      return a.username.localeCompare(b.username);
    });
  }, [vendedores, busqueda, orden, registros, fechaInicio, fechaFin]);

  // --- EXPORTACIÓN EXCEL (RESPETANDO FILTROS) ---
  const exportarExcelBase = () => {
    const dataFiltrada = registros.filter(reg => registroCumpleRango(reg));
    
    const dataFormateada = dataFiltrada.map(reg => ({
      FirstName: reg.FirstName || reg.nombre || "",
      LastName: reg.LastName || reg.apellido || "",
      Programa: reg.Programa || reg.posgrado || "",
      Identification_type__c: reg.Identification_type__c || "Cédula",
      Personal_identification__c: reg.Personal_identification__c || reg.cedula || "",
      Email: reg.Email || reg.correo || "",
      Phone: reg.Phone || reg.telefonoConvencional || "",
      MobilePhone: reg.MobilePhone || reg.telefono || "",
      LeadSource: "Activaciones",
      Tipo_origen__c: "GESCO",
      Status: "Seguimiento", 
      Habeas_data__c: true,
      Company: "UTE",
      Asesor_Asignado: reg.vendedor || "Sin asignar",
      Fecha_Captacion: reg.fechaFiltro || ""
    }));

    const ws = XLSX.utils.json_to_sheet(dataFormateada);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Base_Filtrada");
    XLSX.writeFile(wb, `Base_GESCO_${fechaInicio}_al_${fechaFin}.xlsx`);
  };

  // --- EXPORTACIÓN PDF (RESPETANDO FILTROS) ---
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(18, 74, 112);
    doc.text("Reporte de Desempeño: Asesores UTE", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Rango seleccionado: Desde ${fechaInicio} hasta ${fechaFin}`, 14, 28);
    
    const tableData = vendedoresFiltrados.map(v => [
      v.username,
      obtenerVentas(v.username).toString(),
      "Seguimiento",
      v.email
    ]);

    autoTable(doc, {
      head: [['Asesor', 'Registros en Rango', 'Estado', 'Email']],
      body: tableData,
      startY: 35,
      headStyles: { fillColor: [18, 74, 112], fontStyle: 'bold' },
      styles: { fontSize: 9 }
    });
    
    doc.save(`Reporte_Asesores_Rango.pdf`);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaInicio(primerDiaMes);
    setFechaFin(ultimoDiaMes);
  };

  const totalVentasRango = registros.filter(registroCumpleRango).length;
  const topVendedor = vendedoresFiltrados[0];

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ pb: 8, px: { xs: 2, md: 4 }, maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <Box sx={{ 
          display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 4, mt: 2, gap: 2 
        }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 1000, color: '#124a70', letterSpacing: '-2px' }}>
              Dashboard <span style={{ color: '#80bc71' }}>Administrativo</span>
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Análisis de productividad por rango de fechas personalizado
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />} 
              onClick={exportarExcelBase}
              sx={{ borderRadius: '15px', bgcolor: '#124a70', px: 3 }}
            >
              Excel (Base)
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />} 
              onClick={exportarPDF}
              sx={{ borderRadius: '15px', color: '#124a70', borderColor: '#124a70', px: 3 }}
            >
              PDF (Reporte)
            </Button>
          </Stack>
        </Box>

        {/* FILTROS POR RANGO DE FECHAS */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: '25px', mb: 4, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <DateRangeIcon sx={{ color: '#124a70' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#124a70' }}>Definir Rango de Consulta</Typography>
          </Stack>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 200px' } }}>
              <TextField 
                type="date" fullWidth size="small" label="Desde" 
                value={fechaInicio} InputLabelProps={{ shrink: true }}
                onChange={(e) => setFechaInicio(e.target.value)} 
              />
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 200px' } }}>
              <TextField 
                type="date" fullWidth size="small" label="Hasta" 
                value={fechaFin} InputLabelProps={{ shrink: true }}
                onChange={(e) => setFechaFin(e.target.value)} 
              />
            </Box>

            <Button 
              variant="text" startIcon={<RestartAltIcon />} onClick={limpiarFiltros}
              sx={{ fontWeight: 700, color: '#ef4444' }}
            >
              Restablecer periodo
            </Button>
          </Box>
        </Paper>

        {/* MÉTRICAS */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
          <Paper elevation={0} sx={{ 
            flex: 1, p: 3, borderRadius: "30px", 
            background: "linear-gradient(135deg, #124a70 0%, #1d6ea5 100%)", 
            color: "white", position: 'relative', overflow: 'hidden'
          }}>
            <StarsIcon sx={{ position: 'absolute', right: -20, top: -20, fontSize: 160, opacity: 0.1 }} />
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)', border: '2px solid #80bc71' }}>
                <LeaderboardIcon sx={{ color: '#80bc71' }} />
              </Avatar>
              <Box>
                <Typography variant="overline" sx={{ fontWeight: 700 }}>Líder del Rango</Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>{topVendedor ? topVendedor.username : "N/A"}</Typography>
                <Typography variant="body2">{topVendedor ? obtenerVentas(topVendedor.username) : 0} Registros</Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ 
            flex: 1.5, p: 3, borderRadius: "30px", border: "1px solid #e2e8f0",
            display: 'flex', alignItems: 'center', justifyContent: 'space-around', textAlign: 'center'
          }}>
            <Box>
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                <TrendingUpIcon sx={{ color: '#80bc71' }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>TOTAL EN RANGO</Typography>
              </Stack>
              <Typography variant="h3" sx={{ fontWeight: 1000, color: '#124a70' }}>{totalVentasRango}</Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>DÍAS FILTRADOS</Typography>
              <Typography variant="h3" sx={{ fontWeight: 1000, color: '#124a70' }}>
                {Math.ceil((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 3600 * 24)) + 1}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* BÚSQUEDA */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
          <Paper elevation={0} sx={{ flex: 2, p: 1, px: 2, borderRadius: "20px", border: "1px solid #e2e8f0", display: 'flex', alignItems: 'center' }}>
            <SearchIcon sx={{ color: '#94a3b8', mr: 2 }} />
            <TextField 
              placeholder="Buscar asesor..." variant="standard" fullWidth 
              InputProps={{ disableUnderline: true }} value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Paper>

          <Paper elevation={0} sx={{ flex: 1, p: 1, px: 2, borderRadius: "20px", border: "1px solid #e2e8f0", display: 'flex', alignItems: 'center' }}>
            <SortIcon sx={{ color: '#124a70', mr: 2 }} />
            <TextField 
              select label="Ordenar" variant="standard" fullWidth 
              value={orden} onChange={(e) => setOrden(e.target.value)}
              InputProps={{ disableUnderline: true }}
            >
              <MenuItem value="ventas">Por Registros</MenuItem>
              <MenuItem value="nombre">Por Nombre</MenuItem>
            </TextField>
          </Paper>
        </Box>

        {/* TABLA */}
        <TableContainer component={Paper} sx={{ borderRadius: "30px", border: "1px solid #e2e8f0", overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, py: 3 }}>ASESOR</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>REGISTROS LOGRADOS</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>PARTICIPACIÓN</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800 }}>ESTADO</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vendedoresFiltrados.map((v) => {
                const ventas = obtenerVentas(v.username);
                const porcentaje = totalVentasRango > 0 ? ((ventas / totalVentasRango) * 100).toFixed(1) : 0;
                
                return (
                  <TableRow key={v.id} sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: '#1d6ea5', fontWeight: 800 }}>
                          {v.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 800 }}>{v.username}</Typography>
                          <Typography variant="caption" color="text.secondary">{v.email}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 900, color: '#1d6ea5', fontSize: '1.2rem' }}>{ventas}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <Box sx={{ width: '60px', height: '6px', bgcolor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <Box sx={{ width: `${porcentaje}%`, height: '100%', bgcolor: '#80bc71' }} />
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 800 }}>{porcentaje}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label="Seguimiento" size="small" sx={{ fontWeight: 900, bgcolor: '#e0f2fe', color: '#0369a1' }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

      </Box>
    </Fade>
  );
}