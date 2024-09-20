// src/redux/cartSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from './productSlice';

// Define the CartItem type
export interface CartItem {
  product: Product;
  quantity: number;
}

// Define the CartState type
export interface CartState {
  items: CartItem[];
}

// Load the cart from localStorage or set it to an empty array if not available
const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
};

// Create the slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existingItem = state.items.find(item => item.product._id === action.payload.product._id);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.product._id !== action.payload);
      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      // Clear cart from localStorage
      localStorage.removeItem('cart');
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const existingItem = state.items.find(item => item.product._id === action.payload.productId);
      if (existingItem) {
        existingItem.quantity = action.payload.quantity;
      }
      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
  },
});

// Export actions
export const { addItem, removeItem, clearCart, updateQuantity } = cartSlice.actions;

// Export selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState }) => 
  state.cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);

export default cartSlice.reducer;
