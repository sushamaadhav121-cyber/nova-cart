import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const handleLogin = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userName: data.userName,
          password: data.password
        })
      });

      if (response.ok) {
        const result = await response.json();

        // ॲडमिन डेटा आणि टोकन localStorage मध्ये सेव्ह करा
        localStorage.setItem('user', JSON.stringify(result));
        if (result.token) {
          localStorage.setItem('token', result.token);
        }

        toast.success('Admin login successful!');
        navigate('/orders'); // किंवा '/products'
      } else {
        const errorData = await response.json().catch(() => null);
        toast.error(errorData?.message || 'Invalid username or password!');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Unable to connect to backend server!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light px-3">
      <div className="card border-0 shadow rounded-4 p-4 p-sm-5" style={{ maxWidth: '420px', width: '100%' }}>
        
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div 
            className="bg-dark text-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" 
            style={{ width: '65px', height: '65px' }}
          >
            <i className="bi bi-shield-lock-fill fs-2"></i>
          </div>
          <h4 className="fw-bold text-dark mb-1">NovaCart Admin</h4>
          <p className="text-muted small">Sign in with your administrative credentials</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleLogin)} noValidate>
          {/* Username Input */}
          <div className="mb-3">
            <label className="form-label small fw-semibold">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className={`form-control border-start-0 ps-0 ${errors.userName ? 'is-invalid' : ''}`}
                placeholder="Enter admin username"
                {...register('userName', {
                  required: 'Username is required'
                })}
              />
            </div>
            {errors.userName && (
              <div className="text-danger small mt-1">{errors.userName.message}</div>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label className="form-label small fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="bi bi-key"></i>
              </span>
              <input
                type="password"
                className={`form-control border-start-0 ps-0 ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter password"
                {...register('password', {
                  required: 'Password is required'
                })}
              />
            </div>
            {errors.password && (
              <div className="text-danger small mt-1">{errors.password.message}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-warning w-100 fw-bold py-2 shadow-sm"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Authenticating...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}