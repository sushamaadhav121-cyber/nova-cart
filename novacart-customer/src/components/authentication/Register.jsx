import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      role: 'ADMIN' // Default ADMIN select rahega
    }
  });

  async function collectFormData(formData) {
    try {
      const response = await fetch('http://localhost:8080/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const responseObject = await response.json();

      if (response.ok || response.status === 200 || response.status === 201) {
        toast.success('Registration successful! Please login.');
        reset();
        navigate('/login');
      } else if (response.status === 409 || response.status === 302) {
        toast.error(`Username "${formData.userName}" already exists!`);
      } else {
        toast.error(responseObject.message || 'Registration failed!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Unable to connect to backend server!');
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-warning fw-bold text-center py-3">
              <h4>Register Account</h4>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit(collectFormData)}>
                {/* Username Field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Username</label>
                  <input
                    type="text"
                    className={`form-control ${errors.userName ? 'is-invalid' : ''}`}
                    placeholder="Enter username (e.g. niraj)"
                    {...register('userName', {
                      required: { value: true, message: 'Username is required' },
                      minLength: { value: 3, message: 'Minimum 3 characters required' }
                    })}
                  />
                  {errors.userName && (
                    <div className="invalid-feedback">{errors.userName.message}</div>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Enter password"
                    {...register('password', {
                      required: { value: true, message: 'Password is required' },
                      minLength: { value: 6, message: 'Minimum 6 characters required' }
                    })}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password.message}</div>
                  )}
                </div>

                {/* Role Selection Dropdown */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Select Role</label>
                  <select
                    className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                    {...register('role', {
                      required: { value: true, message: 'Role is required' }
                    })}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                  {errors.role && (
                    <div className="invalid-feedback">{errors.role.message}</div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="d-grid mb-3">
                  <button type="submit" className="btn btn-warning fw-bold py-2">
                    Register
                  </button>
                </div>

                {/* Login Redirect Link */}
                <div className="text-center text-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none fw-semibold">
                    Login here
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}