import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ProductDetail({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);

        let history = JSON.parse(localStorage.getItem('viewedProducts')) || [];
        if (!history.includes(res.data._id)) {
          history.push(res.data._id);
          if (history.length > 10) history = history.slice(-10);
          localStorage.setItem('viewedProducts', JSON.stringify(history));
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/recommend?product_id=${id}`);
        setRecommendations(res.data);
      } catch (err) {
        console.error("Error fetching recommendations", err);
      }
    };

    fetchRecommendations();
  }, [id]);

  const addToCart = () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  if (!product) return <div className="text-white text-center py-5">Loading...</div>;

  return (
    <div className="container my-5 text-white">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="d-flex flex-column flex-md-row bg-dark rounded-4 shadow-lg p-4 glowing-border">

            <div className="text-center mb-4 mb-md-0 me-md-4" style={{ flex: '1' }}>
              <img
                src={product.imageUrl || 'https://via.placeholder.com/500x500'}
                alt={product.name}
                className="img-fluid rounded-3 border border-secondary product-image"
              />
            </div>

            <div style={{ flex: '1.5' }}>
              <h2 className="text-danger fw-bold mb-3 product-title">{product.name}</h2>
              <p className="text-light product-description">{product.description}</p>
              <p className="text-info product-category">
                Category: {product.category || 'Uncategorized'}
              </p>
              <h4 className="text-success mb-3">₹{product.price}</h4>

              <div className="d-flex align-items-center mb-3">
                <label htmlFor="qty" className="me-2">Quantity:</label>
                <input
                  type="number"
                  id="qty"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="form-control quantity-input"
                  min="1"
                />
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-danger add-to-cart-btn" onClick={addToCart}>
                  <i className="bi bi-cart-plus-fill me-1" /> Add to Cart
                </button>
                <button className="btn btn-outline-light back-btn" onClick={() => navigate('/')}>
                  ← Back to Products
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="mt-5">
          <h4 className="text-danger mb-3 text-center">You May Also Like</h4>
          <div className="row justify-content-center">
            {recommendations.map(item => (
              <div className="col-md-2 mb-4" key={item._id}>
                <div className="card bg-dark text-white glass-card h-100">
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/200x200'}
                    className="card-img-top"
                    alt={item.name}
                    style={{ height: '150px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                  />
                  <div className="card-body p-2 d-flex flex-column justify-content-between">
                    <h6 className="card-title text-danger">{item.name}</h6>
                    <p className="card-text text-info small">{item.category}</p>
                    <button
                      className="btn btn-sm btn-outline-light mt-2"
                      onClick={() => navigate(`/product/${item._id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .glowing-border {
          border: 2px solid #e74c3c;
          box-shadow: 0 0 15px rgba(231, 76, 60, 0.5);
          transition: box-shadow 0.3s ease;
        }
        .glowing-border:hover { box-shadow: 0 0 25px rgba(231, 76, 60, 0.8); }
        .product-image { max-height: 400px; object-fit: contain; transition: transform 0.3s ease; }
        .product-image:hover { transform: scale(1.05); }
        .quantity-input { width: 80px; background-color: #333; border: 1px solid #555; color: white; }
        .add-to-cart-btn { background-color: #e74c3c; border: none; font-weight: 600; transition: background-color 0.3s ease, box-shadow 0.3s ease; }
        .add-to-cart-btn:hover { background-color: #c0392b; box-shadow: 0 4px 12px rgba(231, 76, 60, 0.6); }
        .back-btn { border-color: #aaa; transition: background-color 0.3s ease, color 0.3s ease; }
        .back-btn:hover { background-color: #fff; color: #000; }
        .glass-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); backdrop-filter: blur(6px); border-radius: 15px; transition: transform 0.3s ease; }
        .glass-card:hover { transform: scale(1.03); }
        .product-title:hover { color: #ff7675; }
        .product-category { font-size: 1rem; font-weight: 500; color: #17a2b8; }
      `}</style>
    </div>
  );
}

export default ProductDetail;
