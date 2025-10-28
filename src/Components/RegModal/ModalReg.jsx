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
          ? `Check your inbox (${form.email}) – link link expires in 1 hour.`
          : "Registration complete – please verify your email."
      );
    } catch (err) {
      const data = err?.response?.data;
      const temp = {};

      if (data) {
        for (const key of Object.keys(data)) {
          if (key !== "message") {
            temp[key] = data[key].message;
          } else {
            temp.general = data.message;
          }
        }
      } else {
        temp.general = "Registration failed.";
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
          <div className="d-flex flex-column gap-3 p-5 align-items-center">
            <div className="text-center">
              <i className="bi bi-envelope-check-fill text-success" style={{ fontSize: "3rem" }}></i>
              <h3 className="mt-3">Check Your Email</h3>
              <p className="text-muted">{msg}</p>
            </div>

            <div className="d-flex gap-2 flex-column w-100">
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
                <div className="alert alert-danger w-100 text-center">{errors.general}</div>
              )}

              <div className="w-100">
                <input
                  className="form-control"
                  placeholder="First Name"
                  type="text"
                  value={form.fName}
                  onChange={(e) => setForm({ ...form, fName: e.target.value })}
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
                  value={form.lName}
                  onChange={(e) => setForm({ ...form, lName: e.target.value })}
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
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                  value={form.confirmPW}
                  onChange={(e) => setForm({ ...form, confirmPW: e.target.value })}
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
                  {loading ? "Registering…" : "Register"}
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