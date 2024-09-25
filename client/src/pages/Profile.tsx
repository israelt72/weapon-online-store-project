//Profile.tsx
// Profile.tsx
import React, { useEffect, useState } from 'react';
import { useForm, FieldError } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../app/appStore';
import { updateProfile, fetchOrders } from '../redux/userSlice';
import './Profile.css';

// Define types for form data and order
interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface Review {
  _id: string;
  comment: string;
  rating: number;
  user: string;
}

interface Product {
  category: string;
  createdAt: string;
  description: string;
  image: string;
  name: string;
  price: number;
  reviews: Review[];
  _id: string;
  stock: number;
  updatedAt: string;
}

interface Order {
  _id: string;
  createdAt: string;
  products: Array<{ product: Product; quantity: number }>;
  status: string;
  total: number;
  updatedAt: string;
  user: string;
}

const Profile: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showOrders, setShowOrders] = useState<boolean>(false);
  const [showProfileCard, setShowProfileCard] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState<{ productId: string; reviewId: string; comment: string; rating: number } | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>();
  const user = useSelector((state: RootState) => state.user.user);
  const orders = useSelector((state: RootState) => state.user.orders) as Order[];
  const isLoading = useSelector((state: RootState) => state.user.isLoading);
  const error = useSelector((state: RootState) => state.user.error);
  const token = useSelector((state: RootState) => state.user.token);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName);
      setValue('lastName', user.lastName);
      setValue('email', user.email);
      setIsAdmin(user.role === 'admin');
    }
  }, [user, setValue]);

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders());
    }
  }, [dispatch, user]);

  const onSubmit = (data: ProfileFormData) => {
    dispatch(updateProfile(data));
  };

  const toggleOrders = () => setShowOrders(prev => !prev);
  const toggleProfileCard = () => setShowProfileCard(prev => !prev);

  const handleAddReview = async (productId: string) => {
    if (!productId || newComment.trim() === '' || newRating < 1 || newRating > 5) {
      console.error('Product ID, comment, or rating is missing or invalid');
      return;
    }

    try {
      await fetch(`/api/products/${productId}/reviews`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment, rating: newRating }),
      });
      dispatch(fetchOrders());
      setNewComment('');
      setNewRating(1);
      setSelectedProductId(null);
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const handleEditReview = async () => {
    if (!editNote || !editNote.productId || !editNote.reviewId) {
      console.error('Edit note or product/review ID is missing');
      return;
    }

    try {
      await fetch(`/api/products/${editNote.productId}/reviews/${editNote.reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: editNote.comment, rating: editNote.rating }),
      });
      dispatch(fetchOrders());
      setEditNote(null);
    } catch (error) {
      console.error('Error editing review:', error);
    }
  };

  const handleDeleteReview = async (productId: string, reviewId: string) => {
    if (!productId || !reviewId) {
      console.error('Product ID or Review ID is missing');
      return;
    }

    try {
      await fetch(`/api/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      dispatch(fetchOrders());
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  return (
    <div className="profile-container">
      <button onClick={toggleProfileCard} className="profile-toggle-card-button">
        {showProfileCard ? 'Hide Profile Card' : 'Show Profile Card'}
      </button>

      {showProfileCard && (
        <div className='card-profile'>
          {isLoading && <p className="profile-loading">Loading...</p>}
          {error && <p className="profile-error">{error}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
            <div className="profile-form-group">
              <label htmlFor="firstName" className="profile-label">First Name</label>
              <input
                id="firstName"
                className="profile-input"
                {...register('firstName', { required: 'First Name is required' })}
              />
              {errors.firstName && <p className="profile-error-message">{(errors.firstName as FieldError).message}</p>}
            </div>

            <div className="profile-form-group">
              <label htmlFor="lastName" className="profile-label">Last Name</label>
              <input
                id="lastName"
                className="profile-input"
                {...register('lastName', { required: 'Last Name is required' })}
              />
              {errors.lastName && <p className="profile-error-message">{(errors.lastName as FieldError).message}</p>}
            </div>

            <div className="profile-form-group">
              <label htmlFor="email" className="profile-label">Email</label>
              <input
                id="email"
                className="profile-input"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/, message: 'Email is not valid' }
                })}
              />
              {errors.email && <p className="profile-error-message">{(errors.email as FieldError).message}</p>}
            </div>

            <div className="profile-form-group">
              <label htmlFor="password" className="profile-label">Password</label>
              <input
                id="password"
                type="password"
                className="profile-input"
                {...register('password', {
                  minLength: { value: 6, message: 'Password must be at least 6 characters long' }
                })}
              />
              {errors.password && <p className="profile-error-message">{(errors.password as FieldError).message}</p>}
            </div>

            <button type="submit" className="profile-submit-button">Update</button>
          </form>
        </div>
      )}

      <button onClick={toggleOrders} className="profile-toggle-orders-button">
        {showOrders ? 'Hide My Orders History' : 'Show My Orders History'}
      </button>

      {showOrders && (
        <div className="orders-container">
          {isLoading && <p className="profile-loading">Loading orders...</p>}
          {error && <p className="profile-error">{error}</p>}
          {orders.length > 0 ? (
            orders.map(order => (
              <div key={order._id} className="order-item-profile">
                <p>Order ID: {order._id}</p>
                {user ? (
                  <p>User ID: {order.user}</p>
                ) : (
                  <p>User ID: Unknown</p>
                )}
                {user ? (
                  <p>User: {user.firstName} {user.lastName}</p>
                ) : (
                  <p>User: Unknown</p>
                )}
                <p>Status: {order.status}</p>
                <p>Total: ${order.total}</p>
                <p>Created At: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Updated At: {new Date(order.updatedAt).toLocaleDateString()}</p>
                <p>Products:</p>
                <ul>
                  {order.products.map(productEntry => (
                    <li key={productEntry.product._id} className="order-product-item">
                      <p className='Product-Name-profile'>Product Name: {productEntry.product.name}</p>
                      <p>Quantity: {productEntry.quantity}</p>
                      <p>Price: ${productEntry.product.price}</p>

                      {/* Add Review */}
                      {selectedProductId === productEntry.product._id && (
                        <div className="review-form">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment"
                          />
                          <input
                            type="number"
                            value={newRating}
                            min="1"
                            max="5"
                            onChange={(e) => setNewRating(parseInt(e.target.value))}
                            placeholder="Rating (1-5)"
                          />
                          <button onClick={() => handleAddReview(productEntry.product._id)}>Add Review</button>
                        </div>
                      )}

                      {/* Edit Review */}
                      {editNote && editNote.productId === productEntry.product._id && (
                        <div className="review-form">
                          <input
                            type="text"
                            value={editNote.comment}
                            onChange={(e) => setEditNote({ ...editNote, comment: e.target.value })}
                            placeholder="Edit comment"
                          />
                          <input
                            type="number"
                            value={editNote.rating}
                            min="1"
                            max="5"
                            onChange={(e) => setEditNote({ ...editNote, rating: parseInt(e.target.value) })}
                            placeholder="Rating (1-5)"
                          />
                          <button onClick={handleEditReview}>Update Review</button>
                          <button onClick={() => setEditNote(null)} className="back-button">Back</button>
                        </div>
                      )}

                      {/* Display Reviews and Delete Option */}
                      {productEntry.product.reviews.map(review => (
                        <div key={review._id} className="review-item">
                          <p>{review.comment} (Rating: {review.rating})</p>
                          <button className="delete-button-review" onClick={() => handleDeleteReview(productEntry.product._id, review._id)}>Delete</button>
                          <button onClick={() => setEditNote({
                            productId: productEntry.product._id,
                            reviewId: review._id,
                            comment: review.comment,
                            rating: review.rating
                          })}>Edit</button>
                        </div>
                      ))}

                      {/* Add Note */}
                      <button onClick={() => setSelectedProductId(productEntry.product._id)}>Add Review</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
