import { useState, useEffect } from "react";
import { 
  Paper, Typography, Box, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  Chip, TextField, MenuItem, Stack, Button, Tooltip, Avatar,
  Fade, Dialog, DialogTitle, DialogContent, DialogActions,
  TablePagination, Menu, Autocomplete // <-- Importado Autocomplete
} from "@mui/material";

// LIBRERÍAS DE EXPORTACIÓN
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ICONOS
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function MultiplyPage() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<string[]>([]);
  const [filtroVendedor, setFiltroVendedor] = useState<string | null>(""); // Cambiado para Autocomplete
  const [filtroFecha, setFiltroFecha] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    setRegistros(JSON.parse(localStorage.getItem("registros") || "[]"));
    setVendedores(JSON.parse(localStorage.getItem("vendedores") || "[]"));
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const eliminarRegistro = (id: number) => {
    if(window.confirm("¿Está seguro de eliminar este registro?")) {
      const nuevos = registros.filter(r => r.id !== id);
      setRegistros(nuevos);
      localStorage.setItem("registros", JSON.stringify(nuevos));
    }
  };

  const handleOpenEdit = (registro: any) => {
    setSelectedReg({ ...registro });
    setOpenEdit(true);
  };

  const handleSaveEdit = () => {
    const nuevosRegistros = registros.map(r => r.id === selectedReg.id ? selectedReg : r);
    setRegistros(nuevosRegistros);
    localStorage.setItem("registros", JSON.stringify(nuevosRegistros));
    setOpenEdit(false);
  };

  // Lógica de filtrado actualizada
  const registrosFiltrados = registros.filter(r => {
    const coincideVendedor = !filtroVendedor || r.vendedor === filtroVendedor;
    const coincideFecha = filtroFecha === "" || r.fechaFiltro === filtroFecha;
    return coincideVendedor && coincideFecha;
  });

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => { setAnchorEl(event.currentTarget); };
  const handleCloseMenu = () => { setAnchorEl(null); };

  const exportToExcel = () => {
    const dataToExport = registrosFiltrados.map(r => ({
      Nombre: r.nombre, Apellido: r.apellido, Correo: r.correo, Asesor: r.vendedor, Fecha: r.fechaFiltro, Estado: r.estado || "INGRESADO"
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");
    XLSX.writeFile(workbook, `Reporte_GESCO_${new Date().toLocaleDateString()}.xlsx`);
    handleCloseMenu();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("GESCO - Reporte de Seguimiento", 14, 15);
    const tableColumn = ["Docente", "Correo", "Asesor", "Fecha", "Estado"];
    const tableRows = registrosFiltrados.map(r => [`${r.nombre} ${r.apellido}`, r.correo, r.vendedor, r.fechaFiltro, r.estado?.toUpperCase() || "INGRESADO"]);
    autoTable(doc, {
      head: [tableColumn], body: tableRows, startY: 25,
      headStyles: { fillColor: [18, 74, 112], textColor: [255, 255, 255] },
    });
    doc.save(`Reporte_GESCO_${new Date().toLocaleDateString()}.pdf`);
    handleCloseMenu();
  };

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ pb: 5, fontFamily: "'Inter', sans-serif" }}>
        
        {/* HEADER */}
        <Paper elevation={0} sx={{ 
          p: "40px", mb: 4, borderRadius: "32px", 
          background: "linear-gradient(135deg, #124a70 0%, #1d6ea5 100%)", 
          color: "white", display: 'flex', flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', alignItems: 'center', 
          position: 'relative', overflow: 'hidden',
          boxShadow: "0 20px 40px rgba(18, 74, 112, 0.15)"
        }}>
          <TrendingUpIcon sx={{ position: 'absolute', right: -20, bottom: -20, fontSize: 240, opacity: 0.08, color: '#80bc71' }} />
          
          <Box sx={{ zIndex: 1 }}>
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-1.5px', mb: 1, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
              Seguimiento
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500, maxWidth: 450, lineHeight: 1.3, fontSize: '1.1rem' }}>
              Monitoreo en tiempo real de los procesos de admisión docente.
            </Typography>
          </Box>
          
          <Box sx={{ zIndex: 1 }}>
            <Button 
              variant="contained" 
              onClick={handleDownloadClick}
              startIcon={<FileDownloadIcon />} 
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ 
                bgcolor: "#80bc71", fontWeight: 700, px: 4, py: 1.8, 
                borderRadius: "14px", textTransform: 'none', fontSize: "1rem",
                boxShadow: "0 8px 16px rgba(128, 188, 113, 0.3)",
                "&:hover": { bgcolor: "#6da35f", transform: "translateY(-2px)" },
                transition: "all 0.3s ease"
              }}
            >
              Descargar Reporte
            </Button>
            <Menu
              anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}
              PaperProps={{ sx: { borderRadius: '16px', mt: 1, minWidth: 200, boxShadow: '0 15px 35px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.05)' } }}
            >
              <MenuItem onClick={exportToExcel} sx={{ py: 1.5, px: 3, fontWeight: 600, fontSize: "0.95rem" }}>Exportar a Excel (.xlsx)</MenuItem>
              <MenuItem onClick={exportToPDF} sx={{ py: 1.5, px: 3, fontWeight: 600, fontSize: "0.95rem" }}>Exportar a PDF (.pdf)</MenuItem>
            </Menu>
          </Box>
        </Paper>

        {/* FILTROS CON BÚSQUEDA PREDICTIVA */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
          <Paper sx={{ p: 1.5, px: 3, borderRadius: "20px", display: 'flex', alignItems: 'center', flex: 2, border: "1px solid rgba(0,0,0,0.05)" }}>
            <SearchIcon sx={{ color: "#124a70", mr: 2, fontSize: 28 }} />
            {/* CambiadoTextField por Autocomplete para permitir escribir y buscar */}
            <Autocomplete
              fullWidth
              options={vendedores}
              value={filtroVendedor}
              onChange={(_event, newValue) => {
                setFiltroVendedor(newValue);
                setPage(0);
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Buscar o filtrar por Asesor" 
                  variant="standard" 
                  InputProps={{ ...params.InputProps, disableUnderline: true }}
                  sx={{ "& .MuiInputLabel-root": { fontWeight: 700, color: "#124a70" } }}
                />
              )}
            />
          </Paper>

          <Paper sx={{ p: 1.5, px: 3, borderRadius: "20px", display: 'flex', alignItems: 'center', flex: 1, border: "1px solid rgba(0,0,0,0.05)" }}>
            <CalendarTodayIcon sx={{ color: "#124a70", mr: 2 }} />
            <TextField type="date" variant="standard" label="Fecha" value={filtroFecha} onChange={(e) => { setFiltroFecha(e.target.value); setPage(0); }} fullWidth InputLabelProps={{ shrink: true }} InputProps={{ disableUnderline: true }} sx={{ "& .MuiInputLabel-root": { fontWeight: 700, color: "#124a70" } }} />
          </Paper>

          <Box sx={{ p: 2, px: 4, borderRadius: "20px", bgcolor: "#124a70", color: "#fff", display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 120, boxShadow: "0 10px 20px rgba(18, 74, 112, 0.2)" }}>
            <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 800, letterSpacing: 1 }}>TOTAL</Typography>
            <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1 }}>{registrosFiltrados.length}</Typography>
          </Box>
        </Stack>

        {/* TABLA PREMIUM */}
        <TableContainer component={Paper} sx={{ borderRadius: "28px", boxShadow: "0 20px 50px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.05)" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "#64748b", py: 3 }}>DATOS DEL DOCENTE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>ASESOR</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>FECHA</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>ESTADO</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: "#64748b", pr: 4 }}>GESTIÓN</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registrosFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow key={row.id} hover sx={{ "&:hover": { bgcolor: "#f1f5f9 !important" } }}>
                  <TableCell sx={{ py: 2.5 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: "#e2e8f0", color: "#124a70", width: 45, height: 45, fontWeight: 700 }}><PersonIcon /></Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: "#1e293b", fontSize: "1rem" }}>{row.nombre} {row.apellido}</Typography>
                        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>{row.correo}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell><Chip label={row.vendedor} sx={{ fontWeight: 700, bgcolor: "#f1f5f9", color: "#124a70" }} /></TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#475569" }}>{row.fechaFiltro}</TableCell>
                  <TableCell>
                    <Chip label={row.estado?.toUpperCase() || "INGRESADO"} color={row.estado === "Aprobado" ? "success" : "warning"} sx={{ fontWeight: 800, borderRadius: "8px", fontSize: "0.75rem" }} />
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Editar"><IconButton onClick={() => handleOpenEdit(row)} sx={{ color: "#124a70", bgcolor: "#f1f5f9", "&:hover": { bgcolor: "#124a70", color: "white" } }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Eliminar"><IconButton onClick={() => eliminarRegistro(row.id)} sx={{ color: "#ef4444", bgcolor: "#fef2f2", "&:hover": { bgcolor: "#ef4444", color: "white" } }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={registrosFiltrados.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} labelRowsPerPage="Filas:" sx={{ bgcolor: "#f8fafc", fontWeight: 700 }} />
        </TableContainer>

        {/* DIALOG DE EDICIÓN */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '28px', p: 2 } }}>
          <DialogTitle sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#124a70" }}>Editar Docente</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField label="Nombre" fullWidth variant="outlined" value={selectedReg?.nombre || ""} onChange={(e) => setSelectedReg({...selectedReg, nombre: e.target.value})} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              <TextField label="Apellido" fullWidth variant="outlined" value={selectedReg?.apellido || ""} onChange={(e) => setSelectedReg({...selectedReg, apellido: e.target.value})} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              <TextField select label="Estado de Admisión" fullWidth value={selectedReg?.estado || "Ingresado"} onChange={(e) => setSelectedReg({...selectedReg, estado: e.target.value})} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}>
                <MenuItem value="Ingresado">Ingresado</MenuItem>
                <MenuItem value="Aprobado">Aprobado</MenuItem>
                <MenuItem value="Pendiente">Pendiente</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button onClick={() => setOpenEdit(false)} sx={{ color: "#64748b", fontWeight: 700 }}>Cancelar</Button>
            <Button onClick={handleSaveEdit} variant="contained" sx={{ bgcolor: "#124a70", borderRadius: "12px", px: 4, py: 1.2, fontWeight: 700, "&:hover": { bgcolor: "#0d3652" } }}>Guardar Cambios</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}