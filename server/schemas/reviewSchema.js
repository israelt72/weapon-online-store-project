//reviewSchema.js
import mongoose, { Schema, model } from 'mongoose';

// Define the structure of the review data
const reviewSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String
  }
}, {
  timestamps: true  // Automatically add createdAt and updatedAt fields
});

export default model('Review', reviewSchema);
