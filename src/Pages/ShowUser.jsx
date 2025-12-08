import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { MoonLoader } from "react-spinners";
// import ProductCard from "../../Test_Card/ProductCard";
// import ProductCard from "../../haroun card/components/ProductCard";
// import TestH from "../../haroun card/testH";
// import NewCard from "../Components/NewCard.jsx";

import {  useRef } from "react";

const StaticLocationMap = ({ lat, lng }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    // Prevent double initialization in Strict Mode
    if (mapInstance.current) return;

    // Dynamically load Leaflet CSS + JS only once
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(cssLink);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = false;
    script.onload = () => initializeMap();
    document.body.appendChild(script);

    const initializeMap = () => {
      if (!mapRef.current || mapInstance.current) return;

      const L = window.L;

      // Create map
      const map = L.map(mapRef.current, {
        dragging: false,           // Disable drag
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: true ,
        boxZoom: false,
        keyboard: false,
        zoomControl: true,         // Keep + / - buttons
        attributionControl: false  // Remove all attribution links
      }).setView([lat, lng], 15);

      // Add tiles (no attribution)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "", // completely removed
        maxZoom: 19,
      }).addTo(map);

      // Add marker
      L.marker([lat, lng])
        .addTo(map)
        // .bindPopup("User Location")
        // .openPopup();
map.on("zoomend", () => {
        map.setView([lat, lng], map.getZoom(), { animate: true });
      });
      mapInstance.current = map;
    };

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lng]);

  return (
    <div className="mt-5">
      <h4 className="text-center mb-3">Location</h4>
      <div
        ref={mapRef}
        style={{
          height: "400px",
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          background: "#f0f0f0",
        }}
      />
      <p className="text-center text-muted small mt-2">
        Use +/− buttons to zoom
      </p>
    </div>
  );
};


const ShowUser = ({ logged }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState({
    email: "",
    fName: "",
    lName: "",
    adress: "",
    phone: "",
    profilePic: {},
    itemsHistory: [],   
    location: { lat: null, lng: null },
    showEmail: true,
    showPhone: true,
    showAdress: true
  });
  const [loggedUser, setLoggedUser] = useState({
    email: "",
    fName: "",
    lName: "",
    adress: "",
    phone: "",
    profilePic: {},
    itemsHistory: [],
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    
    // Fetch logged user data
    axios
      .get(`${import.meta.env.VITE_VERCEL_URI}/api/users/logged`, {
        withCredentials: true,
      })
      .then((res) => {
        setLoggedUser(res.data);
      })
      .catch((err) => {
        console.log(err);
      });

    // Fetch profile data
    axios
      .get(`${import.meta.env.VITE_VERCEL_URI}/api/users/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log("Error fetching user:", err);
        setLoading(false);
      });
  }, [logged, id]);
  
  // Function to handle email click
  const handleEmailClick = () => {
    if (profile.email && (profile.showEmail !== false || profile._id === loggedUser._id)) {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  
  // Function to handle phone click
  const handlePhoneClick = () => {
    if (profile.phone && (profile.showPhone !== false || profile._id === loggedUser._id)) {
      // Check if we're on a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        window.location.href = `tel:${profile.phone}`;
      } else {
        // For desktop, show a confirmation dialog
        if (window.confirm(`Call ${profile.phone}?`)) {
          window.location.href = `tel:${profile.phone}`;
        }
      }
    }
  };
  
  // Function to open Google Maps
  const openInGoogleMaps = () => {
    if (profile.location && profile.location.lat && (profile.showAdress !== false || profile._id === loggedUser._id)) {
      const url = `https://www.google.com/maps/?q=${profile.location.lat},${profile.location.lng}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
        <MoonLoader size={60} color="#8356C0" />
      </div>
    );
  }
  
  return (
    <div className="container py-4">
      {/* Profile Header Section - Centered for mobile */}
      <div className="row mb-4">
        <div className="col-12 d-flex flex-column align-items-center mb-4">
          {/* Profile Image with fixed aspect ratio */}
          <div className="position-relative mb-3" style={{ width: "150px", height: "150px" }}>
            {profile.profilePic && profile.profilePic.url ? (
              <img
                className="img-fluid"
                style={{ width: "150px", height: "150px", borderRadius: "50%", objectFit: "cover" }}
                src={profile.profilePic.url}
                alt="Profile"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                />
              ) : 
            <div 
              className="d-flex justify-content-center align-items-center bg-light" 
              style={{ 
                width: "150px", 
                height: "150px", 
                borderRadius: "50%",
                display: (profile.profilePic && profile.profilePic.url) ? 'none' : 'flex'
              }}
            >
              <i className="bi bi-person fs-1 text-secondary"></i>
            </div>
            }
          </div>
          
          {/* User Info - Centered */}
          <div className="text-center ">
            <div className="d-flex justify-content-center align-items-center  mb-4">

              <h2 className="mb-0 me-2">
                {profile.fName} {profile.lName}
              </h2>
              {profile._id === loggedUser._id && (
                <Link to="/edituser" className="text-decoration-none">
                  <i className="bi bi-gear-fill fs-5" style={{ color: "#8356C0" }}></i>
                </Link>
              )}
            </div>
            
            {/* Contact Info - Stacked vertically on mobile */}
            <div className="d-flex flex-column gap-3">
              {/* Email Section */}
              <div className="d-flex justify-content-center align-items-center">
                <i 
                  className={`bi bi-envelope me-2 ${(profile.showEmail !== false || profile._id === loggedUser._id) ? 'clickable-icon' : 'd-none'}`}
                  style={{ 
                    color: "#8356C0", 
                    cursor: (profile.showEmail  && profile.email &&  profile.email.length>0 ) ? 'pointer' : 'default',
                  }}
                  onClick={handleEmailClick}
                  title={profile.showEmail !== false || profile._id === loggedUser._id ? `Send email to ${profile.email}` : 'Email hidden'}
                ></i>
                
                {profile.showEmail === false && profile._id !== loggedUser._id && (
                  <i className="bi bi-eye-slash me-2" style={{ color: "#8356C0" }} title="Email hidden for privacy"></i>
                )}
                
                {profile && (profile.showEmail !== false || profile._id === loggedUser._id) ? (
                  <span 
                    onClick={handleEmailClick}
                    style={{ cursor: 'pointer' }}
                    title={`Send email to ${profile.email}`}
                    className="text-break"
                  >
                    {profile.email}
                  </span>
                ) : (
                  <span className="text-muted">Hidden for privacy</span>
                )}
              </div>
              
              {/* Phone Section */}
              <div className="d-flex justify-content-center align-items-center">
                <i 
                  className={`bi bi-telephone me-2 ${(profile.showPhone && profile.phone && profile.phone.length > 0 ) ? 'clickable-icon' : 'd-none'}`}
                  style={{ 
                    color: "#8356C0", 
                    cursor: (profile.showPhone !== false || profile._id === loggedUser._id) ? 'pointer' : 'default',
                  }}
                  onClick={handlePhoneClick}
                  title={profile.showPhone !== false || profile._id === loggedUser._id ? `Call ${profile.phone}` : 'Phone hidden'}
                ></i>
                
                {profile.showPhone === false && profile._id !== loggedUser._id && (
                  <i className="bi bi-eye-slash me-2" style={{ color: "#8356C0" }} title="Phone hidden for privacy"></i>
                )}
                
                {profile && (profile.showPhone !== false || profile._id === loggedUser._id) ? (
                  <span 
                    onClick={handlePhoneClick}
                    style={{ cursor: 'pointer' }}
                    title={`Call ${profile.phone}`}
                  >
                    {profile.phone}
                  </span>
                ) : (
                  <span className="text-muted">Hidden for privacy</span>
                )}
              </div>

              {/* Address Section */}
              <div className="d-flex justify-content-center align-items-center">
                <i 
                  className={`bi bi-geo-alt-fill me-2 ${(profile.showAdress && profile.adress && profile.adress.length > 0 ) ? 'clickable-icon' : 'd-none'}`}
                  style={{ 
                    color: "#8356C0", 
                    cursor: (profile.showAdress !== false || profile._id === loggedUser._id) ? 'pointer' : 'default',
                  }}
                  onClick={openInGoogleMaps}
                  title={profile.showAdress !== false || profile._id === loggedUser._id ? 'View on Google Maps' : 'Address hidden'}
                ></i>
                
                {profile.showAdress === false && profile._id !== loggedUser._id && (
                  <i className="bi bi-eye-slash me-2" style={{ color: "#8356C0" }} title="Address hidden for privacy"></i>
                )}
                
                {profile && (profile.showAdress !== false || profile._id === loggedUser._id) ? (
                  <span 
                    onClick={openInGoogleMaps}
                    style={{ cursor: 'pointer' }}
                    title="View on Google Maps"
                    className="text-break"
                  >
                    {profile.adress}
                  </span>
                ) : (
                  <span className="text-muted">Hidden for privacy</span>
                )}
              </div>
              {(profile.location?.lat && profile.location?.lng) &&
  (profile.showAdress !== false || profile._id === loggedUser._id) && (
    <StaticLocationMap lat={profile.location.lat} lng={profile.location.lng} />
)}
            </div>
          </div>
        </div>
      </div>

      {/* Dressing Section */}
      <h3 className="text-center mb-4">Dressing de {profile.fName}</h3>
      
      {profile.itemsHistory && profile.itemsHistory.length > 0 ? (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
         
         
          {profile.itemsHistory.map((item) => (
            <div key={item._id} className="col">
                <div className="card h-100 w-100 shadow-sm">
                {/* Image container with fixed aspect ratio */}
                <div className="position-relative" style={{ height: "500px", width:"100%" , overflow: "hidden" }}>
                  <span style={{ zIndex: 1, display:'inline' }} className={`position-absolute m-2  top-0 end-0 badge
                  
                  badge  statusbg-${item.status}
                  ` 
                        }>
 {item.status === "0" ? "Pending" :
                 item.status === "1" ? "For Sale" :
                 item.status === "2" ? "Rejected" :
                 item.status === "4" ? "Sold" : "Unknown"}                  </span>
                  {item.itemPics && item.itemPics[0] && item.itemPics[0].url ? (
                    <img
                      src={item.itemPics[0].url}
                      className=" h-100 w-100"
                      alt={item.title}
                      style={{ objectFit: "cover" }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.image-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Image placeholder */}
                  {/* <div 
                    className="image-placeholder d-none justify-content-center align-items-center bg-light h-100 w-100"
                    style={{ display: (item.itemPics && item.itemPics[0] && item.itemPics[0].url) ? 'none' : 'flex' }}
                  >
                    <i className="bi bi-image text-secondary fs-1"></i>
                  </div> */}
                  {/* Status badge - positioned absolutely over image */}
                  
                </div>
                
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-truncate">{item.title}</h5>
                  <p className={`card-text fw-bold  statuscl-${item.status}`}>{item.price} DT</p>
                  
                  <div className="d-flex flex-wrap gap-1 mb-2">
                    <small className="text-muted">Category: {item.category}</small>
                    <small className="text-muted">Size: {item.size}</small>
                    <small className="text-muted">Brand: {item.brand}</small>
                  </div>
                  
                  <button
                    className="btn mt-auto"
                    onClick={() => navigate("/items/" + item._id)}
                    style={{ backgroundColor: "#5C2D9A", color: "white" }}
                  >
                    View Product
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <i className="bi bi-closet-fill display-1 text-muted"></i>
          <p className="text-muted mt-3">No items in the dressing yet</p>
        </div>
      )}
    </div>
  );
};

export default ShowUser;