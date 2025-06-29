import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Bienvenido a TiendaOnline</h1>
        <p>Encuentra los mejores productos al mejor precio</p>

        {user ? (
          <div className="welcome-user">
            <h2>¡Hola! Bienvenido de vuelta</h2>
            <Link to="/products" className="cta-button">
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="guest-actions">
            <Link to="/login" className="cta-button">
              Iniciar Sesión
            </Link>
            <Link to="/products" className="secondary-button">
              Ver Productos
            </Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <div className="feature">
          <h3>Amplio Catálogo</h3>
          <p>Encuentra una gran variedad de productos</p>
        </div>
        <div className="feature">
          <h3>Fácil Compra</h3>
          <p>Proceso de compra simple y seguro</p>
        </div>
        <div className="feature">
          <h3>Seguimiento</h3>
          <p>Rastrea todas tus órdenes</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
