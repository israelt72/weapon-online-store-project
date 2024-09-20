// Checkout.tsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCart, selectCartItems } from '../redux/cartSlice';
import { placeOrder } from '../redux/orderSlice';
import { calculateTotalPrice } from '../utils/helpers';
import { fetchProducts, updateStockAfterOrder } from '../redux/productSlice';
import '../components/styles.css';
import { AppDispatch, RootState } from '../app/appStore';

const Checkout: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = useSelector((state: RootState) => state.user.user?.id);

  useEffect(() => {
    if (!userId) {
      navigate('/login'); // אם המשתמש לא מחובר, העבר אותו לדף ההתחברות
    }
    if (cartItems.length === 0) {
      navigate('/cart'); // אם העגלה ריקה, העבר לדף העגלה
    }
  }, [userId, cartItems, navigate]);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    const token = sessionStorage.getItem('access_token');

    if (!token) {
      setError('Failed to place order. Please try again.');
      setIsPlacingOrder(false);
      return;
    }

    if (!userId) {
      setError('User ID is missing.');
      setIsPlacingOrder(false);
      return;
    }

    try {
      const orderResponse = await dispatch(placeOrder({
        _id: 'temporaryId',
        user: userId,
        items: cartItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
        })),
        products: cartItems.map(item => item.product),
        total: calculateTotalPrice(cartItems),
        createdAt: new Date().toISOString(),
        status: 'pending',
      })).unwrap();

      // עדכון המלאי של המוצרים
      await Promise.all(cartItems.map(item => 
        dispatch(updateStockAfterOrder({
          id: item.product._id,
          quantity: item.quantity,
        }))
      ));

      dispatch(clearCart());
      await dispatch(fetchProducts()); 
      navigate('/products'); 
    } catch (err: any) {
      setError('Failed to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

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
