// redux/userSlice.ts
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

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isLoading: boolean;
}

const initialState: UserState = {
  user: null,
  token: sessionStorage.getItem('access_token') || null,
  isAuthenticated: !!sessionStorage.getItem('access_token'),
  status: 'idle',
  error: null,
  isLoading: false,
};

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: { firstName: string; lastName: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/register', userData);
      const { token, user } = response.data;
      if (token) {
        sessionStorage.setItem('access_token', token); // Save the token in sessionStorage
      }
      return { token, user };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An error occurred during registration';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/login', credentials);
      const { token, user } = response.data;
      if (token) {
        sessionStorage.setItem('access_token', token); // Save the token in sessionStorage
      }
      return { token, user };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An error occurred during login';
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
    try {
      const response = await api.post('/users/refresh-token', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { newToken } = response.data;
      if (newToken) {
        sessionStorage.setItem('access_token', newToken); // Save the new token in sessionStorage
      }
      return { newToken };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to refresh token';
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
    try {
      const response = await api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch profile';
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
    try {
      const response = await api.put('/users/profile', userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
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
      sessionStorage.removeItem('access_token'); // Remove the token from sessionStorage
      console.log('User logged out, token removed from sessionStorage');
    },
    updateUserDetails(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to register';
        state.isLoading = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to login';
        state.isLoading = false;
      })
      .addCase(refreshToken.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.newToken;
        sessionStorage.setItem('access_token', action.payload.newToken); // Update the token in sessionStorage
        state.isLoading = false;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to refresh token';
        state.isLoading = false;
      })
      .addCase(getProfile.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to fetch profile';
        state.isLoading = false;
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to update profile';
        state.isLoading = false;
      });
  },
});

export const { logoutUser, updateUserDetails } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;
export const selectToken = (state: RootState) => state.user.token;
export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated;
export const selectUserStatus = (state: RootState) => state.user.status;
export const selectUserError = (state: RootState) => state.user.error;

export default userSlice.reducer;
