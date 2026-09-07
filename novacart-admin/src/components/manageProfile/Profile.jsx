import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export default function Profile() {
  const [adminData, setAdminData] = useState({
    userName: 'Admin',
    email: 'aditya@novacart.com',
    mobileNumber: '+91 9876543210',
    role: 'ADMIN',
    id: 5
  });

  useEffect(() => {
  
    const stored = 
      localStorage.getItem('user') || 
      localStorage.getItem('admin') || 
      localStorage.getItem('loggedUser');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let extractedName = parsed.userName || parsed.username || '';
        let role = parsed.role || 'ADMIN';
        let id = parsed.id || 5;

       
        if (!extractedName && parsed.token) {
          try {
            const base64Url = parsed.token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const decodedToken = JSON.parse(jsonPayload);
            extractedName = decodedToken.username || decodedToken.sub || 'Admin';
            if (decodedToken.role) role = decodedToken.role;
          } catch (err) {
            console.error('Error decoding token payload:', err);
          }
        }

        const finalName = extractedName || 'Aditya';

        setAdminData({
          userName: finalName.charAt(0).toUpperCase() + finalName.slice(1),
          email: parsed.email || `${finalName.toLowerCase()}@novacart.com`,
          mobileNumber: parsed.mobileNumber || '+91 9876543210',
          role: role,
          id: id
        });
      } catch (e) {
        console.error('Error parsing admin data:', e);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const [savingPassword, setSavingPassword] = useState(false);

  const onUpdatePassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New Password and Confirm Password do not match!');
      return;
    }

    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      toast.success('Security password updated successfully!');
      reset();
    }, 800);
  };

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">
      
      {/* 1. Header */}
      <div className="mb-4">
        <h4 className="fw-bold mb-1">Administrator Profile</h4>
        <p className="text-muted small mb-0">
          Manage system identity, access credentials, and platform security controls
        </p>
      </div>

      <div className="row g-4">
        
        {/* Left Column: Admin Card Overview */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 text-center p-4 bg-white mb-4">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <div 
                className="bg-dark text-warning rounded-circle d-flex align-items-center justify-content-center shadow" 
                style={{ width: '90px', height: '90px' }}
              >
                <i className="bi bi-person-fill fs-1"></i>
              </div>
              <span className="position-absolute bottom-0 end-0 badge rounded-pill bg-success border border-white p-2">
                <span className="visually-hidden">Active</span>
              </span>
            </div>

            <h5 className="fw-bold text-dark mb-1">{adminData.userName}</h5>
            <p className="text-muted small mb-2">{adminData.email}</p>
            <div>
              <span className="badge bg-warning text-dark px-3 py-1 rounded-pill fw-semibold">
                <i className="bi bi-shield-check me-1"></i> {adminData.role}
              </span>
            </div>

            <hr className="my-3 text-muted" />

            <div className="text-start small">
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Account Status:</span>
                <span className="fw-semibold text-success">Verified Active</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Admin ID:</span>
                <span className="fw-semibold text-dark">#{adminData.id}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Contact:</span>
                <span className="fw-semibold text-dark">{adminData.mobileNumber}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted">Access Level:</span>
                <span className="fw-semibold text-dark">Full Superadmin</span>
              </div>
            </div>
          </div>

          {/* System Responsibilities Box */}
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <h6 className="fw-bold mb-2 small text-uppercase text-secondary">Admin Privileges</h6>
            <ul className="list-unstyled mb-0 small text-muted">
              <li className="py-1"><i className="bi bi-check2-circle text-success me-2"></i>Product Catalog CRUD</li>
              <li className="py-1"><i className="bi bi-check2-circle text-success me-2"></i>Orders & Status Fulfillment</li>
              <li className="py-1"><i className="bi bi-check2-circle text-success me-2"></i>Hierarchy & Classification</li>
              <li className="py-1"><i className="bi bi-check2-circle text-success me-2"></i>Customer Record Tracking</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Profile Details & Password Settings */}
        <div className="col-12 col-lg-8">
          
          {/* Account Details */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <h5 className="fw-bold mb-3">General Information</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Admin Username</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={adminData.userName}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Registered Email</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={adminData.email}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Phone Number</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={adminData.mobileNumber}
                  disabled
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-muted">Platform Role</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={adminData.role}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Change Security Password */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold mb-1">Security & Credentials</h5>
            <p className="text-muted small mb-4">Update your admin credentials to maintain platform safety.</p>

            <form onSubmit={handleSubmit(onUpdatePassword)} noValidate>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Current Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                    placeholder="Enter current password"
                    {...register('currentPassword', {
                      required: { value: true, message: 'Current password is required' }
                    })}
                  />
                  {errors.currentPassword && (
                    <div className="invalid-feedback small">{errors.currentPassword.message}</div>
                  )}
                </div>

                <div className="col-12 col-md-6"></div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">New Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                    placeholder="Min 6 characters"
                    {...register('newPassword', {
                      required: { value: true, message: 'New password is required' },
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                  {errors.newPassword && (
                    <div className="invalid-feedback small">{errors.newPassword.message}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Repeat new password"
                    {...register('confirmPassword', {
                      required: { value: true, message: 'Please confirm new password' }
                    })}
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback small">{errors.confirmPassword.message}</div>
                  )}
                </div>

                <div className="col-12 mt-4 text-end">
                  <button 
                    type="submit" 
                    className="btn btn-warning px-4 fw-semibold"
                    disabled={savingPassword}
                  >
                    {savingPassword ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-key me-1"></i> Update Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}