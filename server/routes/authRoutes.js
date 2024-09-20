//authRoutes.js
import { Router } from 'express';
import User from '../schemas/userSchema.js';
import { comparePasswords, generateToken, generateRefreshToken, hashPassword, verifyRefreshToken } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../validations/auth.js';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  // Validate request data
  const { error } = registerValidation({ firstName, lastName, email, password });
  if (error) return res.status(400).send({ error: error.details[0].message });

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).send({ error: 'User already exists' });

    // Create new user
    user = new User({ firstName, lastName, email, password, role });

    // Hash password
    user.password = await hashPassword(password);

    // Save user to the database
    await user.save();

    // Send response without token
    return res.status(201).send({
      msg: 'User registered successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role 
      }
    });
  } catch (err) {
    handleError(res, err, 'Register error');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate request data
  const { error } = loginValidation({ email, password });
  if (error) return res.status(400).send({ error: error.details[0].message });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ error: 'Invalid credentials' });

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) return res.status(400).send({ error: 'Invalid credentials' });

    // Generate JWT token including the role
    const accessToken = generateToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Send token in the response body
    return res.status(200).send({
      msg: 'User logged in',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role // Include the role in the response
      }
    });
  } catch (err) {
    handleError(res, err, 'Login error');
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the refresh token
    const { id, role } = verifyRefreshToken(token);

    // Generate new access and refresh tokens
    const accessToken = generateToken(id, role);
    const refreshToken = generateRefreshToken(id);

    // Send new tokens in the response
    return res.status(200).send({
      accessToken,
      refreshToken
    });
  } catch (err) {
    return res.status(401).send({ error: 'Invalid refresh token' });
  }
});

export default router;
