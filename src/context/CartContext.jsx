import React, { createContext, useContext, useState } from "react";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  runTransaction,
  getDoc,
} from "firebase/firestore";
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

  const addToCart = async (product, quantity = 1) => {
    try {
      // Verificar stock actual en Firebase antes de agregar
      const productRef = doc(db, "productos", product.id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error("Producto no encontrado");
      }

      const currentStock = productSnap.data().stock;
      const existingItem = cartItems.find((item) => item.id === product.id);
      const currentCartQuantity = existingItem ? existingItem.quantity : 0;
      const totalRequestedQuantity = currentCartQuantity + quantity;

      if (totalRequestedQuantity > currentStock) {
        const availableToAdd = currentStock - currentCartQuantity;
        if (availableToAdd <= 0) {
          throw new Error(`No hay más stock disponible para ${product.nombre}`);
        } else {
          throw new Error(
            `Solo puedes agregar ${availableToAdd} unidades más de ${product.nombre}. Stock disponible: ${currentStock}`
          );
        }
      }

      // Si hay stock suficiente, agregar al carrito
      setCartItems((prevItems) => {
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

      return { success: true };
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      return { success: false, error: error.message };
    }
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    try {
      // Verificar stock antes de actualizar cantidad
      const productRef = doc(db, "productos", productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error("Producto no encontrado");
      }

      const currentStock = productSnap.data().stock;

      if (newQuantity > currentStock) {
        throw new Error(`Stock insuficiente. Disponible: ${currentStock}`);
      }

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );

      return { success: true };
    } catch (error) {
      console.error("Error al actualizar cantidad:", error);
      return { success: false, error: error.message };
    }
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
      // Usar transacción para garantizar consistencia
      const result = await runTransaction(db, async (transaction) => {
        // 1. Verificar stock de todos los productos
        const stockChecks = [];
        for (const item of cartItems) {
          const productRef = doc(db, "productos", item.id);
          const productSnap = await transaction.get(productRef);

          if (!productSnap.exists()) {
            throw new Error(`Producto ${item.nombre} no encontrado`);
          }

          const currentStock = productSnap.data().stock;
          if (currentStock < item.quantity) {
            throw new Error(
              `Stock insuficiente para ${item.nombre}. Disponible: ${currentStock}, Solicitado: ${item.quantity}`
            );
          }

          stockChecks.push({
            ref: productRef,
            currentStock,
            quantityToSubtract: item.quantity,
          });
        }

        // 2. Si todo el stock está disponible, crear la orden
        const orderData = {
          usuarioID: user.id,
          productos: JSON.stringify(cartItems),
          total: getCartTotal(),
          fecha: new Date(),
          estado: "pendiente",
        };

        const orderRef = doc(collection(db, "ordenes"));
        transaction.set(orderRef, orderData);

        // 3. Actualizar stock de todos los productos
        stockChecks.forEach(({ ref, currentStock, quantityToSubtract }) => {
          transaction.update(ref, {
            stock: currentStock - quantityToSubtract,
          });
        });

        return orderRef.id;
      });

      // 4. Limpiar carrito solo si todo salió bien
      clearCart();

      return { success: true, orderId: result };
    } catch (error) {
      console.error("Error al procesar orden:", error);
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
