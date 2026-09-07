import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigateTo = useNavigate();

  async function collectFormData(formData) {
    try {
      const response = await fetch('http://localhost:8080/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const responseObject = await response.json();

      if (response.ok) {
        toast.success(responseObject.message || 'Login successful!');
        const role = responseObject.data?.role;

        // Agar ADMIN ya VENDOR hai toh Port 3001 par redirect karega
        if (role === 'ADMIN' || role === 'VENDOR') {
          const userTokenData = encodeURIComponent(JSON.stringify(responseObject.data));
          
          // Port 3001 (Admin App) open karega token ke sath
          window.open(`http://localhost:3001/?token=${userTokenData}`, '_blank');
          
          // Customer tab ko home par navigate kar dega
          navigateTo('/', { replace: true });
        } else {
          // Normal Customer ko yahi local storage me save karega
          localStorage.setItem('user', JSON.stringify(responseObject.data));
          navigateTo('/', { replace: true });
        }
      } else if (response.status === 404 || response.status === 400 || response.status === 401) {
        toast.error(responseObject.message || 'Invalid username or password');
      } else {
        toast.error('Login Failed');
      }
    } catch (error) {
      console.error('Login Error:', error);
      toast.error('Unable to connect to backend server!');
    }
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h2 className="text-center text-primary fw-bold mb-4">
                <i className="bi bi-box-arrow-in-right me-2"></i>Login Here!
              </h2>

              <form onSubmit={handleSubmit(collectFormData)}>
                <table className="table table-borderless align-middle mb-0">
                  <tbody>
                    <tr>
                      <td style={{ width: '30%' }}>
                        <label htmlFor="userName" className="form-label fw-semibold">
                          Username
                        </label>
                      </td>
                      <td>
                        <input
                          type="text"
                          className={`form-control ${errors.userName ? 'is-invalid' : ''}`}
                          id="userName"
                          placeholder="Enter username"
                          {...register('userName', {
                            required: { value: true, message: 'Username is required' },
                            minLength: { value: 3, message: 'Min 3 characters required' },
                            maxLength: { value: 20, message: 'Max 20 characters allowed' }
                          })}
                        />
                        {errors.userName && (
                          <div className="invalid-feedback d-block">
                            {errors.userName.message}
                          </div>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <label htmlFor="password" className="form-label fw-semibold">
                          Password
                        </label>
                      </td>
                      <td>
                        <input
                          type="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          id="password"
                          placeholder="Enter password"
                          {...register('password', {
                            required: { value: true, message: 'Password is required' },
                            minLength: { value: 3, message: 'Min 3 characters required' },
                            maxLength: { value: 20, message: 'Max 20 characters allowed' }
                          })}
                        />
                        {errors.password && (
                          <div className="invalid-feedback d-block">
                            {errors.password.message}
                          </div>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan={2}>
                        <button type="submit" className="btn btn-primary w-100 py-2 mt-3 fw-semibold">
                          Login
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary text-decoration-none fw-semibold">
                    Register here
                  </Link>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}