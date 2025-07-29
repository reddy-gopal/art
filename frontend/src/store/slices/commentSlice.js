import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL ='http://127.0.0.1:8000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

// Async thunks
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (postId) => {
    const response = await axios.get(`${API_URL}/comments/?post_id=${postId}`, {
      headers: {
        Authorization: getAuthToken(),
      },
    });
    return response.data;
  }
);

export const addComment = createAsyncThunk(
  'comments/addComment',
  async ({ postId, content }) => {
    const response = await axios.post(
      `${API_URL}/comments/`,
      {
        post_id: postId,
        content,
      },
      {
        headers: {
          Authorization: getAuthToken(),
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }
);

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async (commentId) => {
    await axios.delete(`${API_URL}/comments/${commentId}/`, {
      headers: {
        Authorization: getAuthToken(),
      },
    });
    return commentId;
  }
);

const commentSlice = createSlice({
  name: 'comments',
  initialState: {
    items: {},
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.loading = false;
        // Group comments by post ID
        const comments = action.payload;
        comments.forEach((comment) => {
          if (!state.items[comment.post.id]) {
            state.items[comment.post.id] = [];
          }
          if (!state.items[comment.post.id].find(c => c.id === comment.id)) {
            state.items[comment.post.id].push(comment);
          }
        });
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const comment = action.payload;
        const postId = comment.post.id;
        if (!state.items[postId]) {
          state.items[postId] = [];
        }
        state.items[postId].push(comment);
      })
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const commentId = action.payload;
        // Remove comment from all posts (we'll find it wherever it is)
        Object.keys(state.items).forEach((postId) => {
          state.items[postId] = state.items[postId].filter(
            (comment) => comment.id !== commentId
          );
        });
      });
  },
});

export default commentSlice.reducer; 