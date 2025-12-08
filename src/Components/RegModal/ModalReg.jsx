import React, { useState } from "react";
import "./ModalReg.css";
import { useAuth } from "../../context/AuthContex";

const ModalReg = ({ open, setOpenModalLog, setOpenModalReg }) => {
  const { register, resendVerification, loading } = useAuth();

  const [form, setForm] = useState({
    fName: "",
    lName: "",
    email: "",
    password: "",
    confirmPW: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPW, setShowConfirmPW] = useState(false);

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [msg, setMsg] = useState("");

  if (!open) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setMsg("");

    try {
      const res = await register(form);
      setSuccess(true);
      setMsg(
        res.emailSent
          ? `Check your inbox (${form.email}) – verification link expires in 1 hour.`
          : "Registration successful! Please check your email to verify."
      );
    } catch (err) {
      const data = err?.response?.data || {};
      const temp = {};
      for (const key in data) {
        if (key !== "message") {
          temp[key] = data[key].message || data[key];
        } else {
          temp.general = data.message;
        }
      }
      setErrors(temp);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification(form.email);
      setMsg("New verification email sent!");
    } catch (err) {
      setErrors({ general: err?.response?.data?.message || "Failed to resend." });
    }
  };

  return (
    <div className="overlay">
      <div className="modalContainer p-1">
        {success ? (
          <div className="d-flex flex-column gap-4 p-5 align-items-center text-center">
            <i className="bi bi-envelope-check-fill text-success" style={{ fontSize: "3.5rem" }}></i>
            <h3>Check Your Email</h3>
            <p className="text-muted px-3">{msg}</p>

            <div className="d-flex flex-column gap-3 w-100">
              <button
                className="btn text-light w-100"
                style={{ backgroundColor: "#5C2D9A" }}
                onClick={handleResend}
                disabled={loading}
              >
                {loading ? "Sending…" : "Resend Verification Email"}
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
          <form onSubmit={handleRegister}>
            <div className="d-flex flex-column gap-3 p-5 align-items-center">
              <h3>Create Account</h3>

              {errors.general && (
                <div className="alert alert-danger w-100 text-center small">{errors.general}</div>
              )}

              <div className="w-100">
                <input
                  className="form-control"
                  placeholder="First Name"
                  value={form.fName}
                  onChange={(e) => setForm({ ...form, fName: e.target.value })}
                  disabled={loading}
                  required
                />
                {errors.fName && <div className="text-danger small mt-1">{errors.fName}</div>}
              </div>

              <div className="w-100">
                <input
                  className="form-control"
                  placeholder="Last Name"
                  value={form.lName}
                  onChange={(e) => setForm({ ...form, lName: e.target.value })}
                  disabled={loading}
                  required
                />
                {errors.lName && <div className="text-danger small mt-1">{errors.lName}</div>}
              </div>

              <div className="w-100">
                <input
                  className="form-control"
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={loading}
                  required
                />
                {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
              </div>

              {/* Password Field */}
              <div className="w-100 position-relative">
                <input
                  className={`form-control pe-5 ${errors.password ? "is-invalid" : ""}`}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={loading}
                  required
                  minLength={6}
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
                  {showPassword ? <i className="bi bi-eye-slash"></i> : <i class="bi bi-eye"></i>}
                </span>
                {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
              </div>

              {/* Confirm Password Field */}
              <div className="w-100 position-relative">
                <input
                  className={`form-control pe-5 ${errors.confirmPW ? "is-invalid" : ""}`}
                  placeholder="Confirm Password"
                  type={showConfirmPW ? "text" : "password"}
                  value={form.confirmPW}
                  onChange={(e) => setForm({ ...form, confirmPW: e.target.value })}
                  disabled={loading}
                  required
                />
                <span
                  onClick={() => setShowConfirmPW(!showConfirmPW)}
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
                  {showConfirmPW ? <i class="bi bi-eye-slash"></i> : <i class="bi bi-eye"></i>}
                </span>
                {errors.confirmPW && <div className="text-danger small mt-1">{errors.confirmPW}</div>}
              </div>

              <div className="d-flex gap-4 w-100 mt-3">
                <button
                  className="btn text-light w-100"
                  style={{ backgroundColor: "#5C2D9A" }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Creating Account…" : "Register"}
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
          className="bi bi-x-circle-fill"
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            fontSize: "2rem",
            color: "#5C2D9A",
            cursor: "pointer",
          }}
          onClick={() => setOpenModalReg(false)}
        ></i>
      </div>
    </div>
  );
};

export default ModalReg;