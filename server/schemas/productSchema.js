// productSchema.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Define the schema for reviews without an _id field
const reviewSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  }
}, { _id: false }); // Disable _id field for review subdocuments

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
    unique: true
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  reviews: [reviewSchema] // Use the review schema without _id
});

const Product = model('Product', productSchema);

export default Product;
