import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Paper,
  Container,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const API_URL = 'https://artbackend.pythonanywhere.com/ecommerce';
const BACKEND_URL = 'https://artbackend.pythonanywhere.com';

const CartDetail = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/cart/`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }

      const data = await response.json();
      setCartItems(data.cart || []);
      calculateTotal(data.cart || []);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast.error('Failed to fetch cart items');
    }
  };

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => {
      return acc + (item.post.price * item.quantity);
    }, 0);
    setTotal(sum);
  };

  const handleQuantityChange = async (itemId, action) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      let endpoint = 'cart/add/';
      let body = { post: itemId, quantity: 1 };

      if (action === 'remove') {
        endpoint = 'cart/remove/';
        body = { post_id: itemId };
      }

      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to update cart');
      }

      await fetchCartItems();
      
      if (action === 'delete') {
        toast.success('Item removed from cart');
      } else {
        toast.success(action === 'add' ? 'Item quantity increased' : 'Item quantity decreased');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update cart');
    }
  };

  const handleDelete = (itemId) => {
    handleQuantityChange(itemId, 'remove');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cartItems.map((item) => (
            <Paper
              key={item.id}
              sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}
            >
              <Box
                component="img"
                src={getImageUrl(item.post.image)}
                alt={item.post.title}
                sx={{ 
                  width: 100, 
                  height: 100, 
                  objectFit: 'cover', 
                  mr: 2,
                  borderRadius: 1
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{item.post.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  ${item.post.price}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <IconButton
                    onClick={() => handleQuantityChange(item.post.id, 'remove')}
                    disabled={item.quantity <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                  <IconButton
                    onClick={() => handleQuantityChange(item.post.id, 'add')}
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(item.post.id)}
                    sx={{ ml: 2 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="h6" sx={{ ml: 2 }}>
                ${(item.post.price * item.quantity).toFixed(2)}
              </Typography>
            </Paper>
          ))}
          {cartItems.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Your cart is empty
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/')}
                sx={{ mt: 2 }}
              >
                Continue Shopping
              </Button>
            </Paper>
          )}
        </Grid>
        {cartItems.length > 0 && (
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Subtotal</Typography>
                    <Typography>${total.toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography>Shipping</Typography>
                    <Typography>Free</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6">${total.toFixed(2)}</Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleCheckout}
                  sx={{ mt: 2 }}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default CartDetail; 