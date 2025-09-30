import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const success = searchParams.get('success');

  useEffect(() => {
    // Close the popup window
    if (window.opener) {
      window.close();
    }

    // Redirect to the homepage
    navigate('/');
  }, [navigate, success]);

  return (
    <div className="container my-5">
      <h1>Payment Result</h1>
      {success === 'true' ? (
        <div className="alert alert-success" role="alert">
          Your payment was successful! Thank you for your purchase.
        </div>
      ) : (
        <div className="alert alert-danger" role="alert">
          Your payment was cancelled or failed. Please try again.
        </div>
      )}
    </div>
  );
};

export default PaymentReturn;