import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import api from '../utils/api'; // Ensure this imports your axios instance
import { RootState } from '../app/appStore';

// Define the Product type
export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  isFeatured?: boolean;
  category: string;
  stock: number;
}

// Define the ProductState type
interface ProductState {
  products: Product[];
  product: Product | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: ProductState = {
  products: [],
  product: null,
  status: 'idle',
  error: null,
};

// Async thunk for fetching products
export const fetchProducts = createAsyncThunk<Product[], void, { rejectValue: string }>(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch products');
    }
  }
);

// Async thunk for fetching a single product
export const fetchProduct = createAsyncThunk<Product, string, { rejectValue: string }>(
  'products/fetchProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch product:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch product');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload;
    },
    addProduct(state, action: PayloadAction<Product>) {
      state.products.push(action.payload);
    },
    updateProduct(state, action: PayloadAction<Product>) {
      const index = state.products.findIndex(product => product._id === action.payload._id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    removeProduct(state, action: PayloadAction<string>) {
      state.products = state.products.filter(product => product._id !== action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProducts.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch products';
      })
      .addCase(fetchProduct.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.product = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch product';
      });
  },
});

export const selectProducts = (state: RootState) => state.products.products;

export const selectFeaturedProducts = createSelector(
  [selectProducts],
  (products) => products.filter(product => product.isFeatured)
);

export const { setProducts, addProduct, updateProduct, removeProduct } = productSlice.actions;

export const selectProduct = (state: RootState) => state.products.product;
export const selectProductStatus = (state: RootState) => state.products.status;
export const selectProductError = (state: RootState) => state.products.error;

export default productSlice.reducer;
