import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Navbar() {
  const navigateTo = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    toast.info('Admin logged out successfully');
    
    window.location.href = 'http://localhost:3000/';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold text-warning d-flex align-items-center" to="/">
          <i className="bi bi-shield-lock-fill me-2 fs-4"></i>
          <span>NovaCart Admin</span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbarContent"
          aria-controls="adminNavbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="adminNavbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-box-seam me-1"></i> Products
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/manage-categories">
                <i className="bi bi-tags me-1"></i> Categories
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/manage-sub-categories">
                <i className="bi bi-diagram-3 me-1"></i> Sub-Categories
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/add-product">
                <i className="bi bi-plus-circle me-1"></i> Add Product
              </Link>
            </li>

            {/* 👇 नवीन Orders टॅब */}
            <li className="nav-item">
              <Link className="nav-link" to="/orders">
                <i className="bi bi-receipt me-1"></i> Orders
              </Link>
            </li>
          </ul>

          {/* Admin Profile & Logout Section */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-2">
            <li className="nav-item">
              <Link className="btn btn-outline-warning btn-sm px-3" to="/profile">
                <i className="bi bi-person-circle me-1"></i>
                {user?.userName ? user.userName : 'Admin Profile'}
              </Link>
            </li>
            <li className="nav-item">
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm px-3"
              >
                <i className="bi bi-box-arrow-right me-1"></i> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}