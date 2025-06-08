import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  Tooltip,
  CircularProgress,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder,
  BookmarkBorder,
  Bookmark,
  Comment as CommentIcon,
  Edit as EditIcon,
  PersonAdd as FollowIcon,
  PersonRemove as UnfollowIcon,
  Share as ShareIcon,
  GridOn as PostsIcon,
  BookmarkBorder as SavedIcon,
  Timeline as ActivityIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { fetchUserProfile } from '../../store/slices/userSlice';

const API_URL = 'http://127.0.0.1:8000/api';

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { username } = useParams();
  const { currentUser } = useSelector((state) => state.auth);
  const { profile } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [followersDialogOpen, setFollowersDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isOwnProfile = !username || username === currentUser?.username;

  useEffect(() => {
    if (isOwnProfile) {
      dispatch(fetchUserProfile());
    }
    fetchProfileData();
  }, [username, dispatch]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = {
        Authorization: token,
        'Content-Type': 'application/json',
      };

      // Fetch profile data
      if (!isOwnProfile) {
        const profileResponse = await axios.get(
          `${API_URL}/users/${username}/`,
          { headers }
        );
        setProfileData(profileResponse.data);
      }

      // Fetch user's posts
      const postsResponse = await axios.get(
        `${API_URL}/users/${username || 'me'}/posts/`,
        { headers }
      );
      setUserPosts(postsResponse.data);

      // Only fetch saved posts and activities for own profile
      if (isOwnProfile) {
        const savedResponse = await axios.get(
          `${API_URL}/save-posts/`,
          { headers }
        );
        setSavedPosts(savedResponse.data);

        const activitiesResponse = await axios.get(
          `${API_URL}/user-activity/`,
          { headers }
        );
        setActivities(activitiesResponse.data);
      }

      // Check if following this user
      if (!isOwnProfile) {
        const followResponse = await axios.get(
          `${API_URL}/follows/check/${username}/`,
          { headers }
        );
        setIsFollowing(followResponse.data.is_following);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error('Failed to fetch profile data. Please try again.');
      }
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/users/${username || 'me'}/followers/`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      setFollowers(response.data);
      setFollowersDialogOpen(true);
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error('Failed to fetch followers. Please try again.');
    }
  };

  const fetchFollowing = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/users/${username || 'me'}/following/`,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      setFollowing(response.data);
      setFollowingDialogOpen(true);
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error('Failed to fetch following users. Please try again.');
    }
  };

  const handleFollow = async (targetUsername) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${API_URL}/follows/toggle/`,
        { username: targetUsername || username },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (targetUsername) {
        // If following from dialog, refresh the lists
        await Promise.all([fetchFollowers(), fetchFollowing()]);
      } else {
        // If following from profile
        setIsFollowing(!isFollowing);
        setProfileData(prev => ({
          ...prev,
          followers_count: isFollowing ? prev.followers_count - 1 : prev.followers_count + 1
        }));
      }
      toast.success(response.data.detail);
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to follow/unfollow user. Please try again.');
      }
    }
  };

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
      fetchProfileData();
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post. Please try again.');
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
      toast.success(response.data.detail);
      fetchProfileData();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post. Please try again.');
    }
  };

  const handleShare = (post) => {
    navigator.clipboard.writeText(window.location.origin + '/post/' + post.id)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePostMenuOpen = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handlePostMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleEditPost = () => {
    handlePostMenuClose();
    navigate(`/edit-post/${selectedPost.id}`);
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
    handlePostMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedPost(null);
  };

  const handleDeletePost = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(`${API_URL}/posts/${selectedPost.id}/`, {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      toast.success('Post deleted successfully');
      fetchProfileData(); // Refresh the posts
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Error deleting post:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error('Failed to delete post. Please try again.');
      }
    }
  };

  const renderUserInfo = () => (
    <Paper sx={{ p: 4, mb: 4, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
          <Avatar
            src={isOwnProfile ? currentUser?.profile_picture : profileData?.profile_picture}
            alt={isOwnProfile ? currentUser?.username : profileData?.username}
            sx={{
              width: 150,
              height: 150,
              mx: 'auto',
              border: '3px solid',
              borderColor: 'primary.main',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {isOwnProfile ? currentUser?.username : profileData?.username}
            </Typography>
            {isOwnProfile ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate('/edit-profile')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant={isFollowing ? "outlined" : "contained"}
                startIcon={isFollowing ? <UnfollowIcon /> : <FollowIcon />}
                onClick={() => handleFollow()}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  background: isFollowing ? 'transparent' : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                }}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
            <Typography>
              <strong>{userPosts?.length || 0}</strong> posts
            </Typography>
            <Typography
              sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
              onClick={fetchFollowers}
            >
              <strong>{isOwnProfile ? currentUser?.followers_count : profileData?.followers_count || 0}</strong> followers
            </Typography>
            <Typography
              sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
              onClick={fetchFollowing}
            >
              <strong>{isOwnProfile ? currentUser?.following_count : profileData?.following_count || 0}</strong> following
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
            {isOwnProfile ? `${currentUser?.first_name} ${currentUser?.last_name}` : `${profileData?.first_name} ${profileData?.last_name}`}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
            {isOwnProfile ? currentUser?.bio : profileData?.bio || 'No bio yet'}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderFollowDialog = (open, setOpen, title, users, type) => (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {title}
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <List>
          {users.map((user) => (
            <ListItem key={user.id}>
              <ListItemAvatar>
                <Avatar
                  src={user.profile_picture}
                  alt={user.username}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setOpen(false);
                    navigate(`/profile/${user.username}`);
                  }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    onClick={() => {
                      setOpen(false);
                      navigate(`/profile/${user.username}`);
                    }}
                  >
                    {user.username}
                  </Typography>
                }
                secondary={`${user.first_name} ${user.last_name}`}
              />
              {user.username !== currentUser?.username && (
                <ListItemSecondaryAction>
                  <Button
                    variant={user.is_following ? "outlined" : "contained"}
                    size="small"
                    startIcon={user.is_following ? <UnfollowIcon /> : <FollowIcon />}
                    onClick={() => handleFollow(user.username)}
                  >
                    {user.is_following ? 'Unfollow' : 'Follow'}
                  </Button>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );

  const renderTabs = () => {
    if (!isOwnProfile) return null;

    return (
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '1rem',
              py: 2,
            },
          }}
        >
          <Tab icon={<PostsIcon />} label="Posts" iconPosition="start" />
          <Tab icon={<SavedIcon />} label="Saved" iconPosition="start" />
          <Tab icon={<ActivityIcon />} label="Activity" iconPosition="start" />
        </Tabs>
      </Paper>
    );
  };

  const renderSavedPosts = () => (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {savedPosts.map((save) => (
        <Card 
          key={save.post.id} 
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
                src={save.post.user?.profile_picture} 
                alt={save.post.user?.username}
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
                onClick={() => navigate(`/profile/${save.post.user?.username}`)}
              />
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
                onClick={() => navigate(`/profile/${save.post.user?.username}`)}
              >
                {save.post.user?.username}
              </Typography>
            }
            subheader={
              <Typography variant="caption" color="text.secondary">
                {new Date(save.post.created_at).toLocaleDateString()}
              </Typography>
            }
          />
          <CardMedia
            component="img"
            image={save.post.image}
            alt={save.post.title}
            sx={{ 
              height: 'auto',
              maxHeight: 600,
              objectFit: 'contain',
              bgcolor: 'black',
            }}
          />
          <CardActions sx={{ px: 2, py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={save.post.is_liked ? "Unlike" : "Like"}>
                <IconButton 
                  onClick={() => handleLike(save.post.id)}
                  sx={{ 
                    '&:hover': { transform: 'scale(1.1)' },
                    transition: 'transform 0.2s',
                  }}
                >
                  {save.post.is_liked ? 
                    <FavoriteIcon sx={{ color: '#ff1744' }} /> : 
                    <FavoriteBorder />
                  }
                </IconButton>
              </Tooltip>
              <Tooltip title="Comment">
                <IconButton
                  onClick={() => navigate(`/post/${save.post.id}`)}
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
                  onClick={() => handleShare(save.post)}
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
            <Tooltip title="Unsave">
              <IconButton 
                onClick={() => handleSave(save.post.id)}
                sx={{ 
                  '&:hover': { transform: 'scale(1.1)' },
                  transition: 'transform 0.2s',
                }}
              >
                <Bookmark sx={{ color: 'primary.main' }} />
              </IconButton>
            </Tooltip>
          </CardActions>
          <CardContent>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" component="span" fontWeight="bold">
                {save.post.likes_count} likes
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
                onClick={() => navigate(`/profile/${save.post.user?.username}`)}
              >
                {save.post.user?.username}
              </Box>
              {save.post.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {save.post.description}
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
              onClick={() => navigate(`/post/${save.post.id}`)}
              gutterBottom
            >
              View all {save.post.comments_count} comments
            </Typography>
            {save.post.price && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    ${save.post.price}
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      ))}
      {savedPosts.length === 0 && (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            color: 'text.secondary',
          }}
        >
          <BookmarkBorder sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">No saved posts yet</Typography>
          <Typography variant="body2">
            Save posts to view them later
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderActivities = () => (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <List>
        {activities.map((activity) => (
          <ListItem 
            key={activity.id}
            sx={{ 
              mb: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <ListItemAvatar>
              <Avatar src={activity.user?.profile_picture} />
            </ListItemAvatar>
            <ListItemText
              primary={activity.description}
              secondary={new Date(activity.timestamp).toLocaleDateString()}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const renderPosts = () => (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {userPosts.map((post) => (
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
                }}
              />
            }
            action={
              isOwnProfile && (
                <>
                  <IconButton
                    onClick={(e) => handlePostMenuOpen(e, post)}
                    sx={{
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'transform 0.2s',
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && selectedPost?.id === post.id}
                    onClose={handlePostMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem 
                      onClick={handleEditPost}
                      sx={{ 
                        gap: 1.5,
                        py: 1,
                        '&:hover': { backgroundColor: `${theme.palette.primary.main}10` },
                      }}
                    >
                      <EditIcon fontSize="small" color="primary" />
                      <Typography>Edit Post</Typography>
                    </MenuItem>
                    <MenuItem 
                      onClick={handleDeleteDialogOpen}
                      sx={{ 
                        gap: 1.5,
                        py: 1,
                        '&:hover': { backgroundColor: `${theme.palette.error.main}10` },
                      }}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                      <Typography color="error">Delete Post</Typography>
                    </MenuItem>
                  </Menu>
                </>
              )
            }
            title={
              <Typography variant="subtitle1" fontWeight="bold">
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
                    <FavoriteIcon sx={{ color: '#ff1744' }} /> : 
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
              <Box component="span" fontWeight="bold" sx={{ mr: 1 }}>
                {post.user?.username}
              </Box>
              {post.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {post.description}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {post.comments_count} comments
            </Typography>
            {post.price && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    ${post.price}
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Delete Post</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this post? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={handleDeleteDialogClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeletePost}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {renderUserInfo()}
      {renderTabs()}
      {isOwnProfile ? (
        <>
          {activeTab === 0 && renderPosts()}
          {activeTab === 1 && renderSavedPosts()}
          {activeTab === 2 && renderActivities()}
        </>
      ) : (
        renderPosts()
      )}
      {renderFollowDialog(followersDialogOpen, setFollowersDialogOpen, 'Followers', followers, 'followers')}
      {renderFollowDialog(followingDialogOpen, setFollowingDialogOpen, 'Following', following, 'following')}
    </Container>
  );
};

export default Profile; 