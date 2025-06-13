import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [personalizedProducts, setPersonalizedProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products?featured=true')
      .then(res => res.json())
      .then(data => setFeaturedProducts(data))
      .catch(err => console.error(err));

    const viewedProductIds = JSON.parse(localStorage.getItem('viewedProducts')) || [];
    if (viewedProductIds.length > 0) {
      fetch(`http://localhost:5000/api/recommend/bulk?ids=${viewedProductIds.join(',')}`)
        .then(res => res.json())
        .then(data => setRecommendedProducts(data))
        .catch(err => console.error('Error fetching recommended products:', err));
    }

    const cartProductIds = JSON.parse(localStorage.getItem('cartProducts')) || [];
    const token = localStorage.getItem('token');

    if (token) {
      fetch('http://localhost:5000/api/recommend/personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ viewedProductIds, cartProductIds })
      })
        .then(res => res.json())
        .then(data => setPersonalizedProducts(data))
        .catch(err => console.error('Error fetching personalized recommendations:', err));
    }
  }, []);

  const featuredSliderSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } }
    ]
  };

  const otherSliderSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 576, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <div className="homepage-container container my-5">

      <section className="hero-section text-center p-5 rounded mb-5">
        <h1 className="display-4 fw-bold text-warning">Welcome to BingeCart!</h1>
        <p className="lead text-light">Binge on amazing deals & exclusive collections.</p>
        <Link to="/products" className="btn btn-lg glass-btn mt-3">Shop Now</Link>
      </section>

      <section>
        <h2 className="mb-4 text-warning text-center">🔥 Featured Products</h2>
        {featuredProducts.length === 0 ? (
          <p className="text-light text-center">Loading featured products...</p>
        ) : (
          <Slider {...featuredSliderSettings} className="featured-slider">
            {featuredProducts.map(product => (
              <div key={product._id} className="slider-item px-2">
                <div className="card bg-dark text-white product-card">
                  <img
                    src={product.imageUrl || '/placeholder.jpg'}
                    className="card-img-top product-img"
                    alt={product.name}
                  />
                  <div className="card-body d-flex flex-column justify-content-between text-center">
                    <h5 className="card-title text-warning">{product.name}</h5>
                    <p className="card-text text-light">₹{product.price.toFixed(2)}</p>
                    <Link to={`/product/${product._id}`} className="btn btn-outline-warning btn-sm glass-btn">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
      </section>

      {recommendedProducts.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-4 text-warning text-center">🎯 You May Also Like</h2>
          <Slider {...otherSliderSettings}>
            {recommendedProducts.map(product => (
              <div key={product._id} className="slider-item px-2">
                <div className="card bg-dark text-white product-card">
                  <img
                    src={product.imageUrl || '/placeholder.jpg'}
                    className="card-img-top product-img"
                    alt={product.name}
                  />
                  <div className="card-body d-flex flex-column justify-content-between text-center">
                    <h5 className="card-title text-warning">{product.name}</h5>
                    <p className="card-text text-light">₹{product.price.toFixed(2)}</p>
                    <Link to={`/product/${product._id}`} className="btn btn-outline-warning btn-sm glass-btn">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section>
      )}

      {personalizedProducts.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-4 text-warning text-center">💖 Recommended For You</h2>
          <Slider {...otherSliderSettings}>
            {personalizedProducts.map(product => (
              <div key={product._id} className="slider-item px-2">
                <div className="card bg-dark text-white product-card">
                  <img
                    src={product.imageUrl || '/placeholder.jpg'}
                    className="card-img-top product-img"
                    alt={product.name}
                  />
                  <div className="card-body d-flex flex-column justify-content-between text-center">
                    <h5 className="card-title text-warning">{product.name}</h5>
                    <p className="card-text text-light">₹{product.price.toFixed(2)}</p>
                    <Link to={`/product/${product._id}`} className="btn btn-outline-warning btn-sm glass-btn">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </section>
      )}

      <section className="about-section text-center my-5 p-4 rounded">
        <h2 className="text-warning">About Us</h2>
        <p className="text-light">BingeCart is your one-stop shop for the latest gadgets, fashion, and more. Our goal is to deliver quality products with unmatched service and fast delivery. Stay tuned for exciting offers!</p>
      </section>

      <footer className="footer-section text-center p-3 mt-5">
        <p className="text-light mb-0">&copy; 2025 BingeCart. Created By Aaryan Bansal.</p>
      </footer>

      <style jsx>{`
        .homepage-container {
          background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
          border-radius: 12px;
          padding: 20px;
          backdrop-filter: blur(6px);
        }
        .hero-section {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 15px;
        }
        .glass-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(241, 196, 15, 0.5);
          color: #f1c40f;
          padding: 10px 20px;
          border-radius: 30px;
          transition: transform 0.3s ease, background-color 0.3s ease;
        }
        .glass-btn:hover {
          background: rgba(241, 196, 15, 0.2);
          transform: scale(1.05);
        }
        .product-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(241, 196, 15, 0.3);
          backdrop-filter: blur(6px);
          border-radius: 15px;
          transition: transform 0.3s ease;
          max-width: 300px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .product-card:hover {
          transform: translateY(-5px);
        }
        .product-img {
          height: 200px;
          object-fit: cover;
          border-bottom: 1px solid #f1c40f;
          border-radius: 15px 15px 0 0;
        }
        .slider-item {
          box-sizing: border-box;
          padding: 0 10px;
          display: flex;
        }
        .slick-slider {
          max-width: 100%;
          overflow: hidden;
        }
        .slick-list {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
