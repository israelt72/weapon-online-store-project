// components/Register.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/appStore';
import { registerUser, selectUserError, selectUserStatus } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import '../components/styles.css';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector((state: RootState) => state.user.status); // Get registration status
  const userError = useSelector(selectUserError); // Get user error

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      console.warn('Passwords do not match'); // Log mismatch warning
      return;
    }

    console.log('Attempting to register with:', { email, firstName, lastName }); // Log registration details
    const resultAction = await dispatch(registerUser({ email, password, firstName, lastName }));

    if (registerUser.fulfilled.match(resultAction)) {
      console.log('Registration successful:', resultAction.payload); // Log success payload
      navigate('/login'); // Navigate to login after successful registration
    } else {
      console.error('Registration failed with error:', userError); // Log error
      setError(userError as string); // Set error message
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Register</button>
          {error && <div className="error-message">{error}</div>} {/* Display error message */}
          {status === 'loading' && <p>Loading...</p>} {/* Display loading state */}
        </form>
      </div>
    </div>
  );
};

export default Register;
