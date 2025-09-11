import { FormControlLabel, Switch } from "@mui/material";
import axios from "axios";
import React, { useState, useEffect } from "react";
// import Logout from "../Components/Logout";
import { useNavigate, useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import LocationPicker from "../Components/LocationPicker";

const UpdateUser = () => {
  const [user, setUser] = useState({
    email: "",
    fName: "",
    lName: "",
    adress: "",  
      location: { lat: null, lng: null }, // ADD THIS: Store coordinates
    profilePic: {},
    itemHistory: [],
    phone: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState(null);
  const [emailCheck, setEmailCheck] = useState(true)
  const [phoneCheck, setPhoneCheck] = useState(true)
  const [adresCheck, setAdressCheck] = useState(true)
  // const nav = useNavigate();
  const navigate = useNavigate();
  // const token = localStorage.getItem('token')
  const { id } = useParams();
  // console.log("this is id : ",id);

  useEffect(() => {
      axios
        .get(""+import.meta.env.VITE_VERCEL_URI+"/api/users/logged", {
          withCredentials: true,
        })
        .then((res) => {
          // console.log("res ===>", res.data);
          setUser(res.data);
        })

        .catch((err) => console.log(err));
      console.log();
      // }
  }, []);
  const handleFileChange = async (e) => {
    const file  = e.target.files[0];
  
  if (file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Type de fichier non supporté',
        text: 'Seules les images JPEG, PNG, GIF et JPG sont autorisées',
      });
      e.target.value = '';
      return;
    }
    
    await setSelectedFile(file);
    console.log("FILE from change/add=====> :", selectedFile);
  }
};

  const handleRemoveImage = (e) => {
    setSelectedFile(null);
    setUser((prev) => ({
      ...prev,
      profilePic: null,
    }))
  };
const handleToggle = (field) => (event) => {
    setUser((prev) => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };
    const handleLocationSelect = async (coordinates,addressName = null) => {
      addressName && console.log("Selected address name:", addressName);
      coordinates && console.log("Selected coordinates:", coordinates);

   await coordinates && addressName &&  setUser(prev => ({
    ...prev,
    location: { lat: coordinates[0], lng: coordinates[1] },
    ...(addressName && { adress: addressName })
  }));
  console.log("user after update ===>",JSON.stringify(user));
  };  
  const handleUpload = async (e) => {
    // const formData = new FormData();
    // formData.append("file", selectedFile);
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("fName", user.fName);
    formData.append("lName", user.lName);
    formData.append("adress", user.adress);
    formData.append("showEmail", user.showEmail);
    formData.append("showPhone", user.showPhone);
    formData.append("showAdress", user.showAdress);
    // formData.append("user", user.user  )
    formData.append("lat", user.location.lat);
    formData.append("lng", user.location.lng);

    // for (let i = 0; i < selectedFile.length; i++) {
    // newarr.push(selectedFile[i]);
    selectedFile && formData.append("files", selectedFile);
    // if (selectedFile) {
    //   for (let i = 0; i < selectedFile.length; i++) {
    //     // newarr.push(selectedFile[i]);
    //     formData.append("files", selectedFile[i]);
    //   }
    // }
    const oldPics = user.profilePic || {};
    const serializedPics = await JSON.stringify(oldPics);
    console.log(
      "serializedPics ===>",
      serializedPics,
      "type:",
      typeof serializedPics
    );
    formData.delete("profilePic");

    formData.append("profilePic", serializedPics);

    // selectedFile && selectedFile.length>0 &&
    // formData.append("profilePic",JSON.stringify(selectedFile[0])  );

    //   formData.append("profilePic",JSON.stringify(user.profilePic[0])  );

    axios
      .put(""+import.meta.env.VITE_VERCEL_URI+"/api/users/" + user._id, formData, {
        withCredentials: true,
      })
      .then((res) => {
        console.log(res);
        console.log(JSON.stringify(formData));
        navigate(-1);
      })
      .catch((err) => {
        console.log(err);
        setErrors(err.response.data.errors);
      });
  };
  return (
    <div>
      <form
        onSubmit={(e) => {
          handleUpload(e);
        }}
      >
        <div className="container d-flex flex-column gap-5 p-5">
          <div className="card h-auto p-3 d-flex flex-column gap-3 ">
            <div className=" p-3 d-flex gap-5 imageCompo align-items-center">
              <div className="file-btn upload col-2 aaa">
                <input
                  className="inputPic "
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/jpg" // ← Ajoutez cette ligne
                  required={false}
                  onChange={(e) => {
                    // setSelectedFile(e.target.files);console.log("FILE =====> :", selectedFile)
                    handleFileChange(e);
                  }}
                />
                <span className="material-symbols-rounded">
                  <i class="bi bi-cloud-plus"></i>
                </span>{" "}
                Choisir une Photo
              </div>
              <div className="d-flex flex-row flex-wrap gap-2">
                {selectedFile ? (
                    <div  className="imgsel">
                      <img
                        src={URL.createObject(selectedFile)}
                        className=" selectedImg"
                        style={{ borderRadius: "100%", width: "190px" }}
                        alt={`preview-${selectedFile.name}`}
                      />
                      <button
                        className="x rounded-circle "
                        type="button"
                        onClick={() =>  {
                          handleRemoveImage();
                        }}
                      >
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </div>
                
                ) : user.profilePic && user.profilePic.url ? (
                  <div className="imgsel">
                    <img src={user.profilePic.url} 
                    style={{ borderRadius: "100%", width: "190px" }}
                    className="selectedImg " />
                    <button
                      className="x rounded-circle "
                      type="button"
                      onClick={() => {
                        handleRemoveImage();
                      }}
                    >
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
          <div className="card h-auto p-3">
            <div className="d-flex justify-content-between">
              <label htmlFor="fName">First Name</label>
              <input
                className="form-control w-25"
                type="text"
                placeholder="Joe"
                value={user.fName}
                onChange={(e) => setUser({ ...user, fName: e.target.value })}
                value={user.fName}
              />
            </div>
          </div>
          <div className="card h-auto p-3">
            <div className="d-flex justify-content-between">
              <label htmlFor="lName">Last Name</label>

              <input
                className="form-control w-25"
                type="text"
                placeholder="Doe"
                value={user.lName}
                onChange={(e) => setUser({ ...user, lName: e.target.value })}
                value={user.lName}
              />
            </div>
          </div>
          <div className="card h-auto p-3">
            <div className="d-flex justify-content-between">
              <label className="col-3 d-flex justify-content-between align-items-center">
                <span className="">Adresse Mail</span>
                <FormControlLabel
                  className=" "
                  control={
                    <Switch
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "violet.main",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "violet.main",
                          },
                      }}
                      checked={user.showEmail}
                    //   onChange={(e) =>
                    //     setUser({ ...user, showEmail: e.target.checked })
                    //   }
            onChange={(e) =>{
                const check = e.target.checked
                console.log("event check",check)
                // setEmailCheck(check)
                setUser({ ...user, showEmail: check })
                console.log("user showEmail", user.showEmail)
            }
            }

                    />
                  }
                  label={`Show: ${user.showEmail ? "Yes" : "No"}`}
                />
              </label>

              <input
                className="form-control w-25"
                type="text"
                placeholder="Joe@gmail.com"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </div>
          </div>
 
 
          <div className="card h-auto p-3">
            <div className="d-flex justify-content-between">
              <label className="col-3 d-flex justify-content-between align-items-center">
                <span className="">Phone</span>
                <FormControlLabel
                  className=" "
                  control={
                    <Switch
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "violet.main",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "violet.main",
                          },
                      }}
                      checked={user.showPhone}
                    //   onChange={(e) =>
                    //     setUser({ ...user, showPhone: e.target.checked })
                    //   }
                    onChange={handleToggle("showPhone")}

                    />
                  }
                  label={`Show: ${user.showPhone ? "Yes" : "No"}`}
                />
              </label>
              <input
                className="form-control w-25"
                type="number"
                placeholder="12 345 678"
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
              />
            </div>
          </div>
          {/* <div className="card h-auto p-3">
            <div className="d-flex justify-content-between">
              <label className="col-3 d-flex justify-content-between align-items-center">
                <span className="">Adresse </span>
                <FormControlLabel
                  className=" "
                  control={
                    <Switch
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "violet.main",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "violet.main",
                          },
                      }}
                      checked={user.showAdress}
                    //   onChange={(e) => {
                    //     console.log("showadress  ", user.showAdress);
                    //     setUser({ ...user, showAdress: e.target.checked });
                    //   }}
                    onChange={handleToggle("showAdress")}

                    />
                  }
                  label={`Show: ${user.showAdress ? "Yes" : "No"}`}
                />
              </label>{" "}
              <input
                className="form-control w-25"
                type="text"
                placeholder="12 345 678"
                value={user.adress}
                onChange={(e) => setUser({ ...user, adress: e.target.value })}
                // value={user.adress}
              />
              
            </div>
          </div> */}
<div className="card h-auto p-3">
              <div className="d-flex justify-content-between">

  <label className="col-3 d-flex justify-content-between align-items-center">
                <span className="">Adresse </span>
                <FormControlLabel
                  className=" "
                  control={
                    <Switch
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "violet.main",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                          {
                            backgroundColor: "violet.main",
                          },
                      }}
                      checked={user.showAdress}
                    //   onChange={(e) => {
                    //     console.log("showadress  ", user.showAdress);
                    //     setUser({ ...user, showAdress: e.target.checked });
                    //   }}
                    onChange={handleToggle("showAdress")}

                    />
                  }
                  label={`Show: ${user.showAdress ? "Yes" : "No"}`}
                />
              </label>
              {/* {user.adress} */}
              {/* <input
                className="form-control w-25"
                type="text"
                placeholder="12 345 678"
                value={user.adress}
                onChange={(e) => setUser({ ...user, adress: e.target.value })}
                // value={user.adress}
              />            */}
              </div>
               <LocationPicker 
              onLocationSelect={handleLocationSelect}
              initialAddress={user?.adress || ''}
              initialPosition={user?.location?.lat ? [user.location.lat, user.location.lng] : null}
            />
            
          </div>
          <button className="btn-submit w-25 rounded p-2 text-light">
            Edit Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUser;