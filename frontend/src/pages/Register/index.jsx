import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  Stepper,
  Step,
  StepLabel,
  Fade,
  Grow,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PersonAddOutlined,
  Visibility,
  VisibilityOff,
  AccountCircle,
  Lock,
  Email,
  ArrowForward,
  ArrowBack,
  Palette,
  Store,
  EmojiEvents,
} from '@mui/icons-material';
import { register } from '../../store/slices/authSlice';

const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: (values) => {
      const { confirmPassword, ...registerData } = values;
      dispatch(register(registerData));
    },
  });

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formik.errors.username && !formik.errors.email && 
          formik.touched.username && formik.touched.email) {
        setActiveStep(1);
      } else {
        formik.setTouched({
          username: true,
          email: true,
        });
      }
    }
  };

  const handleBack = () => {
    setActiveStep(0);
  };

  const steps = ['Account Details', 'Security'];

  const benefits = [
    {
      icon: <Palette sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Create Your Portfolio',
      description: 'Build a stunning portfolio to showcase your artwork. Reach art lovers and collectors from around the world.',
    },
    {
      icon: <Store sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Start Your Art Business',
      description: 'Turn your passion into profit. Set up your store, price your artwork, and manage sales professionally.',
    },
    {
      icon: <EmojiEvents sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Join the Community',
      description: 'Connect with fellow artists, participate in exhibitions, and get featured in our curated collections.',
    },
  ];

  const welcomeSequence = [
    'Start Your Journey',
    3000,
    'Join Our Community',
    3000,
    'Begin Your Story',
    3000,
    'Start Your Journey',
    3000,
  ];

  const subtitleSequence = [
    'Where Art Meets Opportunity',
    2000,
    'Create, Share, and Grow',
    2000,
    'Your Art, Your Way',
    2000,
    'Where Art Meets Opportunity',
    2000,
  ];

  const descriptionSequence = [
    'Join Artloom and become part of a thriving creative community.',
    3000,
    'Showcase your artwork to art enthusiasts worldwide.',
    3000,
    'Build your artistic career with our supportive platform.',
    3000,
    'Join Artloom and become part of a thriving creative community.',
    3000,
  ];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
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
          </Box>
        );
      case 1:
        return (
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #e3f2fd 0%, #bbdefb 100%)',
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
                    {benefits.map((benefit, index) => (
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
                              {benefit.icon}
                            </Box>
                            <Box>
                              <Typography variant="h6" gutterBottom fontWeight={600}>
                                {benefit.title}
                              </Typography>
                              <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                                {benefit.description}
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
                  <PersonAddOutlined sx={{ fontSize: 32 }} />
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
                  Create Account
                </Typography>

                <Stepper
                  activeStep={activeStep}
                  sx={{ width: '100%', mb: 4 }}
                  alternativeLabel
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                <Box
                  component="form"
                  onSubmit={formik.handleSubmit}
                  sx={{ width: '100%' }}
                >
                  {renderStepContent(activeStep)}

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
                        {error.detail || 'Registration failed'}
                      </Typography>
                    </Grow>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      startIcon={<ArrowBack />}
                      sx={{
                        visibility: activeStep === 0 ? 'hidden' : 'visible',
                        color: 'text.secondary',
                      }}
                    >
                      Back
                    </Button>
                    {activeStep === steps.length - 1 ? (
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{
                          py: 1.5,
                          px: 4,
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
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        variant="contained"
                        endIcon={<ArrowForward />}
                        sx={{
                          py: 1.5,
                          px: 4,
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
                        Next
                      </Button>
                    )}
                  </Box>

                  <Box
                    sx={{
                      textAlign: 'center',
                      mt: 3,
                      p: 2,
                      borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Already have an account?
                    </Typography>
                    <Link
                      component={RouterLink}
                      to="/login"
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
                      Sign in here
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

export default Register; 