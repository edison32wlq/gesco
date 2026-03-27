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
    telefonoConvencional: "",
    vendedor: ""
  });
  
  const [vendedores, setVendedores] = useState<any[]>([]);
  
  // --- ACTUALIZACIÓN: MAESTRÍAS OFRECIDAS ---
  const [posgrados] = useState<string[]>([
    "Maestría en Educación Inclusiva, mención Inclusión Educativa y Atención a la Diversidad",
    "Maestría en Pedagogía, mención Docencia e Innovación Educativa",
    "Maestría en Educación, mención Gestión del Aprendizaje",
    "Pendiente"
  ]);

  const [file, setFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [_tempNombre, setTempNombre] = useState("");

  useEffect(() => {
    const usuariosRaw = localStorage.getItem("usuarios_sistema");
    if (usuariosRaw) {
      const todosLosUsuarios = JSON.parse(usuariosRaw);
      const soloAsesores = todosLosUsuarios.filter((u: any) => u.rol === "asesor");
      setVendedores(soloAsesores);
    }
  }, []);

  // Validación de Cédula Ecuatoriana
  const validarCedulaEcuatoriana = (cedula: string) => {
    if (cedula.length !== 10) return false;
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    const digitoVerificador = parseInt(cedula.substring(9, 10));
    let suma = 0;
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    for (let i = 0; i < coeficientes.length; i++) {
      let valor = parseInt(cedula.substring(i, i + 1)) * coeficientes[i];
      suma += valor > 9 ? valor - 9 : valor;
    }
    const total = (Math.ceil(suma / 10) * 10) - suma;
    return total === digitoVerificador || (total === 10 && digitoVerificador === 0);
  };

  // --- ACTUALIZACIÓN: CONTROL DE PESO DE ARCHIVO (2MB) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const limitInBytes = 2 * 1024 * 1024; // 2MB

      if (selectedFile.size > limitInBytes) {
        setError("El archivo es muy pesado. El límite máximo permitido es de 2MB.");
        e.target.value = ""; // Limpiar el input
        setFile(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => setFile(event.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const guardarRegistro = () => {
    setError(null);

    // Validación de campos básicos
    if (!form.nombre || !form.apellido || !form.cedula || !form.vendedor || !file || !form.posgrado || !form.correo) {
      setError("Faltan datos obligatorios para proceder con el registro.");
      return;
    }

    // --- ACTUALIZACIÓN: VALIDACIÓN DE CORREO ---
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(form.correo)) {
      setError("El formato del correo electrónico no es válido.");
      return;
    }

    // Validación de Identificación
    if (form.tipoIdentificacion === "Cédula") {
      if (!validarCedulaEcuatoriana(form.cedula)) {
        setError("La cédula ingresada no es válida para Ecuador.");
        return;
      }
    } else {
      const regexPasaporte = /^[A-Z0-9]{5,15}$/i;
      if (!regexPasaporte.test(form.cedula)) {
        setError("El formato del pasaporte es incorrecto.");
        return;
      }
    }

    // --- NUEVA VALIDACIÓN: EVITAR DUPLICADOS ---
    const registrosActuales = JSON.parse(localStorage.getItem("registros") || "[]");
    const yaExiste = registrosActuales.find((reg: any) => reg.cedula === form.cedula);

    if (yaExiste) {
      setError(`Error: La persona con identificación ${form.cedula} ya se encuentra registrada en el sistema.`);
      return;
    }

    // --- NUEVA LÓGICA DE ALMACENAMIENTO (VARIABLES TÉCNICAS) ---
    // Mapeamos los campos del formulario a los nombres requeridos por el formato Excel/Salesforce
    const nuevoRegistro = { 
      ...form, 
      id: Date.now(),
      comprobante: file, 
      fechaFiltro: new Date().toISOString().split('T')[0],
      estado: "Ingresado",
      
      // Variables solicitadas para coincidir con el formato de carga:
      FirstName: form.nombre,
      LastName: form.apellido,
      Programa: form.posgrado,
      Identification_type__c: form.tipoIdentificacion === "Cédula" ? "IDEC" : "PASS",
      Personal_identification__c: form.cedula,
      Email: form.correo,
      Phone: form.telefonoConvencional || "",
      MobilePhone: form.telefono,
      Status: "Registrado",
      
      // Variables predeterminadas (Ocultas en UI pero guardadas en datos):
      LeadSource: "Activaciones",
      Tipo_origen__c: "GESCO",
      Company: "UTE",
      Habeas_data__c: true 
    };

    localStorage.setItem("registros", JSON.stringify([...registrosActuales, nuevoRegistro]));
    setTempNombre(form.nombre); 
    setOpen(true);
    setForm({ 
      nombre: "", apellido: "", tipoIdentificacion: "Cédula", cedula: "", 
      posgrado: "", experiencia: "", experienciaDocente: "No", correo: "", 
      telefono: "", telefonoConvencional: "", vendedor: "" 
    });
    setFile(null);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 3, md: 5 }, width: '100%', maxWidth: 800,
          borderRadius: "24px", textAlign: 'center',
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.08)"
        }}
      >
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
          {/* Nombres y Apellidos */}
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

          {/* Tipo ID y Número */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              label="Tipo ID" select sx={{ width: { xs: '100%', sm: '40%' } }} variant="filled"
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.tipoIdentificacion} onChange={e => setForm({...form, tipoIdentificacion: e.target.value})}
            >
              <MenuItem value="Cédula">Cédula</MenuItem>
              <MenuItem value="Pasaporte">Pasaporte</MenuItem>
            </TextField>
            <TextField 
              label={form.tipoIdentificacion === "Cédula" ? "Número de Cédula" : "Número de Pasaporte"} 
              fullWidth variant="filled" 
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} 
            />
          </Box>

          {/* Maestría Select */}
          <TextField 
            label="Maestría / Posgrado" select fullWidth variant="filled" 
            InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
            value={form.posgrado} onChange={e => setForm({...form, posgrado: e.target.value})}
          >
            <MenuItem value="" disabled>Seleccione el programa de maestría</MenuItem>
            {posgrados.map((p, i) => <MenuItem key={i} value={p}>{p}</MenuItem>)}
          </TextField>

          {/* Teléfonos */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField label="WhatsApp / Celular" fullWidth variant="filled" 
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} 
            />
            <TextField label="Teléfono Convencional" fullWidth variant="filled" 
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.telefonoConvencional} onChange={e => setForm({...form, telefonoConvencional: e.target.value})} 
            />
          </Box>

          {/* Correo y Experiencia */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField label="Correo Electrónico" fullWidth variant="filled" 
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} 
            />
            <TextField 
              label="¿Experiencia docente (+2 años)?" 
              select fullWidth variant="filled" 
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.experienciaDocente} 
              onChange={e => setForm({...form, experienciaDocente: e.target.value})}
            >
              <MenuItem value="Si">Sí, cuento con la experiencia</MenuItem>
              <MenuItem value="No">No por el momento</MenuItem>
            </TextField>
          </Box>

          {/* Asesor */}
          <TextField 
            label="Asesor GESCO Responsable" select fullWidth variant="filled" 
            InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
            value={form.vendedor} onChange={e => setForm({...form, vendedor: e.target.value})}
          >
            <MenuItem value="" disabled>Seleccione un asesor</MenuItem>
            {vendedores.length > 0 ? (
              vendedores.map((v, i) => (
                <MenuItem key={i} value={v.username}>
                  {v.username}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">No hay asesores registrados</MenuItem>
            )}
          </TextField>
          
          {/* Carga de Archivo */}
          <Box sx={{ 
            p: 3, borderRadius: '16px', border: '2px dashed #1d6ea5', 
            bgcolor: 'rgba(29, 110, 165, 0.03)', textAlign: 'center'
          }}>
            <CloudUploadIcon sx={{ color: '#1d6ea5', fontSize: 32, mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#124a70', display: 'block' }}>
              Subir Comprobante (Máx. 2MB)
            </Typography>
            <Button variant="contained" component="label" size="small" sx={{ bgcolor: '#1d6ea5', mt: 2, borderRadius: '8px' }}>
              {file ? "Archivo Listo ✓" : "Adjuntar Documento"}
              <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
            </Button>
          </Box>
          
          <Button variant="contained" size="large" onClick={guardarRegistro}
            sx={{ 
              py: 2.2, borderRadius: "16px", fontWeight: 900, fontSize: '1.1rem',
              background: "linear-gradient(135deg, #1d6ea5 0%, #2a88ca 40%, #80bc71 100%)",
            }}
          >
            Validar y Registrar en Sistema
          </Button>
        </Stack>
      </Paper>

      {/* Dialogo de Éxito */}
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