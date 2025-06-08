import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardHeader,
  CardActions,
  Typography,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Paper,
  Avatar,
  Button,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  BookmarkBorder,
  Bookmark,
  Comment as CommentIcon,
  Share as ShareIcon,
  ShoppingCart,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://127.0.0.1:8000/api';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedPost, setSelectedPost] = useState(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/posts/`, {
        headers: { 
          Authorization: token,
          'Content-Type': 'application/json',
        },
        params: {
          search: searchTerm,
          ordering: sortBy === 'latest' ? '-created_at' : 'price',
        },
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error('Failed to fetch posts. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [searchTerm, sortBy]);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.post(
        `${API_URL}/like-posts/`,
        { post_id: postId },
        {
          headers: { 
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error('Failed to like post. Please try again.');
      }
    }
  };

  const handleSave = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${API_URL}/save-posts/`,
        { post_id: postId },
        {
          headers: { 
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      // Show success message
      toast.success(response.data.detail);
      
      // Refresh posts to update UI
      fetchPosts();
    } catch (error) {
      console.error('Error saving/unsaving post:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.detail || 'Failed to save/unsave post. Please try again.');
      }
    }
  };

  const handleShare = (post) => {
    navigator.clipboard.writeText(window.location.origin + '/post/' + post.id)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handlePurchase = (post) => {
    setSelectedPost(post);
    setPurchaseDialogOpen(true);
  };

  const handleConfirmPurchase = async () => {
    toast.success('Purchase initiated! Redirecting to payment...');
    setPurchaseDialogOpen(false);
  };

  const handleUserClick = (username) => {
    if (username !== currentUser?.username) {
      navigate(`/profile/${username}`);
    } else {
      navigate('/profile');
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
          p: 2, 
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Grid container spacing={2}>
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search artworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '&:hover': {
                    '& > fieldset': { borderColor: 'primary.main' },
                  },
                },
              }}
            />
          </Grid>
          <Grid xs={12} sm={6}>
            <TextField
              select
              fullWidth
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort by"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            >
              <MenuItem value="latest">Latest</MenuItem>
              <MenuItem value="price">Price: Low to High</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {posts.map((post) => (
          <Card 
            key={post.id} 
            sx={{ 
              mb: 4,
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <CardHeader
              avatar={
                <Avatar 
                  src={post.user?.profile_picture} 
                  alt={post.user?.username}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                    transition: 'transform 0.2s',
                  }}
                  onClick={() => handleUserClick(post.user?.username)}
                />
              }
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
              title={
                <Typography 
                  variant="subtitle1" 
                  fontWeight="bold"
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                    },
                    transition: 'color 0.2s',
                  }}
                  onClick={() => handleUserClick(post.user?.username)}
                >
                  {post.user?.username}
                </Typography>
              }
              subheader={
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.created_at).toLocaleDateString()}
                </Typography>
              }
            />
            <CardMedia
              component="img"
              image={post.image}
              alt={post.title}
              sx={{ 
                height: 'auto',
                maxHeight: 600,
                objectFit: 'contain',
                bgcolor: 'black',
              }}
            />
            <CardActions sx={{ px: 2, py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={post.is_liked ? "Unlike" : "Like"}>
                  <IconButton 
                    onClick={() => handleLike(post.id)}
                    sx={{ 
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'transform 0.2s',
                    }}
                  >
                    {post.is_liked ? 
                      <Favorite sx={{ color: '#ff1744' }} /> : 
                      <FavoriteBorder />
                    }
                  </IconButton>
                </Tooltip>
                <Tooltip title="Comment">
                  <IconButton
                    onClick={() => navigate(`/post/${post.id}`)}
                    sx={{ 
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'transform 0.2s',
                    }}
                  >
                    <CommentIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton 
                    onClick={() => handleShare(post)}
                    sx={{ 
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'transform 0.2s',
                    }}
                  >
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Tooltip title={post.is_saved ? "Unsave" : "Save"}>
                <IconButton 
                  onClick={() => handleSave(post.id)}
                  sx={{ 
                    '&:hover': { transform: 'scale(1.1)' },
                    transition: 'transform 0.2s',
                  }}
                >
                  {post.is_saved ? 
                    <Bookmark sx={{ color: 'primary.main' }} /> : 
                    <BookmarkBorder />
                  }
                </IconButton>
              </Tooltip>
            </CardActions>
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" component="span" fontWeight="bold">
                  {post.likes_count} likes
                </Typography>
              </Box>
              <Typography variant="subtitle1" component="div" gutterBottom>
                <Box 
                  component="span" 
                  fontWeight="bold" 
                  sx={{ 
                    mr: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                    },
                    transition: 'color 0.2s',
                  }}
                  onClick={() => handleUserClick(post.user?.username)}
                >
                  {post.user?.username}
                </Box>
                {post.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {post.description}
              </Typography>
              <Typography 
                variant="subtitle2" 
                color="text.secondary" 
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
                onClick={() => navigate(`/post/${post.id}`)}
                gutterBottom
              >
                View all {post.comments_count} comments
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" color="primary.main" fontWeight="bold">
                  ${post.price}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  onClick={() => handlePurchase(post)}
                  sx={{
                    borderRadius: 3,
                    textTransform: 'none',
                    px: 3,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Purchase
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog 
        open={purchaseDialogOpen} 
        onClose={() => setPurchaseDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle>
          Confirm Purchase
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to purchase this artwork?
          </Typography>
          {selectedPost && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {selectedPost.title}
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ mt: 1 }}>
                Price: ${selectedPost.price}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setPurchaseDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmPurchase}
            startIcon={<ShoppingCart />}
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
              },
            }}
          >
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Home; 