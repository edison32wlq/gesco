import { Paper, Typography } from "@mui/material";

export default function NotFoundPage() {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h5" fontWeight={900} gutterBottom>
        404
      </Typography>

      <Typography color="text.secondary">
        Ruta no encontrada. Usa el menú para volver.
      </Typography>
    </Paper>
  );
}