import { useState, useEffect } from "react";
import { 
  Paper, TextField, Typography, Button, Box, Stack, 
  MenuItem, Alert, Dialog, DialogContent, DialogActions,
  Divider
} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedIcon from '@mui/icons-material/Verified'; 
import logoUte from "../assets/logo-ute-wp.png";
import gescoLogo from "../assets/gesco-logo.png";

export default function RegisterPage() {
  const [form, setForm] = useState({
    nombre: "", 
    apellido: "", 
    tipoIdentificacion: "Cédula",
    cedula: "", 
    posgrado: "", 
    experiencia: "", 
    experienciaDocente: "No",
    correo: "", 
    telefono: "", 
    vendedor: ""
  });
  
  const [vendedores, setVendedores] = useState<string[]>([]);
  
  // Lista de posgrados actualizada con las maestrías solicitadas
  const [posgrados] = useState<string[]>([
    "Maestría en Pedagogía, Mención Docencia e Innovación Educativa",
    "Maestría en Educación, Mención Gestión del Aprendizaje", 
    "Pendiente"
  ]);

  const [file, setFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [_tempNombre, setTempNombre] = useState("");

  useEffect(() => {
    const vendedoresGuardados = JSON.parse(localStorage.getItem("vendedores") || "[]");
    setVendedores(vendedoresGuardados);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => setFile(event.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const guardarRegistro = () => {
    setError(null);
    // Validación actualizada
    if (!form.nombre || !form.apellido || !form.cedula || !form.vendedor || !file || !form.posgrado) {
      setError("Faltan datos obligatorios: Nombre, Identificación, Posgrado, Vendedor o Comprobante.");
      return;
    }

    const actuales = JSON.parse(localStorage.getItem("registros") || "[]");
    const existe = actuales.find((r: any) => r.cedula === form.cedula);

    if (existe) {
      setError("Error: El número de identificación ya se encuentra registrado en el sistema.");
      return;
    }

    const nuevoRegistro = { 
      ...form, 
      id: Date.now(),
      comprobante: file, 
      fechaFiltro: new Date().toISOString().split('T')[0],
      estado: "Ingresado" 
    };

    localStorage.setItem("registros", JSON.stringify([...actuales, nuevoRegistro]));
    setTempNombre(form.nombre); 
    setOpen(true);
    setForm({ 
      nombre: "", apellido: "", tipoIdentificacion: "Cédula", cedula: "", 
      posgrado: "", experiencia: "",experienciaDocente:"", correo: "", telefono: "", vendedor: "" 
    });
    setFile(null);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 5 }, width: '100%', maxWidth: 800,
          borderRadius: "24px", textAlign: 'center',
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.08)"
        }}
      >
        {/* LOGOS */}
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={3} sx={{ mb: 4 }}>
          <img src={gescoLogo} alt="Logo GESCO" style={{ height: 50 }} />
          <Divider orientation="vertical" flexItem sx={{ borderRightWidth: 2, height: 40, my: 'auto' }} />
          <img src={logoUte} alt="Logo UTE" style={{ height: 40, opacity: 0.8 }} />
        </Stack>
        
        <Typography variant="h4" sx={{ fontWeight: 1000, color: '#124a70', letterSpacing: '-1.5px', mb: 1 }}>
          Registro de <span style={{ color: '#1d6ea5' }}>Admisión</span>
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 4 }}>
          <VerifiedIcon sx={{ fontSize: 18, color: '#80bc71' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            Convenio de Fortalecimiento Académico GESCO - UTE
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', fontWeight: 600 }}>{error}</Alert>
        )}

        <Stack spacing={2.5} textAlign="left">
          {/* NOMBRES Y APELLIDOS */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField label="Nombres" fullWidth variant="filled" 
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} 
            />
            <TextField label="Apellidos" fullWidth variant="filled" 
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} 
            />
          </Box>

          {/* TIPO DE IDENTIFICACIÓN Y NÚMERO */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              label="Tipo ID" select sx={{ width: { xs: '100%', sm: '40%' } }} variant="filled"
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.tipoIdentificacion} onChange={e => setForm({...form, tipoIdentificacion: e.target.value})}
            >
              <MenuItem value="Cédula">Cédula</MenuItem>
              <MenuItem value="Pasaporte">Pasaporte</MenuItem>
            </TextField>
            <TextField label="Número de Identificación" fullWidth variant="filled" 
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} 
            />
          </Box>

          {/* POSGRADO AL QUE POSTULA */}
          <TextField 
            label="Maestría / Posgrado" select fullWidth variant="filled" 
            InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
            value={form.posgrado} onChange={e => setForm({...form, posgrado: e.target.value})}
          >
            <MenuItem value="" disabled>Seleccione el programa de maestría</MenuItem>
            {posgrados.map((p, i) => <MenuItem key={i} value={p}>{p}</MenuItem>)}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              label="¿Cuenta con más de 2 años de experiencia docente?" 
              select fullWidth variant="filled" 
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.experienciaDocente} 
              onChange={e => setForm({...form, experienciaDocente: e.target.value})}
            >
              <MenuItem value="Si">Sí, cuento con la experiencia</MenuItem>
              <MenuItem value="No">No por el momento</MenuItem>
            </TextField>
             <TextField label="WhatsApp / Teléfono" fullWidth variant="filled" 
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} 
            />
          </Box>

          <TextField label="Correo Electrónico" fullWidth variant="filled" 
            InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
            value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} 
          />

          <TextField 
            label="Asesor GESCO Responsable" select fullWidth variant="filled" 
            InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
            value={form.vendedor} onChange={e => setForm({...form, vendedor: e.target.value})}
          >
            <MenuItem value="" disabled>Seleccione un asesor</MenuItem>
            {vendedores.map((v, i) => <MenuItem key={i} value={v}>{v}</MenuItem>)}
          </TextField>
          
          {/* COMPROBANTE */}
          <Box sx={{ 
            p: 3, borderRadius: '16px', border: '2px dashed #1d6ea5', 
            bgcolor: 'rgba(29, 110, 165, 0.03)', textAlign: 'center'
          }}>
            <CloudUploadIcon sx={{ color: '#1d6ea5', fontSize: 32, mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#124a70', display: 'block' }}>
              Subir Comprobante de Registro
            </Typography>
            <Button variant="contained" component="label" size="small" sx={{ bgcolor: '#1d6ea5', mt: 2, borderRadius: '8px' }}>
              {file ? "Archivo Listo ✓" : "Adjuntar Documento"}
              <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
            </Button>
          </Box>
          
          <Button variant="contained" size="large" onClick={guardarRegistro}
            disabled={!form.nombre || !form.cedula || !form.vendedor || !file || !form.posgrado}
            sx={{ 
              py: 2.2, borderRadius: "16px", fontWeight: 900, fontSize: '1.1rem',
              background: "linear-gradient(135deg, #1d6ea5 0%, #2a88ca 40%, #80bc71 100%)",
            }}
          >
            Validar y Registrar en Sistema
          </Button>
        </Stack>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: '28px' } }}>
        <DialogContent sx={{ textAlign: 'center', p: 5 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#80bc71', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#124a70' }}>Registro Exitoso</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1.5 }}>
            El postulante ha sido ingresado correctamente al sistema GESCO.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 5 }}>
          <Button onClick={() => setOpen(false)} variant="contained" sx={{ borderRadius: '12px', px: 6, background: "#1d6ea5" }}>Continuar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}