// routes/userRoutes.js
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

  console.log('Register request body:', req.body);

  const { error } = registerValidation({ firstName, lastName, email, password });
  if (error) {
    console.log('Register validation error:', error.details[0].message);
    return res.status(400).send({ error: error.details[0].message });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists:', email);
      return res.status(400).send({ error: 'User already exists' });
    }

    user = new User({ firstName, lastName, email, password, role });
    user.password = await hashPassword(password);
    await user.save();
    console.log('User registered successfully:', user);

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

  console.log('Login request body:', req.body);

  const { error } = loginValidation({ email, password });
  if (error) {
    console.log('Login validation error:', error.details[0].message);
    return res.status(400).send({ error: error.details[0].message });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).send({ error: 'Invalid credentials' });
    }

    const isMatch = await comparePasswords(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(400).send({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id.toString(), user.role);
    console.log('Generated token for user:', user.email);

    return res.status(200).send({
      msg: 'User logged in',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    handleError(res, err, 'Login error');
  }
});

// Get Profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    console.log('Get Profile request for user ID:', req.user.id);
    const foundUser = await User.findById(req.user.id).select('-password');
    if (!foundUser) {
      console.log('User not found:', req.user.id);
      return res.status(404).send({ error: 'User not found' });
    }

    res.status(200).send(foundUser);
  } catch (error) {
    handleError(res, error, 'Get Profile error');
  }
});

// Update Profile
router.put('/profile/:id', authenticateUser, async (req, res) => {
  const userIdToUpdate = req.params.id;

  const { error } = updateUserValidation(req.body);
  if (error) {
    console.log('Update Profile validation error:', error.details[0].message);
    return res.status(400).send({ error: error.details[0].message });
  }

  const { firstName, lastName, email, password } = req.body;

  try {
    console.log('Update Profile request for user ID:', userIdToUpdate);
    const user = await User.findById(userIdToUpdate);
    if (!user) {
      console.log('User not found for update:', userIdToUpdate);
      return res.status(404).send({ error: 'User not found' });
    }

    // Only check for existing email if it's different from the current one
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send({ error: 'Email already in use' });
      }
    }

    // Update user details
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    // Hash password if provided
    if (password) user.password = await hashPassword(password);

    await user.save();
    console.log('Profile updated for user ID:', userIdToUpdate);

    res.status(200).send({ msg: 'Profile updated', user });
  } catch (error) {
    handleError(res, error, 'Update Profile error');
  }
});

// Get all users
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log('Get all users request');
    const users = await User.find().select('-password');
    res.status(200).send(users);
  } catch (error) {
    handleError(res, error, 'Get Users error');
  }
});

// Get user by ID
router.get('/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    console.log('Get user by ID request:', id);
    const user = await User.findById(id).select('-password');
    if (!user) {
      console.log('User not found:', id);
      return res.status(404).send({ error: 'User not found' });
    }
    res.status(200).send(user);
  } catch (error) {
    handleError(res, error, 'Get User by ID error');
  }
});

// Delete user
router.delete('/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    console.log('Delete user request for ID:', id);
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      console.log('User not found:', id);
      return res.status(404).send({ error: 'User not found' });
    }
    res.status(200).send({ msg: 'User deleted successfully' });
  } catch (error) {
    handleError(res, error, 'Delete User error');
  }
});

export default router;
