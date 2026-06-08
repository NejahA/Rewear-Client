import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContex';
// import { useAuth } from '../context/AuthContext';

const ItemCard = ({
  item,
  setOpenModalLog,
  setOpenModalReg,
  // userId, fName, lName, profilePic  ← remove if unused
}) => {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { isLoggedIn, loggedId } = useAuth();

  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(false); // wishlist heart
  const isOwnItem = isLoggedIn && loggedId === item.user;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setOpenModalLog(true);
      return;
    }
    addToCart(item._id);
  };
  const handleShowProduct = () => {
    if (!isLoggedIn) {
      setOpenModalLog(true);
      return;
    }
    navigate(`/items/${item._id}`);
  };
  const firstImage = item?.itemPics?.[0]?.url || '/placeholder-clothing.jpg';
  return (
    <div
      className="card-modern h-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? '0 22px 44px rgba(0,0,0,0.12)'
          : '0 8px 24px rgba(0,0,0,0.06)',
        border: 'none',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#fff',
      }}
    >
      {/* ─── Image Area ──────────────────────────────────────── */}
      <div
        className="position-relative overflow-hidden"
        style={{
          paddingTop: '100%', // square → change to 133% for portrait fashion
          background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)',
        }}
      >
        <img
          src={firstImage}
          alt={item.title}
          loading="lazy"
          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
          style={{
            transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isHovered ? 'scale(1.09)' : 'scale(1.02)',
          }}
        />

        {/* Gradient overlay on hover */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: isHovered
              ? 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.18) 100%)'
              : 'transparent',
            transition: 'background 0.4s ease',
          }}
        />

        {/* Top-left cart button – appears on hover or always for logged-in */}
        {!isOwnItem && (
          <button
            onClick={handleAddToCart}
            className="btn-cart position-absolute top-0 start-0 m-3 d-flex align-items-center justify-content-center"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: isHovered || !isHovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.88)',
              border: '1px solid rgba(0,0,0,0.08)',
              backdropFilter: 'blur(8px)',
              transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.92)',
              opacity: isHovered ? 1 : 0.4,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <i
              className="bi bi-cart-plus-fill"
              style={{ fontSize: '1.3rem', color: '#5C2D9A' }}
            />
          </button>
        )}
        {/* Heart (wishlist) – top right */}
        {/* <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked((prev) => !prev);
            // TODO: call real wishlist API
          }}
          className="position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(0,0,0,0.07)',
            backdropFilter: 'blur(6px)',
            transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.9)',
            opacity: isHovered ? 1 : 0,
            transition: 'all 0.32s ease',
          }}
        >
          <i
            className={liked ? 'bi bi-heart-fill' : 'bi bi-heart'}
            style={{
              fontSize: '1.25rem',
              color: liked ? '#e74c3c' : '#555',
              transition: 'transform 0.2s',
            }}
          />
        </button> */}
      </div>
      {/* ─── Content ─────────────────────────────────────────── */}
      <div className="card-body d-flex flex-column p-4">
        <h6
          className="card-title mb-2 fw-semibold text-dark"
          style={{
            fontSize: '1.05rem',
            lineHeight: '1.35',
            minHeight: '2.7rem',
          }}
          title={item.title}
        >
          {item.title}
        </h6>

        <div className="d-flex align-items-baseline gap-2 mb-3">
          <span className="fw-bold fs-5" style={{ color: '#1a1a1a' }}>
            {item.price} DT
          </span>
          {item.originalPrice && (
            <span className="text-muted text-decoration-line-through small">
              {item.originalPrice} DT
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="d-flex flex-wrap gap-3 text-muted small mb-4">
          <div>
            <span className="fw-medium">{item.category}</span>
          </div>
          <div>•</div>
          <div>
            <span className="fw-medium">{item.size}</span>
          </div>
          <div>•</div>
          <div>
            <span className="fw-medium">{item.gender}</span>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={handleShowProduct}
          className="btn w-100 mt-auto py-3 fw-semibold"
          style={{
            background: 'linear-gradient(90deg, #5C2D9A 0%, #7B4DBA 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '0.98rem',
            transition: 'all 0.28s ease',
            boxShadow: isHovered
              ? '0 8px 24px rgba(92, 45, 154, 0.28)'
              : '0 4px 12px rgba(92, 45, 154, 0.16)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          Voir l'article
        </button>
      </div>
    </div>
  );
};

export default ItemCard;