import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { TypeAnimation } from 'react-type-animation';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Avatar,
  InputAdornment,
  IconButton,
  Fade,
  Grow,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  AccountCircle,
  Lock,
  Palette,
  ShoppingCart,
  Favorite,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMounted(true);
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://127.0.0.1:8000/api/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Login failed');
        }

        // Store the token with Bearer prefix
        localStorage.setItem('token', `Bearer ${data.access_token}`);
        // Store user data if available
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        toast.success('Login successful!');
        navigate('/');
      } catch (error) {
        console.error('Login error:', error);
        setError({ detail: error.message });
        toast.error(error.message || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  const features = [
    {
      icon: <Palette sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Discover Art',
      description: 'Browse through a curated collection of unique artworks from emerging and established artists worldwide.',
    },
    {
      icon: <ShoppingCart sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Buy & Collect',
      description: 'Start or expand your art collection with secure purchases and direct artist connections.',
    },
    {
      icon: <Favorite sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Support Artists',
      description: 'Every purchase directly supports independent artists and helps them continue their creative journey.',
    },
  ];

  const welcomeSequence = [
    'Welcome to Artloom',
    1000,
    'Welcome to Art',
    1000,
    'Welcome to Creativity',
    1000,
    'Welcome to Artloom',
    1000,
  ];

  const subtitleSequence = [
    'Your Gateway to the World of Digital Art',
    2000,
    'Discover Unique Artworks',
    2000,
    'Connect with Amazing Artists',
    2000,
    'Your Gateway to the World of Digital Art',
    2000,
  ];

  const descriptionSequence = [
    'Artloom is a vibrant marketplace where artists and art enthusiasts come together.',
    3000,
    'Discover unique artworks from talented creators worldwide.',
    3000,
    'Build your collection in a secure and inspiring environment.',
    3000,
    'Artloom is a vibrant marketplace where artists and art enthusiasts come together.',
    3000,
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #f0f7ff 0%, #e3f2fd 100%)',
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
      }}
    >
      <Container 
        maxWidth={false}
        disableGutters
        sx={{ 
          display: 'flex',
          flexDirection: 'row',
          p: 0,
        }}
      >
        <Grid 
          container 
          sx={{ 
            minHeight: '100vh',
            margin: 0,
            width: '100%',
          }}
        >
          {!isMobile && (
            <Grid 
              item 
              xs={12} 
              md={7} 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center',
                p: 6,
                pl: { md: 8, lg: 12 },
                pr: { md: 4, lg: 8 },
                borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Box sx={{ maxWidth: '800px' }}>
                <Box sx={{ height: '4.5rem', mb: 3 }}>
                  <TypeAnimation
                    sequence={welcomeSequence}
                    wrapper="div"
                    speed={50}
                    repeat={Infinity}
                    style={{
                      fontSize: '3.5rem',
                      fontWeight: 800,
                      background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      lineHeight: 1.2,
                    }}
                  />
                </Box>
                <Box sx={{ height: '2.5rem', mb: 4 }}>
                  <TypeAnimation
                    sequence={subtitleSequence}
                    wrapper="div"
                    speed={50}
                    repeat={Infinity}
                    style={{
                      fontSize: '1.75rem',
                      color: 'text.secondary',
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  />
                </Box>
                <Box sx={{ height: '4.8rem', mb: 6 }}>
                  <TypeAnimation
                    sequence={descriptionSequence}
                    wrapper="div"
                    speed={50}
                    repeat={Infinity}
                    style={{
                      fontSize: '1.25rem',
                      color: 'text.secondary',
                      lineHeight: 1.6,
                      maxWidth: '80%',
                    }}
                  />
                </Box>

                <Fade in={mounted} timeout={1000}>
                  <Grid container spacing={4}>
                    {features.map((feature, index) => (
                      <Grid item xs={12} key={index}>
                        <Grow in={mounted} timeout={(index + 1) * 500}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 3,
                              background: 'rgba(255, 255, 255, 0.7)',
                              backdropFilter: 'blur(10px)',
                              borderRadius: 2,
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                background: 'rgba(255, 255, 255, 0.9)',
                              },
                            }}
                          >
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                background: 'rgba(33, 150, 243, 0.1)',
                              }}
                            >
                              {feature.icon}
                            </Box>
                            <Box>
                              <Typography variant="h6" gutterBottom fontWeight={600}>
                                {feature.title}
                              </Typography>
                              <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                                {feature.description}
                              </Typography>
                            </Box>
                          </Paper>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                </Fade>
              </Box>
            </Grid>
          )}

          <Grid 
            item 
            xs={12} 
            md={5}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 2, md: 6 },
              background: 'rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Fade in={mounted} timeout={1000}>
              <Paper
                elevation={6}
                sx={{
                  p: { xs: 3, md: 4 },
                  width: '100%',
                  maxWidth: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                }}
              >
                <Avatar
                  sx={{
                    m: 1,
                    bgcolor: 'secondary.main',
                    width: 56,
                    height: 56,
                    transform: 'scale(1)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      bgcolor: 'primary.main',
                    },
                  }}
                >
                  <LockOutlined sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    mb: 3,
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Sign In
                </Typography>
                <Box
                  component="form"
                  onSubmit={formik.handleSubmit}
                  sx={{ width: '100%' }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    helperText={formik.touched.username && formik.errors.username}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountCircle color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                  {error && (
                    <Grow in={true}>
                      <Typography
                        color="error"
                        variant="body2"
                        sx={{
                          mt: 1,
                          textAlign: 'center',
                          backgroundColor: 'rgba(255, 0, 0, 0.1)',
                          padding: 1,
                          borderRadius: 1,
                        }}
                      >
                        {error.detail || 'Invalid credentials'}
                      </Typography>
                    </Grow>
                  )}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{
                      mt: 3,
                      mb: 2,
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                      },
                    }}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <Box
                    sx={{
                      textAlign: 'center',
                      mt: 2,
                      p: 2,
                      borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      New to Artloom?
                    </Typography>
                    <Link
                      component={RouterLink}
                      to="/register"
                      variant="body1"
                      sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                        fontWeight: 500,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          color: 'secondary.main',
                          textDecoration: 'none',
                        },
                      }}
                    >
                      Create an account
                    </Link>
                  </Box>
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login; 