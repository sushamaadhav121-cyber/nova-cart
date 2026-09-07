import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './navbar/Navbar';

export default function Home() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* 1. Navbar */}
      <Navbar />

     
      {isHomePage && (
        <>
          {/* Hero Carousel Slider */}
          <div className="container mt-3">
            <div
              id="heroCarousel"
              className="carousel slide shadow-sm rounded-4 overflow-hidden"
              data-bs-ride="carousel"
              data-bs-interval="3500"
            >
              <div className="carousel-indicators">
                <button
                  type="button"
                  data-bs-target="#heroCarousel"
                  data-bs-slide-to="0"
                  className="active"
                ></button>
                <button
                  type="button"
                  data-bs-target="#heroCarousel"
                  data-bs-slide-to="1"
                ></button>
                <button
                  type="button"
                  data-bs-target="#heroCarousel"
                  data-bs-slide-to="2"
                ></button>
              </div>

              <div className="carousel-inner">
                {/* Slide 1 */}
                <div
                  className="carousel-item active p-5 text-white"
                  style={{
                    background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)",
                    minHeight: "260px"
                  }}
                >
                  <div className="py-4">
                    <span className="badge bg-warning text-dark px-3 py-2 fw-bold mb-2">
                      LIMITED TIME DEAL
                    </span>
                    <h1 className="fw-bold display-5">Mega Tech & Fashion Fest</h1>
                    <p className="fs-5 opacity-75">
                      Get flat discounts and safe Razorpay payments on all orders.
                    </p>
                    <button
                      className="btn btn-light fw-bold px-4 py-2 mt-2 shadow-sm text-primary"
                      onClick={() => window.scrollTo({ top: 520, behavior: 'smooth' })}
                    >
                      Shop Now <i className="bi bi-arrow-right-short"></i>
                    </button>
                  </div>
                </div>

                {/* Slide 2 */}
                <div
                  className="carousel-item p-5 text-white"
                  style={{
                    background: "linear-gradient(135deg, #d63384 0%, #6f42c1 100%)",
                    minHeight: "260px"
                  }}
                >
                  <div className="py-4">
                    <span className="badge bg-light text-dark px-3 py-2 fw-bold mb-2">
                      NEW ARRIVALS
                    </span>
                    <h1 className="fw-bold display-5">Upgrade Your Daily Life</h1>
                    <p className="fs-5 opacity-75">
                      Top quality products delivered straight to your door.
                    </p>
                    <button
                      className="btn btn-warning fw-bold px-4 py-2 mt-2 shadow-sm text-dark"
                      onClick={() => window.scrollTo({ top: 520, behavior: 'smooth' })}
                    >
                      Explore Collection
                    </button>
                  </div>
                </div>

                {/* Slide 3 */}
                <div
                  className="carousel-item p-5 text-white"
                  style={{
                    background: "linear-gradient(135deg, #198754 0%, #0f5132 100%)",
                    minHeight: "260px"
                  }}
                >
                  <div className="py-4">
                    <span className="badge bg-warning text-dark px-3 py-2 fw-bold mb-2">
                      SPECIAL OFFER
                    </span>
                    <h1 className="fw-bold display-5">Flat ₹70 Off On Checkout</h1>
                    <p className="fs-5 opacity-75">
                      Automatic instant deduction on your total cart value.
                    </p>
                    <button
                      className="btn btn-light fw-bold px-4 py-2 mt-2 shadow-sm text-success"
                      onClick={() => window.scrollTo({ top: 520, behavior: 'smooth' })}
                    >
                      Grab Deals
                    </button>
                  </div>
                </div>
              </div>

              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide="prev"
              >
                <span className="carousel-control-prev-icon"></span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#heroCarousel"
                data-bs-slide="next"
              >
                <span className="carousel-control-next-icon"></span>
              </button>
            </div>
          </div>

          {/* Value Proposition Badges */}
          <div className="container mt-4">
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3 rounded-3 h-100">
                  <i className="bi bi-truck fs-2 text-primary"></i>
                  <div>
                    <h6 className="mb-0 fw-bold">Fast Delivery</h6>
                    <small className="text-muted">Direct to doorstep</small>
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3 rounded-3 h-100">
                  <i className="bi bi-shield-check fs-2 text-success"></i>
                  <div>
                    <h6 className="mb-0 fw-bold">Secure Payment</h6>
                    <small className="text-muted">Razorpay Verified</small>
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3 rounded-3 h-100">
                  <i className="bi bi-tag fs-2 text-warning"></i>
                  <div>
                    <h6 className="mb-0 fw-bold">Best Offers</h6>
                    <small className="text-muted">Instant flat discount</small>
                  </div>
                </div>
              </div>

              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3 rounded-3 h-100">
                  <i className="bi bi-arrow-repeat fs-2 text-danger"></i>
                  <div>
                    <h6 className="mb-0 fw-bold">Easy Returns</h6>
                    <small className="text-muted">7 days replacement</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. Products Area / Details / Orders (Outlet) */}
      <div className="container mt-4 mb-5 flex-grow-1">
        <Outlet />
      </div>

      {/* 4. Footer */}
      <footer className="bg-dark text-light text-center py-4 mt-auto">
        <div className="container">
          <h5 className="fw-bold mb-1">NovaCart</h5>
          <p className="text-secondary small mb-0">
            © {new Date().getFullYear()} NovaCart Online Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}