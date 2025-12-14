// Cart.jsx - FINAL VERSION WITH POINTS REDEMPTION
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import {
  Alert, AlertTitle, Button, Dialog, DialogActions, 
  DialogContent, DialogTitle, Chip, IconButton, Slider, Box, Typography
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContex';

const Cart = () => {
  const { cartItems, setCartItems, removeFromCart } = useContext(CartContext);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [paymentToken, setPaymentToken] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const navigate = useNavigate();

  // POINTS REDEMPTION
  const [rewards, setRewards] = useState({ points: 0 });
  const [usePoints, setUsePoints] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
   const  { isLoggedIn, loggedId } = useAuth();

  useEffect(() => {

    const fetchCartItems = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_VERCEL_URI}/api/cart`, {
          withCredentials: true,
        });
        
        if (response.data && response.data.items) {
          setCartItems(response.data.items);
          setTotalAmount(response.data.totalAmount || 0);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        if (error.response?.status === 404) {
          setCartItems([]);
          setTotalAmount(0);
        }
        setLoading(false);
      }
    };

    fetchCartItems();
loggedId &&
    // Fetch user rewards (points)
    axios.get(`${import.meta.env.VITE_VERCEL_URI}/api/reward/${loggedId}`, { withCredentials: true })
      .then((res) => {
        setRewards(res.data);
      })
      .catch((err) => console.error("Error fetching rewards:", err));

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [setCartItems, loggedId]);

  // REAL-TIME FINAL PRICE CALCULATION
  useEffect(() => {
    const maxPoints = Math.min(rewards.points, totalAmount * 10); // 10 points = 1 TND
    const effectivePoints = Math.min(usePoints, maxPoints);
    const discount = Math.floor(effectivePoints / 10);
    setFinalTotal(Math.max(1, totalAmount - discount)); // Minimum 1 TND
    if (usePoints > maxPoints) setUsePoints(maxPoints);
  }, [totalAmount, usePoints, rewards.points]);

  // QUANTITY UPDATE
  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const currentItem = cartItems.find(item => item.item._id === itemId);
      const maxQuantity = currentItem?.item?.stock || 0;
      
      const validQuantity = Math.min(Math.max(1, newQuantity), maxQuantity);
      
      if (newQuantity > maxQuantity) {
        alert(`Maximum ${maxQuantity} available in stock!`);
      }

      if (validQuantity === currentItem.quantity) return;

      await axios.put(
        `${import.meta.env.VITE_VERCEL_URI}/api/cart/update/${itemId}`, 
        { itemId, quantity: validQuantity }, 
        { withCredentials: true }
      );

      const response = await axios.get(`${import.meta.env.VITE_VERCEL_URI}/api/cart`, { withCredentials: true });
      if (response.data && response.data.items) {
        setCartItems(response.data.items);
        setTotalAmount(response.data.totalAmount || 0);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      const response = await axios.get(`${import.meta.env.VITE_VERCEL_URI}/api/cart`, { withCredentials: true });
      if (response.data && response.data.items) {
        setCartItems(response.data.items);
        setTotalAmount(response.data.totalAmount || 0);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      setPaymentLoading(true);

      const outOfStockItems = cartItems.filter(item => item.item.stock === 0);
      if (outOfStockItems.length > 0) {
        alert('Some items are out of stock! Please remove them.');
        setPaymentLoading(false);
        return;
      }

      const cartItemsForPayment = cartItems.map(item => ({
        itemId: item.item._id,
        quantity: item.quantity || 1,
      }));

      const response = await axios.post(
        `${import.meta.env.VITE_VERCEL_URI}/api/paymee/create-cart-payment`,
        { items: cartItemsForPayment, usePoints }, // ← SEND usePoints
        { withCredentials: true }
      );

      if (response.data.error) {
        alert(`Payment error: ${response.data.error.detail || response.data.error.message}`);
        setPaymentLoading(false);
        return;
      }

      const { paymentUrl, token } = response.data;
      setIframeUrl(paymentUrl);
      setPaymentToken(token);
      setPaymentDialog(true);
      setPaymentStatus('pending');
      startPaymentPolling(token);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
      setPaymentStatus('error');
      setPaymentLoading(false);
    }
  };

  const startPaymentPolling = (token) => {
    let attempts = 0;
    const maxAttempts = 30;
    let pollInterval = null;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setPaymentStatus('timeout');
        setPaymentLoading(false);
        if (pollInterval) clearInterval(pollInterval);
        return;
      }

      attempts++;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_VERCEL_URI}/api/paymee/check-status/${token}`,
          { withCredentials: true, timeout: 10000 }
        );

        const status = response.data;
        if (status.status === 'PAID') {
          setPaymentStatus('success');
          setPaymentLoading(false);
          if (pollInterval) clearInterval(pollInterval);

          await axios.post(`${import.meta.env.VITE_VERCEL_URI}/api/cart/checkout`, {}, { withCredentials: true });
          setCartItems([]);
          setTotalAmount(0);
        } else if (status.status === 'CANCELED' || status.status === 'FAILED') {
          setPaymentStatus('failed');
          setPaymentLoading(false);
          if (pollInterval) clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    pollInterval = setInterval(poll, 5000);
    setPollingInterval(pollInterval);
    poll();
  };

  const closePaymentDialog = () => {
    setPaymentDialog(false);
    setPaymentStatus(null);
    setIframeUrl(null);
    setPaymentLoading(false);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Message handler (optional Paymee callback)
  useEffect(() => {
    const handleMessage = (event) => {
      const { type } = event.data;
      if (type === 'PAYMENT_SUCCESS') {
        if (pollingInterval) clearInterval(pollingInterval);
        setPaymentStatus('success');
        setPaymentLoading(false);
        axios.post(`${import.meta.env.VITE_VERCEL_URI}/api/cart/checkout`, {}, { withCredentials: true })
          .then(() => {
            setCartItems([]);
            setTotalAmount(0);
          });
      } else if (type === 'PAYMENT_FAILURE') {
        if (pollingInterval) clearInterval(pollingInterval);
        setPaymentStatus('failed');
        setPaymentLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [pollingInterval]);

  if (loading) {
    return (
      <div className="container my-5 d-flex justify-content-center">
        <MoonLoader size={50} color="#713CC5" />
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-shopping-cart me-2"></i>
          Shopping Cart
        </h2>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/')}
          style={{ borderColor: '#713CC5', color: '#713CC5' }}
        >
          Continue Shopping
        </Button>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-shopping-cart" style={{ fontSize: '64px', color: '#ddd' }}></i>
          </div>
          <h4>Your cart is empty</h4>
          <p className="text-muted">Add some items to get started!</p>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="row g-4 mb-4">
            {cartItems.map((cartItem) => {
              const item = cartItem.item;
              const isOutOfStock = item.stock === 0;
              const isLowStock = item.stock <= 2 && item.stock > 0;
              const canAddMore = cartItem.quantity < item.stock;

              return (
                <div key={cartItem._id} className="col-12">
                  <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
                    <div className="card-body p-4">
                      <div className="row align-items-center">
                        <div className="col-md-2 col-3">
                          <img 
                            src={item.itemPics?.[0]?.url || '/placeholder.jpg'} 
                            className="img-fluid rounded-3" 
                            style={{ height: '80px', objectFit: 'cover' }}
                            alt={item.title}
                          />
                        </div>

                        <div className="col-md-5 col-6">
                          <h6 className="mb-2 fw-bold">{item.title}</h6>
                          <div className="d-flex align-items-center mb-2">
                            <span className="badge bg-primary me-2">{item.category}</span>
                            <Chip 
                              icon={
                                isOutOfStock ? <CloseIcon fontSize="small" style={{ color: '#fff' }} /> :
                                isLowStock ? <WarningIcon fontSize="small" style={{ color: '#fff' }} /> :
                                <CheckCircleIcon fontSize="small" style={{ color: '#fff' }} />
                              }
                              label={isOutOfStock ? 'Out of Stock' : `Stock: ${item.stock}`}
                              color={isOutOfStock ? 'error' : isLowStock ? 'warning' : 'success'}
                              size="small"
                            />
                          </div>
                          <p className="mb-0 text-success fw-bold fs-5">
                            {item.price} DT × {cartItem.quantity}
                          </p>
                        </div>

                        <div className="col-md-3 col-2">
                          <div className="d-flex align-items-center justify-content-center">
                            <IconButton 
                              size="small"
                              onClick={() => updateQuantity(item._id, cartItem.quantity - 1)}
                              disabled={cartItem.quantity <= 1 || isOutOfStock}
                              sx={{ bgcolor: (cartItem.quantity <= 1 || isOutOfStock) ? '#e9ecef' : '#713CC5', color: 'white', borderRadius: '50%' }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <span className="mx-2 fw-bold fs-5">{cartItem.quantity}</span>
                            <IconButton 
                              size="small"
                              onClick={() => updateQuantity(item._id, cartItem.quantity + 1)}
                              disabled={!canAddMore || isOutOfStock}
                              sx={{ bgcolor: (!canAddMore || isOutOfStock) ? '#e9ecef' : '#713CC5', color: 'white', borderRadius: '50%' }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </div>
                        </div>

                        <div className="col-md-2 col-1 text-end">
                          <IconButton 
                            onClick={() => handleRemoveItem(item._id)}
                            sx={{ color: '#dc3545', '&:hover': { bgcolor: '#ffebee' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CHECKOUT SUMMARY + POINTS */}
          <div className="card shadow-sm border-0" style={{ borderRadius: '16px' }}>
            <div className="card-body p-4">
              <Typography variant="h5" className="mb-3">Order Summary</Typography>

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{totalAmount.toFixed(2)} DT</span>
              </div>

              {/* POINTS REDEMPTION SLIDER */}
              {rewards.points > 0 && totalAmount > 0 && (
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Use Points (10 pts = 1 TND)
                  </Typography>
                  <Slider
                    value={usePoints}
                    onChange={(e, val) => setUsePoints(val)}
                    step={10}
                    marks
                    min={0}
                    max={Math.min(rewards.points, totalAmount * 10)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(val) => `${val} pts = ${(val / 10).toFixed(2)} TND off`}
                  />
                  <Typography color="text.secondary">
                    Available: {rewards.points} points
                  </Typography>
                </Box>
              )}

              {usePoints > 0 && (
                <div className="d-flex justify-content-between text-success fw-bold mb-2">
                  <span>Points Discount</span>
                  <span>-{(usePoints / 10).toFixed(2)} DT</span>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mt-4">
                <div>
                  <h4 className="mb-1 text-success fw-bold">Final Total: {finalTotal.toFixed(2)} DT</h4>
                  <small className="text-muted">
                    {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
                  </small>
                  {cartItems.some(item => item.item.stock === 0) && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <AlertTitle>Stock Issue</AlertTitle>
                      Remove out-of-stock items before checkout.
                    </Alert>
                  )}
                </div>

                <Button 
                  variant="contained" 
                  size="large"
                  onClick={handleCheckout}
                  disabled={paymentLoading || cartItems.some(item => item.item.stock === 0)}
                  sx={{ 
                    bgcolor: '#713CC5',
                    px: 5,
                    py: 2,
                    borderRadius: '12px',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: '#5a2d9a' },
                    '&:disabled': { bgcolor: '#6c757d' }
                  }}
                >
                  {paymentLoading ? (
                    <>
                      <MoonLoader size={20} color="#fff" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    `Checkout - ${finalTotal.toFixed(2)} DT`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* PAYMENT DIALOG */}
      <Dialog open={paymentDialog} onClose={closePaymentDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {paymentStatus === 'pending' ? 'Processing Payment' :
           paymentStatus === 'success' ? 'Payment Successful' :
           paymentStatus === 'failed' ? 'Payment Failed' :
           paymentStatus === 'timeout' ? 'Payment Timeout' : 'Payment'}
        </DialogTitle>
        <DialogContent>
          {iframeUrl && (
            <iframe
              src={iframeUrl}
              width="100%"
              height="600px"
              title="Payment Gateway"
              style={{ border: 'none' }}
              allow="payment"
            />
          )}
          {paymentStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <AlertTitle>Payment Successful!</AlertTitle>
              Your order has been placed. Cart cleared successfully.
            </Alert>
          )}
          {paymentStatus === 'failed' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <AlertTitle>Payment Failed</AlertTitle>
              Please try again or contact support.
            </Alert>
          )}
          {paymentStatus === 'timeout' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>Payment Timeout</AlertTitle>
              Check if payment was processed or try again.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePaymentDialog} variant="contained" sx={{ bgcolor: '#713CC5' }}>
            Close
          </Button>
          {paymentStatus === 'failed' && (
            <Button onClick={() => { closePaymentDialog(); handleCheckout(); }}>
              Try Again
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Cart;