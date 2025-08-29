import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Chip } from "@mui/material";
import { MoonLoader } from "react-spinners";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

const ShowOne = () => {
  const [item, setItem] = useState({
    title: "",
    category: "",
    brand: "",
    size: "",
    description: "",
    price: "",
  });
  const [activeImage, setActiveImage] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    setItem({
      title: "-",
      category: "-",
      brand: "-",
      size: "-",
      description: "-",  
      price: "-",
      category: "-",
      previousOwners: "-",
      gender: "-",
      condition: "-",
      age: "-",
      user: {fName:"loading",profilePic:{url:"/logo/load-violet.gif"}}
    });
    
    axios
      .get(""+import.meta.env.VITE_VERCEL_URI+"/api/items/" + id, {})
      .then((res) => {
        const fetchedItem = res.data;
        setItem(fetchedItem);
        setActiveImage(
          res.data.itemPics[0].url
            ? res.data.itemPics[0].url
            : res.data.itemPics[0]
        );
      })
      .catch((err) => console.log(err));

    axios
      .get(""+import.meta.env.VITE_VERCEL_URI+"/api/users/logged", {
        withCredentials: true,
      })
      .then((res) => {
        const user = res.data;
        setLoggedUser(user);
      })
      .catch((err) => console.log(err));

    // Cleanup polling on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [id]);

  const deleteItem = (itemId) => {
    axios
      .delete(""+import.meta.env.VITE_VERCEL_URI+"/api/items/" + itemId, {
        withCredentials: true,
      })
      .then((response) => {
        navigate("/");
      })
      .catch((error) => console.log(error));
  };

 const handleBuyItem = async () => {
  if (!loggedUser) {
    navigate("/login");
    return;
  }

  setPaymentLoading(true);
  
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_VERCEL_URI}/api/paymee/create-payment`,
      {
        itemId: item._id,
        quantity: 1
      },
      {
        withCredentials: true,
      }
    );

    if (response.data.error) {
      alert(`Payment error: ${response.data.error.detail || response.data.error.message}`);
      setPaymentLoading(false);
      return;
    }

    const { paymentUrl, token } = response.data;
    
    // ✅ FIX: Check if paymentUrl is valid before opening
    if (!paymentUrl || !paymentUrl.startsWith('http')) {
      throw new Error('Invalid payment URL received');
    }

    // ✅ FIX: Handle popup blockers gracefully
    let paymeeWindow = null;
    try {
      paymeeWindow = window.open(paymentUrl, '_blank', 'width=600,height=700');
      
      // Check if popup was blocked
      if (!paymeeWindow || paymeeWindow.closed || typeof paymeeWindow.closed === 'undefined') {
        // Popup was blocked, redirect current tab
        window.location.href = paymentUrl;
        return; // Stop further execution since we're redirecting
      }
    } catch (popupError) {
      // Fallback: redirect current tab if popup fails
      window.location.href = paymentUrl;
      return;
    }
    
    // Only show dialog and start polling if popup opened successfully
    setPaymentDialog(true);
    setPaymentStatus('pending');
    startPaymentPolling(token, paymeeWindow);
    
  } catch (error) {
    console.error('Payment initiation failed:', error);
    alert('Failed to initiate payment. Please try again.');
    setPaymentStatus('error');
    setPaymentLoading(false);
  }
};

  const startPaymentPolling = (token, paymeeWindow) => {
  let attempts = 0;
  const maxAttempts = 30; // 2.5 minutes (5 seconds * 30)
  let pollInterval = null;

  const poll = async () => {
    if (attempts >= maxAttempts) {
      // Timeout reached
      setPaymentStatus('timeout');
      setPaymentLoading(false);
      if (pollInterval) clearInterval(pollInterval);
      if (paymeeWindow && !paymeeWindow.closed) paymeeWindow.close();
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
        // Payment successful
        setPaymentStatus('success');
        setPaymentLoading(false);
        if (paymeeWindow && !paymeeWindow.closed) paymeeWindow.close();
        if (pollInterval) clearInterval(pollInterval);
        
        // Refresh item data
        setTimeout(() => {
          axios.get(`${import.meta.env.VITE_VERCEL_URI}/api/items/${id}`, {})
            .then((res) => setItem(res.data))
            .catch(err => console.error('Error refreshing item:', err));
        }, 2000);
        
      } else if (status.status === 'CANCELED' || status.status === 'FAILED') {
        // Payment failed
        setPaymentStatus('failed');
        setPaymentLoading(false);
        if (pollInterval) clearInterval(pollInterval);
        if (paymeeWindow && !paymeeWindow.closed) paymeeWindow.close();
      }
      // Continue polling if still pending
    } catch (error) {
      console.error('Polling error:', error);
      // Don't stop on individual errors, continue polling
    }
  };

  // Poll every 5 seconds
  pollInterval = setInterval(poll, 5000);
  setPollingInterval(pollInterval);
  
  // Initial poll
  poll();
};

  const closePaymentDialog = () => {
    setPaymentDialog(false);
    setPaymentStatus(null);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const capitalizeFirstLetter = (inputString) => {
    if (inputString && typeof inputString === "string" && inputString.length > 0) {
      return inputString.charAt(0).toUpperCase() + inputString.slice(1);
    }
    return "";
  };

  const formattedTitle = capitalizeFirstLetter(item.title);

  return (
    <div className="container my-5">
      {/* Payment Status Dialog */}
      <Dialog open={paymentDialog} onClose={closePaymentDialog}>
  <DialogTitle>
    {paymentStatus === 'pending' ? 'Processing Payment' : 
     paymentStatus === 'success' ? 'Payment Successful' :
     paymentStatus === 'failed' ? 'Payment Failed' :
     paymentStatus === 'timeout' ? 'Payment Timeout' : 'Payment Status'}
  </DialogTitle>
  <DialogContent>
    {paymentStatus === 'pending' && (
      <div className="text-center">
        <MoonLoader size={30} color="#8356C0" />
        <Typography variant="body1" className="mt-2">
          Waiting for payment confirmation...
        </Typography>
        <Typography variant="body2" color="textSecondary" className="mt-1">
          Please complete the payment in the opened window
        </Typography>
        <Typography variant="caption" display="block" className="mt-2">
          If the payment window didn't open,{" "}
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              window.location.reload();
            }}
            style={{ color: '#713CC5', textDecoration: 'underline' }}
          >
            click here to try again
          </a>
        </Typography>
      </div>
    )}
    
    {paymentStatus === 'success' && (
      <Alert severity="success">
        <AlertTitle>Payment Successful!</AlertTitle>
        Your purchase has been completed successfully. The item will be shipped soon.
      </Alert>
    )}
    
    {paymentStatus === 'failed' && (
      <Alert severity="error">
        <AlertTitle>Payment Failed</AlertTitle>
        The payment was cancelled or failed. Please try again.
      </Alert>
    )}
    
    {paymentStatus === 'timeout' && (
      <Alert severity="warning">
        <AlertTitle>Payment Timeout</AlertTitle>
        The payment confirmation took too long. Please check your email for confirmation or contact support.
      </Alert>
    )}
    
    {paymentStatus === 'error' && (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        Something went wrong with the payment processing. Please try again later.
      </Alert>
    )}
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={closePaymentDialog}
      variant="contained"
      style={{ backgroundColor: '#713CC5' }}
    >
      {paymentStatus === 'success' ? 'Continue Shopping' : 'Close'}
    </Button>
    
    {paymentStatus === 'failed' && (
      <Button 
        onClick={() => {
          closePaymentDialog();
          handleBuyItem();
        }}
        variant="outlined"
        style={{ borderColor: '#713CC5', color: '#713CC5' }}
      >
        Try Again
      </Button>
    )}
  </DialogActions>
</Dialog> 
      <div className="row p-5 border">
        {/* Images Section (Left) */}
        <div className="col-md-7">
          {activeImage ? (
            <img
              src={activeImage.url ? activeImage.url : activeImage}
              alt=""
              style={{
                width: "688.828px",
                height: "673.625px",
                cursor: "pointer",
                objectFit: "cover",
              }}
              className="mb-3"
            />
          ) : (
            <MoonLoader className="mx-2" size={200} color="#8356C0" />
          )}
          <div className="d-flex flex-row gap-3">
            {item && item.itemPics && item.itemPics.map((image, idx) => (
              <img
                key={idx}
                src={image.url ? image.url : image}
                style={{
                  width: "100px",
                  height: "70px",
                  cursor: "pointer",
                  objectFit: "cover",
                }}
                alt=""
                className="rounded-md cursor-pointer mr-1"
                onClick={() => setActiveImage(image)}
              />
            ))}
          </div>
        </div>

        {/* Details Section (Right) */}
        <div className="col-5 ps-5">
          <div className="d-flex flex-column gap-3">
            <div
              className="gap-2 d-flex"
              onClick={() => navigate(item?.user?._id && "/user/" + item.user._id)}
            >
              <img
                style={{ borderRadius: "20%", width: "50px" }}
                src={item?.user?.profilePic?.url || ""}
                alt="profilePic"
              />
              <p style={{ color: "grey", cursor: "pointer" }}>
                {item?.user?.fName}
              </p>
            </div>
            
            <div>
              <h1 className="text d-flex">
                <strong className="col-7">{formattedTitle}</strong>
              </h1>
            </div>

            <h1 className="text">
              <div className="d-flex justify-content-between">
                <strong className="d-block gap-3">{item.price} DT</strong>
                <strong className={`d-block statuscl-${item.status} gap-3`}>
                  {item.status === "0" ? "Pending" :
                   item.status === "1" ? "For Sale" :
                   item.status === "2" ? "Rejected" :
                   item.status === "4" ? "Sold" : ""}
                </strong>
              </div>
            </h1>

            {/* Buy Button - Only show if item is for sale and user is not the owner */}
            {item.status === "1" && loggedUser && item.user && item.user._id !== loggedUser._id && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleBuyItem}
                disabled={paymentLoading}
                style={{ backgroundColor: "#713CC5", padding: "12px 24px" }}
              >
                {paymentLoading ? (
                  <>
                    <MoonLoader size={20} color="#fff" />
                    <span className="ms-2">Processing...</span>
                  </>
                ) : (
                  `Buy Now - ${item.price} DT`
                )}
              </Button>
            )}

            {/* Show sold message if item is sold */}
            {item.status === "4" && (
              <Alert severity="info">
                <AlertTitle>Item Sold</AlertTitle>
                This item has already been sold.
              </Alert>
            )}

            <h5 className="text">
              <strong>Brand : </strong>
              {item.brand}
            </h5>

            <div className="d-flex flex-row justify-content-between">
              <div className="d-flex flex-column gap-3">
                <h5 className="text">
                  <strong>Category : </strong>
                  {item.category}
                </h5>
                <h5 className="text">
                  <strong>Gender : </strong>
                  {item.gender}
                </h5>
                <h5 className="text">
                  <strong>Condition : </strong>
                  {item.condition}
                </h5>
              </div>

              <div className="d-flex flex-column gap-3">
                <h5 className="text">
                  <strong>Age : </strong>
                  {item.age}
                </h5>
                <h5 className="text">
                  <strong>Size : </strong>
                  {item.size}
                </h5>
                <h5 className="text">
                  <strong>Previous Owners : </strong>
                  {item.previousOwners}
                </h5>
              </div>
            </div>

            <div className="d-flex flex-wrap">
              {item?.tags?.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  color="default"
                  sx={{ margin: 0.5 }}
                />
              ))}
            </div>

            <p className="text">{item.description}</p>
          </div>

          {item?.adminComment && (
            <Alert severity="error">
              {item.adminComment}
            </Alert>
          )}
        </div>
      </div>

      {/* Owner Actions */}
      {loggedUser && item.user && item.user._id === loggedUser._id ? (
        <div className="d-flex justify-content-between p-5 m-5">
          <button
            className="btn btn-danger rounded w-25"
            onClick={() => deleteItem(item._id)}
          >
            Delete
          </button>
          <button
            className="btn rounded text-light w-25"
            style={{ backgroundColor: "#713CC5" }}
            onClick={() => navigate("/items/edit/" + item._id)}
          >
            Edit
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ShowOne;