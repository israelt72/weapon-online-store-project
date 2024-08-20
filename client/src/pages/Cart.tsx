//Cart.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../app/appStore';
import { removeItem, updateQuantity, selectCartItems, clearCart } from '../redux/cartSlice';
import axios from 'axios';
import { calculateTotalPrice } from '../utils/helpers';
import '../components/styles.css';

const Cart: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.user.user?.id);

  // פונקציה לקבלת הטוקן מה-sessionStorage
  const getToken = () => sessionStorage.getItem('access_token');

  // Handle changing the quantity of an item
  const handleQuantityChange = (productId: string, newQuantity: number, stock: number) => {
    if (newQuantity < 1 || newQuantity > stock) return;
    dispatch(updateQuantity({ productId, quantity: newQuantity }));
  };

  // Handle removing an item from the cart
  const handleRemoveItem = (productId: string) => {
    dispatch(removeItem(productId));
  };

  // Handle clearing all items from the cart
  const handleClearCart = () => {
    dispatch(clearCart());
  };

  // Handle placing the order
  const handlePlaceOrder = async () => {
    if (!userId) {
      console.error('User is not logged in');
      navigate('/login'); // הפנה את המשתמש להתחברות אם הוא לא מחובר
      return;
    }

    const token = getToken();

    if (!token) {
      console.error('Token not found in sessionStorage');
      return;
    }

    const order = {
      userId,
      items: cartItems.map(item => ({
        product: item.product._id, // השתמש בשם החדש עבור המזהה
        quantity: item.quantity,
      })),
      totalAmount: calculateTotalPrice(cartItems), // השתמש בשם הנכון עבור הסכום הכולל
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    try {
      const response = await axios.post('http://localhost:3000/api/orders', order, {
        headers: {
          Authorization: `Bearer ${token}`, // הוסף את הטוקן בכותרת
          'Content-Type': 'application/json', // הקצה את סוג התוכן ל-JSON
        },
      });
      dispatch(clearCart());
      navigate('/order-confirmation');
    } catch (error: any) {
      console.error('Failed to place order', error.response?.data || error.message);
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Your Cart</h2>
        {cartItems.length > 0 && (
          <button className="clear-cart-button" onClick={handleClearCart}>
            Clear Cart
          </button>
        )}
      </div>
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cartItems.map(item => (
            <div key={item.product._id} className="cart-item">
              <img 
                src={item.product.image || 'default-image.png'} 
                alt={item.product.name}
                className="cart-item-image"
              />
              <div className="cart-item-details">
                <div className="cart-item-name">{item.product.name}</div>
                <div className="cart-item-price">${item.product.price.toFixed(2)}</div>
                <div className="cart-item-stock">Stock: {item.product.stock}</div>
                <div className="cart-item-quantity">
                  <button 
                    onClick={() => handleQuantityChange(item.product._id, item.quantity - 1, item.product.stock)}
                    disabled={item.quantity <= 1} 
                  >
                    -
                  </button>
                  {item.quantity}
                  <button 
                    onClick={() => handleQuantityChange(item.product._id, item.quantity + 1, item.product.stock)}
                    disabled={item.quantity >= item.product.stock} 
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="cart-item-actions">
                <button className="cart-item-action-button" onClick={() => handleRemoveItem(item.product._id)}>Remove</button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-summary">
        <h3>Summary</h3>
        <div className="cart-total">Total: ${calculateTotalPrice(cartItems).toFixed(2)}</div>
        <button className="checkout-button" onClick={handlePlaceOrder}>Proceed to Checkout</button>
      </div>
      <button className="back-to-products-button" onClick={() => navigate('/products')}>
        Back to Products
      </button>
    </div>
  );
};

export default Cart;
