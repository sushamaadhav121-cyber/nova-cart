import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Navbar() {
  const navigateTo = useNavigate();

  // Getting logged-in user data from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // Handling logout functionality
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully!');
    navigateTo('/login', { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
      <div className="container-fluid px-4">
        {/* Brand Logo */}
        <Link className="navbar-brand fw-bold text-primary fs-4" to="/">
          <i className="bi bi-cart2 me-2"></i>NovaCart
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Items */}
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/">
                <i className="bi bi-grid me-1"></i> Products
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-2">
            {/* Show Login & Register if user is NOT logged in */}
            {!user ? (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-primary btn-sm px-3" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary btn-sm px-3" to="/register">
                    <i className="bi bi-person-plus me-1"></i> Register
                  </Link>
                </li>
              </>
            ) : (
              /* Show Cart, Orders, User Name and Logout if user IS logged in */
              <>
                <li className="nav-item">
                  <span className="nav-link text-dark fw-semibold">
                    <i className="bi bi-person-circle me-1 text-primary"></i>
                    {user.name || user.username}
                  </span>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-cart">
                    <i className="bi bi-cart3 me-1"></i> My Cart
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-orders">
                    <i className="bi bi-bag-check me-1"></i> My Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger btn-sm ms-2"
                  >
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}