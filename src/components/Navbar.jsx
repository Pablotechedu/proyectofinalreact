import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const cartItemsCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          TiendaOnline
        </Link>

        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Inicio
          </Link>
          <Link to="/products" className="nav-link">
            Catálogo
          </Link>

          {user ? (
            <>
              <Link to="/orders" className="nav-link">
                Mis Órdenes
              </Link>
              <Link to="/cart" className="nav-link cart-link">
                Carrito ({cartItemsCount})
              </Link>
              <button onClick={handleLogout} className="nav-button">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-button">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
