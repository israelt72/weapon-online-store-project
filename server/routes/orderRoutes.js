// orderRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import Order from '../schemas/orderSchema.js';
import Product from '../schemas/productSchema.js';
import User from '../schemas/userSchema.js';
import { calculateTotalPrice } from '../utils/helpers.js';
import { authenticateUser } from '../middleware/auth.js';
import { createOrderValidation, updateOrderValidation } from '../validations/order.js';

const router = express.Router();


 // Middleware to check if the user is admin
 
const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send({ error: 'Access denied' });
  }
  next();
};


 // Create a new order => http://localhost:3000/api/orders

router.post('/', authenticateUser, async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Authentication required' });
  }

  console.log('Received request body:', req.body);
  console.log('Authenticated user:', req.user);

  const { error } = createOrderValidation(req.body);
  if (error) {
    console.error('Validation error:', error.details[0].message);
    return res.status(400).send({ error: error.details[0].message });
  }

  const { products, status } = req.body;

  try {
    const validatedProducts = await Promise.all(products.map(async (item) => {
      const product = await Product.findById(item.product).select('price stock');
      if (!product) {
        console.error(`Product with ID ${item.product} not found.`);
        throw new Error('Invalid product ID');
      }
      return {
        product: item.product,
        quantity: item.quantity,
        price: product.price,
        availableQuantity: product.stock
      };
    }));

    const totalAmount = await calculateTotalPrice(validatedProducts);

    const order = new Order({
      user: req.user.id,
      products: validatedProducts.map(item => ({
        product: item.product,
        quantity: item.quantity
      })),
      total: totalAmount,
      status: status || 'pending'
    });

    await order.save();
    await User.findByIdAndUpdate(req.user.id, {
      $push: { orders: order._id }
    });

    await Promise.all(validatedProducts.map(async (item) => {
      if (item.availableQuantity < item.quantity) {
        console.error(`Not enough stock for product ${item.product}. Available: ${item.availableQuantity}, Requested: ${item.quantity}`);
        throw new Error(`Not enough stock for product ${item.product}`);
      }
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }));

    res.status(201).send({
      message: 'Order placed successfully!',
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send({ error: 'Server error' });
  }
});


// Get all orders => http://localhost:3000/api/orders
 // Admin only
 
router.get('/', authenticateUser, authorizeAdmin, async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Authentication required' });
  }

  console.log('Fetching all orders');
  try {
    const orders = await Order.find().populate('products.product');
    res.send(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send({ error: 'Server error' });
  }
});


 // Get all orders for the currently logged-in user => http://localhost:3000/api/orders/my
 
router.get('/my', authenticateUser, async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Authentication required' });
  }

  console.log('Fetching orders for user ID:', req.user.id);
  try {
    const orders = await Order.find({ user: req.user.id }).populate('products.product');
    res.send(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send({ error: 'Server error' });
  }
});


 // Get a specific order by ID => http://localhost:3000/api/orders/:id
 
router.get('/:id', authenticateUser, async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Authentication required' });
  }

  console.log('Fetching order with ID:', req.params.id);
  try {
    const order = await Order.findById(req.params.id).populate('products.product');
    if (!order) {
      return res.status(404).send({ error: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).send({ error: 'Access denied' });
    }

    res.send(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).send({ error: 'Server error' });
  }
});


  //Update a specific order by ID => http://localhost:3000/api/orders/:id
 
router.patch('/:id', authenticateUser, async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Authentication required' });
  }

  console.log('Update request body:', req.body);

  const { error } = updateOrderValidation(req.body);
  if (error) {
    console.error('Validation error:', error.details[0].message);
    return res.status(400).send({ error: error.details[0].message });
  }

  const { products, status } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).send({ error: 'Order not found' });
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).send({ error: 'Access denied' });
    }

    if (products) {
      const validatedProducts = await Promise.all(products.map(async (item) => {
        const product = await Product.findById(item.product).select('price stock');
        if (!product) {
          console.error(`Product with ID ${item.product} not found.`);
          throw new Error('Invalid product ID');
        }
        return {
          product: item.product,
          quantity: item.quantity,
          price: product.price,
          availableQuantity: product.stock
        };
      }));

      order.products = validatedProducts.map(item => ({
        product: item.product,
        quantity: item.quantity
      }));
    }

    if (status) {
      order.status = status;
    }

    
    if (req.body.total !== undefined) {
      order.total = req.body.total; 
    }

    await order.save();

    res.send({
      message: 'Order updated successfully!',
      order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).send({ error: 'Server error' });
  }
});


//Delete a specific order by ID => http://localhost:3000/api/orders/:id
 // Admin only
 
router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ message: 'Authentication required' });
  }

  console.log('Deleting order with ID:', req.params.id);
  try {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).send({ error: 'Invalid order ID' });
    }

    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).send({ error: 'Order not found' });
    }

    await User.updateMany(
      { orders: orderId },
      { $pull: { orders: orderId } }
    );

    res.send({ message: 'Order deleted successfully!' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

export default router;
