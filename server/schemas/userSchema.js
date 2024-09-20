//userSchema.js
import mongoose, { Schema, model } from 'mongoose';

// Define the structure of the user data
const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Convert email to lowercase
    trim: true, // Remove leading and trailing spaces
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'], // Email format validation
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
    // immutable: true, // Ensure the role cannot be changed after creation
  },
  
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  }],
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

export default model('User', userSchema);
