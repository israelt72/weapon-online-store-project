//index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { authenticateUser } from './middleware/auth.js'; // ייבוא של ה-Middleware

dotenv.config();

const app = express();

app.use(express.json());

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

// Define routes
const userRouter = express.Router();
userRouter.post('/login', userRoutes); // Route for login without authentication
userRouter.use(authenticateUser); // Apply authentication middleware to other user routes
userRouter.use(userRoutes); // All other user routes that need authentication

app.use('/api/users', userRouter); // Apply the combined router for users

app.use('/api/products', authenticateUser, productRoutes);
app.use('/api/orders', authenticateUser, orderRoutes);
app.use('/api/reviews', authenticateUser, reviewRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
