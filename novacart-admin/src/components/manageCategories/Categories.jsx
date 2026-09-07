import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Update & Deactivate States
  const [editCategory, setEditCategory] = useState(null);
  const [deactivatingCategory, setDeactivatingCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form for Creating Category
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: errorsCreate }
  } = useForm();

  // Form for Editing Category
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    formState: { errors: errorsEdit }
  } = useForm();

  // Helper to fetch admin JWT token
  const getAuthToken = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          token =
            parsedUser.token ||
            parsedUser.jwt ||
            parsedUser.accessToken ||
            parsedUser.access_token;
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
    return token;
  };

  // =====================================================
  // 1. Fetch all categories (Dashboard with Product Count)
  // =====================================================
  async function fetchAllCategories() {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/get/categories');
      const responseObject = await response.json().catch(() => ({}));

      if (response.ok) {
        setCategories(responseObject.data || responseObject || []);
      } else {
        toast.error(responseObject.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Server connection error while fetching categories!');
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // 2. Create new category (Name + Description)
  // =====================================================
  async function createCategory(formData) {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token missing! Please login again.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('http://localhost:8080/api/v1/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description?.trim() || ""
        })
      });

      if (response.status === 403) {
        toast.error('Access Denied (403). Admin authorization failed.');
        return;
      }

      const responseObject = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success('Category added successfully!');
        resetCreate();
        await fetchAllCategories();
        return;
      }

      if (response.status === 302 || response.status === 409) {
        toast.error(`Category "${formData.name}" already exists!`);
        return;
      }

      toast.error(responseObject.message || 'Unable to add category');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Unable to connect to backend server!');
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // 3. Update category (Edit Modal)
  // =====================================================
  const openEditModal = (cat) => {
    setEditCategory(cat);
    setEditValue('name', cat.name);
    setEditValue('description', cat.description || '');
  };

  async function updateCategoryData(formData) {
    if (!editCategory) return;
    const token = getAuthToken();

    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:8080/api/v1/admin/categories/${editCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description?.trim() || ""
        })
      });

      if (response.ok) {
        toast.success('Category updated successfully!');
        setEditCategory(null);
        await fetchAllCategories();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to update category');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      toast.error('Server error while updating category');
    } finally {
      setActionLoading(false);
    }
  }

  // =====================================================
  // 4. Soft Delete / Deactivate category (With Warning)
  // =====================================================
  async function confirmDeactivateCategory() {
    if (!deactivatingCategory) return;
    const token = getAuthToken();

    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:8080/api/v1/admin/categories/${deactivatingCategory.id}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.warning(`Category '${deactivatingCategory.name}' deactivated (Soft Deleted)`);
        setDeactivatingCategory(null);
        await fetchAllCategories();
      } else {
        toast.error('Failed to deactivate category');
      }
    } catch (err) {
      console.error('Error deactivating category:', err);
      toast.error('Server error while deactivating category');
    } finally {
      setActionLoading(false);
    }
  }

  // =====================================================
  // 5. Reactivate Category
  // =====================================================
  async function activateCategory(catId) {
    const token = getAuthToken();
    try {
      setActionLoading(true);
      const response = await fetch(`http://localhost:8080/api/v1/admin/categories/${catId}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Category activated successfully!');
        await fetchAllCategories();
      } else {
        toast.error('Failed to activate category');
      }
    } catch (err) {
      console.error('Error activating category:', err);
      toast.error('Server error while activating category');
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Filter categories by search
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      
      {/* 1. Page Header & KPI Cards */}
      <div className="row g-3 align-items-center mb-4">
        <div className="col-12 col-md-8">
          <h4 className="fw-bold mb-1">Category Dashboard</h4>
          <p className="text-muted small mb-0">Manage catalog categories, monitor product counts, and control visibility</p>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <p className="text-muted small mb-1 fw-semibold">Total Categories</p>
                <h4 className="fw-bold mb-0 text-dark">{categories.length}</h4>
              </div>
              <div 
                className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" 
                style={{ width: "48px", height: "48px" }}
              >
                <i className="bi bi-tags fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content: Side-by-Side Form and Dashboard Table */}
      <div className="row g-4">
        
        {/* Left Column: Create New Category Form */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: "20px" }}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-warning-subtle text-warning p-2 rounded-3">
                <i className="bi bi-folder-plus fs-5"></i>
              </div>
              <h5 className="fw-bold mb-0">Create New Category</h5>
            </div>
            <p className="text-muted small mb-3">
              Organize products under a new category with a title and brief description.
            </p>

            <form onSubmit={handleCreateSubmit(createCategory)} noValidate>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Category Name</label>
                <input
                  type="text"
                  className={`form-control ${errorsCreate.name ? 'is-invalid' : ''}`}
                  placeholder="e.g. Home Appliances, Electronics"
                  {...registerCreate('name', {
                    required: 'Category name is required',
                    minLength: { value: 2, message: 'Min 2 characters required' }
                  })}
                />
                {errorsCreate.name && (
                  <div className="invalid-feedback small">
                    {errorsCreate.name.message}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Brief Description</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Brief description about the category and products it contains..."
                  {...registerCreate('description')}
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 py-2 fw-semibold shadow-sm"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving Category...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-1"></i> Add Category
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Category Dashboard Table */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            
            {/* Table Header Controls */}
            <div className="card-header bg-white border-0 py-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h6 className="fw-bold mb-0">Categories List</h6>
                <small className="text-muted">Associated product count, description & status</small>
              </div>

              <div className="d-flex align-items-center gap-2">
                <div className="input-group input-group-sm" style={{ width: "230px" }}>
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0"
                    placeholder="Search category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  className="btn btn-sm btn-outline-secondary rounded-3" 
                  onClick={fetchAllCategories} 
                  title="Refresh List"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small text-muted">
                  <tr>
                    <th className="ps-4" style={{ width: '70px' }}>ID</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Associated Products</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                        Loading categories...
                      </td>
                    </tr>
                  ) : filteredCategories && filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id}>
                        <td className="ps-4 text-muted fw-semibold">
                          #{cat.id}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-secondary-subtle text-dark border p-2 rounded-3">
                              <i className="bi bi-folder2 text-primary"></i>
                            </span>
                            <span className="fw-bold text-dark text-capitalize">
                              {cat.name}
                            </span>
                          </div>
                        </td>
                        <td className="small text-muted" style={{ maxWidth: '200px' }}>
                          {cat.description ? (
                            <span>{cat.description}</span>
                          ) : (
                            <span className="text-secondary fst-italic">No description</span>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border px-3 py-2 rounded-pill fw-semibold">
                            <i className="bi bi-box-seam me-1 text-primary"></i>
                            {cat.productCount || 0} Products
                          </span>
                        </td>
                        <td>
                          {cat.status === 'INACTIVE' ? (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                              Inactive (Soft Deleted)
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          {/* 3. Update Category */}
                          <button
                            className="btn btn-sm btn-outline-primary me-2 rounded-circle"
                            title="Edit Category"
                            onClick={() => openEditModal(cat)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          {/* 4. Delete / Deactivate OR Reactivate Button */}
                          {cat.status !== 'INACTIVE' ? (
                            <button
                              className="btn btn-sm btn-outline-danger rounded-circle"
                              title="Deactivate Category"
                              onClick={() => setDeactivatingCategory(cat)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-success rounded-circle"
                              title="Reactivate Category"
                              onClick={() => activateCategory(cat.id)}
                              disabled={actionLoading}
                            >
                              <i className="bi bi-arrow-counterclockwise"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5 text-muted">
                        <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary"></i>
                        {categories.length === 0
                          ? "No categories found. Add your first category using the form."
                          : "No matching categories found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>

      {/* =====================================================
          3. UPDATE CATEGORY MODAL
      ====================================================== */}
      {editCategory && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Update Category #{editCategory.id}</h5>
                <button className="btn-close" onClick={() => setEditCategory(null)}></button>
              </div>
              <form onSubmit={handleEditSubmit(updateCategoryData)}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category Name</label>
                    <input
                      type="text"
                      className={`form-control ${errorsEdit.name ? 'is-invalid' : ''}`}
                      {...registerEdit('name', { required: 'Name is required' })}
                    />
                    {errorsEdit.name && (
                      <div className="invalid-feedback small">{errorsEdit.name.message}</div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Brief Description</label>
                    <textarea
                      rows="3"
                      className="form-control"
                      {...registerEdit('description')}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-3"
                    onClick={() => setEditCategory(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-warning rounded-pill fw-semibold px-4"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          4. DEACTIVATE (SOFT DELETE) WARNING MODAL
      ====================================================== */}
      {deactivatingCategory && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3 shadow">
              <div className="modal-header border-0 pb-0 text-danger">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Deactivate Category?
                </h5>
                <button className="btn-close" onClick={() => setDeactivatingCategory(null)}></button>
              </div>
              <div className="modal-body">
                <p className="mb-3">
                  Are you sure you want to deactivate <strong>"{deactivatingCategory.name}"</strong>?
                </p>

                {/* Assignment Requirement: Warning notification */}
                <div className="alert alert-warning border-warning small mb-0">
                  <div className="d-flex align-items-start gap-2">
                    <i className="bi bi-shield-exclamation fs-5 text-warning"></i>
                    <div>
                      <strong>Action Required:</strong>
                      <p className="mb-0 mt-1">
                        Please assign products to a new category before deactivating it.
                      </p>
                      {deactivatingCategory.productCount > 0 && (
                        <div className="mt-2 fw-bold text-danger">
                          Currently, {deactivatingCategory.productCount} products are linked to this category!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-3"
                  onClick={() => setDeactivatingCategory(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill fw-semibold px-3"
                  onClick={confirmDeactivateCategory}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deactivating...' : 'Confirm Deactivate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}