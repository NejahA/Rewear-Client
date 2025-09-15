import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./VerifyEmail.css"; // Optional CSS file for styling

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState("verifying"); // verifying, success, error
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                setLoading(true);
                const response = await axios.post(
                    `${import.meta.env.VITE_VERCEL_URI}/api/verify-email/${token}`,
                    {},
                    { withCredentials: true }
                );

                if (response.data.valid) {
                    setVerificationStatus("success");
                    setMessage(response.data.message || "Email verified successfully! Welcome to Reweard!");
                    
                    // Start countdown for automatic redirect
                    const timer = setInterval(() => {
                        setCountdown(prev => {
                            if (prev <= 1) {
                                clearInterval(timer);
                                navigate("/");
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);
                } else {
                    setVerificationStatus("error");
                    setMessage(response.data.message || "Email verification failed.");
                }
            } catch (error) {
                console.error("Verification error:", error);
                setVerificationStatus("error");
                setMessage(
                    error.response?.data?.message || 
                    "Invalid or expired verification link. Please request a new verification email."
                );
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            verifyEmail();
        } else {
            setVerificationStatus("error");
            setMessage("No verification token provided.");
            setLoading(false);
        }
    }, [token, navigate]);

    const handleResendVerification = async () => {
        try {
            setLoading(true);
            // This would typically require the user to enter their email
            // For now, we'll show a message to register again or contact support
            setMessage("Please register again or contact support for a new verification link.");
        } catch (error) {
            setMessage("Failed to process your request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenApp = () => {
        // Deep link to open the mobile app
        window.location.href = `reweard://verify-email?token=${token}`;
        
        // Fallback: redirect to home after a delay if app doesn't open
        setTimeout(() => {
            navigate("/");
        }, 2000);
    };

    if (loading) {
        return (
            <div className="verify-email-container">
                <div className="verify-email-card">
                    <div className="loading-spinner">
                        <i className="bi bi-arrow-repeat bi-spin" style={{ fontSize: "3rem" }}></i>
                    </div>
                    <h2>Verifying Your Email</h2>
                    <p>Please wait while we verify your email address...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                {verificationStatus === "success" ? (
                    <>
                        <div className="success-icon">
                            <i className="bi bi-check-circle-fill" style={{ fontSize: "4rem", color: "#28a745" }}></i>
                        </div>
                        <h2>Email Verified Successfully! 🎉</h2>
                        <p className="success-message">{message}</p>
                        
                        {/* <div className="action-buttons">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleOpenApp}
                                style={{ backgroundColor: "#5C2D9A", border: "none" }}
                            >
                                <i className="bi bi-phone me-2"></i>
                                Open in Mobile App
                            </button>
                            
                            <Link to="/" className="btn btn-outline-secondary btn-lg">
                                <i className="bi bi-house me-2"></i>
                                Go to Homepage
                            </Link>
                        </div> */}

                        <div className="countdown-message mt-3">
                            <small className="text-muted">
                                Redirecting to homepage in {countdown} seconds...
                            </small>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="error-icon">
                            <i className="bi bi-exclamation-circle-fill" style={{ fontSize: "4rem", color: "#dc3545" }}></i>
                        </div>
                        <h2>Verification Failed</h2>
                        <p className="error-message">{message}</p>
                        
                        <div className="action-buttons">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                <i className="bi bi-person-plus me-2"></i>
                                Register Again
                            </Link>
                            
                            <Link to="/login" className="btn btn-outline-secondary btn-lg">
                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                Try Login
                            </Link>
                            
                            {verificationStatus === "error" && (
                                <button
                                    className="btn btn-outline-primary btn-lg"
                                    onClick={handleResendVerification}
                                    disabled={loading}
                                >
                                    <i className="bi bi-envelope me-2"></i>
                                    {loading ? "Processing..." : "Request New Link"}
                                </button>
                            )}
                        </div>

                        {/* <div className="support-contact mt-4">
                            <p className="text-muted">
                                Need help? Contact support at{" "}
                                <a href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL || 'support@reweard.com'}`}>
                                    {import.meta.env.VITE_SUPPORT_EMAIL || 'support@reweard.com'}
                                </a>
                            </p>
                        </div> */}
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;