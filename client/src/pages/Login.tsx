// src/components/Login.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, selectUserError } from '../redux/userSlice';
import { AppDispatch, RootState } from '../app/appStore';
import '../components/styles.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state: RootState) => state.user.status);
  const userError = useSelector(selectUserError);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    console.log('Attempting to login with:', email);

    try {
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        console.log('Login successful:', resultAction.payload);
        
        // Store token in sessionStorage after successful login
        const token = resultAction.payload.token;
        if (!token) {
          console.error('Token not found in the API response');
          setError('Failed to retrieve token. Please try again.');
          return;
        }
        sessionStorage.setItem('access_token', token);

        // Verify token storage
        const storedToken = sessionStorage.getItem('access_token');
        console.log('Stored token:', storedToken);
        if (!storedToken) {
          console.error('Token was not stored correctly in sessionStorage');
          setError('Failed to store token. Please try again.');
          return;
        }

        // Navigate to home or dashboard after successful login
        navigate('/'); 
      } else {
        console.error('Login failed with error:', userError);
        setError(userError || 'An unexpected error occurred.');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError('An error occurred while processing your request.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-describedby="emailHelp"
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-describedby="passwordHelp"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Logging in...' : 'Login'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
