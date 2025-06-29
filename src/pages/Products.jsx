import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Cargando productos...");
        const querySnapshot = await getDocs(collection(db, "productos"));
        const productsData = [];

        querySnapshot.forEach((doc) => {
          productsData.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        console.log("Productos cargados:", productsData);
        setProducts(productsData);
      } catch (err) {
        console.error("Error cargando productos:", err);
        setError("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product, quantity) => {
    if (!user) {
      alert("Debes iniciar sesión para agregar productos al carrito");
      return;
    }

    addToCart(product, quantity);
    alert(`${product.nombre} agregado al carrito`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h2>Cargando productos...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="products-container">
      <h1>Catálogo de Productos</h1>

      {!user && (
        <div className="login-notice">
          <p>Inicia sesión para agregar productos al carrito</p>
        </div>
      )}

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
};

// Componente ProductCard integrado
const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img
          src={product.imagen}
          alt={product.nombre}
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/300x200?text=Imagen+No+Disponible";
          }}
        />
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.nombre}</h3>
        <p className="product-description">{product.descripcion}</p>
        <p className="product-price">${product.precio}</p>
        <p className="product-stock">Stock: {product.stock} unidades</p>

        <div className="product-actions">
          <div className="quantity-selector">
            <label htmlFor={`quantity-${product.id}`}>Cantidad:</label>
            <input
              type="number"
              id={`quantity-${product.id}`}
              min="1"
              max={product.stock}
              value={quantity}
              onChange={handleQuantityChange}
            />
          </div>

          <button
            className="add-to-cart-btn"
            onClick={() => onAddToCart(product, quantity)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? "Sin Stock" : "Agregar al Carrito"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Products;
