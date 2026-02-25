import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { BrowserRouter } from "react-router-dom";
import { CssBaseline } from "@mui/material";
// 1. IMPORTA EL PROVEEDOR DE AUTENTICACIÓN
import { AuthProvider } from "./context/AuthContext"; 

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* 2. ENVUELVE TODO CON EL AUTHPROVIDER */}
    <AuthProvider> 
      <BrowserRouter>
        <CssBaseline />
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);