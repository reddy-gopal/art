import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Grid as MuiGrid,
  Paper,
  TextField,
  Typography,
  Divider,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  LocationCity as LocationCityIcon,
  LocationOn as LocationOnIcon,
  Lock as LockIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const API_URL = 'http://127.0.0.1:8000/ecommerce';

// Create a Grid component with default props
const Grid = (props) => (
  <MuiGrid {...props} container={props.container || false} />
);

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // First save shipping address
      await axios.post(
        `${API_URL}/address/`,
        {
          full_name: formData.fullName,
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          postal_code: formData.zipCode
        },
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          }
        }
      );

      // Then create order
      const response = await axios.post(
        `${API_URL}/checkout/`,
        {},  // The backend will use the user's cart items
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
          }
        }
      );

      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.detail || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  // Custom styles
  const styles = {
    container: {
      py: 4,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      background: 'linear-gradient(145deg, #f6f8ff 0%, #f0f3ff 100%)'
    },
    paper: {
      p: 4,
      borderRadius: 2,
      boxShadow: '0 8px 40px -12px rgba(0,0,0,0.1)',
      background: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)'
      }
    },
    title: {
      mb: 4,
      color: '#1a237e',
      fontWeight: 600,
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '3px',
        background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)'
      }
    },
    sectionTitle: {
      color: '#1a237e',
      fontWeight: 500,
      mb: 3
    },
    textField: {
      '& .MuiOutlinedInput-root': {
        '&:hover fieldset': {
          borderColor: '#2196f3',
        },
        '&.Mui-focused fieldset': {
          borderColor: '#1976d2',
        }
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: '#1976d2',
      }
    },
    submitButton: {
      py: 1.5,
      mt: 2,
      background: 'linear-gradient(90deg, #2196f3 0%, #1976d2 100%)',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        background: 'linear-gradient(90deg, #1976d2 0%, #1565c0 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px -8px rgba(0,0,0,0.3)'
      }
    },
    divider: {
      my: 4
    }
  };

  return (
    <Box sx={styles.container}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={styles.paper}>
          <Typography variant="h4" align="center" sx={styles.title}>
            Secure Checkout
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Personal Information */}
              <Grid container>
                <Typography variant="h6" sx={styles.sectionTitle}>
                  Personal Information
                </Typography>
              </Grid>
              
              <Grid container>
                <TextField
                  required
                  name="fullName"
                  label="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  fullWidth
                  sx={styles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid container>
                <TextField
                  required
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  sx={styles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid container>
                <TextField
                  required
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  sx={styles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid container>
                <Divider sx={styles.divider} />
              </Grid>
              
              {/* Shipping Information */}
              <Grid container>
                <Typography variant="h6" sx={styles.sectionTitle}>
                  Shipping Information
                </Typography>
              </Grid>
              
              <Grid container>
                <TextField
                  required
                  name="address"
                  label="Address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  sx={styles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid container spacing={2}>
                <Grid sx={{ width: '50%' }}>
                  <TextField
                    required
                    name="city"
                    label="City"
                    value={formData.city}
                    onChange={handleChange}
                    fullWidth
                    sx={styles.textField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationCityIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid sx={{ width: '50%' }}>
                  <TextField
                    required
                    name="zipCode"
                    label="ZIP Code"
                    value={formData.zipCode}
                    onChange={handleChange}
                    fullWidth
                    sx={styles.textField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container>
                <Divider sx={styles.divider} />
              </Grid>

              {/* Payment Information */}
              <Grid container>
                <Typography variant="h6" sx={styles.sectionTitle}>
                  Payment Details
                </Typography>
              </Grid>
              
              <Grid container>
                <TextField
                  required
                  name="cardNumber"
                  label="Card Number"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  fullWidth
                  sx={styles.textField}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CreditCardIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid container spacing={2}>
                <Grid sx={{ width: '50%' }}>
                  <TextField
                    required
                    name="expiryDate"
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    fullWidth
                    sx={styles.textField}
                  />
                </Grid>
                
                <Grid sx={{ width: '50%' }}>
                  <TextField
                    required
                    name="cvv"
                    label="CVV"
                    value={formData.cvv}
                    onChange={handleChange}
                    fullWidth
                    sx={styles.textField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={styles.submitButton}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Complete Purchase'
                  )}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Checkout; 