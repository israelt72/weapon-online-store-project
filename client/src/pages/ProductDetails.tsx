// src/pages/ProductDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/appStore';
import { fetchProduct, updateProduct, Product as ProductType } from '../redux/productSlice';
import { addItem } from '../redux/cartSlice';
import RatingStars from '../components/RatingStars';
import { addReview } from '../redux/reviewSlice';
import '../components/styles.css';

interface Review {
  _id: string;
  user: string;
  rating: number;
  comment?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  reviews: Review[];
  isFeatured?: boolean;
}

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [quantity, setQuantity] = useState<number>(1);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [showReviews, setShowReviews] = useState<boolean>(false); // Start with reviews hidden
  const product = useSelector((state: RootState) => state.products.product);
  const status = useSelector((state: RootState) => state.products.status);
  const error = useSelector((state: RootState) => state.products.error);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (id) {
          const resultAction = await dispatch(fetchProduct(id) as any);
          if (fetchProduct.rejected.match(resultAction)) {
            console.error('Failed to load product:', resultAction.payload);
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      }
    };
    loadProduct();
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (product) {
      const cartItem = {
        product,
        quantity,
      };
      dispatch(addItem(cartItem));
      navigate('/cart');
    }
  };

  const handleBackToProducts = () => {
    navigate('/products');
  };

  const handleUpdateSubmit = () => {
    if (product) {
      const updatedData: Partial<Omit<ProductType, "_id">> = {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image,
        stock: product.stock,
      };

      const cleanedProduct = {
        id: product._id,
        data: updatedData,
      };

      dispatch(updateProduct(cleanedProduct) as any);
    }
  };

  const handleReviewSubmit = () => {
    // We assume user is logged in, so no need to check login status here.
    if (!id) {
      console.error('Product ID is missing');
      return;
    }

    if (reviewRating <= 0) {
      console.error('Invalid review rating');
      return;
    }

    const newReview: Review = {
      _id: '', // ID to be generated automatically by the server
      user: 'placeholderUserId', // Replace with actual user ID if available
      rating: reviewRating,
      comment: reviewComment,
    };

    dispatch(addReview({ productId: id, review: newReview }))
      .unwrap()
      .then(() => {
        setReviewRating(0);
        setReviewComment('');
      })
      .catch((error) => {
        console.error('Failed to submit review:', error);
      });
  };

  const toggleReviews = () => setShowReviews(!showReviews);

  const ratings = product?.reviews.map(review => review.rating) || [];
  const averageRating = ratings.length > 0 
    ? ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length
    : 0;

  const roundedAverageRating = Math.round(averageRating * 10) / 10;

  if (status === 'loading') return <p className="loading-message">Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!product) return <p className="not-found-message">Product not found</p>;

  return (
    <div className="product-details-container">
      <h2 className="product-details-title">Product Details</h2>
      <img className="product-image" src={product.image} alt={product.name} />
      <h1 className="product-name">{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price.toFixed(2)}</p>
      <p>Category: {product.category}</p>
      <p>Stock: {product.stock}</p>
      
      <RatingStars averageRating={roundedAverageRating} />
      
      <div className="quantity-selector">
        <button 
          className="quantity-button" 
          onClick={() => setQuantity(quantity - 1)} 
          disabled={quantity <= 1}
        >
          -
        </button>
        <span className="quantity-display">{quantity}</span>
        <button 
          className="quantity-button" 
          onClick={() => setQuantity(quantity + 1)} 
          disabled={quantity >= product.stock}
        >
          +
        </button>
      </div>
      <button 
        className="add-to-cart-button" 
        onClick={handleAddToCart} 
        disabled={quantity > product.stock}
      >
        Add to Cart
      </button>
      <button 
        className="back-to-products-button" 
        onClick={handleBackToProducts}
      >
        Back to Products
      </button>
      {product.isFeatured && (
        <button 
          className="update-product-button" 
          onClick={handleUpdateSubmit}
        >
          Update Product
        </button>
      )}
      
      <div className="reviews-section">
        <h3>Reviews</h3>
        <button onClick={toggleReviews}>
          {showReviews ? 'Hide Reviews' : 'Show Reviews'}
        </button>
        {showReviews && (
          <div>
            {product.reviews.length > 0 ? (
              <ul className="reviews-list">
                {product.reviews.map(review => (
                  <li key={review._id} className="review-item">
                    <RatingStars averageRating={review.rating} />
                    <p>{review.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reviews yet</p>
            )}
          </div>
        )}
        
        {/* Review submission form is always visible */}
        
          <button 
            onClick={() => navigate(-1)} 
            className="back-button"
          >
            Back
          </button>
        </div>
      </div>
   
  );
};

export default ProductDetails;
