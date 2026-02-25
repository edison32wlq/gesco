import { Paper, Typography, Box, Card, CardContent, Divider, Stack, Avatar } from "@mui/material";
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

export default function HomePage() {
  const maestrias = [
    {
      titulo: "Maestría en Pedagogía",
      mencion: "Mención Docencia e Innovación Educativa",
      descripcion: "Formación avanzada para líderes educativos enfocada en nuevas metodologías y transformación digital en el aula.",
      color: "#124a70"
    },
    {
      titulo: "Maestría en Pedagogía",
      mencion: "Mención Gestión del Aprendizaje",
      descripcion: "Especialización en el diseño de entornos educativos eficaces y dirección estratégica de instituciones.",
      color: "#80bc71"
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header de Bienvenida */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          borderRadius: 4, 
          background: "linear-gradient(to right, #ffffff, #f1f5f9)",
          border: "1px solid rgba(0,0,0,0.05)",
          mb: 4 
        }}
      >
        <Typography variant="h4" fontWeight={900} sx={{ color: "#124a70", mb: 1 }}>
          Bienvenido al Portal Admissions 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
          Gestiona el proceso de admisión y seguimiento de los programas de posgrado de 
          <strong> GESCO Management</strong> de manera eficiente.
        </Typography>
      </Paper>

      <Typography variant="h5" fontWeight={800} sx={{ mb: 3, color: "#334155", display: 'flex', alignItems: 'center', gap: 1 }}>
        <MenuBookIcon sx={{ color: '#80bc71' }} /> Programas Disponibles
      </Typography>

      {/* Reemplazo de Grid por Box Flexbox */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, // Espacio entre tarjetas
        width: '100%' 
      }}>
        {maestrias.map((m, index) => (
          <Box 
            key={index} 
            sx={{ 
              flex: { xs: '1 1 100%', md: '1 1 calc(50% - 24px)' }, // 100% en móvil, 50% en desktop
              minWidth: { md: '300px' }
            }}
          >
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 4, 
                height: '100%',
                border: "1px solid rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 12px 20px rgba(0,0,0,0.05)",
                  borderColor: m.color
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar sx={{ bgcolor: m.color, width: 48, height: 48 }}>
                    <SchoolIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ color: "#1e293b", lineHeight: 1.2 }}>
                      {m.titulo}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ color: m.color }}>
                      {m.mencion}
                    </Typography>
                  </Box>
                </Stack>
                
                <Divider sx={{ my: 2, opacity: 0.6 }} />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {m.descripcion}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <LightbulbIcon sx={{ fontSize: 18, color: '#80bc71' }} />
                  <Typography variant="caption" fontWeight={700} color="text.primary">
                    MODALIDAD 100% ONLINE
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Footer Info */}
      <Box sx={{ mt: 6, textAlign: 'center', pb: 4 }}>
        <Typography variant="caption" color="text.disabled" fontWeight={600}>
          SISTEMA DE GESTIÓN ACADÉMICA V.2.0 • GESCO 2026
        </Typography>
      </Box>
    </Box>
  );
}