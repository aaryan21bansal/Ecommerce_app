import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import ProductList from './components/ProductList';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import Cart from './components/Cart';
import Navbar from './components/Navbar';
import AdminPanel from './components/AdminPanel';
import ProductDetail from './components/ProductDetail';
import HomePage from './components/HomePage';
import Checkout from './components/Checkout';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!token);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoggedIn(false);
      return;
    }

    fetch('http://localhost:5000/api/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user info');
        return res.json();
      })
      .then(data => {
        setUser(data);
        setIsLoggedIn(true);
      })
      .catch(() => {
        setUser(null);
        setIsLoggedIn(false);
        setToken(null);
        localStorage.removeItem('token');
      });
  }, [token]);

  const handleLogin = (tokenFromLogin) => {
    localStorage.setItem('token', tokenFromLogin);
    setToken(tokenFromLogin);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  const addToCart = (product) => {  
    setCart((prevCart) => [...prevCart, product]);
  };

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} isAdmin={user?.is_admin} handleLogout={handleLogout} />
      <div className="container mt-3">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/products" element={<ProductList addToCart={addToCart} />} />

          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLoginSuccess={handleLogin} />}
          />
          <Route
            path="/register"
            element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register />}
          />
          <Route
            path="/dashboard"
            element={isLoggedIn ? <Dashboard token={token} handleLogout={handleLogout} user={user} /> : <Navigate to="/login" />}
          />
          
          <Route path="/cart" element={<Cart token={token} cart={cart} />} />

          <Route
            path="/admin"
            element={isLoggedIn && user?.is_admin ? <AdminPanel token={token} /> : <Navigate to="/login" />}
          />
          <Route path="/checkout" element={isLoggedIn ? <Checkout token={token} /> : <Navigate to="/login" />} />
          <Route path="/product/:id" element={<ProductDetail token={token} />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
