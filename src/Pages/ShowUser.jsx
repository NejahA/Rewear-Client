import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { MoonLoader } from "react-spinners";

const ShowUser = ({logged}) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [profile, setProfile] = useState({
    email: "",
    fName: "",
    lName: "",
    adress: "",
    phone: "",
    profilePic: {},
    itemHistory: [],   
    location: { lat: null, lng: null },
  });
  const [loggedUser, setloggedUser] = useState({
    email: "",
    fName: "",
    lName: "",
    adress: "",
    phone: "",
    profilePic: {},
    itemHistory: [],
  });
  
  useEffect(() => {
      setProfile({
        email: "-",
        fName: "-",
        lName: "",
        adress: "-",
        phone: "-",
        profilePic: null,
      });
      axios
        .get(""+import.meta.env.VITE_VERCEL_URI+"/api/users/logged", {
          withCredentials: true,
        })
        .then((res) => {
          console.log("loggedUser res from showUser===>", res.data);
          setloggedUser(res.data);
        })
        .catch((err) => {
          navigate("/");
          console.log(err)});

      axios
        .get(""+import.meta.env.VITE_VERCEL_URI+"/api/users/" + id, {
          withCredentials: true,
        })
        .then((res) => {
          setProfile(res.data);
          console.log("one user res ===>", res.data);
        })
        .catch((err) => console.log("err ===>", err));
  }, [logged, id]);
  
  // Function to handle email click
  const handleEmailClick = () => {
    if (profile.email && (profile.showEmail !== false || profile.id === loggedUser.id)) {
      window.location.href = `mailto:${profile.email}`;
    }
  };
  
  // Function to handle phone click
  const handlePhoneClick = () => {
    if (profile.phone && (profile.showPhone !== false || profile.id === loggedUser.id)) {
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
    if (profile.location && profile.location.lat && (profile.showAdress !== false || profile.id === loggedUser.id)) {
      const url = `https://www.google.com/maps/?q=${profile.location.lat},${profile.location.lng}`;
      window.open(url, '_blank');
    }
  };
  
  return (
    <div className="container d-flex flex-column gap-5 p-5">
      <div className="d-flex mx-5  gap-3">
        {profile && profile.profilePic && profile.profilePic.url ? (
          <img
            className="mx-2"
            style={{ width: "250px", borderRadius: "100%" }}
            src={profile && profile.profilePic && profile.profilePic.url}
            alt="profilePic"
          />
        ) : (
          <MoonLoader className="mx-2" size={200} color="#8356C0" />
        )}
        <div className="d-flex flex-column gap-3">
          <div className="d-flex ">
            <h1>
              {profile && profile.fName} {profile && profile.lName}
            </h1>
            {(profile?.id == loggedUser?.id)? (
              <Link to={"/edituser"}>
                <i className="bi bi-gear VioletCred"></i>
              </Link>
            ) : (
              ""
            )}
          </div>
          
          {/* Email Section */}
          <p>
            <i 
              className={`bi bi-envelope mx-3 VioletCred ${(profile.showEmail !== false || profile.id === loggedUser.id) ? 'clickable-icon' : ''}`}
              onClick={handleEmailClick}
              title={profile.showEmail !== false || profile.id === loggedUser.id ? `Send email to ${profile.email}` : 'Email hidden'}
              style={{ cursor: (profile.showEmail !== false || profile.id === loggedUser.id) ? 'pointer' : 'default' }}
            ></i>
            {profile && profile.showEmail === false && (
              <i className="bi bi-eye-slash pe-3 VioletCred" title="Email hidden for privacy"></i>
            )}
            {profile && (profile.showEmail !== false || profile.id === loggedUser.id) ? (
              <span 
                onClick={handleEmailClick}
                style={{ cursor: 'pointer' }}
                title={`Send email to ${profile.email}`}
              >
                {profile.email}
              </span>
            ) : "Hidden for privacy"}
          </p>
          
          {/* Phone Section */}
          <p>
            <i 
              className={`bi bi-telephone mx-3 VioletCred ${(profile.showPhone !== false || profile.id === loggedUser.id) ? 'clickable-icon' : ''}`}
              onClick={handlePhoneClick}
              title={profile.showPhone !== false || profile.id === loggedUser.id ? `Call ${profile.phone}` : 'Phone hidden'}
              style={{ cursor: (profile.showPhone !== false || profile.id === loggedUser.id) ? 'pointer' : 'default' }}
            ></i>
            {profile && profile.showPhone === false && (
              <i className="bi bi-eye-slash pe-3 VioletCred" title="Phone hidden for privacy"></i>
            )}
            {profile && (profile.showPhone !== false || profile.id === loggedUser.id) ? (
              <span 
                onClick={handlePhoneClick}
                style={{ cursor: 'pointer' }}
                title={`Call ${profile.phone}`}
              >
                {profile.phone}
              </span>
            ) : "Hidden for privacy"}
          </p>

          {/* Address Section */}
          <p>
            <i 
              className={`bi bi-geo-alt-fill mx-3 VioletCred ${(profile.showAdress !== false || profile.id === loggedUser.id) ? 'clickable-icon' : ''}`}
              onClick={openInGoogleMaps}
              title={profile.showAdress !== false || profile.id === loggedUser.id ? 'View on Google Maps' : 'Address hidden'}
              style={{ cursor: (profile.showAdress !== false || profile.id === loggedUser.id) ? 'pointer' : 'default' }}
            ></i>
            {profile && profile.showAdress === false && (
              <i className="bi bi-eye-slash pe-3 VioletCred" title="Address hidden for privacy"></i>
            )}
            {profile && (profile.showAdress !== false || profile.id === loggedUser.id) ? (
              <span 
                onClick={openInGoogleMaps}
                style={{ cursor: 'pointer' }}
                title="View on Google Maps"
              >
                {profile.adress}
              </span>
            ) : "Hidden for privacy"}
            
            {/* {profile && profile.adress && (profile.showAdress !== false || profile.id === loggedUser.id) && profile.location && profile.location.lat && (
              <button 
                className="btn btn-sm btn-outline-primary ms-2"
                onClick={openInGoogleMaps}
                title="Open in Google Maps"
              >
                <i className="bi bi-map"></i> View on Map
              </button>
            )} */}
          </p>
        </div>
      </div>

      <h1 className="text-center">Dressing de {profile && profile.fName}</h1>
      <div className="card-container border p-5 d-flex gap-2">
        <div className="scroll-container ">
          <div className="scroll-content">
            {profile &&
              profile.itemsHistory &&
              profile.itemsHistory.map((item) => (
                <div
                  key={item.id}
                  className={`item-card cardItem bg-opacity-50 pt-3 pb-3 statusbg-${item.status && item.status}`}
                >
                  <p className="card-text fw-bold">
                    Title : <strong className="">{item.title} </strong>
                  </p>
                  <img
                    src={item && item.itemPics && item.itemPics[0] && item.itemPics[0].url}
                    className="card-img-top p-2"
                    alt="itemPic"
                    style={{ borderRadius: "5%" }}
                  />
                  <h5 className="card-text ">{item.price}</h5>
                  <p className="card-text fw-bold">
                    Category : <span className="text fw-medium">{item.category}</span>
                  </p>
                  <p className="card-text fw-bold">
                    Size : <span className="text fw-medium">{item.size}</span>
                  </p>
                  <p className="card-text fw-bold">
                    Brand : <span className="text fw-medium">{item.brand}</span>
                  </p>
                  <div
                    className="btn"
                    onClick={() => navigate("/items/" + item._id)}
                    style={{ backgroundColor: "#5C2D9A", color: "white" }}
                  >
                    Show Product
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowUser;