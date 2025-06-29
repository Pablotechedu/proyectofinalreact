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

  const handleAddToCart = async (product, quantity) => {
    if (!user) {
      alert("Debes iniciar sesión para agregar productos al carrito");
      return;
    }

    const result = await addToCart(product, quantity);

    if (result.success) {
      alert(`${product.nombre} agregado al carrito`);
      // Recargar productos para mostrar stock actualizado
      window.location.reload();
    } else {
      alert(`Error: ${result.error}`);
    }
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

// Componente ProductCard mejorado con manejo de stock
const ProductCard = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock <= 5 && product.stock > 0;

  return (
    <div className={`product-card ${isOutOfStock ? "out-of-stock" : ""}`}>
      <div className="product-image">
        <img
          src={product.imagen}
          alt={product.nombre}
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/300x200?text=Imagen+No+Disponible";
          }}
        />
        {isOutOfStock && (
          <div className="stock-overlay">
            <span>SIN STOCK</span>
          </div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.nombre}</h3>
        <p className="product-description">{product.descripcion}</p>
        <p className="product-price">${product.precio}</p>

        <div className="stock-info">
          {isOutOfStock ? (
            <p className="stock-status out-of-stock">Sin stock</p>
          ) : isLowStock ? (
            <p className="stock-status low-stock">
              ¡Últimas {product.stock} unidades!
            </p>
          ) : (
            <p className="stock-status in-stock">
              Stock: {product.stock} unidades
            </p>
          )}
        </div>

        {!isOutOfStock && (
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
            >
              Agregar al Carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
