import axios from "axios";
import React, { useState, useEffect } from "react";
import Logout from "../Components/Logout";
import { useNavigate, useParams } from "react-router-dom";
import Chat from "../Components/Chat/Chat";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";

import { Chip } from "@mui/material";
import { MoonLoader } from "react-spinners";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";

// const socket = io("http://localhost:8001");
// socket.connect();

const ShowOne = () => {
  // const socket = io("http://localhost:8001");
  const [item, setItem] = useState({
    title: "",
    category: "",
    brand: "",
    size: "",
    description: "",
    price: "",
  });
  const [activeImage, setActiveImage] = useState("");
  const [loggedUser, SetLoggedUser] = useState(null);
  const [owner, setOwner] = useState({
    email: "",
    fName: "",
    lName: "",
    adress: "",
    phone: "",
    profilePic: {},
    itemHistory: [],
  });
  const nav = useNavigate();
  const [showChat, setShowChat] = useState(false);

  const navigate = useNavigate();
  // const token = localStorage.getItem('token')
  const { id } = useParams();
  // console.log("this is id : ",id);
  //  const token =  localStorage.getItem('token')

  useEffect(() => {
      // console.log("token",token)
      // socket.on("connection", () => {
      //   console.log("connected", socket.id); // x8WIv7-mJelg7on_ALbx
      // });
   

        setItem({
          title: "-",
          category: "-",
          brand: "-",
          size: "-",
          description: "-",  
          price: "-",
          category: "-",
          previousOwners: "-",
          gender: "-",
          condition: "-",
          age: "-",
          user: {fName:"loading",profilePic:{url:"/logo/load-violet.gif"}}
           })
      axios
        .get(""+import.meta.env.VITE_GITHUB_URI+"/api/items/" + id, {})
        .then((res) => {
          const fetchedItem = res.data;
          setItem(fetchedItem);
          console.log("data fetcheditem ==>", fetchedItem);
          setActiveImage(
            res.data.itemPics[0].url
              ? res.data.itemPics[0].url
              : res.data.itemPics[0]
          );

          console.log("Item state  ==>", item);
          console.log("item pics==>", JSON.stringify(item.itemPics));
        })
        .catch((err) => console.log(err));
    // .catch(err=>console.log(err))
    //   }
    // )
  }, []);

  useEffect(() => {
      axios
        .get(""+import.meta.env.VITE_GITHUB_URI+"/api/users/logged", {
          withCredentials: true,
        })
        .then((res) => {
          const user = res.data;
          SetLoggedUser(user);
          console.log("Logged user ===>", user);
        })
        .catch((err) => console.log(err));
    // .catch(err=>console.log(err))
    //   }
    // )
  }, []);

  const deleteItem = (itemId) => {
    axios
      .delete(""+import.meta.env.VITE_GITHUB_URI+"/api/items/" + itemId, {
        withCredentials: true,
      })
      .then((response) => {
        console.log(response.data);
        navigate("/");
      })
      .catch((error) => console.log(error));
  };
  function capitalizeFirstLetter(inputString) {
    if (
      inputString &&
      typeof inputString === "string" &&
      inputString.length > 0
    ) {
      return inputString.charAt(0).toUpperCase() + inputString.slice(1);
    }
    return "";
  }
  const formattedTitle = capitalizeFirstLetter(item.title);

  return (
    <div className="container my-5">
      <div className="row p-5 border">
        {/* {
          owner && owner._id !== loggedUser._id ?
        <p>{owner &&  owner.fName} {owner && owner.lName} </p> : ""
        } */}
        {/* Images Section (Left) */}
        <div className="col-md-7   ">
          {activeImage  ? (
            <img
              src={activeImage.url ? activeImage.url : activeImage}
              alt=""
              style={{
                width: "688.828px",
                height: "673.625px",
                cursor: "pointer",
                objectFit: "cover",
              }}
              className="mb-3"
              onClick={() => setActiveImage(activeImage)}
            />
          ) : (
            <MoonLoader className="mx-2" size={200} color="#8356C0" />
          )}
          <div className="d-flex flex-row gap-3">
            {item &&
              item.itemPics &&
              item.itemPics.map((image, idx) => (
                <img
                  key={idx}
                  src={image.url ? image.url : image}
                  style={{
                    width: "100px",
                    height: "70px",
                    cursor: "pointer",
                    objectFit: "cover",
                  }}
                  alt=""
                  className=" rounded-md cursor-pointer mr-1"
                  onClick={() => setActiveImage(image)}
                />
              ))}
          </div>
        </div>

        {/* Details Section (Right) */}
        <div className="col-5 ps-5   ">
          <div className="d-flex flex-column gap-3 ">
            <div
              className="gap-2 d-flex "
              onClick={() =>
                navigate(
                  item && item.user && item.user._id && "/user/" + item.user._id
                )
              }
            >
              <img
                style={{ borderRadius: "20%", width: "50px" }}
                src={
                  item &&
                  item.user &&
                  item.user.profilePic &&
                  item.user.profilePic.url
                    ? item.user.profilePic.url
                    : ""
                }
                alt="profilePic"
              />
              <p style={{ color: "grey", cursor: "pointer" }}>
                {item && item.user && item.user.fName}
                {/* {item && item.user && item.user.lName} */}
              </p>
            </div>
            <div>
              <h1 className="text d-flex  ">
                <strong className=" col-7">{formattedTitle}</strong>

                {/* <strong className="col-">{item.price} DT</strong> */}
              </h1>
            </div>

            <h1 className="text ">
              <div className="d-flex  justify-content-between ">
                <strong className="d-block   gap-3">{item.price} DT</strong>
                <stong
                  className={`d-block  statuscl-${
                    item.status && item.status
                  }   gap-3`}
                >
                  {item.status === "0"
                    ? "Pending"
                    : item.status === "1"
                    ? "For Sale"
                    : item.status === "2"
                    ? "Rejected"
                    : ""}
                </stong>
              </div>
            </h1>
            <h5 className="text">
              <strong>Brand : </strong>
              {item.brand}
            </h5>

            <div className="d-flex flex-row justify-content-between ">
              <div className="d-flex  flex-column gap-3">
                <h5 className="text">
                  <strong>Category : </strong>
                  {item.category}
                </h5>
                <h5 className="text">
                  <strong>Gender : </strong>
                  {item.gender}
                </h5>

                <h5 className="text">
                  <strong>Condition : </strong>
                  {item.condition}
                </h5>
              </div>

              <div className="d-flex flex-column gap-3">
                <h5 className="text">
                  <strong>Age : </strong>
                  {item.age}
                </h5>

                <h5 className="text">
                  <strong>Size : </strong>
                  {item.size}
                </h5>
                <h5 className="text">
                  <strong>Previous Owners : </strong>
                  {item.previousOwners}
                </h5>
              </div>
            </div>
            <div className="d-flex flex-wrap">
              {item &&
                item.tags &&
                item.tags.map((tag, index) => (
                  <div key={index} className="">
                    <div
                      style={{ display: "flex", flexWrap: "wrap" }}
                      className="d-flex "
                    >
                      <Chip
                        key={tag}
                        label={tag}
                        color="default"
                        // color={sort.tags === tags ? "violet" : "default"}

                        sx={{ margin: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
            </div>
            <p className="text">{item.description}</p>
          </div>
            {
          item?.adminComment &&
            <Alert severity="error">
              {item.adminComment}
          </Alert>}
        </div>
      </div>
      {loggedUser &&
      item.user &&
      item.user._id &&
      item.user._id === loggedUser._id ? (
        <div className="d-flex justify-content-between p-5 m-5">
          <button
            className="btn btn-danger rounded w-25"
            onClick={() => deleteItem(item._id)}
          >
            Delete
          </button>
          <button
            className="btn rounded text-light w-25"
            style={{ backgroundColor: "#713CC5" }}
            onClick={() => navigate("/items/edit/" + item._id)}
          >
            Edit
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ShowOne;