// OrderCard.tsx
import React from 'react';
import { Order } from '../redux/orderSlice';
import './OrderCard.css';


interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  // Check if `order` exists and `order.items` is defined and not empty
  if (!order || !order.items) {
    return <div>Order data is unavailable.</div>;
  }

  return (
    <div className="order-card">
      <h2>Order ID: {order._id}</h2>
      <ul>
        {order.items.length === 0 ? (
          <li>No items in this order.</li>
        ) : (
          order.items.map((item) => (
            <li key={item.product._id}>
              Product ID: {item.product._id} - Quantity: {item.quantity}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default OrderCard;
