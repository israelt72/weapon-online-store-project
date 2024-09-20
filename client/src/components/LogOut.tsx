//LogOut.tsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../redux/userSlice';
import { AppDispatch } from '../app/appStore';

const Logout: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    sessionStorage.removeItem('access_token'); // Remove token from sessionStorage
    navigate('/'); // Navigate to home after logout
  };

  return (
    <button onClick={handleLogout} style={{ all: 'unset', cursor: 'pointer' }}>Logout</button>
  );
};

export default Logout;
