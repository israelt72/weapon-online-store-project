// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // עדכן לכתובת ה-API שלך
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    if (!config.url) {
      return config;
    }

    // Retrieve the token from sessionStorage or localStorage
    const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
    console.log('Retrieved token from storage:', token); // Log token for debugging

    // Check if the request requires authorization
    const requiresAuth = ['/users', '/protected', '/users/login'].some((path) => config.url?.includes(path));

    if (requiresAuth && token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Token added to request headers:', `Bearer ${token}`);
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Response error status:', error.response.status);
      console.error('Response error data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
