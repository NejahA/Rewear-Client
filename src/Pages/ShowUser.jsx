import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
// import Logout from "../Components/Logout"
// import ItemCard from "../Components/ItemCard"
// import ModalLog from "../Components/LogModal/ModalLog"
// import ModalReg from "../Components/RegModal/ModalReg"
// import Navbar from "../Components/Navbar"
// import NoteListItem from "../components/NoteListItem"
import Cookies from "universal-cookie";
import { MoonLoader } from "react-spinners";

const ShowUser = () => {
  const cookies = new Cookies();
  const navigate = useNavigate();
  const { id } = useParams();
  // const token = localStorage.getItem('token')
  const [profile, setProfile] = useState({
    email: "",
    fName: "",
    lName: "",
    adress: "",
    phone: "",
    profilePic: {},
    itemHistory: [],
  });
  const [logged, setLogged] = useState({
    email: "",
    fName: "",
    lName: "",
    adress: "",
    phone: "",
    profilePic: {},
    itemHistory: [],
  });
  useEffect(() => {
    if (!cookies.get("userToken")) {
      navigate("/");
    } else {
      setProfile({
        email: "-",
        fName: "-",
        lName: "",
        adress: "-",
        phone: "-",
        profilePic: null,
      });
      axios
        .get("http://localhost:10000/api/users/logged", {
          withCredentials: true,
        })
        .then((res) => {
          console.log("logged res ===>", res.data);
          setLogged(res.data);
        })

        .catch((err) => console.log(err));

      axios
        .get("http://localhost:10000/api/users/" + id, {
          withCredentials: true,
        })
        .then((res) => {
          setProfile(res.data);
          console.log("one user res ===>", res.data);
        })
        .catch((err) => console.log("err ===>", err));
    }
  }, [cookies.get("userToken"), id]);
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
            {/* {logged && logged.id && profile && profile.id && (profile.id == logged.id)? ( */}
            {(profile?.id == logged?.id)? (
              <Link to={"/edituser"}>
                <i className="bi bi-gear VioletCred"></i>
              </Link>
            ) : (
              ""
            )}
          </div>
          <p>
            <i class="bi bi-envelope mx-3 VioletCred"></i>
            {profile && profile.email && profile.showEmail === false && (
              <i class="bi bi-eye-slash pe-3 VioletCred"></i>
            )}
            {profile && profile.email ? profile.email : "Hidden for privacy"}{" "}
          </p>
          <p>
            <i class="bi bi-geo-alt-fill mx-3 VioletCred"></i>
            {profile && profile.adress && profile.showAdress === false && (
              <i class="bi bi-eye-slash pe-3 VioletCred"></i>
            )}
            {profile && profile.adress ? profile.adress : "Hidden for privacy"}
          </p>
          <p>
            <i class="bi bi-telephone mx-3 VioletCred"></i>
            {profile && profile.phone && profile.showPhone === false && (
              <i class="bi bi-eye-slash pe-3 VioletCred"></i>
            )}
            {profile && profile.phone ? profile.phone : "Hidden for privacy"}
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
                  //  className="cardItem bg-opacity-50  pt-3 pb-3 status-"
                  className={`item-card cardItem bg-opacity-50 pt-3 pb-3 statusbg-${
                    item.status && item.status
                  }`}
                >
                  <p className="card-text fw-bold">
                    Title : <strong className="">{item.title} </strong>
                  </p>
                  <img
                    src={
                      item &&
                      item.itemPics &&
                      item.itemPics[0] &&
                      item.itemPics[0].url
                    }
                    className="card-img-top p-2"
                    alt="itemPic"
                    style={{ borderRadius: "5%" }}
                  />
                  <h5 className="card-text ">{item.price}</h5>
                  <p className="card-text fw-bold">
                    Category :{" "}
                    <span className="text fw-medium">{item.category}</span>
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

        {/* )
                        
                        } */}
      </div>
    </div>
  );
};

export default ShowUser;
