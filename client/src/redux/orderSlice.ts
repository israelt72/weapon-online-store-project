// orderSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../utils/api'; // Ensure this imports your axios instance
import { RootState } from '../app/appStore';
import { Product } from './productSlice';

// Define the Order type
interface Order {
  id?: string;
  userId: string;
  items: {
    product: Product;
    quantity: number;
  }[];
  totalAmount: number;
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
      const token = sessionStorage.getItem('access_token'); // Get token from sessionStorage
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await api.post('/orders', newOrder, {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in headers
        },
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
      const token = sessionStorage.getItem('access_token'); // Get token from sessionStorage
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await api.get('/orders', {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in headers
        },
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
      const token = sessionStorage.getItem('access_token'); // Get token from sessionStorage
      if (!token) {
        return rejectWithValue('No token found');
      }
      const response = await api.put(`/orders/${id}`, updates, {
        headers: {
          Authorization: `Bearer ${token}`, // Send token in headers
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update order');
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
        const index = state.orders.findIndex((order) => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
          state.order = action.payload; // Optionally update current order state
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to update order';
      });
  },
});

export const { setOrders, setOrder } = orderSlice.actions;

export const selectOrders = (state: RootState) => state.orders.orders;
export const selectOrder = (state: RootState) => state.orders.order;
export const selectOrderStatus = (state: RootState) => state.orders.status;
export const selectOrderError = (state: RootState) => state.orders.error;

export default orderSlice.reducer;
