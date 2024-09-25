// src/App.tsx
import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import NotFound from './components/NotFound';
import Profile from './pages/Profile';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import MyOrders from './pages/MyOrders'; 
import AdminDashboard from './pages/AdminDashboard'; 
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, logoutUser, } from './redux/userSlice';
import { AppDispatch, RootState } from './app/appStore';

import AdminOrderManagement from './pages/AdminOrderManagement';
import AdminUserManagement from './pages/UserManagement';

// Define the PrivateRoute component to protect routes
const PrivateRoute: React.FC<{ element: JSX.Element, isAuthenticated: boolean }> = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ element: JSX.Element, isAdmin: boolean }> = ({ element, isAdmin }) => {
  return isAdmin ? element : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.user.token);
  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.role === 'admin'; // Check if the user is an admin

  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      dispatch(getProfile());
    } else {
      dispatch(logoutUser()); // Clear user data and perform logout if no token
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
            <Route path="/users" element={<Checkout />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={<PrivateRoute isAuthenticated={!!token} element={<Profile />} />} />
            

            Admin routes
            <Route path="/admin" element={<AdminRoute isAdmin={isAdmin} element={<AdminDashboard />} />} />
            <Route path="/admin/users" element={<AdminRoute isAdmin={isAdmin} element={<AdminUserManagement />} />} />
            <Route path="/admin/orders" element={<AdminRoute isAdmin={isAdmin} element={<AdminOrderManagement />} />} />

            {/* Catch-all route for not found pages */}
            <Route path="*" element={<Navigate to="/notFound" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
