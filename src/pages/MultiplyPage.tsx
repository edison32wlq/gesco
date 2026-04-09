import { useState, useEffect } from "react";
import { 
  Paper, Typography, Box, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, 
  Chip, TextField, MenuItem, Stack, Button, Tooltip, Avatar,
  Fade, Dialog, DialogTitle, DialogContent, DialogActions,
  TablePagination, Menu, Autocomplete 
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DateRangeIcon from '@mui/icons-material/DateRange';

// FIREBASE CONFIG (Asegúrate de exportar 'db' desde tu archivo de configuración)
import { db } from "../firebaseConfig"; 
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query 
} from "firebase/firestore";

export default function MultiplyPage() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [vendedores, setVendedores] = useState<string[]>([]);
  const [filtroVendedor, setFiltroVendedor] = useState<string | null>(""); 
  const [filtroNombre, setFiltroNombre] = useState(""); 
  
  // RANGO DE FECHAS
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // ESCUCHA EN TIEMPO REAL DESDE FIREBASE
  useEffect(() => {
    const q = query(collection(db, "registros"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(documento => ({
        id: documento.id,
        ...documento.data()
      }));
      setRegistros(docs);

      // Obtener vendedores únicos para el Autocomplete
      const listaAsesores = Array.from(new Set(docs.map((r: any) => r.vendedor))).filter(Boolean);
      setVendedores(listaAsesores as string[]);
    });

    return () => unsubscribe();
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => { setPage(newPage); };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const eliminarRegistro = async (id: string) => {
    if(window.confirm("¿Está seguro de eliminar este registro?")) {
      try {
        await deleteDoc(doc(db, "registros", id));
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const handleOpenEdit = (registro: any) => {
    setSelectedReg({ ...registro });
    setOpenEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedReg) return;
    try {
      const docRef = doc(db, "registros", selectedReg.id);
      await updateDoc(docRef, {
        nombre: selectedReg.nombre,
        apellido: selectedReg.apellido,
        experienciaDocente: selectedReg.experienciaDocente,
        estado: selectedReg.estado
      });
      setOpenEdit(false);
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  // LÓGICA DE FILTRADO
  const registrosFiltrados = registros.filter(r => {
    const nombreCompleto = `${r.nombre} ${r.apellido}`.toLowerCase();
    const coincideNombre = nombreCompleto.includes(filtroNombre.toLowerCase());
    const coincideVendedor = !filtroVendedor || r.vendedor === filtroVendedor;
    
    const fechaRegistro = r.fechaFiltro; 
    const coincideDesde = !fechaDesde || fechaRegistro >= fechaDesde;
    const coincideHasta = !fechaHasta || fechaRegistro <= fechaHasta;

    return coincideNombre && coincideVendedor && coincideDesde && coincideHasta;
  });

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => { setAnchorEl(event.currentTarget); };
  const handleCloseMenu = () => { setAnchorEl(null); };

  // EXPORTACIÓN EXCEL
  const exportToExcel = () => {
    const dataToExport = registrosFiltrados.map(r => ({
      FirstName: r.nombre || "", 
      LastName: r.apellido || "", 
      Programa: r.posgrado || "",
      Identification_type__c: r.tipoIdentificacion === "Cédula" ? "IDEC" : "PASS",
      Personal_identification__c: r.cedula || "",
      Email: r.correo || "", 
      Phone: r.telefonoConvencional || "",
      MobilePhone: r.telefono || "",
      LeadSource: "Activaciones",
      Tipo_origen__c: "GESCO",
      Status: "Registrado",
      Habeas_data__c: "true",
      Company: "UTE"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    
    const wscols = [
      {wch: 15}, {wch: 15}, {wch: 40}, {wch: 20}, {wch: 20}, 
      {wch: 30}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, 
      {wch: 15}, {wch: 15}, {wch: 10}
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Carga_Leads_GESCO_${new Date().toISOString().split('T')[0]}.xlsx`);
    handleCloseMenu();
  };

  // EXPORTACIÓN PDF
  const exportToPDF = () => {
    const docPdf = new jsPDF('l', 'mm', 'a4'); 
    docPdf.setFontSize(18);
    docPdf.setTextColor(18, 74, 112);
    docPdf.text("GESCO - Reporte de Seguimiento Detallado", 14, 15);
    docPdf.setFontSize(10);
    docPdf.setTextColor(100, 100, 100);
    docPdf.text(`Fecha de reporte: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = ["Nombre Completo", "Cédula", "Correo", "Asesor", "Exp. Docente", "Fecha", "Estado"];
    const tableRows = registrosFiltrados.map(r => [
        `${r.nombre} ${r.apellido}`, r.cedula, r.correo, r.vendedor, r.experienciaDocente || "N/A", r.fechaFiltro || "N/A", r.estado?.toUpperCase() || "INGRESADO"
    ]);

    autoTable(docPdf, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [18, 74, 112], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      didDrawPage: (_data) => {
        const pageCount = (docPdf as any).internal.getNumberOfPages();
        docPdf.setFontSize(8);
        docPdf.setTextColor(150, 150, 150);
        docPdf.text("GESCO UTE - Este documento contiene información confidencial de carácter institucional.", 14, 200);
        const str = `Página ${pageCount}`;
        docPdf.text(str, 283, 200, { align: "right" });
      }
    });

    docPdf.save(`Reporte_GESCO_${new Date().toLocaleDateString()}.pdf`);
    handleCloseMenu();
  };

  const verComprobante = (base64: string) => {
  if (!base64) {
    alert("No hay comprobante disponible.");
    return;
  }

  const win = window.open();
  if (!win) {
    alert("Por favor, permite las ventanas emergentes para ver el comprobante.");
    return;
  }

  // Si es un PDF
  if (base64.includes("data:application/pdf")) {
    win.document.write(
      `<iframe src="${base64}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
    );
  } 
  // Si es una imagen
  else {
    win.document.write(
      `<html>
        <body style="margin:0; display:flex; align-items:center; justify-content:center; background:#222;">
          <img src="${base64}" style="max-width:100%; max-height:100%; box-shadow: 0 0 20px rgba(0,0,0,0.5);" />
        </body>
      </html>`
    );
  }
  win.document.close();
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

        {/* FILTROS */}
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Paper sx={{ p: 1.5, px: 3, borderRadius: "20px", display: 'flex', alignItems: 'center', flex: 2, border: "1px solid rgba(0,0,0,0.05)" }}>
              <SearchIcon sx={{ color: "#124a70", mr: 2, fontSize: 28 }} />
              <TextField 
                  fullWidth 
                  variant="standard" 
                  placeholder="Buscar por nombre o apellido..."
                  value={filtroNombre}
                  onChange={(e) => { setFiltroNombre(e.target.value); setPage(0); }}
                  InputProps={{ disableUnderline: true }}
                  sx={{ "& input::placeholder": { fontWeight: 600, color: "#124a70", opacity: 0.5 } }}
              />
            </Paper>

            <Paper sx={{ p: 1.5, px: 3, borderRadius: "20px", display: 'flex', alignItems: 'center', flex: 2, border: "1px solid rgba(0,0,0,0.05)" }}>
              <PersonIcon sx={{ color: "#124a70", mr: 2 }} />
              <Autocomplete
                fullWidth
                options={vendedores}
                value={filtroVendedor}
                onChange={(_event, newValue) => { setFiltroVendedor(newValue); setPage(0); }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Filtrar por Asesor" 
                    variant="standard" 
                    InputProps={{ ...params.InputProps, disableUnderline: true }}
                    sx={{ "& .MuiInputLabel-root": { fontWeight: 700, color: "#124a70" } }}
                  />
                )}
              />
            </Paper>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Paper sx={{ p: 1.5, px: 3, borderRadius: "20px", display: 'flex', alignItems: 'center', flex: 1, border: "1px solid rgba(0,0,0,0.05)" }}>
              <DateRangeIcon sx={{ color: "#124a70", mr: 2 }} />
              <TextField 
                type="date" variant="standard" label="Desde" value={fechaDesde} 
                onChange={(e) => { setFechaDesde(e.target.value); setPage(0); }} 
                fullWidth InputLabelProps={{ shrink: true }} InputProps={{ disableUnderline: true }} 
                sx={{ "& .MuiInputLabel-root": { fontWeight: 700, color: "#124a70" } }} 
              />
            </Paper>

            <Paper sx={{ p: 1.5, px: 3, borderRadius: "20px", display: 'flex', alignItems: 'center', flex: 1, border: "1px solid rgba(0,0,0,0.05)" }}>
              <DateRangeIcon sx={{ color: "#124a70", mr: 2 }} />
              <TextField 
                type="date" variant="standard" label="Hasta" value={fechaHasta} 
                inputProps={{ min: fechaDesde }} 
                onChange={(e) => {
                    if (fechaDesde && e.target.value < fechaDesde) {
                        alert("La fecha final no puede ser anterior a la inicial.");
                        return;
                    }
                    setFechaHasta(e.target.value); setPage(0); 
                }} 
                fullWidth InputLabelProps={{ shrink: true }} InputProps={{ disableUnderline: true }} 
                sx={{ "& .MuiInputLabel-root": { fontWeight: 700, color: "#124a70" } }} 
              />
            </Paper>

            <Button 
              variant="outlined"
              onClick={() => { setFechaDesde(""); setFechaHasta(""); setFiltroNombre(""); setFiltroVendedor(""); }}
              sx={{ borderRadius: "15px", fontWeight: 700, color: "#124a70", borderColor: "#124a70", px: 3 }}
            >
              Limpiar
            </Button>

            <Box sx={{ p: 2, px: 4, borderRadius: "20px", bgcolor: "#124a70", color: "#fff", display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 120, boxShadow: "0 10px 20px rgba(18, 74, 112, 0.2)" }}>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 800, letterSpacing: 1 }}>TOTAL</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1 }}>{registrosFiltrados.length}</Typography>
            </Box>
          </Stack>
        </Stack>

        <TableContainer component={Paper} sx={{ borderRadius: "28px", boxShadow: "0 20px 50px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.05)" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "#64748b", py: 3 }}>DATOS DEL CLIENTE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>ASESOR</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#64748b" }}>EXP. DOCENTE</TableCell>
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
                  <TableCell>
                    <Chip 
                        label={row.experienciaDocente || "N/A"} variant="outlined"
                        sx={{ fontWeight: 700, color: row.experienciaDocente === "Si" ? "#80bc71" : "#64748b", borderColor: row.experienciaDocente === "Si" ? "#80bc71" : "#e2e8f0" }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={row.estado?.toUpperCase() || "INGRESADO"} color={row.estado === "Aprobado" ? "success" : "warning"} sx={{ fontWeight: 800, borderRadius: "8px", fontSize: "0.75rem" }} />
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Ver Comprobante"><IconButton onClick={() => verComprobante(row.comprobanteBase64 || row.comprobante)} sx={{ color: "#80bc71", bgcolor: "#f0f9ed", "&:hover": { bgcolor: "#80bc71", color: "white" } }}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
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

        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '28px', p: 2 } }}>
          <DialogTitle sx={{ fontWeight: 900, fontSize: "1.5rem", color: "#124a70" }}>Editar Cliente</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField label="Nombre" fullWidth variant="outlined" value={selectedReg?.nombre || ""} onChange={(e) => setSelectedReg({...selectedReg, nombre: e.target.value})} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              <TextField label="Apellido" fullWidth variant="outlined" value={selectedReg?.apellido || ""} onChange={(e) => setSelectedReg({...selectedReg, apellido: e.target.value})} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }} />
              <TextField select label="¿Más de 2 años Exp. Docente?" fullWidth value={selectedReg?.experienciaDocente || "No"} onChange={(e) => setSelectedReg({...selectedReg, experienciaDocente: e.target.value})} sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}>
                <MenuItem value="Si">Sí</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
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