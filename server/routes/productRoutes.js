// productRoutes.js
import express from 'express';
import Product from '../schemas/productSchema.js';
import { createProductValidation, updateProductValidation } from '../validations/product.js';
import { authenticateUser, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get all products => http://localhost:3000/api/products
 * No authentication required
 */
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).send(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

/**
 * Get a single product by ID => http://localhost:3000/api/products/:id
 * No authentication required
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }
    res.status(200).send(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

/**
 * Create a new product => http://localhost:3000/api/products
 * Admin authentication required
 */
router.post('/', authenticateUser, isAdmin, async (req, res) => {
  console.log('POST /api/products - Authenticating user');

  // Validate request data
  const { error } = createProductValidation(req.body);
  if (error) {
    console.error('Validation error:', error.details[0].message);
    return res.status(400).send({ error: error.details[0].message });
  }

  const { name, description, price, category, image, stock, reviews } = req.body;

  try {
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).send({ error: 'Product with this name already exists' });
    }

    const product = new Product({ name, description, price, category, image, stock, reviews });
    const savedProduct = await product.save();
    res.status(201).send(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

/**
 * Update a product => http://localhost:3000/api/products/:id
 * Admin authentication required
 */
router.put('/:id', authenticateUser, isAdmin, async (req, res) => {
  console.log('PUT /api/products/:id - Authenticating user');

  const { _id, ...updatedProductData } = req.body;
  const { error } = updateProductValidation(updatedProductData);
  if (error) {
    console.error('Validation error:', error.details[0].message);
    return res.status(400).send({ error: error.details[0].message });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }

    Object.assign(product, updatedProductData);
    const updatedProduct = await product.save();
    res.status(200).send(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

/**
 * Delete a product => http://localhost:3000/api/products/:id
 * Admin authentication required
 */
router.delete('/:id', authenticateUser, isAdmin, async (req, res) => {
  console.log('DELETE /api/products/:id - Authenticating user');
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.status(200).send({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

/**
 * Update product stock after purchase => http://localhost:3000/api/products/:id/purchase
 * User authentication required
 */
router.patch('/:id/purchase', authenticateUser, async (req, res) => {
  console.log('PATCH /api/products/:id/purchase - Authenticating user');
  const { quantity } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).send({ error: 'Not enough stock available' });
    }

    product.stock -= quantity;
    const updatedProduct = await product.save();

    res.status(200).send({ message: 'Stock updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

/**
 * Update product stock (admin only) => http://localhost:3000/api/products/:id/stock
 * Admin authentication required
 */
router.patch('/:id/stock', authenticateUser, isAdmin, async (req, res) => {
  console.log('PATCH /api/products/:id/stock - Authenticating user');
  const { quantity } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }

    product.stock = quantity; // Admins can set stock directly
    const updatedProduct = await product.save();

    res.status(200).send({ message: 'Stock updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

/**
 * Get all reviews for a product => http://localhost:3000/api/products/:id/reviews
 * No authentication required
 */
router.get('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }
    res.status(200).send(product.reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

/**
 * Create a new review => http://localhost:3000/api/products/:id/reviews
 * User authentication required
 */
router.post('/:id/reviews', authenticateUser, async (req, res) => {
  const { user, rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }

    const review = { user, rating, comment };
    product.reviews.push(review);
    await product.save();

    res.status(201).send(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

/**
 * Update a review => http://localhost:3000/api/products/:id/reviews/:reviewId
 * User authentication required
 */
router.put('/:id/reviews/:reviewId', authenticateUser, async (req, res) => {
  const { id, reviewId } = req.params;
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }

    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).send({ error: 'Review not found' });
    }

    review.rating = rating;
    review.comment = comment;
    await product.save();

    res.status(200).send(review);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

export default router;
