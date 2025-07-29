import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';
import { updateCurrentUser } from './authSlice';

const API_URL = 'https://artbackend.pythonanywhere.com/api';

// Helper function to get axios config with token
const getAxiosConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    }
  };
};

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/me/`, getAxiosConfig());
      // Update the currentUser in auth slice
      dispatch(updateCurrentUser(response.data));
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        // Clear local storage and reload page
        localStorage.clear();
        window.location.href = '/login';
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Append text fields
      Object.keys(userData).forEach(key => {
        if (key !== 'profile_picture' && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });
      
      // Append file if exists
      if (userData.profile_picture instanceof File) {
        formData.append('profile_picture', userData.profile_picture);
      }

      const response = await axios.patch(
        `${API_URL}/me/`,
        formData,
        {
          ...getAxiosConfig(),
          headers: {
            ...getAxiosConfig().headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Update the currentUser in auth slice
      dispatch(updateCurrentUser(response.data));
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to update profile');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'user/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/posts/`, getAxiosConfig());
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch posts');
    }
  }
);

export const fetchUserActivities = createAsyncThunk(
  'user/fetchActivities',
  async (_, { rejectWithValue }) => {
    try {
      const [likes, saves, comments] = await Promise.all([
        axios.get(`${API_URL}/like-posts/`, getAxiosConfig()),
        axios.get(`${API_URL}/save-posts/`, getAxiosConfig()),
        axios.get(`${API_URL}/comments/`, getAxiosConfig())
      ]);
      
      return {
        likes: likes.data,
        saves: saves.data,
        comments: comments.data
      };
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      }
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch activities');
    }
  }
);

const initialState = {
  profile: null,
  posts: [],
  activities: {
    likes: [],
    saves: [],
    comments: []
  },
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData: (state) => {
      state.profile = null;
      state.posts = [];
      state.activities = {
        likes: [],
        saves: [],
        comments: []
      };
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Profile fetching
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Profile updating
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        toast.success('Profile updated successfully');
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Posts fetching
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Activities fetching
      .addCase(fetchUserActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchUserActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearUserData } = userSlice.actions;
export default userSlice.reducer; 