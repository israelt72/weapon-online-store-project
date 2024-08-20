// productRoutes.js
import express from 'express';
import Product from '../schemas/productSchema.js';
import { createProductValidation, updateProductValidation } from '../validations/product.js';
import { authenticateUser } from '../middleware/auth.js'; // Ensure authentication is using Authorization Header

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
 * Authentication required
 */
router.post('/', authenticateUser, async (req, res) => {
  console.log('POST /api/products - Authenticating user'); // Debug log
  // Validate request data
  const { error } = createProductValidation(req.body);
  if (error) {
    console.error('Validation error:', error.details[0].message);
    return res.status(400).send({ error: error.details[0].message });
  }

  const { name, description, price, category, image, stock, reviews } = req.body;

  try {
    // Check if a product with the same name already exists
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return res.status(400).send({ error: 'Product with this name already exists' });
    }

    // Create a new product instance
    const product = new Product({
      name,
      description,
      price,
      category,
      image,
      stock,
      reviews
    });

    // Save the product to the database
    const savedProduct = await product.save();
    res.status(201).send(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

/**
 * Update a product => http://localhost:3000/api/products/:id
 * Authentication required
 */
router.put('/:id', authenticateUser, async (req, res) => {
  console.log('PUT /api/products/:id - Authenticating user'); // Debug log
  // Validate request data
  const { error } = updateProductValidation(req.body);
  if (error) {
    console.error('Validation error:', error.details[0].message);
    return res.status(400).send({ error: error.details[0].message });
  }

  const { name, description, price, category, image, stock, reviews } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ error: 'Product not found' });
    }

    // Update the product fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (image) product.image = image;
    if (stock) product.stock = stock;
    if (reviews) product.reviews = reviews;

    const updatedProduct = await product.save();
    res.status(200).send(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send({ error: 'Server error' });
  }
});

/**
 * Delete a product => http://localhost:3000/api/products/:id
 * Authentication required
 */
router.delete('/:id', authenticateUser, async (req, res) => {
  console.log('DELETE /api/products/:id - Authenticating user'); // Debug log
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
 * Update product stock => http://localhost:3000/api/products/:id/stock
 * Authentication required
 */
router.patch('/:id/stock', authenticateUser, async (req, res) => {
  console.log('PATCH /api/products/:id/stock - Authenticating user'); // Debug log
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

export default router;
