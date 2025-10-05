// Cart.jsx
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { MoonLoader } from 'react-spinners';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

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

  useEffect(() => {
    // Fetch cart items on component mount
    const fetchCartItems = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_LOCAL_URI}/api/cart`, {
          withCredentials: true,
        });
        
        console.log("Cart response:", response.data);
        
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

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [setCartItems]);

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      const response = await axios.get(`${import.meta.env.VITE_LOCAL_URI}/api/cart`, {
        withCredentials: true,
      });
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

      const cartItemsForPayment = cartItems.map(item => ({
        itemId: item.item._id,
        quantity: 1,
      }));

      const response = await axios.post(
        `${import.meta.env.VITE_LOCAL_URI}/api/paymee/create-cart-payment`,
        { items: cartItemsForPayment },
        { withCredentials: true }
      );

      if (response.data.error) {
        alert(`Payment error: ${response.data.error.detail || response.data.error.message}`);
        setPaymentLoading(false);
        return;
      }

      const { paymentUrl, token } = response.data;

      if (!paymentUrl || !paymentUrl.startsWith('http')) {
        throw new Error('Invalid payment URL received');
      }

      // Set the payment URL to the iframe
      setIframeUrl(paymentUrl);
      setPaymentToken(token);

      // Start polling for payment status
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
    const maxAttempts = 30; // 2.5 minutes (5 seconds * 30)
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
          `${import.meta.env.VITE_LOCAL_URI}/api/paymee/check-status/${token}`,
          { withCredentials: true, timeout: 10000 }
        );

        const status = response.data;

        if (status.status === 'PAID') {
          setPaymentStatus('success');
          setPaymentLoading(false);
          if (pollInterval) clearInterval(pollInterval);

          // Clear cart after successful payment
          await axios.post(`${import.meta.env.VITE_LOCAL_URI}/api/cart/checkout`, {}, { withCredentials: true });
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
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Listen for messages from iframe (same as ShowOne.jsx)
  useEffect(() => {
    const handleMessage = (event) => {
      console.log('Message received in parent:', event.data);
      
      const { type } = event.data;

      if (type === 'PAYMENT_SUCCESS') {
        console.log('Payment success detected!');
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        setPaymentStatus('success');
        setPaymentLoading(false);
        
        // Clear cart after successful payment
        axios.post(`${import.meta.env.VITE_LOCAL_URI}/api/cart/checkout`, {}, { withCredentials: true })
          .then(() => {
            setCartItems([]);
            setTotalAmount(0);
          })
          .catch(err => console.error('Error clearing cart:', err));
        
      } else if (type === 'PAYMENT_FAILURE') {
        console.log('Payment failure detected');
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        setPaymentStatus('failed');
        setPaymentLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    console.log('Message listener added to parent window');

    return () => {
      window.removeEventListener('message', handleMessage);
      console.log('Message listener removed');
    };
  }, [pollingInterval]);

  return (
    <div className="container my-5">
      {loading ? (
        <div className="d-flex justify-content-center">
          <MoonLoader size={200} color="#8356C0" />
        </div>
      ) : (
        <div>
          <h2 className="mb-4">Shopping Cart</h2>
          {!cartItems || cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((cartItem) => (
                    <tr key={cartItem._id}>
                      <td>{cartItem.item?.title || 'Unknown Item'}</td>
                      <td>{cartItem.item?.price || 0} DT</td>
                      <td>
                        <button 
                          onClick={() => handleRemoveItem(cartItem.item._id)} 
                          className="btn btn-danger"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="d-flex justify-content-between align-items-center">
                <h4>Total: {totalAmount} DT</h4>
                <button 
                  className="btn btn-primary" 
                  onClick={handleCheckout} 
                  disabled={paymentLoading}
                  style={{ backgroundColor: '#713CC5', borderColor: '#713CC5' }}
                >
                  {paymentLoading ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog 
        open={paymentDialog} 
        onClose={closePaymentDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {paymentStatus === 'pending' ? 'Processing Payment' :
            paymentStatus === 'success' ? 'Payment Successful' :
              paymentStatus === 'failed' ? 'Payment Failed' :
                paymentStatus === 'timeout' ? 'Payment Timeout' : 'Payment'}
        </DialogTitle>
        <DialogContent>
          {/* Always show iframe if URL exists, even after status changes */}
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

          {/* Show timeout alert as overlay/additional info */}
          {paymentStatus === 'timeout' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>Payment Timeout</AlertTitle>
              The payment confirmation took too long. The payment page is still shown above - 
              please check if your payment was processed, or contact support.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closePaymentDialog}
            variant="contained"
            style={{ backgroundColor: '#713CC5' }}
          >
            Close
          </Button>

          {paymentStatus === 'failed' && (
            <Button
              onClick={() => {
                closePaymentDialog();
                handleCheckout();
              }}
              variant="outlined"
              style={{ borderColor: '#713CC5', color: '#713CC5' }}
            >
              Try Again
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Cart