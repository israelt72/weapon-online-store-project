// utils/helpers.ts

import { CartItem } from '../redux/cartSlice';

//  calculate the total price of items in the cart
export const calculateTotalPrice = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
};