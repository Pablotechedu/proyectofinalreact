import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    submitOrder,
    clearCart,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleQuantityChange = async (productId, newQuantity) => {
    const result = await updateQuantity(productId, newQuantity);

    if (!result.success) {
      alert(`Error: ${result.error}`);
      // Recargar la página para mostrar el stock actual
      window.location.reload();
    }
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      alert("Debes iniciar sesión para realizar una orden");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = await submitOrder();

      if (result.success) {
        setMessage("¡Orden creada exitosamente!");
        alert(
          '¡Orden creada exitosamente! Puedes ver tus órdenes en "Mis Órdenes"'
        );
        navigate("/orders");
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error inesperado: ${error.message}`);
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h2>Carrito de Compras</h2>
          <p>Debes iniciar sesión para ver tu carrito</p>
          <button onClick={() => navigate("/login")} className="login-button">
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h2>Carrito de Compras</h2>
          <p>Tu carrito está vacío</p>
          <button onClick={() => navigate("/products")} className="shop-button">
            Ir a Comprar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Carrito de Compras</h1>

      {message && (
        <div
          className={`message ${
            message.includes("Error") ? "error" : "success"
          }`}
        >
          {message}
        </div>
      )}

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/100x100?text=No+Image";
                  }}
                />
              </div>

              <div className="item-details">
                <h3>{item.nombre}</h3>
                <p className="item-description">{item.descripcion}</p>
                <p className="item-price">Precio unitario: ${item.precio}</p>
              </div>

              <div className="item-quantity">
                <label>Cantidad:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="item-subtotal">
                <p>Subtotal: ${item.precio * item.quantity}</p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3>Resumen de la Orden</h3>
            <div className="summary-line">
              <span>Productos ({cartItems.length}):</span>
              <span>${getCartTotal()}</span>
            </div>
            <div className="summary-line total">
              <span>Total:</span>
              <span>${getCartTotal()}</span>
            </div>

            <div className="cart-actions">
              <button onClick={clearCart} className="clear-cart-btn">
                Vaciar Carrito
              </button>
              <button
                onClick={handleSubmitOrder}
                disabled={loading}
                className="submit-order-btn"
              >
                {loading ? "Procesando..." : "Ingresar Orden"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
