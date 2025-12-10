import React, { useState } from "react";
import "./ModalLog.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ModalLog0 = ({ open, setOpenModalLog, setOpenModalReg, setLogged }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({ email: "", password: "" });
    const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const login = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('' + import.meta.env.VITE_LOCAL_URI + '/api/login', user,
                { withCredentials: true }
            )
            console.log('SERVER RESPONSE:', response.data)
            setLogged(true)
            console.log('TOKEN RESPONSE:', response.data.token)
            setOpenModalLog(false)
            navigate('/')
        } catch (error) {
            console.log("Error:", error.response.data);
            let tempErrors = {}
            for (let key of Object.keys(error.response.data)) {
                console.log(key, '------', error.response.data[key].message);
                tempErrors[key] = error.response.data[key].message
            }
            setErrors({ ...tempErrors })
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!forgotPasswordEmail) {
                setForgotPasswordMessage("Please enter your email address");
                return;
            }

            const response = await axios.post(
                `${import.meta.env.VITE_VERCEL_URI}/api/forgot-password`,
                { email: forgotPasswordEmail }
            ).then(res => {
                setForgotPasswordMessage("Password reset instructions have been sent to your email");
                console.log(res.data)});

            
        } catch (error) {
            setForgotPasswordMessage(
                error.response?.data?.message || "An error occurred. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overlay">
            <div className="modalContainer p-1">
                {forgotPasswordMode ? (
                    <form onSubmit={handleForgotPassword} className="d-flex justify-content-center">
                        <div className="d-flex flex-column gap-3 p-5 align-items-center">
                            <h3>Reset Password</h3>
                            
                            <div className="">
                                <input
                                    className="form-control"
                                    placeholder="Enter your email"
                                    type="email"
                                    value={forgotPasswordEmail}
                                    onChange={e => setForgotPasswordEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            
                            {forgotPasswordMessage && (
                                <div className={forgotPasswordMessage.includes("sent") ? "text-success" : "text-danger"}>
                                    {forgotPasswordMessage}
                                </div>
                            )}
                            
                            <div className="d-flex gap-4">
                                <button
                                    className="btn text-light w-100 mt-3"
                                    style={{ backgroundColor: "#5C2D9A" }}
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send Reset Instructions"}
                                </button>
                                
                                <button 
                                    className="btn border w-100 mt-3"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setForgotPasswordMode(false);
                                    }}
                                    disabled={loading}
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={login} className="d-flex justify-content-center">
                        <div className="d-flex flex-column gap-3 p-5 align-items-center">
                            <div className="">
                                <input
                                    className="form-control"
                                    placeholder="Email"
                                    type="email"
                                    onChange={e => setUser({ ...user, email: e.target.value })}
                                    value={user.email}
                                    disabled={loading}
                                />
                                <span className="text-danger">{errors.email}</span>
                            </div>
                            <div className="">
                                <input
                                    className="form-control"
                                    placeholder="Password"
                                    type="password"
                                    onChange={e => setUser({ ...user, password: e.target.value })}
                                    value={user.password}
                                    disabled={loading}
                                />
                                <span className="text-danger">{errors.password}</span>
                            </div>
                            
                            <a 
                                href="#" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    setForgotPasswordMode(true);
                                }}
                                style={{display: 'block', textAlign: 'right', marginBottom: '10px'}}
                            >
                                Forgot Password?
                            </a>
                            
                            <div className="d-flex gap-4">
                                <button
                                    className="btn text-light w-100 mt-3"
                                    style={{ backgroundColor: "#5C2D9A" }}
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Logging in..." : "Log In"}
                                </button>
                                <button 
                                    className="btn border w-100 mt-3" 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setOpenModalLog(false);
                                        setOpenModalReg(true);
                                    }}
                                    disabled={loading}
                                >
                                    Register
                                </button>
                            </div>
                        </div>
                    </form>
                )}
                
                <i 
                    className="bi bi-arrow-left-circle-fill VioletCred mt-2 fw-bold " 
                    style={{ cursor: "pointer" }} 
                    onClick={(e) => setOpenModalLog(false)}
                ></i>
            </div>
        </div>
    );
};

export default ModalLog0;