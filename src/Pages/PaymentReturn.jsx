import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentReturn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const success = searchParams.get('success');
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      // Check if opened from the mobile app
      const fromApp = searchParams.get('from') === 'app';
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      
      // Detect if it's a mobile device
      const isMobile = /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());

      if (isMobile || fromApp) {
        // Try to redirect to the native app
        const appScheme = 'rewear://'; // Your app's custom scheme
        const expoScheme = 'exp://'; // Expo Go scheme
        
        // Construct the deep link with payment result
        // const deepLinkPath = success === 'True' ? 'payment-success' : 'payment-failed';
        const deepLinkPath = "home";
        
        // Try app deep link first
        const rewearDeepLink = `${appScheme}${deepLinkPath}`;
        const expoDeepLink = `${expoScheme}${deepLinkPath}`;
        
        // Function to attempt app opening
        const tryOpenApp = (url, timeout = 2000) => {
          return new Promise((resolve) => {
            const start = Date.now();
            
            // Create a hidden iframe to trigger the deep link
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            
            // Set a timeout to check if app opened
            const timer = setTimeout(() => {
              const elapsed = Date.now() - start;
              document.body.removeChild(iframe);
              
              // If we're still here after timeout, app probably didn't open
              if (elapsed < timeout + 100) {
                resolve(false);
              } else {
                resolve(true);
              }
            }, timeout);

            // Listen for blur event (app might have opened)
            const onBlur = () => {
              clearTimeout(timer);
              document.body.removeChild(iframe);
              window.removeEventListener('blur', onBlur);
              resolve(true);
            };
            
            window.addEventListener('blur', onBlur);
          });
        };

        // Try to open the app
        let appOpened = false;

        // Try Rewear app first
        try {
          window.location.href = rewearDeepLink;
          await new Promise(resolve => setTimeout(resolve, 1500));
          




          // Check if still on the page (app didn't open) expo part
          // if (document.hasFocus()) {
          //   // Try Expo Go as fallback
          //   window.location.href = expoDeepLink;
          //   await new Promise(resolve => setTimeout(resolve, 1500));
          // } else {
          //   appOpened = true;
          // }




        } catch (error) {
          console.log('Error opening app:', error);
        }

        // If app didn't open and we're in a popup, close it
        if (!appOpened && window.opener) {
          window.close();
          return;
        }

        // If app didn't open and not a popup, fallback to web navigation
        if (!appOpened) {
          setRedirecting(false);
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      } else {
        // Desktop or web browser - use normal navigation
        if (window.opener) {
          // If opened in popup, close it
          window.close();
        } else {
          // Otherwise redirect to home
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }
      }
    };

    handleRedirect();
  }, [navigate, success, searchParams]);

  return (
    <div className="container my-5">
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        {redirecting ? (
          <>
            <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h2 className="mb-3">Processing Payment Result...</h2>
            <p className="text-muted">Redirecting you back to the app...</p>
          </>
        ) : (
          <>
            <h1 className="mb-4">Payment Result</h1>
            {success === 'True' ? (
              <div className="alert alert-success" role="alert" style={{ maxWidth: '500px', width: '100%' }}>
                <h4 className="alert-heading">Success!</h4>
                <p>Your payment was successful! Thank you for your purchase.</p>
                <hr />
                <p className="mb-0">Redirecting to homepage...</p>
              </div>
            ) : (
              <div className="alert alert-danger" role="alert" style={{ maxWidth: '500px', width: '100%' }}>
                <h4 className="alert-heading">Payment Failed</h4>
                <p>Your payment was cancelled or failed. Please try again.</p>
                <hr />
                <p className="mb-0">Redirecting to homepage...</p>
              </div>
            )}
            {/* <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/')}
            >
              Go to Homepage Now
            </button> */}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentReturn;