// src/components/ProductCard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../redux/cartSlice';
import RatingStars from './RatingStars'; // Ensure this path is correct
import './styles.css';

// Define the Review interface to include _id
interface Review {
  _id: string;
  user: string;
  rating: number;
  comment?: string;
}

// Define the Product interface to include updated reviews type
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  reviews: Review[]; 
}

//  props for the ProductCard component
interface ProductCardProps {
  product: Product;
}


const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();

  // calculate average rating
  const calculateAverageRating = (reviews: Review[]): number => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return totalRating / reviews.length;
  };

  // Calculate average rating for the product
  const averageRating = calculateAverageRating(product.reviews);

  
  const handleAddToCart = () => {
    const cartItem = {
      product: product,
      quantity: 1,
    };

    dispatch(addItem(cartItem));
  };

  return (
    
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />
      </Link>
      <div className="product-details">
     
        <h3 className="product-name">{product.name}</h3>
        <RatingStars averageRating={averageRating} /> {/* Add RatingStars component */}
        <p className="product-description">{product.description}</p>
        
        <p className={`product-stock ${product.stock === 0 ? 'out-of-stock' : ''}`}>
          {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of stock'}
        </p>
      
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button
            className="add-to-cart-button"
            onClick={handleAddToCart}
            disabled={product.stock === 0} // Disable button if out of stock
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
