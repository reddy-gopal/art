import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  useTheme,
  Card,
  CardMedia,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://127.0.0.1:8000/api';

const EditPost = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { postId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
  });
  const [newImage, setNewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/posts/${postId}/`, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      setPost(response.data);
      setPreviewImage(response.data.image);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('Post not found.');
        navigate('/profile');
      } else {
        toast.error('Failed to fetch post. Please try again.');
        navigate('/profile');
      }
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('title', post.title);
      formData.append('description', post.description);
      if (post.price) {
        formData.append('price', post.price);
      }
      if (newImage) {
        formData.append('image', newImage);
      }

      await axios.put(`${API_URL}/posts/${postId}/`, formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Post updated successfully');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating post:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to update post. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <IconButton
            onClick={() => navigate('/profile')}
            sx={{
              '&:hover': { transform: 'scale(1.1)' },
              transition: 'transform 0.2s',
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            Edit Post
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Card
              sx={{
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <CardMedia
                component="img"
                image={previewImage}
                alt="Post preview"
                sx={{
                  height: 400,
                  objectFit: 'contain',
                  bgcolor: 'black',
                }}
              />
              <Button
                component="label"
                variant="contained"
                startIcon={<UploadIcon />}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  borderRadius: 2,
                  textTransform: 'none',
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(4px)',
                  '&:hover': {
                    background: 'rgba(0, 0, 0, 0.8)',
                  },
                }}
              >
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
            </Card>
          </Box>

          <TextField
            fullWidth
            label="Title"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Description"
            value={post.description}
            onChange={(e) => setPost({ ...post, description: e.target.value })}
            multiline
            rows={4}
            required
            sx={{ mb: 3 }}
          />

          <TextField
            label="Price"
            type="number"
            value={post.price}
            onChange={(e) => setPost({ ...post, price: e.target.value })}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={{ mb: 4 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/profile')}
              startIcon={<CloseIcon />}
              sx={{
                borderRadius: 2,
                py: 1,
                px: 4,
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{
                borderRadius: 2,
                py: 1,
                px: 4,
                textTransform: 'none',
                background: theme.palette.primary.main,
                '&:hover': {
                  background: theme.palette.primary.dark,
                },
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default EditPost; 