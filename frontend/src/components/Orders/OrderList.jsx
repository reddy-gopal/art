import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const API_URL = 'https://artbackend.pythonanywhere.com/ecommerce';
const BACKEND_URL = 'https://artbackend.pythonanywhere.com';

const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/`, {
        headers: {
          'Authorization': localStorage.getItem('token'),
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>
      {orders.map((order) => (
        <Accordion key={order.id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <Typography sx={{ flexGrow: 1 }}>
                Order #{order.id} - {formatDate(order.created_at)}
              </Typography>
              <Chip
                label={order.status}
                color={getStatusColor(order.status)}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.post?.id || item.id}>
  <TableCell>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        component="img"
        src={getImageUrl(item.post?.image) || '/placeholder.png'}
        alt={item.post?.title || 'Unknown Product'}
        sx={{
          width: 50,
          height: 50,
          objectFit: 'cover',
          mr: 2,
          borderRadius: 1
        }}
      />
      <Typography>{item.post?.title || 'Unknown Product'}</Typography>
    </Box>
  </TableCell>
  <TableCell align="right">{item.quantity}</TableCell>
  <TableCell align="right">${item.price}</TableCell>
  <TableCell align="right">
    ${(item.price * item.quantity).toFixed(2)}
  </TableCell>
</TableRow>

                  ))}
                  <TableRow>
                    <TableCell colSpan={3} />
                    <TableCell align="right">
                      <Typography variant="subtitle1">
                        Total: ${order.total_amount}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}
      {orders.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            When you place an order, it will appear here
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default OrderList; 