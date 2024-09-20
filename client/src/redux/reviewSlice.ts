// src/redux/reviewSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../utils/api';

// Define Review type
export interface Review {
  _id: string;
  user: string;
  rating: number;
  comment?: string;
}

// Define initial state for reviews
interface ReviewsState {
  reviews: Review[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReviewsState = {
  reviews: [],
  status: 'idle',
  error: null,
};

// Fetch reviews
export const fetchReviews = createAsyncThunk(
  'reviews/fetchReviews',
  async (productId: string) => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  }
);

// Add review
export const addReview = createAsyncThunk(
  'reviews/addReview',
  async ({ productId, review }: { productId: string; review: Review }) => {
    const response = await api.post(`/products/${productId}/reviews`, review);
    return response.data;
  }
);

// Update review
export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ productId, reviewId, review }: { productId: string; reviewId: string; review: Partial<Review> }) => {
    const response = await api.patch(`/products/${productId}/reviews/${reviewId}`, review);
    return response.data;
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchReviews.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.status = 'succeeded';
        state.reviews = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch reviews';
      })
      .addCase(addReview.fulfilled, (state, action: PayloadAction<Review>) => {
        state.reviews.push(action.payload);
      })
      .addCase(updateReview.fulfilled, (state, action: PayloadAction<Review>) => {
        const index = state.reviews.findIndex(review => review._id === action.payload._id);
        if (index !== -1) {
          state.reviews[index] = action.payload;
        }
      });
  },
});

export default reviewSlice.reducer;
