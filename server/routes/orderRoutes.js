// orderRoutes.js

import express from 'express';
import Order from '../schemas/orderSchema.js';
import { calculateTotalPrice } from '../utils/helpers.js';
import { authenticateUser } from '../middleware/auth.js';
import { createOrderValidation, updateOrderValidation } from '../validations/order.js';

const router = express.Router();

/**
 * Create a new order => http://localhost:3000/api/orders
 */
router.post('/', authenticateUser, async (req, res) => {
  console.log('Received request body:', req.body);

  // Validate request data
  const { error } = createOrderValidation(req.body);
  if (error) {
    console.error('Validation error:', error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }

  const { products } = req.body;

  try {
    // Calculate the total amount for the order
    const totalAmount = calculateTotalPrice(products);

    // Create a new order instance
    const order = new Order({
      user: req.user.id,  // Ensure req.user is properly set by the middleware
      products,
      total: totalAmount,  // Make sure this field matches the schema
    });

    // Save the order to the database
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get all orders for the currently logged-in user => http://localhost:3000/api/orders
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get a specific order by ID => http://localhost:3000/api/orders/:id
 */
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Ensure that the order belongs to the current user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Update a specific order by ID => http://localhost:3000/api/orders/:id
 */
router.put('/:id', authenticateUser, async (req, res) => {
  console.log('Update request body:', req.body);

  // Validate request data
  const { error } = updateOrderValidation(req.body);
  if (error) {
    console.error('Validation error:', error.details[0].message);
    return res.status(400).json({ error: error.details[0].message });
  }

  const { products, status } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ensure that the order belongs to the current user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (products) {
      order.products = products;
      order.total = calculateTotalPrice(products);  // Ensure 'total' is used
    }

    if (status) {
      order.status = status;
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Delete a specific order by ID => http://localhost:3000/api/orders/:id
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ensure that the order belongs to the current user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Order.deleteOne({ _id: req.params.id });
    res.json({ message: 'Order removed' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
