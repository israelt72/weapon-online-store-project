import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/appStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faBars, faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import { getProfile, logoutUser } from '../redux/userSlice';
import { Link, NavLink } from 'react-router-dom';
import './styles.css';

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const user = useSelector((state: RootState) => state.user.user);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (token && !user) {
      dispatch(getProfile());
    } else if (!token) {
      dispatch(logoutUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    const savedSoundEnabled = localStorage.getItem('soundEnabled') === 'true';
    setSoundEnabled(savedSoundEnabled);

    if (!savedSoundEnabled) {
      stopAllSounds();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('soundEnabled', soundEnabled.toString());

    if (soundEnabled) {
      playSounds();
    } else {
      stopAllSounds();
    }
  }, [soundEnabled]);

  const stopAllSounds = () => {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      const element = audio as HTMLAudioElement;
      element.pause();
      element.currentTime = 0;
    });
  };

  const playSounds = () => {
    const soundElements = document.querySelectorAll('audio');
    soundElements.forEach(audio => {
      const element = audio as HTMLAudioElement;
      if (!element.paused) {
        element.play();
      }
    });
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogoutClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    sessionStorage.removeItem('access_token');
    dispatch(logoutUser());
    stopAllSounds();
    window.location.href = '/';
  };

  const toggleSound = () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
  };

  const handleHover = () => {
    if (soundEnabled) {
      const hoverSound = document.getElementById('hoverSound') as HTMLAudioElement;
      if (hoverSound) {
        hoverSound.play();
      }
    }
  };

  const handleClick = () => {
    if (soundEnabled) {
      const clickSound = document.getElementById('clickSound') as HTMLAudioElement;
      if (clickSound) {
        clickSound.play();
      }
    }
  };

  const handleNavLinkInteraction = (event: React.MouseEvent<HTMLAnchorElement>) => {
    handleClick();
    handleHover();
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
                to="/profile"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                onClick={handleNavLinkInteraction}
              >
                My Profile
              </NavLink>
            </li>
            {user?.role === 'admin' && (
              <li className="nav-item">
                <NavLink
                  to="/admin"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  onClick={handleNavLinkInteraction}
                >
                  Admin Dashboard
                </NavLink>
              </li>
            )}
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
        <li className="nav-item">
          <button onClick={toggleSound} className="sound-toggle-button">
            <FontAwesomeIcon icon={soundEnabled ? faVolumeUp : faVolumeMute} />
          </button>
        </li>
      </ul>
      <audio id="interactionSound" src="/assets/sound/The Good, the Bad and the Ugly.mp3" />
      <audio id="clickSound" src="/assets/sound/Gunshot.mp3" />
      <audio id="hoverSound" src="/assets/sound/Gun Sound Effects.mp3" />
    </nav>
  );
};

export default NavBar;
