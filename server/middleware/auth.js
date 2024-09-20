// middleware/auth.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/config.js';

const TOKEN_SECRET = config.TOKEN_SECRET;

if (!TOKEN_SECRET) {
  throw new Error('TOKEN_SECRET is not defined in the environment variables.');
}

const generateToken = (userId, role = 'user') => {
  console.log('Generating token for userId:', userId, 'with role:', role);
  return jwt.sign({ id: userId, role: role }, TOKEN_SECRET, { expiresIn: '10h' });
};

const generateRefreshToken = (userId, role = 'user') => {
  console.log('Generating refresh token for userId:', userId, 'with role:', role);
  return jwt.sign({ id: userId, role: role }, TOKEN_SECRET, { expiresIn: '30d' });
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    console.log('Decoded token:', decoded);
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    if (error.name === 'TokenExpiredError') {
      throw new Error('TokenExpired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('InvalidToken');
    } else {
      throw new Error('TokenVerificationError');
    }
  }
};

const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    console.log('Decoded refresh token:', decoded);
    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    if (error.name === 'TokenExpiredError') {
      throw new Error('RefreshTokenExpired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('InvalidRefreshToken');
    } else {
      throw new Error('RefreshTokenVerificationError');
    }
  }
};

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    console.error('Failed to hash password:', error);
    throw new Error('Failed to hash password');
  }
};

const comparePasswords = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Failed to compare passwords:', error);
    throw new Error('Failed to compare passwords');
  }
};

const authenticateUser = async (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH','GET'].includes(req.method) &&
      !req.path.startsWith('/api/users/login')) 
      
      {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      console.log('No Authorization header found.');
      return res.status(401).send({ message: 'Access Denied: No Authorization Header' });
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.log('Authorization header does not start with Bearer.');
      return res.status(401).send({ message: 'Access Denied: Token format is incorrect. Use Bearer token.' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyToken(token);
      req.user = decoded; // Decoded token payload, which includes user ID and role
      console.log('Authenticated user:', req.user);
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      if (error.message === 'TokenExpired') {
        return res.status(401).send({ message: 'Token expired. Please log in again.' });
      } else if (error.message === 'InvalidToken') {
        return res.status(401).send({ message: 'Invalid token. Please provide a valid token.' });
      } else {
        return res.status(401).send({ message: 'Authentication failed. Please log in again.' });
      }
    }
  } else {
    next(); // For GET requests and login route, allow access without authentication
  }
};

const isAdmin = (req, res, next) => {
  console.log('req.user in isAdmin:', req.user);
  if (!req.user) {
    console.log('User object is not defined.');
    return res.status(403).send({ message: 'Access Denied: No user information available.' });
  }

  if (!req.user.role) {
    console.log('User role is not defined.');
    return res.status(403).send({ message: 'Access Denied: User role is not defined.' });
  }

  if (req.user.role !== 'admin') {
    console.log('User role is not admin. Current role:', req.user.role);
    return res.status(403).send({ message: 'Access Denied: Admins Only' });
  }

  next();
};

export { generateToken, verifyToken, hashPassword, comparePasswords, authenticateUser, isAdmin, generateRefreshToken, verifyRefreshToken };
