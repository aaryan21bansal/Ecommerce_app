import React, { useEffect, useState } from 'react';

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', imageUrl: '', category: '' });
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          imageUrl: form.imageUrl,
          category: form.category
        })
      });

      const data = await res.json();
      alert(data.message || 'Product added');
      setForm({ name: '', price: '', imageUrl: '', category: '' });
      fetchProducts();
    } catch (err) {
      alert("Failed to add product");
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      alert(data.message);
      fetchProducts();
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  return (
    <div className="container mt-4 text-white admin-container">
      <h2 className="text-danger mb-3 text-center">Admin Panel</h2>

      <form onSubmit={handleAdd} className="mb-4 p-4 glass-form">
        <h5 className="mb-3 text-danger">Add New Product</h5>
        <div className="mb-3">
          <input
            className="form-control glass-input"
            type="text"
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control glass-input"
            type="number"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control glass-input"
            type="text"
            placeholder="Image URL"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control glass-input"
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          />
        </div>
        <button className="btn btn-danger w-100" type="submit">Add Product</button>
      </form>

      <div className="row">
        {products.map(product => (
          <div className="col-md-3 mb-4" key={product._id}>
            <div className="card glass-card text-white h-100">
              <img
                src={product.imageUrl || "/placeholder.jpg"}
                className="card-img-top"
                alt={product.name}
                style={{ height: '200px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
              />
              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h5 className="card-title text-danger">{product.name}</h5>
                  <p className="card-text text-white-50">₹{product.price}</p>
                  <p className="card-text text-info">Category: {product.category || 'Uncategorized'}</p>
                </div>
                <button
                  className="btn btn-outline-danger mt-2"
                  onClick={() => handleDelete(product._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      
      <style jsx>{`
        .admin-container {
          backdrop-filter: blur(6px);
          border-radius: 12px;
        }

        .glass-form {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 15px;
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          backdrop-filter: blur(4px);
          border-radius: 8px;
          padding: 10px;
        }

        .glass-input::placeholder {
          color: rgba(255,255,255,0.7);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border-radius: 15px;
          transition: transform 0.3s ease;
        }

        .glass-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}
