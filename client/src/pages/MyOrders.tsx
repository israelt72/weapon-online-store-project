//MyOrders.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, selectOrders, selectOrderStatus, selectOrderError } from '../redux/orderSlice';
import { RootState } from '../app/appStore';
import OrderCard from '../components/OrderCard';

const MyOrders: React.FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectOrders) || []; // Ensure orders is at least an empty array
  const orderStatus = useSelector(selectOrderStatus);
  const orderError = useSelector(selectOrderError);
  const user = useSelector((state: RootState) => state.user.user);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      setIsAdmin(true);
    }
    if (isAuthenticated) {
      dispatch(fetchOrders() as any);
    }
  }, [dispatch, isAuthenticated, user?.role]);

  const handleDelete = (orderId: string) => {
    // Logic to delete the order
    console.log(`Deleting order with ID: ${orderId}`);
    // TODO: Implement delete logic
  };

  // Ensure orders is defined before attempting to filter or map
  const filteredOrders = isAdmin ? orders : orders.filter(order => user?.id === order.user);

  return (
    <div className="my-orders">
      {orderStatus === 'loading' && <p>Loading...</p>}
      {orderError && <p>Error: {orderError}</p>}
      {orderStatus === 'succeeded' && filteredOrders.length === 0 && <p>No orders found.</p>}
      {orderStatus === 'succeeded' && filteredOrders.length > 0 && (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
      {isAdmin && filteredOrders.length > 0 && (
        <div className="order-actions">
          {filteredOrders.map((order) => (
            <div key={order._id} className="order-item-list">
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.product._id} className="order-item">
                    Product ID: {item.product._id} - Quantity: {item.quantity}
                  </div>
                ))
              ) : (
                <div>No items found for this order.</div>
              )}
              <button onClick={() => handleDelete(order._id)} className="delete-button">
                Delete Order
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
