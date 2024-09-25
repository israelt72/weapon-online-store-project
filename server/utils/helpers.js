// helpers.js
import jwt from 'jsonwebtoken';

/**
 * Function to calculate the total price of an order
 * @param {Array} products - Array of product objects with `price` and `quantity`
 * @returns {number} Total order amount
 * @throws {Error} If products is not an array or any product price or quantity is not a number
 */
export const calculateTotalPrice = (products) => {
  if (!Array.isArray(products)) {
    throw new Error('Products should be an array');
  }

  return products.reduce((total, product) => {
    // Ensure price and quantity are valid numbers
    const price = Number(product.price);
    const quantity = Number(product.quantity);

    if (isNaN(price) || isNaN(quantity)) {
      throw new Error('Product price and quantity should be valid numbers');
    }

    return total + (price * quantity);
  }, 0);
};


export const isValidEmail = (email) => {
  if (typeof email !== 'string') {
    throw new Error('Email should be a string');
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};


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


export const createToken = (payload, expiresIn = '1h') => {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) {
    throw new Error('TOKEN_SECRET is not defined in the environment variables.');
  }
  return jwt.sign(payload, secret, { expiresIn });
};


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


export const getEnv = () => {
  return process.env.NODE_ENV || 'development';
};


export const calculatePriceWithTax = (price, taxRate) => {
  if (typeof price !== 'number' || typeof taxRate !== 'number') {
    throw new Error('Price and tax rate should be numbers');
  }
  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Tax rate should be between 0 and 1');
  }
  return price + (price * taxRate);
};


export const formatDate = (date) => {
  if (!(date instanceof Date)) {
    throw new Error('Date should be a Date object');
  }
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};
