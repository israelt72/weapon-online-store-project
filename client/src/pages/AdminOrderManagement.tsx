// AdminOrderManagement.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/appStore';
import { fetchOrders, selectOrders, updateOrder, deleteOrder } from '../redux/orderSlice';
import { selectProducts } from '../redux/productSlice';
import './AdminOrderManagement.css';

interface OrderProduct {
  product: {
    _id: string;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  products: OrderProduct[];
  _id: string;
  user: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
}

const AdminOrderManagement: React.FC = () => {
  const [order, setOrder] = useState<Partial<Order>>({
    products: [],
    total: 0,
    status: 'pending',
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const orders = useSelector((state: RootState) => selectOrders(state)) as Order[];
  const products = useSelector((state: RootState) => selectProducts(state));
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const loadOrders = async () => {
      await dispatch(fetchOrders());
    };
    loadOrders();
  }, [dispatch]);

  const getProductById = (id: string) => {
    return products.find((product) => product._id === id) || null;
  };

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setOrder({
      products: order.products.map((p) => ({ product: p.product, quantity: p.quantity })),
      total: order.total,
      status: order.status,
    });
  };

  const handleUpdateSubmit = async () => {
    if (selectedOrder) {
      const { _id, ...updates } = order;

      if (updates.products) {
        updates.products = updates.products.map((orderProduct) => ({
          product: orderProduct.product,
          quantity: orderProduct.quantity,
        }));
      }

      try {
        await dispatch(updateOrder({ id: selectedOrder._id, updates: updates as Partial<Order> }));
        setSuccessMessage('The order has been updated successfully!');
        dispatch(fetchOrders());

        setTimeout(() => {
          setSuccessMessage(null);
        }, 2500);

        setSelectedOrder(null);
      } catch (error) {
        console.error("Error updating order:", error);
        alert("Failed to update order.");
      }
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteOrder(id));
    setSelectedOrder(null);
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setOrder((prevOrder) => ({
      ...prevOrder,
      [name]: name === "total" ? parseFloat(value) : value,
    }));
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return; // Ensure quantity is at least 1

    const updatedProducts = [...(order.products || [])];
    updatedProducts[index].quantity = quantity;

    const newTotal = updatedProducts.reduce((acc, item) => {
      const product = getProductById(item.product._id);
      return product ? acc + (product.price * item.quantity) : acc;
    }, 0);

    setOrder({
      ...order,
      products: updatedProducts,
      total: newTotal,
    });
  };

  const handleBackClick = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="admin-order-management">
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      {selectedOrder ? (
        <div className="order-item">
          <h3>Order ID: {selectedOrder._id}</h3>
          <p>User: {selectedOrder.user}</p>
          <p>Total Price: ${selectedOrder.total}</p>
          <p>Status: {selectedOrder.status}</p>
          <div className="products-list-container">
            <h4>Products</h4>
            <div className="product-list">
              {selectedOrder.products.map((orderProduct, index) => {
                const product = getProductById(orderProduct.product._id);
                return product ? (
                  <div className="order-product-card" key={index}>
                    <div className="product-details">
                      <p>Product Name: {product.name}</p>
                      <p>Price: ${product.price}</p>
                      <p>Quantity: {orderProduct.quantity}</p>
                    </div>
                    <label>
                      Update Quantity:
                      <input
                        type="number"
                        value={orderProduct.quantity}
                        min="1" 
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)} // Default to 1 if NaN
                      />
                    </label>
                  </div>
                ) : (
                  <p>Product not found</p>
                );
              })}
            </div>
          </div>
          <div className="order-edit-form">
            <h3>Edit Order</h3>
            <label>
              Total Price:
              <input
                type="number"
                name="total"
                value={order.total || ''}
                onChange={handleUpdateChange}
              />
            </label>
            <label>
              Status:
              <select
                name="status"
                value={order.status || 'pending'}
                onChange={handleUpdateChange}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>
          <div className="order-buttons">
            <button onClick={handleUpdateSubmit}>Submit Changes</button>
            <button onClick={() => handleDelete(selectedOrder._id)}>Delete</button>
            <button onClick={handleBackClick}>Back to Orders</button>
          </div>
        </div>
      ) : (
        <div className="order-selection">
          <h3 className='order-selection-h3'>Select an Order to Manage</h3>
          {orders.length === 0 ? (
            <p>No orders available.</p>
          ) : (
            <div className="order-preview-container">
              {orders.map((order) => (
                <div key={order._id} className="order-preview">
                  <h4>Order ID: {order._id}</h4>
                  <button className='btn-manage' onClick={() => handleEditClick(order)}>Manage</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;
