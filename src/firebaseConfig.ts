import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// 1. Agregamos "export" aquí para poder usarla en la creación de usuarios temporales
export const firebaseConfig = {
  apiKey: "AIzaSyBsrrZ0EyMZdItdO3u0Elukk9vqTVWA-eQ",
  authDomain: "gesco-admisiones.firebaseapp.com",
  projectId: "gesco-admisiones",
  storageBucket: "gesco-admisiones.firebasestorage.app",
  messagingSenderId: "581650068894",
  appId: "1:581650068894:web:50814c889f72198021928f"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos las herramientas
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);