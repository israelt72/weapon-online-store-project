// src/components/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addItem } from '../redux/cartSlice';
import './styles.css';

// Define the Product interface
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number; // Add the stock property
}

// Define the props for the ProductCard component
interface ProductCardProps {
  product: Product;
}

// The ProductCard functional component
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch();

  // Function to handle adding the product to the cart
  const handleAddToCart = () => {
    const cartItem = {
      product: product, // Updated to product
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
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button className="add-to-cart-button" onClick={handleAddToCart}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
