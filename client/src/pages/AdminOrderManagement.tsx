// AdminOrderManagement.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../app/appStore';
import { fetchOrders, selectOrders, updateOrder, deleteOrder } from '../redux/orderSlice';
import './AdminOrderManagement.css';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

interface OrderProduct {
  product: Product;
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
  const orders = useSelector((state: RootState) => selectOrders(state)) as Order[];
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleEditClick = (order: Order) => {
    setSelectedOrder(order);
    setOrder({
      products: order.products,
      total: order.total,
      status: order.status,
    });
  };

  const handleUpdateSubmit = () => {
    if (selectedOrder) {
      const { _id, ...updates } = order;

      if (updates.products) {
        updates.products = updates.products.map((orderProduct: OrderProduct) => ({
          product: {
            _id: orderProduct.product._id,
            name: orderProduct.product.name,
            price: orderProduct.product.price,
            category: orderProduct.product.category,
            image: orderProduct.product.image,
            stock: orderProduct.product.stock,
          },
          quantity: orderProduct.quantity,
        }));
      }

      console.log("Updating order with data:", { id: selectedOrder._id, updates });

      dispatch(updateOrder({ id: selectedOrder._id, updates: updates as Partial<Order> }));
      setSelectedOrder(null);
    }
  };

  const handleDelete = (id: string) => {
    dispatch(deleteOrder(id));
    setSelectedOrder(null);
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "total") {
      setOrder((prevOrder) => ({
        ...prevOrder,
        [name]: parseFloat(value),
      }));
    } else {
      setOrder((prevOrder) => ({
        ...prevOrder,
        [name]: value,
      }));
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updatedProducts = [...(order.products || [])];
    const updatedProduct = { ...updatedProducts[index] };
    updatedProduct.quantity = quantity;

    updatedProducts[index] = updatedProduct;

    const newTotal = updatedProducts.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    
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
      {selectedOrder ? (
        <div className="order-item">
          <h3>Order ID: {selectedOrder._id}</h3>
          <p>User: {selectedOrder.user}</p>
          <p>Total Price: ${selectedOrder.total}</p>
          <p>Status: {selectedOrder.status}</p>
          <div className="products-list">
            <h4>Products</h4>
            <div>
              {selectedOrder.products.map((orderProduct, index) => (
                <div className='orders-card' key={index}>
                  <div className="product-info">
                    <p>Product Name: {orderProduct.product.name}</p>
                    <img src={orderProduct.product.image} alt={orderProduct.product.name} className="product-order-image" />
                    <p>Price: ${orderProduct.product.price}</p>
                  </div>
                  <label>
                    Quantity:
                    <input
                      type="number"
                      value={orderProduct.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="order-buttons">
            <button onClick={handleUpdateSubmit}>Submit Changes</button>
            <button onClick={() => handleDelete(selectedOrder._id)}>Delete</button>
            <button onClick={handleBackClick}>Back to Orders</button>
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
                  <button onClick={() => handleEditClick(order)}>Manage</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminOrderManagement;
