import { Paper, Typography } from "@mui/material";

export default function AboutPage() {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={900} gutterBottom>
        Acerca de
      </Typography>

      <Typography color="text.secondary">
        Ejercicio de Programación III: Router + Material UI + consumo simple de API.
      </Typography>

      <Typography sx={{ mt: 2 }}>
        Reglas: 6 páginas en <strong>src/pages</strong> y sin crear capas extra de servicios.
      </Typography>
    </Paper>
  );
}