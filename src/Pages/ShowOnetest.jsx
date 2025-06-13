import axios from "axios";
import React, { useState, useEffect } from "react";
import Logout from "../Components/Logout";
import { useNavigate, useParams } from "react-router-dom";
import Chat from "../Components/Chat/Chat";
import io from "socket.io-client";

const ShowOne = () => {
  // const socket = io.connect("http://localhost:8001");
  const [item, setItem] = useState({
    title: "",
    category: "",
    brand: "",
    size: "",
    description: "",
    price: "",
  });
  const [activeImage, setActiveImage] = useState("");
  const [loggedUser, SetLoggedUser] = useState(null)
  const [owner, setOwner] = useState(null)
  const nav = useNavigate();
  const [showChat, setShowChat] = useState(false);

  const navigate = useNavigate()
  // const token = localStorage.getItem('token')
  const { id } = useParams()
  // console.log("this is id : ",id);

  useEffect(() => {
    // if (!token) {
    //   navigate('/')
    // }
     else {
      axios.get(""+import.meta.env.VITE_GITHUB_URI+"/api/items/" + id)
        .then(res => {
          setItem(res.data)
          console.log("data ==>", res.data);
          setActiveImage(res.data.itemPics[0])

          console.log('THIS IS SHOW ONE ITEM ==>', item);
        })
        .then(axios.get(''+import.meta.env.VITE_GITHUB_URI+'/api/users/' + item.user)
          .then(res => { setOwner(res.data); console.log("THIS IS ITEM OWNER ===> ", owner); }))
        .then(axios.get(''+import.meta.env.VITE_GITHUB_URI+'/api/users/logged', { withCredentials: true })
          .then((res) => {
            SetLoggedUser(res.data)
            console.log("Logged user ===>", loggedUser);


          }))

        .catch(err => console.log(err))
    }
  }, [id])

  const deleteItem = (itemId) => {
    axios.delete(''+import.meta.env.VITE_GITHUB_URI+'/api/items/' + itemId)
      .then(response => {
        console.log(response.data)
        navigate("/")
      })
      .catch(error => console.log(error))
  }
  function capitalizeFirstLetter(inputString) {
    if (inputString && typeof inputString === 'string' && inputString.length > 0) {
      return inputString.charAt(0).toUpperCase() + inputString.slice(1);
    }
    return "";
  }
  const formattedTitle = capitalizeFirstLetter(item.title);

  return (
    <div>
      {/* <button onClick={() => nav("/home")}>Home</button> */}

      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center border">
          <div className="d-flex gap-3 p-5">
            <img style={{borderRadius:'100%',width:'50px'}} src={loggedUser && loggedUser.profilePic} alt="profilePic" />
            <p>{loggedUser && loggedUser.fName} {loggedUser && loggedUser.lName}</p>
          </div>

          {
          // showChat?<Chat socket={socket}  ownerid={item.user} room={id} user={loggedUser}
          //   />
          //   :
          //   <button class="custom-btn btn-1" onClick={()=>{setShowChat(true)}}>Contacter
          //   </button>
            }
        </div>
        <div className="row p-5 ">

          {/* {
          owner && owner._id !== loggedUser._id ?
        <p>{owner &&  owner.fName} {owner && owner.lName} </p> : ""
        } */}
          {/* Images Section (Left) */}
          <div className="col-md-7   ">
            <img
              src={activeImage.url ? activeImage.url : activeImage}
              alt=""
              style={{ width: "100%", height: "auto", cursor: 'pointer' }}
              className="mb-3"
              onClick={() => setActiveImage(activeImage)}
            />
            <div className="d-flex flex-row">
            {item.itemPics &&
              item.itemPics.map((image, idx) => (
                <img
                  key={idx}
                  src={image.url ? image.url : image}
                  style={{ width: "20%", height: "3%", cursor: 'pointer' }}
                  alt=""
                  className=" rounded-md cursor-pointer mr-1"
                  onClick={() => setActiveImage(image)}
                />
              ))}
            </div>
          </div>

          {/* Details Section (Right) */}
          <div className="col-md-4 p-5  d-flex ">
            <div className="d-flex flex-column gap-3 ">
              <h1 className="text"><strong>{formattedTitle}</strong></h1>
              <h5 className="text">
                <strong>Brand : </strong>
                {item.brand}
              </h5>
              <h5 className="text">
                <strong>Size : </strong>
                {item.size}
              </h5>
              <h1 className="text"><strong>{item.price} DT</strong></h1>
              <p className="text">{item.description}</p>
            </div>
          </div>
        

        </div>
        {loggedUser && item.user === loggedUser._id ?
          <div className="d-flex justify-content-between p-5 m-5">

            <button className="btn btn-danger rounded w-25" onClick={() => deleteItem(item._id)}>Delete</button>
            <button className="btn rounded text-light w-25" style={{ backgroundColor: '#713CC5' }} onClick={() => navigate('/items/edit/' + item._id)} >Edit</button>
          </div> : ""}

      </div>

      {/* <input
            type="text"
            onChange={(e) => setItem({ ...item, title: e.target.value })}
            /> */}
      {/* <p>Title : {item.title}</p>
            <p>category : {item.category}</p>
            <p>brand : {item.brand}</p>
            <p>size : {item.size}</p>
            <p>description : {item.description}</p>
            <p>price : {item.price}</p>
            {item.itemPics && item.itemPics.map (image => <img src={image} /> )} */}
      {/* <img src="/images/arboraissance.png-1705238926451.png" /> */}
    </div>
  );
};

export default ShowOne;
