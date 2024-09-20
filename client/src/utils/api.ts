// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);

    // Retrieve the token from sessionStorage or localStorage
    const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
    console.log('Retrieved token from storage:', token);

    // Check if the request requires authorization
    const requiresAuth = ['/api/admin','/api/users', '/api/products', '/api/orders'].some((path) => config.url?.includes(path));

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

// Response interceptor to handle errors and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const status = response?.status;

    if (status === 401 && response.data.message === 'Token expired') {
      // Token has expired, attempt to refresh it
      const refreshToken = sessionStorage.getItem('refresh_token') || localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const refreshResponse = await axios.post('http://localhost:3000/api/users/refresh', { token: refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

          // Store new tokens
          sessionStorage.setItem('access_token', accessToken);
          localStorage.setItem('access_token', accessToken);
          sessionStorage.setItem('refresh_token', newRefreshToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          // Retry the original request with the new access token
          config.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(config);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          // Propagate refresh error with additional info
          const customError = new Error('Failed to refresh token') as any;
          customError.needRedirect = true;
          return Promise.reject(customError);
        }
      } else {
        // No refresh token available
        const customError = new Error('No refresh token available') as any;
        customError.needRedirect = true;
        return Promise.reject(customError);
      }
    } else if (status === 403) {
      console.error('Access denied:', response.data.message);
      // Propagate forbidden error with additional info
      const customError = new Error('Access denied') as any;
      customError.needRedirect = true;
      return Promise.reject(customError);
    } else if (status === 404) {
      console.error('Not found:', response.data.message);
      // Propagate not found error with additional info
      const customError = new Error('Not found') as any;
      customError.needRedirect = true;
      return Promise.reject(customError);
    } else {
      console.error('Response error status:', status);
      console.error('Response error data:', response.data);
      return Promise.reject(error);
    }
  }
);

export default api;
