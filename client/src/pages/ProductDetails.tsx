// src/pages/ProductDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../app/appStore';
import { fetchProduct } from '../redux/productSlice';
import { addItem } from '../redux/cartSlice';
import { Product } from '../redux/productSlice';
import '../components/styles.css'; // Ensure to include the CSS file

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState<number>(1);
  const product = useSelector((state: RootState) => state.products.product);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        if (id) {
          await dispatch(fetchProduct(id) as any); // Type assertion to address dispatch issue
        }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (product) {
      const cartItem = {
        product: product,
        quantity: quantity,
      };
      dispatch(addItem(cartItem));
      navigate('/cart');
    }
  };

  const handleBackToProducts = () => {
    navigate('/products');
  };

  if (loading) return <p className="loading-message">Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!product) return <p className="not-found-message">Product not found</p>;

  return (
    <div className="product-details-container">
      <h2 className="product-details-title">Product Details</h2>
      <img className="product-image" src={product.image} alt={product.name} />
      <h1 className="product-name">{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Category: {product.category}</p>
      <p>Stock: {product.stock}</p>
      
      <div className="quantity-selector-Detail">
        <button className="quantity-button-Details" onClick={() => setQuantity(quantity - 1)} disabled={quantity <= 1}>
          -
        </button>
        <span className="quantity-display-Details">{quantity}</span>
        <button className="quantity-button-Details" onClick={() => setQuantity(quantity + 1)} disabled={quantity >= product.stock}>
          +
        </button>
      </div>
      <button className="add-to-cart-button" onClick={handleAddToCart} disabled={quantity > product.stock}>Add to Cart</button>
      <button className="back-to-products-button" onClick={handleBackToProducts}>Back to Products</button>
    </div>
  );
};

export default ProductDetails;
