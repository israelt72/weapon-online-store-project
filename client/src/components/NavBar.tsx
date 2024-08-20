// src/components/NavBar.tsx
// src/components/NavBar.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/appStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faBars } from '@fortawesome/free-solid-svg-icons';
import { getProfile, logoutUser } from '../redux/userSlice';
import { Link, NavLink } from 'react-router-dom';
import Cookies from 'js-cookie';
import './styles.css';

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const user = useSelector((state: RootState) => state.user.user);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token && !isAuthenticated) {
      // Only dispatch getProfile if the token exists and the user is not authenticated
      dispatch(getProfile());
    }
  }, [dispatch, isAuthenticated]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogoutClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    dispatch(logoutUser()); // Clear user data
    Cookies.remove('access_token'); // Remove token cookie
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Weapons Shop</Link>
      </div>
      <div className="hamburger" onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBars} />
      </div>
      <ul className={`navbar-nav ${isOpen ? 'open' : ''}`}>
        <li className="nav-item">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Products
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <FontAwesomeIcon icon={faShoppingCart} className="fa-shopping-cart" />
            {cartItems.length > 0 && ` Cart (${cartItems.length})`}
          </NavLink>
        </li>
        {isAuthenticated ? (
          <>
            <li className="nav-item">
              <span className="nav-link">Welcome, {user?.firstName || 'User'}</span>
            </li>
            <li className="nav-item">
              <NavLink
                to="/orders"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                My Orders
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                My Profile
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/logout"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={handleLogoutClick}
              >
                Logout
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <NavLink to="/register" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Register
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Login
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
