import React, { createContext, useContext, useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.precio * item.quantity,
      0
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const submitOrder = async () => {
    if (!user || cartItems.length === 0) {
      throw new Error("No hay usuario logueado o el carrito está vacío");
    }

    try {
      const orderData = {
        usuarioID: user.id, // Cambiar de userId a usuarioID
        productos: JSON.stringify(cartItems),
        total: getCartTotal(),
        fecha: new Date(),
        estado: "pendiente",
      };

      const docRef = await addDoc(collection(db, "ordenes"), orderData);
      clearCart();

      return { success: true, orderId: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    clearCart,
    submitOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
