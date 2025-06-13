import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion'; 

export default function Dashboard({ handleLogout, user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch orders');
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [token]);

  const formatIST = (utcDate) => {
    const date = new Date(utcDate);
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  };

  let cartLength = 0;
  try {
    const cart = JSON.parse(localStorage.getItem('cart'));
    cartLength = Array.isArray(cart) ? cart.length : 0;
  } catch (e) {
    cartLength = 0;
  }

  return (
    <motion.div 
      className="container dashboard-container text-white py-5 px-4 rounded-4 shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      
      <div className="d-flex justify-content-between align-items-center mb-5 border-bottom pb-3">
        <h2 className="text-gradient fw-bold">Welcome, {user?.name || 'User'}!</h2>
        <motion.button
          className="glow-btn fw-semibold px-4"
          whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(255, 75, 43, 1)" }}
          onClick={handleLogout}
        >
          Logout
        </motion.button>
      </div>

      <div className="row g-4 mb-5">
        {[ 
          { title: "👤 Profile Info", content: (
              <>
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> 
                  <span className={`badge ms-2 ${user?.is_admin ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                    {user?.is_admin ? 'Admin' : 'User'}
                  </span>
                </p>
              </>
            )
          },
          { title: "📊 Your Stats", content: (
              <>
                <p>🛒 <strong>Cart Items:</strong> <span className="text-success">{cartLength}</span></p>
                <p>📦 <strong>Orders Placed:</strong> <span className="text-success">{orders.length}</span></p>
              </>
            )
          }
        ].map((card, index) => (
          <motion.div 
            key={index} 
            className="col-md-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.3 }}
          >
            <div className="card bg-dark glass-card border-0 rounded-4 shadow h-100">
              <div className="card-body d-flex flex-column justify-content-center">
                <h5 className="text-danger mb-3">{card.title}</h5>
                {card.content}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-danger" role="status" />
        </div>
      )}

      {error && (
        <motion.div 
          className="alert alert-warning text-dark" 
          role="alert"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          ⚠️ {error}
        </motion.div>
      )}

      {!loading && !error && (
        <>
          <h4 className="text-danger mb-4">🧾 Your Orders</h4>
          {orders.length === 0 ? (
            <p className="text-muted">You haven’t placed any orders yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover border border-secondary rounded-4 overflow-hidden">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total (₹)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <motion.tr 
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td>{order._id}</td>
                      <td>{formatIST(order.created_at)}</td>
                      <td>
                        <ul className="mb-0 ps-3">
                          {order.items.map(item => (
                            <li key={item.productId}>
                              {item.name || 'Unnamed'} × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="fw-bold text-success">₹{order.total.toFixed(2)}</td>
                      <td>
                        <span className="badge bg-warning text-dark">
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .dashboard-container {
          background: linear-gradient(135deg, #0f0f0f, #1a1a1a);
          border-radius: 20px;
          box-shadow: 0 0 30px rgba(255, 0, 0, 0.2);
        }

        .text-gradient {
          background: linear-gradient(45deg, #ff416c, #ff4b2b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .glow-btn {
          background: linear-gradient(45deg, #ff416c, #ff4b2b);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 30px;
          box-shadow: 0 0 15px rgba(255, 65, 108, 0.6);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f1f1f1;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .glass-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0 20px rgba(255, 65, 108, 0.4);
        }

        .table-responsive {
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(255, 65, 108, 0.2);
        }

        table {
          color: #f8f9fa;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(5px);
          border-collapse: separate;
          border-spacing: 0;
        }

        thead th {
          background: linear-gradient(45deg, #ff416c, #ff4b2b);
          color: #212529;
          text-align: center;
          padding: 12px;
        }

        tbody td {
          padding: 12px;
          text-align: center;
          vertical-align: middle;
        }

        tbody tr:hover {
          background-color: rgba(255, 65, 108, 0.1);
          transition: background 0.3s ease;
          transform: scale(1.01);
        }

        .alert-warning {
          background-color: rgba(255, 193, 7, 0.2);
          border: 1px solid #ffc107;
          color: #ffc107;
        }
      `}</style>
    </motion.div>
  );
}
