import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { MoonLoader } from 'react-spinners';

const PaymentReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  
  // Fix: PayMee returns URL like ?success=true?payment_token=xxx
  // We need to handle this malformed URL
  let success = searchParams.get('success');
  let token = searchParams.get('payment_token');
  console.log("success before fix:", success, "token before fix:", token);
  
  // If success contains a question mark, it means PayMee concatenated params incorrectly
  if (success && success.includes('?')) {
    const parts = success.split('?');
    success = parts[0]; // 'true' or 'false'
    
    // Parse the rest as query params
    const additionalParams = new URLSearchParams(parts[1]);
    token = additionalParams.get('payment_token');
  }
  
  console.log('PaymentReturn - success:', success, 'token:', token);

  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (success === 'true' && token) {
        try {
          console.log('Fetching payment details for token:', token);
          
          const response = await axios.get(
            `${import.meta.env.VITE_VERCEL_URI}/api/paymee/payment-details/${token}`
          );
          
          console.log('Order details received:', response.data);
          setOrderDetails(response.data);
          
          // Notify parent window of success
          window.parent.postMessage({ type: 'PAYMENT_SUCCESS' }, '*');
        } catch (err) {
          console.log('Error fetching order details:', err);
          setError('Unable to load purchase details');
          window.parent.postMessage({ type: 'PAYMENT_FAILURE' }, '*');
        }
      } else {
        // Payment failed or cancelled
        window.parent.postMessage({ type: 'PAYMENT_FAILURE' }, '*');
      }
      
      setLoading(false);
    };

    fetchOrderDetails();
  }, [success, token]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="400px"
        p={3}
      >
        <MoonLoader size={60} color="#713CC5" />
        <Typography variant="h6" mt={3} color="textSecondary">
          Loading purchase details...
        </Typography>
      </Box>
    );
  }

  if (success === 'false' || !success) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          icon={<ErrorIcon fontSize="large" />}
          sx={{ mb: 3 }}
        >
          <AlertTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            Payment Cancelled
          </AlertTitle>
          <Typography variant="body1">
            Your payment was cancelled or failed. No charges were made to your account.
          </Typography>
        </Alert>
        
        <Card sx={{ mt: 3, textAlign: 'center', p: 3 }}>
          <Typography variant="body1" color="textSecondary">
            You can close this window and try again if you wish to complete the purchase.
          </Typography>
        </Card>
      </Box>
    );
  }

  if (error || !orderDetails) {
    return (
      <Box p={3}>
        <Alert severity="warning">
          <AlertTitle>Unable to Load Details</AlertTitle>
          <Typography>
            {error || 'Could not retrieve order information. Please contact support with your transaction reference.'}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Calculate total amount from items
  const totalAmount = orderDetails.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Box p={3}>
      {/* Success Header */}
      <Alert 
        severity="success" 
        icon={<CheckCircleIcon fontSize="large" />}
        sx={{ mb: 3 }}
      >
        <AlertTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          Payment Successful!
        </AlertTitle>
        <Typography variant="body1">
          Thank you for your purchase. Your order has been confirmed.
        </Typography>
      </Alert>

      {/* Order Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#713CC5' }}>
            Order Summary
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" color="textSecondary">
                Order ID:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {orderDetails.orderId}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" color="textSecondary">
                Transaction Token:
              </Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ fontSize: '0.9rem' }}>
                {orderDetails.token}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" color="textSecondary">
                Date:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {new Date(orderDetails.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" color="textSecondary">
                Status:
              </Typography>
              <Typography 
                variant="body1" 
                fontWeight="bold" 
                sx={{ color: '#4caf50' }}
              >
                {orderDetails.status.toUpperCase()}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Items Details Card */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#713CC5' }}>
            Purchase Details
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Loop through all items */}
          {orderDetails.items.map((item, index) => (
            <Box key={index} sx={{ mb: index < orderDetails.items.length - 1 ? 3 : 0 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                {/* Item Image */}
                {/* {item.itemPics && item.itemPics.length > 0 && (
                  <CardMedia
                    component="img"
                    sx={{
                      width: { xs: '100%', sm: 150 },
                      height: { xs: 200, sm: 150 },
                      objectFit: 'cover',
                      borderRadius: 1
                    }}
                    image={item.itemPics[0].url || item.itemPics[0]}
                    alt={item.title}
                  />
                )} */}
                
                {/* Item Info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    {item.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        Brand:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {item.brand}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        Category:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {item.category}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        Quantity:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {item.quantity}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        Unit Price:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {item.price} DT
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" fontWeight="bold">
                        Subtotal:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {item.price * item.quantity} DT
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
              
              {/* Divider between items */}
              {index < orderDetails.items.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
          
          {/* Total Amount */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="h6" color="textSecondary">
              Total Amount:
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ color: '#713CC5' }}>
              {orderDetails.amount} DT
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Buyer Info */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Buyer Information
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1" color="textSecondary">
                Name:
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {orderDetails.buyer.fName} {orderDetails.buyer.lName}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <Box mt={3} p={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="body2" color="textSecondary" textAlign="center">
          A confirmation email has been sent to your email address.
          <br />
          Please keep this transaction reference for your records.
        </Typography>
      </Box>
    </Box>
  );
};

export default PaymentReturn;