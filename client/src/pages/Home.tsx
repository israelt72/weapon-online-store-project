// Home.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, selectFeaturedProducts, selectProductStatus, selectProductError } from '../redux/productSlice';
import { Link } from 'react-router-dom';
import '../components/styles.css';
import { AppDispatch } from '../app/appStore'; // Import the AppDispatch type

// Define the Product type
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  reviews: {
    user: string;
    rating: number;
    comment?: string;
  }[];
  isFeatured?: boolean;
}

const Home: React.FC = () => {
  const dispatch: AppDispatch = useDispatch(); // Explicitly type dispatch
  const featuredProducts = useSelector(selectFeaturedProducts) as Product[];
  const status = useSelector(selectProductStatus);
  const error = useSelector(selectProductError);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts() as any); // Cast to `any` if necessary
    }
  }, [dispatch, status]);

  if (status === 'loading') return <p>Loading...</p>;
  if (status === 'failed') return <p>Error: {error}</p>;

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to the Ultimate Weapons Store</h1>
        <p>Discover our wide range of firearms, ammunition, and accessories.</p>
        <Link to="/products" className="shop-now-button">Shop Now</Link>
      </div>
      <div className="featured-products">
        <h2>Featured Products</h2>
        <div className="product-list">
          {featuredProducts.length === 0 ? (
            <p className="no-products">No featured products available at the moment.</p>
          ) : (
            featuredProducts.map(product => (
              <div key={product._id} className="product-card">
                <img 
                  src={product.image || 'default-image.png'} 
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-details">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <Link to={`/products/${product._id}`} className="view-details-button">View Details</Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
