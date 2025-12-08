import React, { useState } from "react";
import "./ModalLog.css";
import { useAuth } from "../../context/AuthContex";

const ModalLog = ({ open, setOpenModalLog, setOpenModalReg }) => {
  const { login, resendVerification, forgotPassword, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setEmailNotVerified(false);
    setForgotMsg("");

    try {
      await login(email, password);
      setOpenModalLog(false);
    } catch (err) {
      const data = err?.response?.data;

      if (data?.emailVerified === false) {
        setUnverifiedEmail(email);
        setEmailNotVerified(true);
        return;
      }

      const temp = {};
      if (data) {
        for (const key of Object.keys(data)) {
          if (key !== "message") {
            temp[key] = data[key].message || data[key];
          }
        }
      }
      setErrors(temp);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification(unverifiedEmail);
      setForgotMsg("New verification email sent!");
      setEmailNotVerified(false);
    } catch (err) {
      setForgotMsg(err?.response?.data?.message || "Failed to resend.");
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotMsg("Please enter your email.");
      return;
    }
    try {
      await forgotPassword(forgotEmail);
      setForgotMsg("Reset instructions sent to your email.");
    } catch (err) {
      setForgotMsg(err?.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="overlay">
      <div className="modalContainer p-1">
        {forgotMode ? (
          <form onSubmit={handleForgot} className="d-flex justify-content-center">
            <div className="d-flex flex-column gap-3 p-5 align-items-center">
              <h3>Reset Password</h3>

              <div className="w-100">
                <input
                  className="form-control"
                  placeholder="Enter your email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              {forgotMsg && (
                <div className={forgotMsg.includes("sent") ? "text-success" : "text-danger"}>
                  {forgotMsg}
                </div>
              )}

              <div className="d-flex gap-4 w-100">
                <button
                  className="btn text-light w-100"
                  style={{ backgroundColor: "#5C2D9A" }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>

                <button
                  className="btn border w-100"
                  onClick={(e) => {
                    e.preventDefault();
                    setForgotMode(false);
                    setForgotMsg("");
                  }}
                  disabled={loading}
                >
                  Back to Login
                </button>
              </div>
            </div>
          </form>
        ) : emailNotVerified ? (
          <div className="d-flex flex-column gap-4 p-5 align-items-center text-center">
            <i className="bi bi-envelope-exclamation-fill text-warning" style={{ fontSize: "3.5rem" }}></i>
            <h3>Email Not Verified</h3>
            <p className="text-muted">
              Please verify <strong>{unverifiedEmail}</strong> before logging in.
            </p>

            <div className="d-flex gap-3 w-100">
              <button
                className="btn text-light w-100"
                style={{ backgroundColor: "#5C2D9A" }}
                onClick={handleResend}
                disabled={loading}
              >
                {loading ? "Sending…" : "Resend Verification"}
              </button>
              <button
                className="btn border w-100"
                onClick={() => setEmailNotVerified(false)}
                disabled={loading}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="d-flex justify-content-center">
            <div className="d-flex flex-column gap-3 p-5 align-items-center">
              <h3>Login</h3>

              <div className="w-100 position-relative">
                <input
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
                {errors.email && <div className="invalid-feedback d-block small">{errors.email}</div>}
              </div>

              <div className="w-100 position-relative">
                <input
                  className={`form-control pe-5 ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#5C2D9A",
                    fontSize: "1.2rem",
                    zIndex: 10,
                  }}
                >
                  {showPassword ? <i className="bi bi-eye-slash"></i> : <i className="bi bi-eye"></i>}
                </span>
                {errors.password && <div className="invalid-feedback d-block small">{errors.password}</div>}
              </div>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setForgotMode(true);
                }}
                className="text-decoration-none"
                style={{ width: "100%", textAlign: "right", color: "#5C2D9A", margin: "8px 0" }}
              >
                Forgot Password?
              </a>

              <div className="d-flex gap-4 w-100">
                <button
                  className="btn text-light w-100"
                  style={{ backgroundColor: "#5C2D9A" }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in…" : "Log In"}
                </button>

                <button
                  className="btn border w-100"
                  type="button"
                  onClick={() => {
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
          className="bi bi-x-circle-fill"
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            fontSize: "2rem",
            color: "#5C2D9A",
            cursor: "pointer",
          }}
          onClick={() => {
            setOpenModalLog(false);
            setForgotMode(false);
            setEmailNotVerified(false);
          }}
        ></i>
      </div>
    </div>
  );
};

export default ModalLog;