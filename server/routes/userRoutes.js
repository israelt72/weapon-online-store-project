// routes/userRoutes.js
import { Router } from 'express';
import User from '../schemas/userSchema.js';
import { authenticateUser, comparePasswords, generateToken, hashPassword } from '../middleware/auth.js';
import { registerValidation, loginValidation } from '../validations/auth.js';
import { updateUserValidation } from '../validations/user.js';

const router = Router();

// Helper function to handle errors
const handleError = (res, error, message = 'Server error') => {
  console.error(message, error.message);
  res.status(500).send({ error: message });
};

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

    // Generate JWT token including the role
    const token = generateToken(user._id.toString(), user.role);

    // Send token in the response body
    return res.status(201).send({
      msg: 'User registered',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role // Include the role in the response
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
    const token = generateToken(user._id.toString(), user.role);

    // Send token in the response body
    return res.status(200).send({
      msg: 'User logged in',
      token,
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

// Get Profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const foundUser = await User.findById(req.user.id).select('-password');
    if (!foundUser) return res.status(404).send({ error: 'User not found' });

    res.status(200).send(foundUser);
  } catch (error) {
    handleError(res, error, 'Get Profile error');
  }
});

// Update Profile
router.put('/profile', authenticateUser, async (req, res) => {
  // Validate request data
  const { error } = updateUserValidation(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  const { firstName, lastName, email, password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send({ error: 'User not found' });

    // Update user details
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    // Hash password if provided
    if (password) user.password = await hashPassword(password);

    await user.save();

    res.status(200).send({ msg: 'Profile updated', user });
  } catch (error) {
    handleError(res, error, 'Update Profile error');
  }
});

export default router;
