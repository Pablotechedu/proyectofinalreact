// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // PEGA AQUÍ TU CONFIGURACIÓN DE FIREBASE
  apiKey: "AIzaSyD66brwH5uRtBSTx5jGHVPrrkJ9fnf8ZXw",
  authDomain: "tienda-online-413f7.firebaseapp.com",
  projectId: "tienda-online-413f7",
  storageBucket: "tienda-online-413f7.firebasestorage.app",
  messagingSenderId: "632041375621",
  appId: "1:632041375621:web:76d65515a9b4289d15e6ec",
  measurementId: "G-LLZWGKSR02",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);
console.log("Firebase inicializado correctamente");
