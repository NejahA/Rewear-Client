// ShowOne.jsx - STOCK POLLING + BUTTON FIX
import axios from "axios";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Chip, Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { MoonLoader } from "react-spinners";
import { CartContext } from "../context/CartContext";

const ShowOne = () => {
  const [item, setItem] = useState({
    title: "", category: "", brand: "", size: "", description: "", price: "",
    previousOwners: "", gender: "", condition: "", age: "", status: "", stock: 1,
    tags: [], itemPics: [], user: { fName: "loading", profilePic: { url: "/logo/load-violet.gif" } }
  });
  const [activeImage, setActiveImage] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null); // Payment polling
  const [stockPollingInterval, setStockPollingInterval] = useState(null); // Stock polling
  const [paymentToken, setPaymentToken] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  // Fetch item function (extracted for reuse)
  const fetchItem = useCallback(async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_VERCEL_URI}/api/items/${id}`);
      const fetchedItem = res.data;
      console.log("🔄 Stock refresh:", fetchedItem.stock);
      setItem(fetchedItem);
      
      // Update active image if needed
      if (fetchedItem.itemPics && fetchedItem.itemPics.length > 0 && !activeImage) {
        setActiveImage(fetchedItem.itemPics[0].url || fetchedItem.itemPics[0]);
      }
      
      // Reset quantity if stock changed
      if (quantity > fetchedItem.stock) {
        setQuantity(fetchedItem.stock || 1);
      }
    } catch (err) {
      console.error("Error fetching item:", err);
    }
  }, [id, quantity, activeImage]);

  // Fetch user
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_VERCEL_URI}/api/users/logged`, { withCredentials: true })
      .then((res) => setLoggedUser(res.data))
      .catch((err) => console.error("Error fetching logged user:", err));
  }, []);

  // Initial load + Stock Polling
  useEffect(() => {
    fetchItem(); // Initial load

    // Poll stock every 30 seconds
    const stockInterval = setInterval(fetchItem, 1000);
    setStockPollingInterval(stockInterval);

    return () => {
      if (stockInterval) clearInterval(stockInterval);
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [fetchItem, pollingInterval]);

  const deleteItem = (itemId) => {
    axios.delete(`${import.meta.env.VITE_VERCEL_URI}/api/items/${itemId}`, { withCredentials: true })
      .then(() => navigate("/"))
      .catch((error) => console.error("Error deleting item:", error));
  };

  const handleBuyItem = async () => {
    if (!loggedUser) {
      navigate("/login");
      return;
    }
    if (quantity > item.stock) {
      alert(`Cannot purchase more than ${item.stock} units of ${item.title}.`);
      return;
    }

    setPaymentLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_VERCEL_URI}/api/paymee/create-payment`,
        { itemId: item._id, quantity },
        { withCredentials: true }
      );

      if (response.data.error) {
        alert(`Payment error: ${response.data.error.message || 'Unknown error'}`);
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

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setPaymentStatus('timeout');
        setPaymentLoading(false);
        clearInterval(pollingInterval);
        setPollingInterval(null);
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
          clearInterval(pollingInterval);
          setPollingInterval(null);
          fetchItem();
        } else if (status.status === 'FAILED' || status.status === 'CANCELLED') {
          setPaymentStatus('failed');
          setPaymentLoading(false);
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts >= maxAttempts) {
          setPaymentStatus('timeout');
          setPaymentLoading(false);
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
      }
    };

    const interval = setInterval(poll, 5000);
    setPollingInterval(interval);
  };

  // 🔥 FIXED: STOP LOADING WHEN DIALOG CLOSES
  const closePaymentDialog = () => {
    setPaymentDialog(false);
    setIframeUrl(null);
    setPaymentToken(null);
    setPaymentStatus(null);
    setPaymentLoading(false); // 🔥 1-LINE FIX: STOP MOONLOADER!
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    if (stockPollingInterval) {
      clearInterval(stockPollingInterval);
      setStockPollingInterval(null);
    }
  };

  // Message handler
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data === 'payment_success') {
        setPaymentStatus('success');
        setPaymentLoading(false);
        fetchItem();
      } else if (event.data === 'payment_failed' || event.data === 'payment_cancelled') {
        setPaymentStatus('failed');
        setPaymentLoading(false);
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [pollingInterval]);

  // ---- NEW: Navigate to owner profile --------------------
const goToOwnerProfile = () => {
  if (item?.user?._id) {
    navigate(`/user/${item.user._id}`);
  }
};
  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12 col-md-6">
          <div className=" align-items-center mb-3">
            <img
              src={activeImage}
              className="card-img-top"
              alt={item.title}
              style={{ maxHeight: '500px', objectFit: 'contain' }}
            />
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {item.itemPics.map((pic, index) => (
                  <img
                    key={index}
                    src={pic.url || pic}
                    className="img-thumbnail"
                    style={{ width: '60px', height: '60px', cursor: 'pointer' }}
                    onClick={() => setActiveImage(pic.url || pic)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <h1 className="mb-3">{item.title}</h1>
          

{/* ----------- NEW: Owner profile link ----------- */}
<div className="d-flex align-items-center gap-2 mb-3">
  {/* <strong>Seller:</strong> */}
  <div
    className="d-flex align-items-center gap-2"
    style={{ cursor: "pointer" }}
    onClick={goToOwnerProfile}
  >
    {/* Profile picture */}
    <img
      src={item.user?.profilePic?.url || "/logo/load-violet.gif"}
      alt={`${item.user?.fName || ""} ${item.user?.lName || ""}`}
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
    {/* Full name */}
    <Typography variant="body1" sx={{ fontWeight: 500 }}>
      {item.user?.fName || ""} {item.user?.lName || ""}
    </Typography>
  </div>
</div>

          <div className="mb-3">
            <small className="text-muted">
              <strong>Price:</strong> {item.price} DT
              <br />
              <strong>Stock:</strong> {item.stock}
              {item.stock <= 2 && item.stock > 0 && <span className="text-warning"> (Low Stock!)</span>}
              {item.stock === 0 && <span className="text-danger"> (Out of Stock)</span>}
              <br />
              {/* <small className="text-muted">Updates every 30s ↻</small> */}
            </small>
          </div>
          
          {item.status === "1" && loggedUser && item.user?._id !== loggedUser._id && (
            <div className="d-flex align-items-center gap-2 mt-3">
              <div className="d-flex align-items-center">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || item.stock <= 0}
                  className="btn btn-sm btn-outline-secondary"
                >
                  -
                </button>
                <span className="mx-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => Math.min(item.stock, prev + 1))}
                  disabled={quantity >= item.stock || item.stock <= 0}
                  className="btn btn-sm btn-outline-secondary"
                >
                  +
                </button>
              </div>
              
              {/* 🔥 BUTTON READY AFTER DIALOG CLOSE */}
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleBuyItem}
                disabled={paymentLoading || item.stock <= 0}
                style={{ backgroundColor: "#713CC5", padding: "12px 24px" }}
              >
                {paymentLoading ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <MoonLoader size={20} color="#fff" />
                    <span className="ms-2">Processing...</span>
                  </div>
                ) : (
                  `Buy Now - ${item.price * quantity} DT`
                )}
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => addToCart(item._id, quantity)}
                disabled={item.stock <= 0}
                style={{ borderColor: "#713CC5", color: "#713CC5", padding: "12px 24px" }}
              >
                Add to Cart
              </Button>
            </div>
          )}
          
          {item.status === "4" && (
            <Alert severity="info" className="mt-3">
              <AlertTitle>Item Sold</AlertTitle>
              This item has already been sold.
            </Alert>
          )}
          
          <div className="row mt-4">
            <div className="col-md-6">
              <h5 className="text"><strong>Brand: </strong>{item.brand || "-"}</h5>
              <h5 className="text"><strong>Category: </strong>{item.category || "-"}</h5>
              <h5 className="text"><strong>Gender: </strong>{item.gender || "-"}</h5>
              <h5 className="text"><strong>Condition: </strong>{item.condition || "-"}</h5>
            </div>
            <div className="col-md-6">
              <h5 className="text"><strong>Age: </strong>{item.age || "-"}</h5>
              <h5 className="text"><strong>Size: </strong>{item.size || "-"}</h5>
              <h5 className="text"><strong>Previous Owners: </strong>{item.previousOwners || "-"}</h5>
            </div>
          </div>
          
          {item.tags && item.tags.length > 0 && (
            <div className="d-flex flex-wrap mt-3">
              {item.tags.map((tag, index) => (
                <Chip key={index} label={tag} color="default" sx={{ margin: 0.5 }} />
              ))}
            </div>
          )}
          
          {item.description && (
            <div className="mt-3">
              <h5><strong>Description:</strong></h5>
              <p className="text">{item.description}</p>
            </div>
          )}
          
          {item.adminComment && (
            <Alert severity="error" className="mt-3">
              <strong>Admin Comment:</strong> {item.adminComment}
            </Alert>
          )}
        </div>
      </div>
      
      {loggedUser && item.user?._id === loggedUser._id && (
        <div className="d-flex justify-content-center gap-3 p-5">
          <button className="btn btn-danger rounded" style={{ width: "120px" }}
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this item?")) {
                deleteItem(item._id);
              }
            }}
          >
            Delete
          </button>
          <button className="btn text-light rounded" style={{ backgroundColor: "#713CC5", width: "120px" }}
            onClick={() => navigate("/items/edit/" + item._id)}
          >
            Edit
          </button>
        </div>
      )}
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={closePaymentDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {paymentStatus === 'pending' ? 'Processing Payment' :
           paymentStatus === 'success' ? 'Payment Successful' :
           paymentStatus === 'failed' ? 'Payment Failed' :
           paymentStatus === 'timeout' ? 'Payment Timeout' : 'Payment'}
        </DialogTitle>
        <DialogContent>
          {iframeUrl && (
            <iframe src={iframeUrl} width="100%" height="600px" title="Payment Gateway" style={{ border: 'none' }} allow="payment" />
          )}
          {paymentStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <AlertTitle>Payment Successful</AlertTitle>
              Your payment has been processed successfully.
            </Alert>
          )}
          {paymentStatus === 'failed' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <AlertTitle>Payment Failed</AlertTitle>
              The payment was not completed. Please try again or contact support.
            </Alert>
          )}
          {paymentStatus === 'timeout' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>Payment Timeout</AlertTitle>
              The payment confirmation took too long. Please check if your payment was processed or try again.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePaymentDialog} variant="contained" style={{ backgroundColor: '#713CC5' }}>
            Close
          </Button>
          {paymentStatus === 'failed' && (
            <Button onClick={() => { closePaymentDialog(); handleBuyItem(); }}
              variant="outlined" style={{ borderColor: '#713CC5', color: '#713CC5' }}
            >
              Try Again
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ShowOne;