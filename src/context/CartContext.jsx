// CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const token  = localStorage.getItem('userToken');
    if (token) {
      setUserToken(token);
      fetchCartItems(token);
    }
  }, []);

  const fetchCartItems = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_LOCAL_URI}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const addToCart = async (itemId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_LOCAL_URI}/api/cart/add`,
        { itemId },
        {
          headers: { Authorization: `Bearer ${userToken}` },
          withCredentials: true,
        }
      );
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_LOCAL_URI}/api/cart/remove/${itemId}`,
        {
          headers: { Authorization: `Bearer ${userToken}` },
          withCredentials: true,
        }
      );
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateCartItemQuantity = async (itemId, quantity) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_LOCAL_URI}/api/cart/update/${itemId}`,
        { quantity },
        {
          headers: { Authorization: `Bearer ${userToken}` },
          withCredentials: true,
        }
      );
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
    }
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        setCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};