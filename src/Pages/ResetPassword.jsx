import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenChecked, setTokenChecked] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  // Use consistent base URL
  const BASE_URL = import.meta.env.VITE_VERCEL_URI ;

  // Check if token is valid when component mounts
  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        setLoading(true);
        console.log('Checking token validity for token:', token);
        
        const response = await axios.get(
          `${BASE_URL}/api/change-password/${token}`
        );
        
        console.log('Token validation response:', response.data);
        
        if (response.data.valid) {
          setTokenValid(true);
        } else {
          setError('This password reset link is invalid or has expired.');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else {
          setError('This password reset link is invalid or has expired.');
        }
      } finally {
        setLoading(false);
        setTokenChecked(true);
      }
    };

    if (token) {
      checkTokenValidity();
    } else {
      setError('Invalid reset link.');
      setTokenChecked(true);
    }
  }, [token, BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting password reset for token:', token);
      
      const response = await axios.post(
        `${BASE_URL}/api/reset-password/${token}`,
        { password, confirmPW: confirmPassword }
      );

      console.log('Password reset response:', response.data);
      setMessage('Password has been reset successfully. You can now login with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred while resetting your password.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenChecked) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="loading-spinner"></div>
          <p>Checking reset link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h2>Invalid Reset Link</h2>
          </div>
          <div className="error-message">
            <p>{error}</p>
          </div>
          <div className="reset-password-footer">
            <Link to="/forgot-password" className="reset-link">
              Request a new reset link
            </Link>
            <Link to="/" className="login-link">
              Back to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h2>Reset Your Password</h2>
          <p>Please enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Enter your new password"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Confirm your new password"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="reset-button"
            disabled={loading}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="reset-password-footer">
          <Link to="/" className="login-link">
            Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;