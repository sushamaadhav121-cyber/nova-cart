import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function DisplayProducts(props) {
  const [displayedProducts, setDisplayedProducts] = useState(props.productsValue || []);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [filterLoading, setFilterLoading] = useState(false);

  let loggedInCustomer = JSON.parse(localStorage.getItem("user"));

  // Parent मधून props.productsValue बदलल्यास सिंक ठेवा
  useEffect(() => {
    setDisplayedProducts(props.productsValue || []);
  }, [props.productsValue]);

  // सर्व ॲक्टिव्ह कॅटेगरीज आणणे
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('http://localhost:8080/api/v1/get/categories');
        const data = await response.json();
        const cats = data.data || data || [];
        setCategories(cats.filter(c => c.status !== 'INACTIVE'));
      } catch (error) {
        console.error("Failed to load categories for filter:", error);
      }
    }
    loadCategories();
  }, []);

  // 1. All Products बटण
  function handleResetAll() {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSubCategories([]);
    setDisplayedProducts(props.productsValue || []);
  }

  // 2. कॅटेगरी फिल्टर
  async function handleCategorySelect(cat) {
    setSelectedCategory(cat);
    setSelectedSubCategory(null);
    setFilterLoading(true);

    try {
      // Filtered products API कॉल
      const prodRes = await fetch(
        `http://localhost:8080/api/v1/get/filtered-products?categoryName=${encodeURIComponent(cat.name)}`
      );
      const prodData = await prodRes.json();
      setDisplayedProducts(prodData.data || prodData || []);

      // त्या कॅटेगरीच्या Sub-Categories लोड करणे
      const subRes = await fetch(
        `http://localhost:8080/api/v1/get/categories/${cat.id}/sub-categories`
      );
      const subData = await subRes.json();
      const subs = subData.data || subData || [];
      setSubCategories(subs.filter(s => s.status !== 'INACTIVE'));
    } catch (error) {
      console.error("Error filtering category:", error);
      toast.error("Failed to filter products!");
    } finally {
      setFilterLoading(false);
    }
  }

  // 3. सब-कॅटेगरी फिल्टर
  async function handleSubCategorySelect(sub) {
    setSelectedSubCategory(sub);
    setFilterLoading(true);

    try {
      const prodRes = await fetch(
        `http://localhost:8080/api/v1/get/filtered-products?categoryName=${encodeURIComponent(selectedCategory.name)}&subCategoryName=${encodeURIComponent(sub.name)}`
      );
      const prodData = await prodRes.json();
      setDisplayedProducts(prodData.data || prodData || []);
    } catch (error) {
      console.error("Error filtering sub-category:", error);
      toast.error("Failed to filter by sub-category!");
    } finally {
      setFilterLoading(false);
    }
  }

  // Cart Function
  async function addToCart(productId) {
    if (!loggedInCustomer) {
      return alert(`Login Required ! ${productId}`);
    }

    try {
      let response = await fetch(
        `http://localhost:8080/api/v1/customer/${loggedInCustomer.id}/cart/${productId}`,
        {
          method: "post",
          headers: {
            Authorization: `Bearer ${loggedInCustomer.token}`
          }
        }
      );
      let responseObject = await response.json();
      if (response.ok) {
        toast.success(responseObject.message);
      } else {
        toast.error(responseObject.message);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add product to cart!");
    }
  }

  return (
    <div className="container mt-4 mb-5">
      
      {/* ================= CATEGORY FILTER PILLS ================= */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="d-flex align-items-center gap-2 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
          <button
            type="button"
            className={`btn rounded-pill px-3 py-1 btn-sm fw-semibold ${!selectedCategory ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={handleResetAll}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`btn rounded-pill px-3 py-1 btn-sm fw-semibold ${selectedCategory?.id === cat.id ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sub-Category Filters (पालक कॅटेगरी सिलेक्ट झाल्यावर) */}
        {selectedCategory && subCategories.length > 0 && (
          <div className="d-flex align-items-center gap-2 mt-2 pt-2 border-top overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
            <span className="small text-muted fw-semibold me-1">Sub-Categories:</span>
            <button
              type="button"
              className={`btn rounded-pill px-2 py-0 btn-sm ${!selectedSubCategory ? 'btn-secondary text-white' : 'btn-light border'}`}
              style={{ fontSize: '0.8rem' }}
              onClick={() => handleCategorySelect(selectedCategory)}
            >
              All {selectedCategory.name}
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={`btn rounded-pill px-2 py-0 btn-sm ${selectedSubCategory?.id === sub.id ? 'btn-primary' : 'btn-light border'}`}
                style={{ fontSize: '0.8rem' }}
                onClick={() => handleSubCategorySelect(sub)}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= PRODUCTS GRID ================= */}
      {filterLoading ? (
        <div className="col-12 text-center my-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Filtering products...</p>
        </div>
      ) : (
        <div className="row g-4">
          {displayedProducts && displayedProducts.length > 0 ? (
            displayedProducts.map((product) => {
              return (
                <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={product.id}>
                  <div className="card h-100 border rounded-3 shadow-sm p-3">
                    
                    <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
                      <img
                        src={`http://localhost:8080/api/v1/images/${product.imageName}`}
                        alt={product.name}
                        style={{ maxHeight: "180px", maxWidth: "100%", objectFit: "contain" }}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/200?text=No+Image";
                        }}
                      />
                    </div>

                    <div className="card-body d-flex flex-column p-0 mt-2">
                      
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span 
                          className="badge bg-warning text-dark px-2 py-1 text-truncate" 
                          style={{ fontSize: "0.75rem", maxWidth: "48%" }}
                          title={product.subCategory?.category?.name}
                        >
                          {product.subCategory?.category?.name}
                        </span>
                        <span 
                          className="badge bg-secondary px-2 py-1 text-truncate" 
                          style={{ fontSize: "0.75rem", maxWidth: "48%" }}
                          title={product.subCategory?.name}
                        >
                          {product.subCategory?.name}
                        </span>
                      </div>

                      {/* Product Name */}
                      <h6 className="card-title fw-bold text-truncate mb-1" title={product.name}>
                        {product.name}
                      </h6>

                      {/* Product Price */}
                      <h5 className="fw-bold text-success mb-3">
                        ₹{product.price}
                      </h5>

                      <div className="d-flex justify-content-between align-items-center gap-2 mt-auto">
                        <Link to={`/products/${product.id}`}
                          className="btn btn-outline-secondary btn-sm flex-fill">View More</Link>

                        <button type="button" className="btn btn-primary btn-sm flex-fill" onClick={() => addToCart(product.id)}>
                          Add to Cart
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-12 text-center my-5">
              <h5 className="text-muted">No products available in this category.</h5>
            </div>
          )}
        </div>
      )}

    </div>
  );
}