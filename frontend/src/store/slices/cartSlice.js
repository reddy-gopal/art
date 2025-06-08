import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://127.0.0.1:8000/ecommerce';

const getAxiosConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  };
};

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/cart/add/`,
        { 
          post: postId,
          quantity: 1
        },
        getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to add to cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/cart/remove/`,
        { post_id: postId },
        getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to remove from cart');
    }
  }
);

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/cart/`, getAxiosConfig());
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart || [];
        state.total = action.payload.total || 0;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove from cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart || [];
        state.total = action.payload.total || 0;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cartSlice.reducer; 