import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product, addToCart }) { 
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div
      className="product-card card text-white border-0 shadow-sm"
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="image-container position-relative">
        <img
          src={product.imageUrl || '/placeholder.jpg'}
          className="card-img-top"
          alt={product.name}
        />
        <div className="overlay"></div>
      </div>
      <div className="card-body d-flex flex-column justify-content-between">
        <div className="text-center">
          <h5 className="card-title">{product.name}</h5>
          <p className="card-category">{product.category || 'Uncategorized'}</p>
          <p className="card-price">₹{product.price.toFixed(2)}</p>
        </div>
        <button
          className="btn btn-outline-warning mt-2"
          onClick={(e) => {
            e.stopPropagation(); 
            addToCart(product); 
          }}
        >
          Add to Cart
        </button>
      </div>

      <style jsx>{`
        .product-card {
          width: 250px;
          height: 400px;
          background: rgba(30, 30, 30, 0.7);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .product-card:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 24px rgba(255, 165, 0, 0.3);
          border-color: rgba(255, 165, 0, 0.5);
        }

        .image-container {
          width: 100%;
          height: 200px;
          position: relative;
        }

        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 16px 16px 0 0;
        }

        .overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
          border-radius: 16px 16px 0 0;
        }

        .card-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #f5c518;
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
          margin-bottom: 0.3rem;
        }

        .card-category {
          font-size: 0.9rem;
          color: #ccc;
          margin-bottom: 0.5rem;
        }

        .card-price {
          font-size: 1rem;
          color: #e0e0e0;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
