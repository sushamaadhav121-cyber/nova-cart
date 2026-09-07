import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export default function SubCategories() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [editItem, setEditItem] = useState(null);
  const [deactivatingItem, setDeactivatingItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const {
    register: regCreate,
    handleSubmit: handleCreate,
    reset: resetCreate,
    formState: { errors: errCreate }
  } = useForm();

  const {
    register: regEdit,
    handleSubmit: handleEdit,
    setValue: setEditValue,
    formState: { errors: errEdit }
  } = useForm();

  const getAuthToken = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          token = parsed.token || parsed.jwt || parsed.accessToken;
        } catch (e) {
          console.error(e);
        }
      }
    }
    return token;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [resSub, resCat] = await Promise.all([
        fetch('http://localhost:8080/api/v1/get/sub-categories'),
        fetch('http://localhost:8080/api/v1/get/categories')
      ]);

      const subData = await resSub.json().catch(() => ({}));
      const catData = await resCat.json().catch(() => ({}));

      setSubCategories(subData.data || subData || []);
      setCategories(catData.data || catData || []);
    } catch (err) {
      toast.error('Error fetching data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Create Sub-Category
  const onCreateSubmit = async (formData) => {
    const token = getAuthToken();
    try {
      setSubmitting(true);
      const res = await fetch(
        `http://localhost:8080/api/v1/admin/categories/${formData.categoryId}/sub-categories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: formData.name.trim() })
        }
      );

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success('Sub-Category added successfully!');
        resetCreate();
        loadData();
      } else {
        toast.error(data.message || 'Failed to add sub-category');
      }
    } catch (e) {
      toast.error('Network error while saving sub-category');
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Open Edit Modal
  const openEditModal = (item) => {
    setEditItem(item);
    setEditValue('name', item.name);
    setEditValue('categoryId', item.category?.id || '');
  };

  // 3. Update Sub-Category
  const onUpdateSubmit = async (formData) => {
    if (!editItem) return;
    const token = getAuthToken();

    try {
      setActionLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/v1/admin/sub-categories/${editItem.id}?categoryId=${formData.categoryId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: formData.name.trim() })
        }
      );

      if (res.ok) {
        toast.success('Sub-Category updated!');
        setEditItem(null);
        loadData();
      } else {
        toast.error('Failed to update sub-category');
      }
    } catch (e) {
      toast.error('Server error');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Deactivate
  const confirmDeactivate = async () => {
    if (!deactivatingItem) return;
    const token = getAuthToken();

    try {
      setActionLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/v1/admin/sub-categories/${deactivatingItem.id}/deactivate`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (res.ok) {
        toast.warning(`Sub-category '${deactivatingItem.name}' deactivated`);
        setDeactivatingItem(null);
        loadData();
      } else {
        toast.error('Failed to deactivate');
      }
    } catch (e) {
      toast.error('Server error');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Activate
  const activateItem = async (id) => {
    const token = getAuthToken();
    try {
      setActionLoading(true);
      const res = await fetch(
        `http://localhost:8080/api/v1/admin/sub-categories/${id}/activate`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (res.ok) {
        toast.success('Sub-Category reactivated!');
        loadData();
      } else {
        toast.error('Failed to activate');
      }
    } catch (e) {
      toast.error('Server error');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = subCategories.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Sub-Category Management</h4>
          <p className="text-muted small mb-0">Group secondary sub-departments under parent categories</p>
        </div>
        <span className="badge bg-white text-dark shadow-sm px-3 py-2 border rounded-pill">
          Total: {subCategories.length} Sub-Categories
        </span>
      </div>

      <div className="row g-4">
        {/* Add Sub-Category Form */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '20px' }}>
            <h5 className="fw-bold mb-3">Add Sub-Category</h5>
            <form onSubmit={handleCreate(onCreateSubmit)} noValidate>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Parent Category</label>
                <select
                  className={`form-select ${errCreate.categoryId ? 'is-invalid' : ''}`}
                  {...regCreate('categoryId', { required: 'Please select a parent category' })}
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errCreate.categoryId && (
                  <div className="invalid-feedback small">{errCreate.categoryId.message}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Sub-Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Running Shoes, Laptops"
                  className={`form-control ${errCreate.name ? 'is-invalid' : ''}`}
                  {...regCreate('name', { required: 'Sub-Category name is required' })}
                />
                {errCreate.name && (
                  <div className="invalid-feedback small">{errCreate.name.message}</div>
                )}
              </div>

              <button type="submit" className="btn btn-warning w-100 py-2 fw-semibold" disabled={submitting}>
                {submitting ? 'Saving...' : 'Add Sub-Category'}
              </button>
            </form>
          </div>
        </div>

        {/* Sub-Category Table */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Sub-Categories List</h6>
              <input
                type="text"
                placeholder="Search..."
                className="form-control form-control-sm"
                style={{ width: '200px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-muted">
                  <tr>
                    <th className="ps-4">ID</th>
                    <th>Sub-Category</th>
                    <th>Parent Category</th>
                    <th>Products</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">No sub-categories found.</td></tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id}>
                        <td className="ps-4 fw-semibold text-muted">#{item.id}</td>
                        <td className="fw-bold">{item.name}</td>
                        <td>
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                            {item.category?.name || 'Unassigned'}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {item.productCount || 0} Products
                          </span>
                        </td>
                        <td>
                          {item.status === 'INACTIVE' ? (
                            <span className="badge bg-danger-subtle text-danger">Inactive</span>
                          ) : (
                            <span className="badge bg-success-subtle text-success">Active</span>
                          )}
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-circle me-2"
                            onClick={() => openEditModal(item)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          {item.status !== 'INACTIVE' ? (
                            <button
                              className="btn btn-sm btn-outline-danger rounded-circle"
                              onClick={() => setDeactivatingItem(item)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-success rounded-circle"
                              onClick={() => activateItem(item.id)}
                            >
                              <i className="bi bi-arrow-counterclockwise"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3 shadow">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Update Sub-Category #{editItem.id}</h5>
                <button className="btn-close" onClick={() => setEditItem(null)}></button>
              </div>
              <form onSubmit={handleEdit(onUpdateSubmit)}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Parent Category</label>
                    <select className="form-select" {...regEdit('categoryId', { required: true })}>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Sub-Category Name</label>
                    <input
                      type="text"
                      className={`form-control ${errEdit.name ? 'is-invalid' : ''}`}
                      {...regEdit('name', { required: 'Name is required' })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setEditItem(null)}>Cancel</button>
                  <button type="submit" className="btn btn-warning px-4" disabled={actionLoading}>
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Warning Modal */}
      {deactivatingItem && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3 shadow">
              <div className="modal-header border-0 pb-0 text-danger">
                <h5 className="modal-title fw-bold">Deactivate Sub-Category?</h5>
                <button className="btn-close" onClick={() => setDeactivatingItem(null)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to deactivate <strong>"{deactivatingItem.name}"</strong>?</p>
                <div className="alert alert-warning small mb-0">
                  Please assign products to another sub-category before deactivating.
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn btn-light" onClick={() => setDeactivatingItem(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDeactivate} disabled={actionLoading}>
                  Confirm Deactivate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}