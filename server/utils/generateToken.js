//generateToken.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel'; // עדכן בהתאם למיקום המודל שלך

/**
 * Generate a JWT token for a given user ID
 * @param {string} userId - The user's ID
 * @param {string} [expiresIn='10h'] - Token expiry time
 * @returns {Promise<string>} JWT token
 */
export const generateToken = async (userId, expiresIn = '10h') => {
    // Retrieve the TOKEN_SECRET from environment variables
    const TOKEN_SECRET = process.env.TOKEN_SECRET || 'your_secret_key';

    if (!TOKEN_SECRET) {
        throw new Error('TOKEN_SECRET is not defined in the environment variables.');
    }

    // Retrieve user from the database to get their role
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Create and return JWT token
    return jwt.sign({ id: user._id.toString(), role: user.role || 'user' }, TOKEN_SECRET, { expiresIn });
};

