// middleware/auth.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';

// Extract TOKEN_SECRET from config or environment variables
const TOKEN_SECRET = config.TOKEN_SECRET;

if (!TOKEN_SECRET) {
  throw new Error('TOKEN_SECRET is not defined in the environment variables.');
}

/**
 * Function to generate a JWT token for a given user ID and role
 * @param {String} userId - User ID for the token payload
 * @param {String} [role='user'] - Role of the user (e.g., 'admin' or 'user')
 * @returns {String} JWT token
 */
const generateToken = (userId, role = 'user') => {
  console.log('Generating token for userId:', userId, 'with role:', role); // Debug log
  return jwt.sign({ id: userId, role: role }, TOKEN_SECRET, { expiresIn: '6h' });
};

/**
 * Function to verify a JWT token
 * @param {String} token - JWT token to be verified
 * @returns {Object} Decoded token payload
 * @throws {Error} if the token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, TOKEN_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error); // Debug log
    if (error.name === 'TokenExpiredError') {
      throw new Error('TokenExpired');
    } else {
      throw new Error('InvalidToken');
    }
  }
};

/**
 * Hash a password with bcrypt
 * @param {String} password - Plaintext password
 * @returns {String} Hashed password
 * @throws {Error} if hashing fails
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Failed to hash password:', error); // Debug log
    throw new Error('Failed to hash password');
  }
};

/**
 * Compare a plaintext password with a hashed password
 * @param {String} password - Plaintext password
 * @param {String} hashedPassword - Hashed password
 * @returns {Boolean} Whether the passwords match
 * @throws {Error} if comparison fails
 */
const comparePasswords = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Failed to compare passwords:', error); // Debug log
    throw new Error('Failed to compare passwords');
  }
};

/**
 * Middleware to authenticate a user by verifying the JWT token from the Authorization header
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const authenticateUser = (req, res, next) => {
  // Only apply authentication to POST, PUT, DELETE, PATCH requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && !req.path.startsWith('/api/users/login')) {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({ message: 'Access Denied: No Token Provided!' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyToken(token);
      req.user = decoded; // Decoded token payload, which includes user ID and role
      next();
    } catch (error) {
      if (error.message === 'TokenExpired') {
        return res.status(401).send({ message: 'Token expired' });
      } else {
        return res.status(401).send({ message: 'Access Denied: Invalid Token' });
      }
    }
  } else {
    next(); // For GET requests and login route, allow access without authentication
  }
};

/**
 * Middleware to check if the user is an admin
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send({ message: 'Access Denied: Admins Only' });
  }
  next();
};

export { generateToken, verifyToken, hashPassword, comparePasswords, authenticateUser, isAdmin };
