import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  IconButton,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const CATEGORY_OPTIONS = [
  { value: 'painting', label: 'Painting' },
  { value: 'sculpture', label: 'Sculpture' },
  { value: 'photography', label: 'Photography' },
  { value: 'digital', label: 'Digital Art' },
  { value: 'other', label: 'Other' },
];

const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  price: Yup.number()
    .required('Price is required')
    .min(0, 'Price must be greater than or equal to 0'),
  category: Yup.string().required('Category is required'),
  image: Yup.mixed().required('Image is required'),
});

const API_URL = 'http://127.0.0.1:8000/api';

const CreatePost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const token = localStorage.getItem('token');
  if (!token) {
    toast.error('Please login to create a post');
    navigate('/login');
    return null;
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      price: '',
      category: 'other',
      image: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const formData = new FormData();
        
        const price = parseFloat(values.price).toFixed(2);
        
        formData.append('title', values.title.trim());
        formData.append('description', values.description.trim());
        formData.append('price', price);
        formData.append('category', values.category);
        if (values.image) {
          formData.append('image', values.image);
        }

        const response = await axios.post(
          `${API_URL}/posts/`,
          formData,
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.status === 201) {
          toast.success('Post created successfully!');
          navigate('/');
        } else {
          toast.error('Failed to create post. Please try again.');
        }
      } catch (error) {
        console.error('Error creating post:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          toast.error(error.response?.data?.detail || 'Failed to create post. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      formik.setFieldValue('image', file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Post
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                name="title"
                label="Title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="category"
                name="category"
                label="Category"
                select
                value={formik.values.category}
                onChange={formik.handleChange}
                error={formik.touched.category && Boolean(formik.errors.category)}
                helperText={formik.touched.category && formik.errors.category}
                disabled={loading}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: formik.touched.image && formik.errors.image 
                    ? 'error.main'
                    : 'primary.main',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  mb: 2,
                  opacity: loading ? 0.7 : 1,
                }}
                onClick={() => !loading && document.getElementById('image-input').click()}
              >
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
                <IconButton color="primary" sx={{ mb: 1 }} disabled={loading}>
                  <CloudUploadIcon fontSize="large" />
                </IconButton>
                <Typography>
                  {formik.values.image
                    ? formik.values.image.name
                    : 'Click to upload image'}
                </Typography>
                {formik.touched.image && formik.errors.image && (
                  <Typography color="error" variant="caption">
                    {formik.errors.image}
                  </Typography>
                )}
              </Box>
              {previewUrl && (
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'cover',
                    borderRadius: 1,
                    opacity: loading ? 0.7 : 1,
                  }}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="price"
                name="price"
                label="Price ($)"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !formik.isValid}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                  },
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                    Creating Post...
                  </>
                ) : (
                  'Create Post'
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreatePost; 