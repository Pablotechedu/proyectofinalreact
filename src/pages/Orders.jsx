import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        console.log("Cargando órdenes para usuario:", user.id);

        const ordersRef = collection(db, "ordenes");
        const q = query(
          ordersRef,
          where("usuarioID", "==", user.id),
          orderBy("fecha", "desc")
        );

        const querySnapshot = await getDocs(q);
        const ordersData = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Convertir el JSON string de productos a array
          let productos = [];
          try {
            productos = JSON.parse(data.productos);
          } catch (e) {
            console.error("Error parsing productos:", e);
            productos = [];
          }

          ordersData.push({
            id: doc.id,
            ...data,
            productos: productos,
          });
        });

        console.log("Órdenes cargadas:", ordersData);
        setOrders(ordersData);
      } catch (err) {
        console.error("Error cargando órdenes:", err);
        setError("Error al cargar las órdenes");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Fecha no disponible";

    // Si es un timestamp de Firebase
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Si es un objeto Date normal
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return "Fecha no disponible";
  };

  if (!user) {
    return null; // El useEffect ya maneja la redirección
  }

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-container">
          <h2>Cargando órdenes...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-btn"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="orders-empty">
          <h1>Mis Órdenes</h1>
          <p>No tienes órdenes aún</p>
          <button onClick={() => navigate("/products")} className="shop-button">
            Ir a Comprar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>Mis Órdenes</h1>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Orden #{order.id.slice(-8)}</h3>
                <p className="order-date">{formatDate(order.fecha)}</p>
                <span className={`order-status ${order.estado}`}>
                  {order.estado}
                </span>
              </div>
              <div className="order-total">
                <span className="total-label">Total:</span>
                <span className="total-amount">${order.total}</span>
              </div>
            </div>

            <div className="order-products">
              <h4>Productos ({order.productos.length}):</h4>
              <div className="products-list">
                {order.productos.map((producto, index) => (
                  <div key={index} className="order-product">
                    <div className="product-image">
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/80x80?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="product-details">
                      <h5>{producto.nombre}</h5>
                      <p className="product-description">
                        {producto.descripcion}
                      </p>
                      <div className="product-pricing">
                        <span className="unit-price">
                          Precio unitario: ${producto.precio}
                        </span>
                        <span className="quantity">
                          Cantidad: {producto.quantity}
                        </span>
                        <span className="subtotal">
                          Subtotal: ${producto.precio * producto.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

// import React, { useState, useEffect } from "react";
// import { collection, query, where, getDocs } from "firebase/firestore";
// import { db } from "../services/firebase";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!user) {
//       navigate("/login");
//       return;
//     }

//     const fetchOrders = async () => {
//       try {
//         console.log("Cargando órdenes para usuario:", user.id);

//         const ordersRef = collection(db, "ordenes");
//         // Temporalmente sin orderBy hasta que se cree el índice
//         const q = query(ordersRef, where("usuarioID", "==", user.id));

//         const querySnapshot = await getDocs(q);
//         const ordersData = [];

//         querySnapshot.forEach((doc) => {
//           const data = doc.data();

//           // Convertir el JSON string de productos a array
//           let productos = [];
//           try {
//             productos = JSON.parse(data.productos);
//           } catch (e) {
//             console.error("Error parsing productos:", e);
//             productos = [];
//           }

//           ordersData.push({
//             id: doc.id,
//             ...data,
//             productos: productos,
//           });
//         });

//         // Ordenar manualmente por fecha (más reciente primero)
//         ordersData.sort((a, b) => {
//           const dateA = a.fecha?.toDate ? a.fecha.toDate() : new Date(a.fecha);
//           const dateB = b.fecha?.toDate ? b.fecha.toDate() : new Date(b.fecha);
//           return dateB - dateA;
//         });

//         console.log("Órdenes cargadas:", ordersData);
//         setOrders(ordersData);
//       } catch (err) {
//         console.error("Error cargando órdenes:", err);
//         setError("Error al cargar las órdenes");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [user, navigate]);

//   const formatDate = (timestamp) => {
//     if (!timestamp) return "Fecha no disponible";

//     // Si es un timestamp de Firebase
//     if (timestamp.toDate) {
//       return timestamp.toDate().toLocaleDateString("es-ES", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     }

//     // Si es un objeto Date normal
//     if (timestamp instanceof Date) {
//       return timestamp.toLocaleDateString("es-ES", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     }

//     return "Fecha no disponible";
//   };

//   if (!user) {
//     return null;
//   }

//   if (loading) {
//     return (
//       <div className="orders-container">
//         <div className="loading-container">
//           <h2>Cargando órdenes...</h2>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="orders-container">
//         <div className="error-container">
//           <h2>Error</h2>
//           <p>{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="retry-btn"
//           >
//             Reintentar
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (orders.length === 0) {
//     return (
//       <div className="orders-container">
//         <div className="orders-empty">
//           <h1>Mis Órdenes</h1>
//           <p>No tienes órdenes aún</p>
//           <button onClick={() => navigate("/products")} className="shop-button">
//             Ir a Comprar
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="orders-container">
//       <h1>Mis Órdenes</h1>

//       <div className="orders-list">
//         {orders.map((order) => (
//           <div key={order.id} className="order-card">
//             <div className="order-header">
//               <div className="order-info">
//                 <h3>Orden #{order.id.slice(-8)}</h3>
//                 <p className="order-date">{formatDate(order.fecha)}</p>
//                 <span className={`order-status ${order.estado}`}>
//                   {order.estado}
//                 </span>
//               </div>
//               <div className="order-total">
//                 <span className="total-label">Total:</span>
//                 <span className="total-amount">${order.total}</span>
//               </div>
//             </div>

//             <div className="order-products">
//               <h4>Productos ({order.productos.length}):</h4>
//               <div className="products-list">
//                 {order.productos.map((producto, index) => (
//                   <div key={index} className="order-product">
//                     <div className="product-image">
//                       <img
//                         src={producto.imagen}
//                         alt={producto.nombre}
//                         onError={(e) => {
//                           e.target.src =
//                             "https://via.placeholder.com/80x80?text=No+Image";
//                         }}
//                       />
//                     </div>
//                     <div className="product-details">
//                       <h5>{producto.nombre}</h5>
//                       <p className="product-description">
//                         {producto.descripcion}
//                       </p>
//                       <div className="product-pricing">
//                         <span className="unit-price">
//                           Precio unitario: ${producto.precio}
//                         </span>
//                         <span className="quantity">
//                           Cantidad: {producto.quantity}
//                         </span>
//                         <span className="subtotal">
//                           Subtotal: ${producto.precio * producto.quantity}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Orders;
