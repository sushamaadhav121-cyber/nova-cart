import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ProductDetails() {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const loggedInCustomer = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

 useEffect(() => {
    async function fetchProductDetails() {
      try {
        
        let response = await fetch(`http://localhost:8080/api/v1/get/products/${id}`);
        let responseObject = await response.json();

        if (response.ok) {
         
          setProduct(responseObject.data || responseObject);
        } else {
          toast.error("Product not found!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetails();
  }, [id]);

  
  async function addToCart() {
    if (!loggedInCustomer) {
      toast.info("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      let response = await fetch(
        `http://localhost:8080/api/v1/customer/${loggedInCustomer.id}/cart/${id}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${loggedInCustomer.token}`
          }
        }
      );
      let responseObject = await response.json();
      if (response.ok) {
        toast.success(responseObject.message || "Added to cart successfully!");
      } else {
        toast.error(responseObject.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Cart error:", error);
      toast.error("Error adding product to cart");
    }
  }

  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center my-5 py-5">
        <h4>Product details unavailable</h4>
        <button className="btn btn-outline-primary mt-3" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <button 
        className="btn btn-outline-secondary btn-sm mb-4" 
        onClick={() => navigate("/")}
      >
        <i className="bi bi-arrow-left me-1"></i> Back to Products
      </button>

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="row g-4 align-items-center">

          <div className="col-12 col-md-5 text-center">
            <img
              src={`http://localhost:8080/api/v1/images/${product.imageName}`}
              alt={product.name}
              className="img-fluid rounded-3"
              style={{ maxHeight: "350px", objectFit: "contain" }}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/350?text=No+Image";
              }}
            />
          </div>

          <div className="col-12 col-md-7">
            <div className="d-flex gap-2 mb-2">
              {product.subCategory?.category?.name && (
                <span className="badge bg-warning text-dark px-2 py-1">
                  {product.subCategory.category.name}
                </span>
              )}
              {product.subCategory?.name && (
                <span className="badge bg-secondary px-2 py-1">
                  {product.subCategory.name}
                </span>
              )}
            </div>

            <h2 className="fw-bold text-capitalize mb-2">{product.name}</h2>
            <p className="text-muted small mb-3">Brand: <span className="fw-semibold text-dark">{product.brand || "NovaCart Choice"}</span></p>

            <h3 className="text-success fw-bold mb-3">₹ {product.price}</h3>

            <div className="mb-4">
              <h6 className="fw-bold text-secondary">Description:</h6>
              <p className="text-muted lh-base">
                {product.description || "High quality and verified product. Fast doorstep delivery available with safe Razorpay transactions."}
              </p>
            </div>

            <div className="d-flex gap-3">
              <button 
                className="btn btn-primary px-4 py-2 fw-bold"
                onClick={addToCart}
              >
                <i className="bi bi-cart-plus me-2"></i> Add to Cart
              </button>
              <button 
                className="btn btn-warning px-4 py-2 fw-bold text-dark"
                onClick={() => {
                  addToCart();
                  navigate("/my-cart");
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}