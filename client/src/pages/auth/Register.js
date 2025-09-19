import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  // CORRECTED: Added 'login' from your AuthContext
  const { register, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await register({
        fullName: formData.fullName.trim(),
        email: formData.email,
        password: formData.password
      });
      
      if (result.success && result.token) {
        // CORRECTED: Using the 'login' function from your context
        login(result.token); 
        
        // CORRECTED: Removed the 'fetchUserData' call as it's not defined
        // and the 'login' function should handle setting the user state.
        
        navigate('/dashboard', { replace: true });
      } else {
        setErrors({ form: result.message || 'Registration failed. Please try again.' });
      }

    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ form: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ backgroundImage: 'url(/assets/register.png)' }}>
      <div className="auth-container">
        <div className="auth-box register-box">
          <div className="form-header register-header">
            <h2>Create an Account</h2>
            <p>Join Campus Events to register for college events</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {errors.form && <span className="error-message form-error">{errors.form}</span>}

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? 'error' : ''}
                required
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                required
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                required
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="terms">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className={errors.terms ? 'error' : ''}
                />
                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
              </label>
              {errors.terms && <span className="error-message">{errors.terms}</span>}
            </div>

            <button type="submit" disabled={loading} className="auth-btn register-btn">
              <img src="/assets/Frame.png" alt="Sign Up Icon" />
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div className="auth-link">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
