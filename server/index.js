//index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { authenticateUser, isAdmin } from './middleware/auth.js'; 
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();

app.use(express.json());

// Set up CORS to allow requests from your frontend origin
app.use(cors({
    origin: 'http://localhost:3001',
}));

const mongoDbUrl = process.env.DB_CONNECTION_STRING || 'mongodb://localhost:27017/mydatabase';

mongoose.connect(mongoDbUrl)
    .then(() => {
        console.log('Connected to the MongoDB database!');
    })
    .catch((error) => {
        console.error('MongoDB connection failed!', error);
    });

    app.use('/api/products', productRoutes);
    app.use('/api/users', userRoutes);
// Apply authentication middleware before defining routes that require authentication
app.use(authenticateUser);

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Apply admin middleware for specific routes if needed
app.use('/api/admin', isAdmin); // Apply admin check to /api/admin routes

// Define a catch-all route for non-existing endpoints
app.get('/', (req, res) => {
    res.send('API is running...');
});


app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
