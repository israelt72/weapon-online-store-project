



// export default store;

import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/userSlice';
import cartReducer from '../redux/cartSlice';
import productsReducer from '../redux/productSlice';
import ordersReducer from '../redux/orderSlice';
import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';

// Configure the Redux store
const store = configureStore({
  reducer: {
    user: userReducer,
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
  },
  // Uncomment this line if you want Redux DevTools in development
  //  devTools: process.env.NODE_ENV !== 'production',
});

// Define RootState and AppDispatch based on the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;

export default store;
