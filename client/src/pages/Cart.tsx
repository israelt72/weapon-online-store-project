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

  // Function to get the token from sessionStorage
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
      navigate('/login'); // Redirect to login if not logged in
      return;
    }

    const token = getToken();

    if (!token) {
      console.error('Token not found in sessionStorage');
      return;
    }

    // Ensure all fields are correct and in the right format
    const order = {
      user: userId, // Ensure this matches your schema
      products: cartItems.map(item => ({
        product: item.product._id, // Use `product` as per your schema
        quantity: Number(item.quantity), // Ensure quantity is a number
      })),
      total: Number(calculateTotalPrice(cartItems)), // Ensure total is a number
      status: 'pending', // Default status
    };

    try {
      const response = await axios.post('http://localhost:3000/api/orders', order, {
        headers: {
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) { 
        dispatch(clearCart());
        navigate('/products');
      } else {
        console.error('Failed to place order:', response.statusText);
      }
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
                <div className="cart-item-price">${Number(item.product.price).toFixed(2)}</div>
                <div className={`cart-item-stock ${item.product.stock === 0 ? 'out-of-stock' : ''}`}>
                  {item.product.stock > 0 ? `Stock: ${item.product.stock}` : 'Out of stock'}
                </div>
                <div className="cart-item-quantity">
                  <button 
                    onClick={() => handleQuantityChange(item.product._id, item.quantity - 1, item.product.stock)}
                    disabled={item.quantity <= 1} 
                    className="quantity-button"
                  >
                    -
                  </button>
                  {item.quantity}
                  <button 
                    onClick={() => handleQuantityChange(item.product._id, item.quantity + 1, item.product.stock)}
                    disabled={item.quantity >= item.product.stock} 
                    className="quantity-button"
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
        <div className="cart-total">Total: ${Number(calculateTotalPrice(cartItems)).toFixed(2)}</div>
        <button className="checkout-button" onClick={handlePlaceOrder}>Proceed to Checkout</button>
      </div>
      <button className="back-to-products-button" onClick={() => navigate('/products')}>
        Back to Products
      </button>
    </div>
  );
};

export default Cart;
