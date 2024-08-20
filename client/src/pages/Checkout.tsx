// src/pages/Checkout.tsx

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart, selectCartItems, selectCartTotal } from '../redux/cartSlice';
import { placeOrder } from '../redux/orderSlice';
import { calculateTotalPrice } from '../utils/helpers';
import '../components/styles.css';
import { AppDispatch } from '../app/appStore';
import { Product } from '../redux/productSlice';

const Checkout: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle placing the order
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);

    // Retrieve token from sessionStorage
    const token = sessionStorage.getItem('access_token');
    console.log('Token from sessionStorage:', token); // Log token for debugging

    if (!token) {
      console.error('Token not found in sessionStorage');
      setError('Failed to place order. Please try again.');
      setIsPlacingOrder(false);
      return;
    }

    try {
      // Dispatch placeOrder action
      await dispatch(placeOrder({
        userId: 'user-id', // Replace with actual user ID
        items: cartItems.map(item => ({
          product: item.product, // Send the full product object
          quantity: item.quantity,
        })),
        totalAmount: cartTotal,
        createdAt: new Date().toISOString(),
        status: 'pending',
      })).unwrap();
      
      // Clear cart and navigate to order confirmation
      dispatch(clearCart());
      navigate('/order-confirmation');
    } catch (err) {
      console.error('Failed to place order:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  return (
    <div className="checkout">
      <h2>Checkout</h2>
      <div className="checkout-summary">
        <h3>Order Summary</h3>
        <ul>
          {cartItems.map(item => (
            <li key={item.product._id}>
              {item.product.name} x {item.quantity} - ${item.product.price * item.quantity}
            </li>
          ))}
        </ul>
        <div className="checkout-total">
          <strong>Total:</strong> ${calculateTotalPrice(cartItems)}
        </div>
      </div>
      {error && <div className="error">{error}</div>}
      <button 
        onClick={handlePlaceOrder} 
        disabled={isPlacingOrder} 
        className="place-order-button"
      >
        {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
};

export default Checkout;
