// src/redux/userSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../utils/api';
import { RootState } from '../app/appStore';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Order {
  _id: string;
  createdAt: string;
  products: {
    // product: Product;
    quantity: number;
  }[];
  status: 'pending' | 'completed' | 'cancelled';
  total: number;
  updatedAt: string;
  user: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isLoading: boolean;
  successMessage: string | null;
  orders: Order[];
  users: User[];
}

const initialState: UserState = {
  user: null,
  token: sessionStorage.getItem('access_token') || null,
  isAuthenticated: !!sessionStorage.getItem('access_token'),
  status: 'idle',
  error: null,
  isLoading: false,
  successMessage: null,
  orders: [],
  users: [],
};

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: { firstName: string; lastName: string; email: string; password: string }, { rejectWithValue }) => {
    console.log('Registering user with data:', userData);
    try {
      const response = await api.post('/users/register', userData);
      console.log('Registration response:', response.data);
      const { token, user } = response.data;
      if (token) {
        sessionStorage.setItem('access_token', token);
      }
      return { token, user };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An error occurred during registration';
      console.error('Registration error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    console.log('Logging in with credentials:', credentials);
    try {
      const response = await api.post('/users/login', credentials);
      console.log('Login response:', response.data);
      const { token, user } = response.data;
      if (token) {
        sessionStorage.setItem('access_token', token);
      }
      return { token, user };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An error occurred during login';
      console.error('Login error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to refresh the token
export const refreshToken = createAsyncThunk(
  'user/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.user.token;
    if (!token) {
      return rejectWithValue('Token is missing');
    }
    console.log('Refreshing token with current token:', token);
    try {
      const response = await api.post('/users/refresh-token', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Token refresh response:', response.data);
      const { newToken } = response.data;
      if (newToken) {
        sessionStorage.setItem('access_token', newToken);
      }
      return { newToken };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to refresh token';
      console.error('Token refresh error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to get user profile
export const getProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.user.token;
    if (!token) {
      return rejectWithValue('Token is missing');
    }
    console.log('Fetching profile with token:', token);
    try {
      const response = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Profile fetch response:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch profile';
      console.error('Profile fetch error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update user profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: Partial<User>, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.user.token;
    if (!token) {
      return rejectWithValue('Token is missing');
    }
    console.log('Updating profile with data:', userData);
    try {
      const response = await api.put('/users/profile', userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Profile update response:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      console.error('Profile update error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch user orders
export const fetchOrders = createAsyncThunk(
  'user/fetchOrders',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.user.token;
    if (!token) {
      return rejectWithValue('Token is missing');
    }
    console.log('Fetching orders with token:', token);
    try {
      const response = await api.get('/orders/my/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Orders fetch response:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch orders';
      console.error('Orders fetch error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch all users (for admin)
export const fetchUsers = createAsyncThunk('/user/fetchUsers', async (_, { getState, rejectWithValue }) => {
  const state = getState() as RootState;
  const token = state.user.token;
  if (!token) {
      return rejectWithValue('Token is missing');
  }
  console.log('Fetching all users');
  try {
      const response = await api.get('/users', {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      console.log('Users fetch response:', response.data);
      return response.data;
  } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch users';
      console.error('Users fetch error:', errorMessage);
      return rejectWithValue(errorMessage);
  }
});

// Async thunk to delete a user
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const token = state.user.token;
    if (!token) {
      return rejectWithValue('Token is missing');
    }
    console.log('Deleting user with ID:', userId);
    try {
      await api.delete(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('User deleted successfully:', userId);
      return userId;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete user';
      console.error('User deletion error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to fetch a user by ID
export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (userId: string, { rejectWithValue }) => {
    console.log('Fetching user by ID:', userId);
    try {
      const response = await api.get(`/users/${userId}`);
      console.log('User fetch response:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch user';
      console.error('User fetch error:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logoutUser(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.successMessage = null;
      state.orders = [];
      state.users = [];
      sessionStorage.removeItem('access_token');
      console.log('User logged out, token removed from sessionStorage');
    },
    updateUserDetails(state, action: PayloadAction<User>) {
      state.user = action.payload;
      console.log('User details updated:', action.payload);
    },
    clearSuccessMessage(state) {
      state.successMessage = null;
      console.log('Success message cleared');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        console.log('Registration - pending');
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.successMessage = 'Registration successful';
        console.log('Registration - succeeded:', action.payload);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isLoading = false;
        console.error('Registration - failed:', action.payload);
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        console.log('Login - pending');
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.successMessage = 'Login successful';
        console.log('Login - succeeded:', action.payload);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isLoading = false;
        console.error('Login - failed:', action.payload);
      })
      .addCase(refreshToken.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        console.log('Token refresh - pending');
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.newToken;
        sessionStorage.setItem('access_token', action.payload.newToken);
        state.isLoading = false;
        console.log('Token refresh - succeeded:', action.payload);
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isLoading = false;
        console.error('Token refresh - failed:', action.payload);
      })
      .addCase(getProfile.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        console.log('Profile fetch - pending');
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isLoading = false;
        console.log('Profile fetch - succeeded:', action.payload);
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isLoading = false;
        console.error('Profile fetch - failed:', action.payload);
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        console.log('Profile update - pending');
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isLoading = false;
        state.successMessage = 'Profile updated successfully';
        console.log('Profile update - succeeded:', action.payload);
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isLoading = false;
        console.error('Profile update - failed:', action.payload);
      })
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        console.log('Orders fetch - pending');
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orders = action.payload;
        state.isLoading = false;
        console.log('Orders fetch - succeeded:', action.payload);
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isLoading = false;
        console.error('Orders fetch - failed:', action.payload);
      })
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        console.log('Users fetch - pending');
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload;
        state.isLoading = false;
        console.log('Users fetch - succeeded:', action.payload);
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isLoading = false;
        console.error('Users fetch - failed:', action.payload);
      })
      .addCase(deleteUser.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        console.log('User delete - pending');
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = state.users.filter(user => user.id !== action.payload);
        state.isLoading = false;
        console.log('User deleted - succeeded:', action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isLoading = false;
        console.error('User delete - failed:', action.payload);
      })
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
        console.log('User fetch by ID - pending');
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isLoading = false;
        console.log('User fetch by ID - succeeded:', action.payload);
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isLoading = false;
        console.error('User fetch by ID - failed:', action.payload);
      });
  },
});

export const { logoutUser, updateUserDetails, clearSuccessMessage } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated;
export const selectToken = (state: RootState) => state.user.token;
export const selectStatus = (state: RootState) => state.user.status;
export const selectError = (state: RootState) => state.user.error;
export const selectOrders = (state: RootState) => state.user.orders;
export const selectUsers = (state: RootState) => state.user.users;
export const selectIsLoading = (state: RootState) => state.user.isLoading;

export default userSlice.reducer;
