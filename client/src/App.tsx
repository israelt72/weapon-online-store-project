// src/App.tsx
import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import NotFound from './components/NotFound';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import { useDispatch } from 'react-redux';
import { getProfile } from './redux/userSlice';
import { AppDispatch } from './app/appStore';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = sessionStorage.getItem('access_token'); // קרא את הטוקן מה-sessionStorage
    if (token) {
      dispatch(getProfile());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/aboutUs" element={<AboutUs />} />
            <Route path="/contactUs" element={<ContactUs />} />
            <Route path="/notFound" element={<NotFound />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/notFound" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
