//Orders.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/appStore';
import { fetchOrders, selectOrders, selectOrderStatus, selectOrderError } from '../redux/orderSlice';
import './styles.css';

const Orders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector(selectOrders);
  const status = useSelector(selectOrderStatus);
  const error = useSelector(selectOrderError);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      {status === 'loading' && <p>Loading...</p>}
      {status === 'failed' && <p>Error: {error}</p>}
      {status === 'succeeded' && orders.length === 0 && <p>No orders found</p>}
      {status === 'succeeded' && orders.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Items</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>${order.totalAmount.toFixed(2)}</td>
                <td>{order.status}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>
                        {item.quantity} x {item.product.name}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Orders;
