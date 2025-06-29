import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage
    const savedUserId = localStorage.getItem("userId");
    console.log("Usuario guardado en localStorage:", savedUserId);
    if (savedUserId) {
      setUser({ id: savedUserId });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log("Intentando login con:", email);

      // Buscar usuario en Firestore
      const usersRef = collection(db, "usuarios");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      console.log("Documentos encontrados:", querySnapshot.size);

      if (querySnapshot.empty) {
        throw new Error("Usuario no encontrado");
      }

      const userData = querySnapshot.docs[0].data();
      const userId = querySnapshot.docs[0].id;

      console.log("Datos del usuario:", userData);
      console.log("ID del usuario:", userId);

      if (userData.password !== password) {
        throw new Error("Contraseña incorrecta");
      }

      // Guardar en localStorage y estado
      localStorage.setItem("userId", userId);
      setUser({ id: userId, ...userData });

      console.log("Login exitoso");
      return { success: true };
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password) => {
    try {
      console.log("Intentando registro con:", email);

      // Verificar si el usuario ya existe
      const usersRef = collection(db, "usuarios");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error("El usuario ya existe");
      }

      // Crear nuevo usuario
      const docRef = await addDoc(usersRef, {
        email,
        password,
        createdAt: new Date(),
      });

      console.log("Usuario creado con ID:", docRef.id);

      // Guardar en localStorage y estado
      localStorage.setItem("userId", docRef.id);
      setUser({ id: docRef.id, email });

      return { success: true };
    } catch (error) {
      console.error("Error en registro:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    console.log("Cerrando sesión");
    localStorage.removeItem("userId");
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
