import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar({ isLoggedIn, isAdmin, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const onLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="custom-navbar navbar navbar-expand-lg px-3 py-2">
      <Link
        className={`navbar-brand fw-bold brand-text ${isActive('/') ? 'active-link' : ''}`}
        to="/"
        aria-current={isActive('/') ? 'page' : undefined}
      >
        BingeCart
      </Link>
      <button
        className="navbar-toggler bg-light"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {['/', '/products', '/cart'].map((path, index) => (
            <li className="nav-item" key={index}>
              <Link
                className={`nav-link ${isActive(path) ? 'active-link' : 'link-text'}`}
                to={path}
              >
                {path === '/' ? 'Home' : path.replace('/', '').charAt(0).toUpperCase() + path.slice(2)}
              </Link>
            </li>
          ))}

          {isLoggedIn && (
            <>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive('/dashboard') ? 'active-link' : 'link-text'}`}
                  to="/dashboard"
                >
                  Dashboard
                </Link>
              </li>
              {isAdmin && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/admin') ? 'active-link-admin' : 'link-text-admin'}`}
                    to="/admin"
                  >
                    Admin Panel
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>

        <ul className="navbar-nav">
          {isLoggedIn ? (
            <li className="nav-item">
              <button
                className="btn logout-btn ms-2"
                onClick={onLogoutClick}
              >
                Logout
              </button>
            </li>
          ) : (
            <>
              <li className="nav-item me-2">
                <Link className="btn btn-outline-light auth-btn" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-warning auth-btn" to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>

      <style jsx>{`
        .custom-navbar {
          background-color: rgba(30, 30, 30, 0.85);
          backdrop-filter: saturate(180%) blur(10px);
          border-bottom: 2px solid #f39c12;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
        }

        .brand-text {
          color: #f39c12;
          font-size: 1.8rem;
          letter-spacing: 1.5px;
          transition: transform 0.3s ease;
        }

        .brand-text:hover {
          transform: scale(1.05);
        }

        .nav-link {
          position: relative;
          color: #eee !important;
          margin: 0 0.5rem;
          transition: color 0.3s ease;
          font-weight: 500;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          width: 0%;
          height: 2px;
          left: 0;
          bottom: 0;
          background-color: #f39c12;
          transition: width 0.3s;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .active-link::after {
          width: 100%;
        }

        .link-text-admin {
          color: #ffcc00 !important;
        }

        .active-link-admin::after {
          background-color: #ffcc00;
          width: 100%;
        }

        .logout-btn {
          background-color: #e74c3c;
          color: #fff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }

        .logout-btn:hover {
          background-color: #c0392b;
          box-shadow: 0 4px 15px rgba(231, 76, 60, 0.5);
        }

        .auth-btn {
          font-weight: 600;
          border-radius: 6px;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
