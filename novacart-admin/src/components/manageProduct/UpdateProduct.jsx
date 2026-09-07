import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function UpdateProduct() {
  const { register, handleSubmit, formState, watch, setValue } = useForm();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const loggedInAdmin = JSON.parse(localStorage.getItem("user"));
  const navigateTo = useNavigate();
  const URLParams = useParams();

  // Watch fields
  const selectedCategoryId = watch("category");
  const watchImage = watch("imageName");

  // New Image Selection Preview
  useEffect(() => {
    if (watchImage && watchImage.length > 0) {
      const file = watchImage[0];
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);

      return () => URL.revokeObjectURL(imageUrl);
    } else {
      setPreviewImage(null);
    }
  }, [watchImage]);

  // 1. Fetch All Categories
  useEffect(() => {
    async function fetchAllCategories() {
      try {
        const response = await fetch("http://localhost:8080/api/v1/get/categories");
        const responseObject = await response.json();
        setCategories(responseObject.data || responseObject || []);
      } catch (error) {
        console.error("Categories fetch error:", error);
        toast.error("Categories load karta aale nahit!");
      }
    }
    fetchAllCategories();
  }, []);

  // 2. Fetch Product Details to prefill form
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/admin/products/${URLParams.id}`,
          {
            headers: { Authorization: `Bearer ${loggedInAdmin?.token}` }
          }
        );
        const responseObject = await response.json();

        if (response.ok && (responseObject.data || responseObject)) {
          const productData = responseObject.data || responseObject;
          setProduct(productData);

          // Form fields prefill
          setValue("name", productData.name);
          setValue("price", productData.price);
          setValue("quantity", productData.quantity);
          setValue("brand", productData.brand);
          setValue("description", productData.description);
          
          if (productData.subCategory) {
            setValue("category", productData.subCategory.category?.id);
            setValue("subCategory", productData.subCategory.id);
          }
        } else {
          toast.error("Product details not found!");
        }
      } catch (error) {
        console.error("Fetch product error:", error);
        toast.error("Error loading product details!");
      }
    }
    if (URLParams.id) {
      fetchProduct();
    }
  }, [URLParams.id, setValue, loggedInAdmin?.token]);

  // 3. Dynamically set Sub-Categories based on selected Category
  useEffect(() => {
    if (!selectedCategoryId || categories.length === 0) {
      setSubCategories([]);
      return;
    }

    const selectedCategory = categories.find(
      (category) => String(category.id) === String(selectedCategoryId)
    );
    setSubCategories(selectedCategory?.subCategories || []);
  }, [selectedCategoryId, categories]);

  // 4. Submit Updated Form Data
  async function collectFormData(formData) {
    try {
      setLoading(true);
      const formDataObject = new FormData();

      const productPayload = {
        name: formData.name,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        description: formData.description,
        brand: formData.brand,
        subCategory: { id: Number(formData.subCategory) }
      };

      formDataObject.append("productObject", JSON.stringify(productPayload));

      // Append image only if a new file is uploaded
      if (formData.imageName && formData.imageName.length > 0) {
        formDataObject.append("productImage", formData.imageName[0]);
      }

      const response = await fetch(
        `http://localhost:8080/api/v1/admin/products/${URLParams.id}`,
        {
          method: "PUT",
          body: formDataObject,
          headers: {
            Authorization: `Bearer ${loggedInAdmin?.token}`
          }
        }
      );

      const responseObject = await response.json();

      if (response.ok) {
        toast.success(responseObject.message || "Product updated successfully!");
        navigateTo("/", { replace: true });
      } else {
        toast.error(responseObject.message || "Product update failed!");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Server error occurred!");
    } finally {
      setLoading(false);
    }
  }

  if (!product) {
    return (
      <div className="container-fluid px-4 py-5 bg-light min-vh-100 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Update Product</h4>
          <p className="text-muted small mb-0">Modify catalog attributes, pricing, or product media</p>
        </div>
        <Link to="/" className="btn btn-outline-secondary btn-sm px-3">
          <i className="bi bi-arrow-left me-1"></i> Back to Inventory
        </Link>
      </div>

      <form onSubmit={handleSubmit(collectFormData)} noValidate className="needs-validation">
        <div className="row g-4">
          
          {/* Left: Product Image & Preview */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center">
              <h6 className="fw-bold text-start mb-3">Product Media</h6>
              
              <div 
                className="d-flex flex-column align-items-center justify-content-center border border-2 border-dashed rounded-4 p-3 mb-3 bg-light"
                style={{ minHeight: "240px" }}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="New Preview"
                    className="img-fluid rounded-3 object-fit-contain"
                    style={{ maxHeight: "210px" }}
                  />
                ) : product.imageName ? (
                  <img
                    src={`http://localhost:8080/api/v1/images/${product.imageName}`}
                    alt={product.name}
                    className="img-fluid rounded-3 object-fit-contain"
                    style={{ maxHeight: "210px" }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/210?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="text-muted py-4">
                    <i className="bi bi-image fs-1 d-block text-secondary mb-2"></i>
                    <small>No product image</small>
                  </div>
                )}
              </div>

              <div className="text-start">
                <label className="form-label small fw-semibold">Update Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control form-control-sm"
                  {...register("imageName")}
                />
                <small className="text-muted d-block mt-1">
                  Keep empty to retain the current image.
                </small>
              </div>
            </div>
          </div>

          {/* Right: Form Information */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="fw-bold mb-3">Product Information</h6>

              {/* Product Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Product Title</label>
                <input
                  type="text"
                  className={`form-control ${formState.errors.name ? "is-invalid" : ""}`}
                  {...register("name", { required: "Product name is required" })}
                />
                {formState.errors.name && (
                  <div className="invalid-feedback d-block small">
                    {formState.errors.name.message}
                  </div>
                )}
              </div>

              {/* Brand & Categories */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Brand</label>
                  <input
                    type="text"
                    className={`form-control ${formState.errors.brand ? "is-invalid" : ""}`}
                    {...register("brand", { required: "Brand is required" })}
                  />
                  {formState.errors.brand && (
                    <div className="invalid-feedback d-block small">
                      {formState.errors.brand.message}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Category</label>
                  <select
                    className={`form-select ${formState.errors.category ? "is-invalid" : ""}`}
                    {...register("category", { required: "Please select category" })}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {formState.errors.category && (
                    <div className="invalid-feedback d-block small">
                      {formState.errors.category.message}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Sub-Category</label>
                  <select
                    className={`form-select ${formState.errors.subCategory ? "is-invalid" : ""}`}
                    {...register("subCategory", { required: "Please select sub-category" })}
                    disabled={subCategories.length === 0}
                  >
                    <option value="">Select Sub-Category</option>
                    {subCategories
                      .filter((sub) => sub && sub.name)
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                  {formState.errors.subCategory && (
                    <div className="invalid-feedback d-block small">
                      {formState.errors.subCategory.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Quantity */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Price (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">₹</span>
                    <input
                      type="number"
                      className={`form-control ${formState.errors.price ? "is-invalid" : ""}`}
                      {...register("price", {
                        required: "Price is required",
                        min: { value: 1, message: "Price must be at least ₹1" }
                      })}
                    />
                  </div>
                  {formState.errors.price && (
                    <div className="invalid-feedback d-block small">
                      {formState.errors.price.message}
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Stock / Quantity</label>
                  <input
                    type="number"
                    className={`form-control ${formState.errors.quantity ? "is-invalid" : ""}`}
                    {...register("quantity", {
                      required: "Quantity is required",
                      min: { value: 1, message: "Quantity must be at least 1" }
                    })}
                  />
                  {formState.errors.quantity && (
                    <div className="invalid-feedback d-block small">
                      {formState.errors.quantity.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="form-label small fw-semibold">Product Description</label>
                <textarea
                  rows="4"
                  className={`form-control ${formState.errors.description ? "is-invalid" : ""}`}
                  {...register("description", { required: "Description is required" })}
                />
                {formState.errors.description && (
                  <div className="invalid-feedback d-block small">
                    {formState.errors.description.message}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2">
                <Link to="/" className="btn btn-light px-4">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary px-4 fw-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-1"></i> Save Changes
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>
      </form>
    </div>
  );
}