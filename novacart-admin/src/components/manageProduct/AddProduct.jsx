import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AddProduct() {
  const { register, handleSubmit, formState, watch, reset } = useForm();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Watch fields
  const selectedCategoryId = watch("category");
  const watchImage = watch("imageName");
  const loggedInAdmin = JSON.parse(localStorage.getItem("user"));
  const navigateTo = useNavigate();

  // Image Preview Logic
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

  // 1. Fetch all categories
  useEffect(() => {
    async function fetchAllCategories() {
      try {
        const response = await fetch("http://localhost:8080/api/v1/get/categories");
        const responseObject = await response.json();

        if (Array.isArray(responseObject.data)) {
          setCategories(responseObject.data);
        } else if (Array.isArray(responseObject)) {
          setCategories(responseObject);
        } else if (responseObject.data && Array.isArray(responseObject.data.categories)) {
          setCategories(responseObject.data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Categories load hou shaklya nahit!");
      }
    }
    fetchAllCategories();
  }, []);

  // 2. Filter sub-categories whenever category changes
  useEffect(() => {
    if (!selectedCategoryId) {
      setSubCategories([]);
      return;
    }

    const selectedCategory = categories.find(
      (cat) => String(cat.id) === String(selectedCategoryId)
    );

    setSubCategories(selectedCategory?.subCategories || []);
  }, [selectedCategoryId, categories]);

  // 3. Submit Product Form
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
      formDataObject.append("productImage", formData.imageName[0]);

      const response = await fetch("http://localhost:8080/api/v1/admin/products", {
        method: "POST",
        body: formDataObject,
        headers: {
          Authorization: `Bearer ${loggedInAdmin?.token}`
        }
      });

      const responseObject = await response.json();

      if (response.ok) {
        toast.success(responseObject.message || "Product successfully added!");
        reset();
        navigateTo("/", { replace: true });
      } else {
        toast.error(responseObject.message || "Product add karnyatasathi error ala!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error ala ahe!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      {/* Header with Navigation */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1">Create New Product</h4>
          <p className="text-muted small mb-0">Add a new item to your store inventory and catalog</p>
        </div>
        <Link to="/" className="btn btn-outline-secondary btn-sm px-3">
          <i className="bi bi-arrow-left me-1"></i> Back to Inventory
        </Link>
      </div>

      <form onSubmit={handleSubmit(collectFormData)} noValidate className="needs-validation">
        <div className="row g-4">
          
          {/* Left Column: Image Upload & Live Preview */}
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
                    alt="Product Preview"
                    className="img-fluid rounded-3 object-fit-contain"
                    style={{ maxHeight: "210px" }}
                  />
                ) : (
                  <div className="text-muted py-4">
                    <i className="bi bi-image fs-1 d-block text-secondary mb-2"></i>
                    <small>Upload an image to see live preview</small>
                  </div>
                )}
              </div>

              <div className="text-start">
                <label className="form-label small fw-semibold">Choose Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className={`form-control form-control-sm ${formState.errors.imageName ? "is-invalid" : ""}`}
                  {...register("imageName", { required: "Product image is required" })}
                />
                {formState.errors.imageName && (
                  <div className="invalid-feedback d-block small">
                    {formState.errors.imageName.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Product Information Fields */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h6 className="fw-bold mb-3">Basic Information</h6>

              {/* Product Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Nike Air Zoom Running Shoes"
                  className={`form-control ${formState.errors.name ? "is-invalid" : ""}`}
                  {...register("name", { required: "Product name is required" })}
                />
                {formState.errors.name && (
                  <div className="invalid-feedback d-block small">
                    {formState.errors.name.message}
                  </div>
                )}
              </div>

              {/* Brand & Category Row */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Nike, Apple, Dell"
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
                    disabled={!subCategories || subCategories.length === 0}
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

              {/* Pricing & Stock Inventory Row */}
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Price (₹)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">₹</span>
                    <input
                      type="number"
                      placeholder="0.00"
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
                  <label className="form-label small fw-semibold">Quantity / Stock</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
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
                  placeholder="Enter detailed description, features, warranty specifications..."
                  className={`form-control ${formState.errors.description ? "is-invalid" : ""}`}
                  {...register("description", { required: "Description is required" })}
                />
                {formState.errors.description && (
                  <div className="invalid-feedback d-block small">
                    {formState.errors.description.message}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light px-4"
                  onClick={() => reset()}
                  disabled={loading}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 fw-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cloud-arrow-up me-1"></i> Save Product
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