import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ModalReg.css";

const ModalReg = ({ open, setOpenModalLog, setOpenModalReg, setLogged }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        fName: "",
        lName: "",
        email: "",
        password: "",
        confirmPW: "",
    });
    const [errors, setErrors] = useState({
        fName: "",
        lName: "",    
        email: "",
        password: "",
        confirmPW: "",
    });
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    if (!open) return null;

    const register = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_VERCEL_URI}/api/register`,
                user,
                { withCredentials: true }
            );
            
            console.log("SERVER RESPONSE:", response.data);
            
            if (response.data.emailSent) {
                setRegistrationSuccess(true);
                setSuccessMessage(
                    `Registration successful! Please check your email (${user.email}) for verification instructions. ` +
                    `The verification link will expire in 1 hour.`
                );
            } else {
                setSuccessMessage("Registration successful! Please check your email for verification.");
            }
            
        } catch (error) {
            console.log("Error:", error.response?.data);
            let tempErrors = {};
            
            if (error.response?.data) {
                for (let key of Object.keys(error.response.data)) {
                    if (key !== 'message') {
                        tempErrors[key] = error.response.data[key].message;
                    } else {
                        tempErrors.general = error.response.data.message;
                    }
                }
            } else {
                tempErrors.general = "Registration failed. Please try again.";
            }
            
            setErrors({ ...tempErrors });
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_VERCEL_URI}/api/resend-verification`,
                { email: user.email }
            );
            
            setSuccessMessage("New verification email sent! Please check your inbox.");
        } catch (error) {
            setErrors({
                general: error.response?.data?.message || "Failed to resend verification email."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overlay">
            <div className="modalContainer p-1">
                {registrationSuccess ? (
                    <div className="d-flex flex-column gap-3 p-5 align-items-center">
                        <div className="text-center">
                            <i className="bi bi-envelope-check-fill text-success" style={{ fontSize: "3rem" }}></i>
                            <h3 className="mt-3">Check Your Email</h3>
                            <p className="text-muted">{successMessage}</p>
                        </div>
                        
                        <div className="d-flex gap-2 flex-column w-100">
                            <button
                                className="btn text-light w-100"
                                style={{ backgroundColor: "#5C2D9A" }}
                                onClick={handleResendVerification}
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Resend Verification Email"}
                            </button>
                            
                            <button
                                className="btn border w-100"
                                onClick={() => {
                                    setOpenModalReg(false);
                                    setOpenModalLog(true);
                                }}
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={register}>
                        <div className="d-flex flex-column gap-3 p-5 align-items-center">
                            <h3>Create Account</h3>
                            
                            {errors.general && (
                                <div className="alert alert-danger w-100 text-center">
                                    {errors.general}
                                </div>
                            )}
                            
                            <div className="w-100">
                                <input
                                    className="form-control"
                                    placeholder="First Name"
                                    type="text"
                                    onChange={e => setUser({ ...user, fName: e.target.value })}
                                    value={user.fName}
                                    disabled={loading}
                                    required
                                />
                                <span className="text-danger small">{errors.fName}</span>
                            </div>
                            
                            <div className="w-100">
                                <input
                                    className="form-control"
                                    placeholder="Last Name"
                                    type="text"
                                    onChange={e => setUser({ ...user, lName: e.target.value })}
                                    value={user.lName}
                                    disabled={loading}
                                    required
                                />
                                <span className="text-danger small">{errors.lName}</span>
                            </div>

                            <div className="w-100">
                                <input
                                    className="form-control"
                                    placeholder="Email"
                                    type="email"
                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    value={user.email}
                                    disabled={loading}
                                    required
                                />
                                <span className="text-danger small">{errors.email}</span>
                            </div>
                            
                            <div className="w-100">
                                <input
                                    className="form-control"
                                    placeholder="Password"
                                    type="password"
                                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                                    value={user.password}
                                    disabled={loading}
                                    required
                                    minLength={6}
                                />
                                <span className="text-danger small">{errors.password}</span>
                            </div>
                            
                            <div className="w-100">
                                <input
                                    className="form-control"
                                    placeholder="Confirm Password"
                                    type="password"
                                    onChange={(e) => setUser({ ...user, confirmPW: e.target.value })}
                                    value={user.confirmPW}
                                    disabled={loading}
                                    required
                                />
                                <span className="text-danger small">{errors.confirmPW}</span>
                            </div>
                            
                            <div className="d-flex gap-4 w-100">  
                                <button
                                    className="btn text-light w-100"
                                    style={{ backgroundColor: "#5C2D9A" }}
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Registering..." : "Register"}
                                </button>
                                
                                <button
                                    className="btn border w-100"
                                    type="button"
                                    onClick={() => {
                                        setOpenModalReg(false);
                                        setOpenModalLog(true);
                                    }}
                                    disabled={loading}
                                >
                                    Login
                                </button>
                            </div>
                        </div>
                    </form>
                )}
                
                <i 
                    className="bi bi-arrow-left-circle-fill VioletCred" 
                    style={{ cursor: "pointer", position: "absolute", top: "10px", right: "10px" }} 
                    onClick={() => setOpenModalReg(false)}
                ></i>
            </div>
        </div>
    );
};

export default ModalReg;