import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function DisplayProducts(props) {
  const products = props.allProducts || [];
  
  // 1. Modal sathi select kelelya product chi ID
  const [selectedProductId, setSelectedProductId] = useState(null);

  // 2. Search filter state
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered products based on name / brand
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      
      {/* 1. Quick Stats / Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small mb-1 fw-semibold">Total Products</p>
                <h3 className="fw-bold mb-0 text-dark">{products.length}</h3>
              </div>
              <div className="bg-primary-subtle text-primary p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px" }}>
                <i className="bi bi-box-seam fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small mb-1 fw-semibold">Low Stock Alert</p>
                <h3 className="fw-bold mb-0 text-warning">
                  {products.filter((p) => p.quantity < 5).length}
                </h3>
              </div>
              <div className="bg-warning-subtle text-warning p-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px" }}>
                <i className="bi bi-exclamation-triangle fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls & Table Container */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="card-header bg-white border-0 py-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <h5 className="fw-bold mb-1">Manage Products</h5>
            <small className="text-muted">Review inventory, update prices, and manage catalog</small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: "260px" }}>
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search by name or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Link to="/add-product" className="btn btn-primary btn-sm px-3 fw-medium">
              <i className="bi bi-plus-lg me-1"></i> Add Product
            </Link>
          </div>
        </div>

        {/* Product Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-uppercase small text-muted">
              <tr>
                <th className="ps-4" style={{ width: "60px" }}>ID</th>
                <th>Product</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Description</th>
                <th className="text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="ps-4 text-muted fw-semibold">#{product.id}</td>

                    {/* Image & Title */}
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={`http://localhost:8080/api/v1/images/${product.imageName}`}
                          alt={product.name}
                          className="rounded-3 border object-fit-contain p-1 bg-light"
                          style={{ width: "48px", height: "48px" }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/48?text=NA";
                          }}
                        />
                        <span className="fw-semibold text-dark text-capitalize text-truncate" style={{ maxWidth: "260px" }} title={product.name}>
                          {product.name}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="badge bg-light text-dark border">
                        {product.brand || "—"}
                      </span>
                    </td>

                    <td className="fw-bold text-dark">
                      ₹{product.price}
                    </td>

                    {/* Quantity with badge */}
                    <td>
                      {product.quantity > 5 ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                          {product.quantity} in stock
                        </span>
                      ) : product.quantity > 0 ? (
                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">
                          Only {product.quantity} left
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                          0 Out of stock
                        </span>
                      )}
                    </td>

                    <td className="text-muted small text-truncate" style={{ maxWidth: "220px" }} title={product.description}>
                      {product.description || "—"}
                    </td>

                    {/* Action Buttons */}
                    <td className="text-end pe-4">
                      <div className="btn-group btn-group-sm">
                        <Link
                          to={`/update-product/${product.id}`}
                          className="btn btn-outline-primary"
                          title="Update Product"
                        >
                          <i className="bi bi-pencil-square me-1"></i> Update
                        </Link>
                        <button
                          className="btn btn-outline-danger"
                          type="button"
                          data-bs-toggle="modal"
                          data-bs-target="#deleteProductModal"
                          onClick={() => setSelectedProductId(product.id)}
                          title="Delete Product"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                    {products.length === 0 ? "Loading Products..." : "No matching products found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Bootstrap Confirmation Modal */}
      <div
        className="modal fade"
        id="deleteProductModal"
        tabIndex="-1"
        aria-labelledby="deleteProductModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold text-danger" id="deleteProductModalLabel">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>Delete Product?
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body text-secondary">
              Are you sure you want to permanently delete this product from NovaCart? This action cannot be undone.
            </div>
            <div className="modal-footer border-0 pt-0">
              <button
                type="button"
                className="btn btn-light"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger px-3"
                data-bs-dismiss="modal"
                onClick={() => props.onDeleteProduct(selectedProductId)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}