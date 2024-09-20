// reviewRoutes.js
import { Router } from 'express';
import Review from '../schemas/reviewSchema.js';
import Product from '../schemas/productSchema.js';
import Order from '../schemas/orderSchema.js'; // Ensure you import the Order schema
import { authenticateUser } from '../middleware/auth.js';
import { createReviewValidation, updateReviewValidation } from '../validations/review.js';

const router = Router();

/**
 * Get all reviews for a product => http://localhost:3000/api/products/:productId/reviews
 */
router.get('/:productId/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId });
        if (!reviews.length) {
            return res.status(404).send({ error: 'No reviews found for this product' });
        }
        res.status(200).send(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).send({ error: 'Server error' });
    }
});

/**
 * Create a new review => http://localhost:3000/api/products/:productId/reviews
 */
router.post('/:productId/reviews', authenticateUser, async (req, res) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    // Validate request data
    const { error } = createReviewValidation(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).send({ error: error.details[0].message });
    }

    try {
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).send({ error: 'Product not found' });
        }

        const review = new Review({
            user: req.user.id,
            product: productId,
            rating,
            comment,
        });

        await review.save();
        res.status(201).send(review);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).send({ error: 'Server error' });
    }
});

/**
 * Get a specific review by ID => http://localhost:3000/api/reviews/review/:id
 */
router.get('/review/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).send({ error: 'Review not found' });
        }
        res.status(200).send(review);
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).send({ error: 'Server error' });
    }
});

/**
 * Update a specific review by ID => http://localhost:3000/api/reviews/review/:id
 */
router.put('/review/:id', authenticateUser, async (req, res) => {
    const { rating, comment } = req.body;

    // Validate request data
    const { error } = updateReviewValidation(req.body);
    if (error) {
        console.error('Validation error:', error.details[0].message);
        return res.status(400).send({ error: error.details[0].message });
    }

    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).send({ error: 'Review not found' });
        }

        // Check if the review belongs to the user
        if (review.user.toString() !== req.user.id) {
            return res.status(403).send({ error: 'Unauthorized' });
        }

        // Ensure the review belongs to an order of the user
        const order = await Order.findOne({ 'products.product': review.product, user: req.user.id });
        if (!order) {
            return res.status(403).send({ error: 'Unauthorized' });
        }

        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;

        await review.save();
        res.status(200).send(review);
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).send({ error: 'Server error' });
    }
});

/**
 * Delete a specific review by ID => http://localhost:3000/api/reviews/review/:id
 */
router.delete('/review/:id', authenticateUser, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).send({ error: 'Review not found' });
        }

        // Check if the review belongs to the user
        if (review.user.toString() !== req.user.id) {
            return res.status(403).send({ error: 'Unauthorized' });
        }

        // Ensure the review belongs to an order of the user
        const order = await Order.findOne({ 'products.product': review.product, user: req.user.id });
        if (!order) {
            return res.status(403).send({ error: 'Unauthorized' });
        }

        await Review.findByIdAndDelete(req.params.id);
        res.status(204).send({ message: 'Review removed successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).send({ error: 'Server error' });
    }
});

export default router;
