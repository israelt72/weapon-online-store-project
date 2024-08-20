// helpers.js
import jwt from 'jsonwebtoken';

/**
 * Function to calculate the total price of an order
 * @param {Array} products - Array of product objects with `price` and `quantity`
 * @returns {number} Total order amount
 */
export const calculateTotalPrice = (products) => {
  if (!Array.isArray(products)) {
    throw new Error('Products should be an array');
  }
  return products.reduce((total, product) => {
    if (typeof product.price !== 'number' || typeof product.quantity !== 'number') {
      throw new Error('Product price and quantity should be numbers');
    }
    return total + (product.price * product.quantity);
  }, 0);
};

/**
 * Function to check if an email is valid
 * @param {string} email - Email to be checked
 * @returns {boolean} Whether the email is valid or not
 */
export const isValidEmail = (email) => {
  if (typeof email !== 'string') {
    throw new Error('Email should be a string');
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Function to generate a random string of a given length
 * @param {number} length - Desired length of the string
 * @returns {string} Random string
 */
export const generateRandomString = (length) => {
  if (typeof length !== 'number' || length <= 0) {
    throw new Error('Length should be a positive number');
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Function to create a JWT token with a payload and expiry time
 * @param {Object} payload - Data to be included in the token
 * @param {string} [expiresIn='1h'] - Token expiry time (e.g., '5h')
 * @returns {string} Created JWT token
 */
export const createToken = (payload, expiresIn = '1h') => {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) {
    throw new Error('TOKEN_SECRET is not defined in the environment variables.');
  }
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Function to extract a token from the 'Authorization' header
 * @param {Object} req - Request object
 * @returns {string|null} Token from the 'Authorization' header, or null if not present
 */
export const getTokenFromRequest = (req) => {
  if (!req || typeof req !== 'object') {
    throw new Error('Request object is required');
  }
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
};

/**
 * Function to read the environment variable for the app mode
 * @returns {string} App mode: 'production' or 'development'
 */
export const getEnv = () => {
  return process.env.NODE_ENV || 'development';
};

/**
 * Function to calculate price including tax
 * @param {number} price - Price before tax
 * @param {number} taxRate - Tax rate (as a number between 0 and 1)
 * @returns {number} Price including tax
 */
export const calculatePriceWithTax = (price, taxRate) => {
  if (typeof price !== 'number' || typeof taxRate !== 'number') {
    throw new Error('Price and tax rate should be numbers');
  }
  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate should be between 0 and 1');
  }
  return price + (price * taxRate);
};

/**
 * Function to convert a date to 'YYYY-MM-DD' format
 * @param {Date} date - Date to be formatted
 * @returns {string} Formatted date as 'YYYY-MM-DD'
 */
export const formatDate = (date) => {
  if (!(date instanceof Date)) {
    throw new Error('Date should be a Date object');
  }
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};
