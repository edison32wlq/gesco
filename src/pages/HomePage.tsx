import { 
  Paper, Typography, Box, Card, Stack, Button, Chip, 
  Divider, Container, List, ListItem, ListItemIcon, ListItemText 
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import BlockIcon from '@mui/icons-material/Block';
import TimerIcon from '@mui/icons-material/Timer';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

/**
 * Componente HomePage
 * Presenta la oferta académica de Maestrías en convenio GESCO - UTE.
 * Incluye secciones de beneficios, inversión, programas y datos bancarios.
 */
export default function HomePage() {
  // Configuración de los programas con sus respectivos brochures PDF actualizados
  const maestrias = [
    {
      titulo: "Maestría en Educación Inclusiva",
      mencion: "Mención Inclusión Educativa y Atención a la Diversidad",
      // Archivo actualizado: educacion (1) (1)_260323_170700.pdf
      url: "/docs/educacion (1) (1)_260323_170700.pdf",
      color: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
      shadow: "rgba(59, 130, 246, 0.2)"
    },
    {
      titulo: "Maestría en Pedagogía e Innovación",
      mencion: "Mención Docencia e Innovación Educativa",
      // Archivo actualizado: pedagogia (1)-1_260323_170633.pdf
      url: "/docs/pedagogia (1)-1_260323_170633.pdf",
      color: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      shadow: "rgba(16, 185, 129, 0.2)"
    },
    {
      titulo: "Maestría en Administración Educativa",
      mencion: "Gestión y Dirección de Instituciones",
      // Archivo actualizado: administracion-educativa (1) (1)_260323_170807.pdf
      url: "/docs/administracion-educativa (1) (1)_260323_170807.pdf",
      color: "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)",
      shadow: "rgba(245, 158, 11, 0.2)"
    }
  ];

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', pb: 10, color: '#1e293b', fontFamily: "'Inter', sans-serif" }}>
      
      {/* --- HERO SECTION --- 
          Sección de bienvenida con gradientes radiales y branding del convenio.
      */}
      <Box sx={{ 
        pt: { xs: 8, md: 12 }, pb: { xs: 10, md: 14 },
        background: 'radial-gradient(circle at 50% -20%, #eff6ff 0%, #ffffff 80%)',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={3}>
            <Chip 
              label="CONVENIO EXCLUSIVO GESCO - UTE" 
              sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', fontWeight: 900, px: 1, border: '1px solid rgba(37, 99, 235, 0.2)' }} 
            />
            <Typography variant="h1" align="center" sx={{ 
              fontWeight: 950, fontSize: { xs: '2.5rem', md: '4.2rem' }, 
              lineHeight: 1.1, color: '#0f172a', letterSpacing: '-0.05em'
            }}>
              Maestrías de <br /> 
              <span style={{ 
                background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>Educación y Pedagogía</span>
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
              <Paper elevation={0} sx={{ px: 3, py: 1, borderRadius: 10, bgcolor: '#fff1f2', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon sx={{ color: '#e11d48', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ color: '#be123c', fontWeight: 900 }}>HASTA EL 15 DE ABRIL</Typography>
              </Paper>
              <Paper elevation={0} sx={{ px: 3, py: 1, borderRadius: 10, bgcolor: '#f0fdf4', border: '1px solid #dcfce7', display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ color: '#15803d', fontWeight: 900 }}>450 BECAS DISPONIBLES</Typography>
              </Paper>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* --- REQUISITOS E INVERSIÓN --- 
          Detalles sobre beneficios académicos y costos con beca aplicada.
      */}
      <Container maxWidth="lg" sx={{ mt: -5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
          <Paper elevation={0} sx={{ 
            p: 4, borderRadius: 7, border: '1px solid #e2e8f0', 
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)', bgcolor: '#fff' 
          }}>
            <Typography variant="h5" fontWeight={900} sx={{ mb: 3, color: '#2563eb', letterSpacing: -0.5 }}>Beneficios</Typography>
            <List sx={{ p: 0 }}>
              {["Sin examen de admisión ni B2 de inglés.", "Registro oficial en Senescyt.", "Graduación vía Examen Complexivo.", "Duración: 12 meses."].map((text, i) => (
                <ListItem key={i} sx={{ px: 0, py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 35 }}><CheckCircleIcon sx={{ color: '#10b981' }} /></ListItemIcon>
                  <ListItemText primary={text} primaryTypographyProps={{ fontWeight: 600, color: '#475569' }} />
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper elevation={0} sx={{ 
            p: 4, borderRadius: 7, border: '1px solid #e2e8f0', 
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.03)', bgcolor: '#fff',
            display: 'flex', flexDirection: 'column', justifyContent: 'center'
          }}>
            <Typography variant="h5" fontWeight={900} sx={{ mb: 2, color: '#e11d48', letterSpacing: -0.5 }}>Inversión</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h2" sx={{ fontWeight: 950, color: '#0f172a', lineHeight: 1, mb: 1 }}>$2250</Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>Valor normal: $6355 (Ahorro exclusivo)</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2, fontWeight: 500 }}>
              Aceptamos <strong>Tarjeta de Crédito</strong> (Mensualizado o Pago único).
            </Typography>
            <Chip icon={<BlockIcon />} label="TECNOLOGÍAS NO PERMITIDAS" sx={{ width: 'fit-content', fontWeight: 800, fontSize: '0.65rem', bgcolor: '#f8fafc', color: '#94a3b8' }} />
          </Paper>
        </Box>
      </Container>

      {/* --- MAESTRÍAS DISPONIBLES --- 
          Grid de tarjetas interactivas que enlazan a los nuevos brochures PDF.
      */}
      <Container maxWidth="lg" sx={{ mt: 12 }}>
        <Typography variant="h3" align="center" sx={{ fontWeight: 950, mb: 8, color: '#0f172a', letterSpacing: -1 }}>Programas Disponibles</Typography>
        <Box sx={{ 
          display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4 
        }}>
          {maestrias.map((m, index) => (
            <Card key={index} elevation={0} sx={{ 
              borderRadius: 7, border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column',
              transition: '0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              '&:hover': { transform: 'translateY(-12px)', boxShadow: `0 30px 60px -12px ${m.shadow}` }
            }}>
              {/* Header con degradado dinámico según el programa */}
              <Box sx={{ p: 4, background: m.color, color: 'white' }}>
                <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2, fontSize: '1.25rem' }}>
                  {m.titulo}
                </Typography>
              </Box>
              
              {/* Información del programa y botón de descarga/visualización */}
              <Box sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 4, minHeight: '3rem', fontWeight: 500, lineHeight: 1.4 }}>
                  {m.mencion}
                </Typography>
                <Button 
                  fullWidth 
                  variant="contained" 
                  endIcon={<ArrowForwardIosIcon sx={{ fontSize: '10px !important' }} />} 
                  href={m.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    borderRadius: 4, py: 1.8, fontWeight: 900, textTransform: 'none', 
                    background: m.color, boxShadow: 'none', mt: 'auto'
                  }}
                >
                  Ver Brochure PDF
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      </Container>

      {/* --- SECCIÓN BANCARIA --- 
          Información para la reserva de cupo mediante depósito o transferencia.
      */}
      <Container maxWidth="md" sx={{ mt: 15 }}>
        <Paper elevation={0} sx={{ 
          p: { xs: 4, md: 6 }, borderRadius: 9, bgcolor: '#f8fafc', border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <Chip label="PASO 1: RESERVA" sx={{ bgcolor: '#0f172a', color: 'white', fontWeight: 900, mb: 3 }} />
          <Typography variant="h4" fontWeight={950} sx={{ color: '#0f172a', mb: 1 }}>Asegura tu Cupo</Typography>
          <Typography variant="h6" sx={{ color: '#2563eb', fontWeight: 800, mb: 4 }}>Aporte Administrativo: $20.00</Typography>
          
          <Box sx={{ 
            p: 4, borderRadius: 6, bgcolor: '#fffdeb', border: '2px dashed #facc15',
            mx: 'auto', maxWidth: '450px'
          }}>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="overline" fontWeight={900} color="#854d0e">BANCO PICHINCHA</Typography>
                <AccountBalanceIcon sx={{ color: '#ca8a04' }} />
              </Stack>
              <Typography variant="h4" fontWeight={950} color="#1e293b">2100212066</Typography>
              <Divider sx={{ my: 1, borderColor: 'rgba(133, 77, 14, 0.1)' }} />
              <Typography variant="body2" fontWeight={700} color="#475569">Fundación GESCO | RUC: 1792916895001</Typography>
              <Typography variant="caption" color="#94a3b8">Cuenta Corriente</Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
      
      {/* Espacio adicional al final de la página */}
      <Box sx={{ height: 40 }} />
    </Box>
  );
}