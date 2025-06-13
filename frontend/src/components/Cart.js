import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cart({ token }) {
  const navigate = useNavigate();

  const authToken = token || localStorage.getItem('token');

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const removeItem = (id) => {
    const updated = cart.filter(item => item._id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const handleCheckout = () => {
    if (!authToken) {
      alert("Please login to checkout.");
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0)
    return (
      <p style={{ color: '#bbb', fontSize: '1.2rem', textAlign: 'center', marginTop: '2rem' }}>
        Your cart is empty.
      </p>
    );

  return (
    <div className="cart-container fade-in">
      <h2 className="cart-title">Your Cart</h2>

      {cart.map((item) => (
        <div key={item._id} className="cart-item">
          <div className="item-info">
            <span className="item-name">{item.name}</span>{' '}
            <small className="item-qty">(x{item.quantity})</small>
          </div>
          <div className="item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
          <button
            className="btn btn-sm btn-remove"
            onClick={() => removeItem(item._id)}
            aria-label={`Remove ${item.name} from cart`}
          >
            Remove
          </button>
        </div>
      ))}

      <div className="cart-footer">
        <h4 className="total-amount">Total: ₹{total.toFixed(2)}</h4>
        <button className="btn btn-primary btn-checkout" onClick={handleCheckout}>
          Checkout
        </button>
      </div>

      <style jsx>{`
        .cart-container {
          max-width: 600px;
          margin: 2rem auto;
          background-color: #1e1e1e;
          padding: 1.5rem 2rem;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
          color: #eee;
          font-family: 'Poppins', sans-serif;
        }

        .cart-title {
          font-weight: 700;
          font-size: 2rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #f39c12;
          padding-bottom: 0.5rem;
          letter-spacing: 1.2px;
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #333;
          transition: background-color 0.3s ease;
          border-radius: 6px;
        }

        .cart-item:hover {
          background-color: #2a2a2a;
        }

        .item-info {
          flex: 1;
          font-size: 1.1rem;
        }

        .item-name {
          font-weight: 600;
        }

        .item-qty {
          color: #bbb;
          font-weight: 400;
          margin-left: 6px;
        }

        .item-price {
          width: 100px;
          text-align: right;
          font-weight: 600;
          font-size: 1.1rem;
          color: #f39c12;
        }

        .btn-remove {
          margin-left: 1rem;
          background: transparent;
          border: 2px solid #e74c3c;
          color: #e74c3c;
          padding: 4px 12px;
          border-radius: 6px;
          font-weight: 600;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .btn-remove:hover {
          background-color: #e74c3c;
          color: #1e1e1e;
          box-shadow: 0 4px 15px rgba(231, 76, 60, 0.6);
        }

        .cart-footer {
          margin-top: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-amount {
          font-weight: 700;
          font-size: 1.6rem;
          color: #f39c12;
        }

        .btn-primary.btn-checkout {
          background-color: #f39c12;
          border: none;
          padding: 0.8rem 2rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1.1rem;
          color: #121212;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(243, 156, 18, 0.6);
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }

        .btn-primary.btn-checkout:hover {
          background-color: #d17e0a;
          box-shadow: 0 8px 30px rgba(209, 126, 10, 0.8);
        }

        /* Fade-in animation */
        .fade-in {
          animation: fadeIn 0.6s ease forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
