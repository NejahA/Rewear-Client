import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_VERCEL_URI;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  // Fetch logged-in user from /api/users/logged
  const fetchMe = async () => {
    try {
      const { data } = await axiosInstance.get("/api/users/logged");
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await axiosInstance.post("/api/login", { email, password });
      await fetchMe();
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ fName, lName, email, password, confirmPW }) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/api/register", {
        fName,
        lName,
        email,
        password,
        confirmPW,
      });
      await fetchMe(); // optional: auto-login after register
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await axiosInstance.post("/api/logout");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email) => {
    await axiosInstance.post("/api/resend-verification", { email });
  };

  const forgotPassword = async (email) => {
    await axiosInstance.post("/api/forgot-password", { email });
  };

  const resetPassword = async (token, password, confirmPW) => {
    await axiosInstance.post(`/api/reset-password/${token}`, {
      password,
      confirmPW,
    });
  };

  const refreshUser = async () => {
    await fetchMe();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        login,
        register,
        logout,
        resendVerification,
        forgotPassword,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};