import React, { useState } from 'react';

export default function Checkout({ token }) {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
    paymentMethod: 'Cash on Delivery',
  });

  const [message, setMessage] = useState('');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const items = cart.map(item => ({
      productId: item._id, 
      quantity: item.quantity,
      price: item.price   
    }));

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      ...formData,
      items,
      total,
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error('Order failed');

      setMessage('✅ Order placed successfully!');
      localStorage.removeItem('cart');
    } catch (err) {
      setMessage('❌ Failed to place order. Try again.');
    }
  };

  return (
    <div className="container bg-dark text-white p-4 rounded shadow-lg mt-4">
      <h2 className="text-danger mb-4">🛒 Checkout</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="form-control bg-black text-white border-danger"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="form-control bg-black text-white border-danger"
          ></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="form-control bg-black text-white border-danger"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Payment Method</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="form-select bg-black text-white border-danger"
          >
            <option>Cash on Delivery</option>
            <option>UPI</option>
            <option>Card</option>
          </select>
        </div>
        <button type="submit" className="btn btn-danger w-100">
          Place Order
        </button>
      </form>
      {message && <p className="mt-3 text-center">{message}</p>}
    </div>
  );
}
