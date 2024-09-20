// src/redux/orderSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../utils/api';
import { RootState } from '../app/appStore';
import { Product } from './productSlice';

// Helper function to get the token
const getToken = () => {
  const token = sessionStorage.getItem('access_token');
  if (!token) {
    throw new Error('No token found');
  }
  return token;
};

// Define the Order type
export interface Order {
  products: any;
  _id: string;
  user: string;
  items: {
    product: Product;
    quantity: number;
  }[];
  total: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface OrderState {
  orders: Order[];
  order: Order | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: OrderState = {
  orders: [],
  order: null,
  status: 'idle',
  error: null,
};

// Async thunk for creating an order
export const placeOrder = createAsyncThunk<Order, Order, { rejectValue: string }>(
  'orders/placeOrder',
  async (newOrder, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await api.post('/orders', newOrder, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to place order');
    }
  }
);

// Async thunk for fetching orders
export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const response = await api.get('/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch orders');
    }
  }
);

// Async thunk for updating an order
export const updateOrder = createAsyncThunk<Order, { id: string; updates: Partial<Order> }, { rejectValue: string }>(
  'orders/updateOrder',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const token = getToken();
      console.log('Token:', token);
      const response = await api.patch(`/orders/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating order:', error.response?.data); 
      return rejectWithValue(error.response?.data?.error || 'Failed to update order');
    }
  }
);

// Async thunk for deleting an order
export const deleteOrder = createAsyncThunk<string, string, { rejectValue: string }>(
  'orders/deleteOrder',
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      await api.delete(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete order');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders(state, action: PayloadAction<Order[]>) {
      state.orders = action.payload;
    },
    setOrder(state, action: PayloadAction<Order>) {
      state.order = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.status = 'succeeded';
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch orders';
      })
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(placeOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.status = 'succeeded';
        state.orders.push(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to place order';
      })
      .addCase(updateOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.status = 'succeeded';
        const index = state.orders.findIndex((order) => order._id === action.payload._id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update order';
      })
      .addCase(deleteOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteOrder.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.orders = state.orders.filter((order) => order._id !== action.payload);
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to delete order';
      });
  },
});

export const { setOrders, setOrder } = orderSlice.actions;
export default orderSlice.reducer;

export const selectOrders = (state: RootState) => state.orders.orders;
export const selectOrderStatus = (state: RootState) => state.orders.status;
export const selectOrderError = (state: RootState) => state.orders.error;
