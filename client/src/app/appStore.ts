// src/app/appStore.ts

import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import userReducer from '../redux/userSlice';
import cartReducer from '../redux/cartSlice';
import productsReducer from '../redux/productSlice';
import ordersReducer from '../redux/orderSlice';
import soundReducer from '../redux/soundSlice'; // Import sound reducer
import reviewReducer from '../redux/reviewSlice'; // Import review reducer

// Configure the Redux store
const store = configureStore({
  reducer: {
    user: userReducer,
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    sound: soundReducer, 
    reviews: reviewReducer, 
  },
  // Uncomment this line if you want Redux DevTools in development
  //  devTools: process.env.NODE_ENV !== 'production',
});

// Define RootState and AppDispatch based on the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export default store;
