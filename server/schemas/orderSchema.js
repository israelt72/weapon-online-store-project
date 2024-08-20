// orderSchema.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the structure of the order data
const orderSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  total: {  // Ensure this field matches the implementation
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'shipped', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true  // Automatically add createdAt and updatedAt fields
});

export default model('Order', orderSchema);
