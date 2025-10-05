// Cart.jsx
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
const Cart = () => {
  const { cartItems, setCartItems, removeFromCart } = useContext(CartContext);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch cart items on component mount
    const fetchCartItems = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_VERCEL_URI}/api/cart`, {
          withCredentials: true,
        });
        
        console.log("Cart response:", response.data);
        
        // The backend returns cart with structure: { items: [{item: {...}, _id: ...}], totalAmount: ... }
        if (response.data && response.data.items) {
          setCartItems(response.data.items);
          setTotalAmount(response.data.totalAmount || 0);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        if (error.response?.status === 404) {
          // Cart not found, set empty cart
          setCartItems([]);
          setTotalAmount(0);
        }
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [setCartItems]);

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      // Refresh cart after removal
      const response = await axios.get(`${import.meta.env.VITE_VERCEL_URI}/api/cart`, {
        withCredentials: true,
      });
      if (response.data && response.data.items) {
        setCartItems(response.data.items);
        setTotalAmount(response.data.totalAmount || 0);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_VERCEL_URI}/api/cart/checkout`,
        {},
        { withCredentials: true }
      );
      alert("Checkout successful!");
      setCartItems([]);
      setTotalAmount(0);
      console.log("Order:", response.data.order);
    } catch (error) {
      console.error("Error during checkout:", error);
      alert(error.response?.data?.message || "Checkout failed");
    }
  };

  if (loading) {
    return (
      <div className="container my-5">
        <h2 className="mb-4">Shopping Cart</h2>
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Shopping Cart</h2>
      {!cartItems || cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((cartItem) => (
                <tr key={cartItem._id}>
                  <td>{cartItem.item?.title || 'Unknown Item'}</td>
                  <td>{cartItem.item?.price || 0} DT</td>
                  <td>
                    <button 
                      onClick={() => handleRemoveItem(cartItem.item._id)} 
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between align-items-center">
            <h4>Total: {totalAmount} DT</h4>
            <button className="btn btn-primary" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;