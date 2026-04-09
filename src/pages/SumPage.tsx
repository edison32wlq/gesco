import { useState, useEffect } from "react";
import { 
  Paper, TextField, Typography, Button, Box, Stack, 
  MenuItem, Alert, Dialog, DialogContent, DialogActions,
  Divider, CircularProgress
} from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedIcon from '@mui/icons-material/Verified'; 

// FIREBASE IMPORTS (Solo usamos Firestore)
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";

// ASSETS
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
    vendedor: "",
    medioCaptacion: "" 
  });
  
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [base64File, setBase64File] = useState<string | null>(null); // Guardamos el texto del archivo
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const posgrados = [
    "Maestría en Educación Inclusiva, mención Inclusión Educativa y Atención a la Diversidad",
    "Maestría en Pedagogía, mención Docencia e Innovación Educativa",
    "Maestría en Educación, mención Gestión del Aprendizaje",
    "Pendiente"
  ];

  const mediosCaptacion = [
    "Recomendación", "Redes Sociales", "Publicidad Exterior", 
    "Correo Electrónico", "Llamada Telefónica", "Otros"
  ];

  useEffect(() => {
    const fetchAsesores = async () => {
      try {
        const q = query(collection(db, "usuarios"), where("rol", "==", "asesor"));
        const querySnapshot = await getDocs(q);
        const listaAsesores = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVendedores(listaAsesores);
      } catch (err) {
        console.error("Error cargando asesores:", err);
      }
    };
    fetchAsesores();
  }, []);

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

  // FUNCIÓN PARA CONVERTIR ARCHIVO A BASE64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Límite de 1MB para no saturar Firestore gratuito
      if (selectedFile.size > 1024 * 1024) { 
        setError("El archivo es muy pesado. Máximo 1MB para evitar costos.");
        return;
      }

      setFileName(selectedFile.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64File(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const guardarRegistro = async () => {
    setError(null);

    if (!form.nombre || !form.apellido || !form.cedula || !form.vendedor || !base64File || !form.posgrado || !form.correo || !form.medioCaptacion) {
      setError("Faltan datos obligatorios o el comprobante.");
      return;
    }

    if (form.tipoIdentificacion === "Cédula" && !validarCedulaEcuatoriana(form.cedula)) {
      setError("La cédula no es válida.");
      return;
    }

    setLoading(true);

    try {
      const qExistente = query(collection(db, "registros"), where("cedula", "==", form.cedula));
      const existeSnap = await getDocs(qExistente);
      
      if (!existeSnap.empty) {
        throw new Error(`La identificación ${form.cedula} ya está registrada.`);
      }

      // Estructura para Firestore con el archivo en Base64 (Cero costos de Storage)
      const nuevoRegistro = {
        ...form,
        comprobanteBase64: base64File, // Aquí viaja el archivo como texto
        fechaCreacion: serverTimestamp(),
        fechaFiltro: new Date().toISOString().split('T')[0],
        estado: "Ingresado",
        
        FirstName: form.nombre,
        LastName: form.apellido,
        Programa: form.posgrado,
        Identification_type__c: form.tipoIdentificacion === "Cédula" ? "IDEC" : "PASS",
        Personal_identification__c: form.cedula,
        Email: form.correo,
        Phone: form.telefonoConvencional || "",
        MobilePhone: form.telefono,
        Status: "Registrado",
        LeadSource: form.medioCaptacion,
        Tipo_origen__c: "GESCO",
        Company: "UTE",
        Habeas_data__c: true 
      };

      await addDoc(collection(db, "registros"), nuevoRegistro);

      setOpen(true);
      setForm({ 
        nombre: "", apellido: "", tipoIdentificacion: "Cédula", cedula: "", 
        posgrado: "", experiencia: "", experienciaDocente: "No", correo: "", 
        telefono: "", telefonoConvencional: "", vendedor: "", medioCaptacion: ""
      });
      setBase64File(null);
      setFileName("");

    } catch (err: any) {
      setError(err.message || "Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
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
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField label="Nombres" fullWidth variant="filled" disabled={loading}
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} 
            />
            <TextField label="Apellidos" fullWidth variant="filled" disabled={loading}
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} 
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              label="Tipo ID" select sx={{ width: { xs: '100%', sm: '40%' } }} variant="filled" disabled={loading}
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.tipoIdentificacion} onChange={e => setForm({...form, tipoIdentificacion: e.target.value})}
            >
              <MenuItem value="Cédula">Cédula</MenuItem>
              <MenuItem value="Pasaporte">Pasaporte</MenuItem>
            </TextField>
            <TextField 
              label={form.tipoIdentificacion === "Cédula" ? "Número de Cédula" : "Número de Pasaporte"} 
              fullWidth variant="filled" disabled={loading}
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} 
            />
          </Box>

          <TextField 
            label="Maestría / Posgrado" select fullWidth variant="filled" disabled={loading}
            InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
            value={form.posgrado} onChange={e => setForm({...form, posgrado: e.target.value})}
          >
            {posgrados.map((p, i) => <MenuItem key={i} value={p}>{p}</MenuItem>)}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField label="WhatsApp / Celular" fullWidth variant="filled" disabled={loading}
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} 
            />
            <TextField label="Teléfono Convencional" fullWidth variant="filled" disabled={loading}
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.telefonoConvencional} onChange={e => setForm({...form, telefonoConvencional: e.target.value})} 
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField label="Correo Electrónico" fullWidth variant="filled" disabled={loading}
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} 
            />
            <TextField 
              label="¿Experiencia docente (+2 años)?" 
              select fullWidth variant="filled" disabled={loading}
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.experienciaDocente} 
              onChange={e => setForm({...form, experienciaDocente: e.target.value})}
            >
              <MenuItem value="Si">Sí, cuento con la experiencia</MenuItem>
              <MenuItem value="No">No por el momento</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
              label="Asesor GESCO Responsable" select fullWidth variant="filled" disabled={loading}
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.vendedor} onChange={e => setForm({...form, vendedor: e.target.value})}
            >
              <MenuItem value="" disabled>Seleccione un asesor</MenuItem>
              {vendedores.map((v, i) => (
                <MenuItem key={i} value={v.username}>{v.username}</MenuItem>
              ))}
            </TextField>

            <TextField 
              label="¿Cómo se enteró?" select fullWidth variant="filled" disabled={loading}
              InputProps={{ disableUnderline: true, sx: { borderRadius: '12px' } }}
              value={form.medioCaptacion} onChange={e => setForm({...form, medioCaptacion: e.target.value})}
            >
              <MenuItem value="" disabled>Seleccione una opción</MenuItem>
              {mediosCaptacion.map((m, i) => (
                <MenuItem key={i} value={m}>{m}</MenuItem>
              ))}
            </TextField>
          </Box>
          
          <Box sx={{ 
            p: 3, borderRadius: '16px', border: '2px dashed #1d6ea5', 
            bgcolor: 'rgba(29, 110, 165, 0.03)', textAlign: 'center'
          }}>
            <CloudUploadIcon sx={{ color: '#1d6ea5', fontSize: 32, mb: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#124a70', display: 'block' }}>
              Subir Comprobante (Máx. 1MB)
            </Typography>
            <Button variant="contained" component="label" size="small" sx={{ bgcolor: '#1d6ea5', mt: 2, borderRadius: '8px' }} disabled={loading}>
              {base64File ? "Comprobante Cargado ✓" : "Adjuntar Documento"}
              <input type="file" hidden accept="image/*,.pdf" onChange={handleFileChange} />
            </Button>
            {fileName && <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>{fileName}</Typography>}
          </Box>
          
          <Button variant="contained" size="large" onClick={guardarRegistro} disabled={loading}
            sx={{ 
              py: 2.2, borderRadius: "16px", fontWeight: 900, fontSize: '1.1rem',
              background: "linear-gradient(135deg, #1d6ea5 0%, #2a88ca 40%, #80bc71 100%)",
              minHeight: '64px'
            }}
          >
            {loading ? <CircularProgress size={26} color="inherit" /> : "Validar y Registrar en Sistema"}
          </Button>
        </Stack>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: '28px' } }}>
        <DialogContent sx={{ textAlign: 'center', p: 5 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#80bc71', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#124a70' }}>Registro Exitoso</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1.5 }}>
            El postulante ha sido ingresado correctamente (Modo Ahorro).
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 5 }}>
          <Button onClick={() => setOpen(false)} variant="contained" sx={{ borderRadius: '12px', px: 6, background: "#1d6ea5" }}>Continuar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}