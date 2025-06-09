import { FormControlLabel, Switch } from "@mui/material";
import axios from "axios";
import React, { useState, useEffect } from "react";
// import Logout from "../Components/Logout";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "universal-cookie";

const UpdateUser = () => {
  const [user, setUser] = useState({
    email: "",
    fName: "",
    lName: "",
    adress: "",
    profilePic: {},
    itemHistory: [],
    phone: "",
  });

  const [selectedFiles, setSelectedFiles] = useState(null);
  const [errors, setErrors] = useState(null);
  const [emailCheck, setEmailCheck] = useState(true)
  const [phoneCheck, setPhoneCheck] = useState(true)
  const [adresCheck, setAdressCheck] = useState(true)
  // const nav = useNavigate();
  const navigate = useNavigate();
  const cookies = new Cookies();
  // const token = localStorage.getItem('token')
  const { id } = useParams();
  // console.log("this is id : ",id);

  useEffect(() => {
    if (!cookies.get("userToken")) {
      navigate("/");
    } else {
      axios
        .get("http://localhost:10000/api/users/logged", {
          withCredentials: true,
        })
        .then((res) => {
          // console.log("res ===>", res.data);
          setUser(res.data);
        })

        .catch((err) => console.log(err));
      console.log();
      // }
    }
  }, [cookies.get("userToken")]);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFiles(e.target.files);
    console.log("FILE from change/add=====> :", file);
  };

  const handleRemoveImage = () => {
    //   const updatedFiles = Array.from(selectedFiles);
    // const empty = []
    //   selectedFiles.filter(() => false);
    setSelectedFiles(null);
    console.log("FILE from remove =====> :", selectedFiles);
    // user && user.profilePic && setUser ( { ...user, profilePic: setUser({ ...user, profilePic: null})})
    // console.log("FILE from delete=====> :", file);
  };
const handleToggle = (field) => (event) => {
    setUser((prev) => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };
  const handleUpload = async (e) => {
    // const formData = new FormData();
    // formData.append("file", selectedFiles);
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

    // for (let i = 0; i < selectedFiles.length; i++) {
    // newarr.push(selectedFiles[i]);
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        // newarr.push(selectedFiles[i]);
        formData.append("files", selectedFiles[i]);
      }
    }
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

    // selectedFiles && selectedFiles.length>0 &&
    // formData.append("profilePic",JSON.stringify(selectedFiles[0])  );

    //   formData.append("profilePic",JSON.stringify(user.profilePic[0])  );

    axios
      .put("http://localhost:10000/api/users/" + user._id, formData, {
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
                  required={false}
                  onChange={(e) => {
                    // setSelectedFiles(e.target.files);console.log("FILE =====> :", selectedFiles)
                    handleFileChange(e);
                  }}
                />
                <span className="material-symbols-rounded">
                  <i class="bi bi-cloud-plus"></i>
                </span>{" "}
                Choisir une Photo
              </div>
              <div className="d-flex flex-row flex-wrap gap-2">
                {selectedFiles ? (
                  Array.from(selectedFiles).map((file, idx) => (
                    <div key={idx} className="imgsel">
                      <img
                        src={URL.createObjectURL(file)}
                        className=" "
                        style={{ borderRadius: "100%", width: "190px" }}
                        alt={`preview-${idx}`}
                      />
                      <button
                        className="x rounded-circle "
                        type="button"
                        onClick={(e) => {
                          handleRemoveImage();
                        }}
                      >
                        <i class="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  ))
                ) : user.profilePic && user.profilePic.url ? (
                  <div className="imgsel">
                    <img src={user.profilePic.url} className="selectedImg " />
                    <button
                      className="x rounded-circle "
                      type="button"
                      onClick={(e) => {
                        user &&
                          user.profilePic &&
                          setUser({
                            ...user,
                            profilePic: setUser({ ...user, profilePic: null }),
                          });
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
                value={user.email}
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
                value={user.phone}
              />
            </div>
          </div>
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
              </label>{" "}
              <input
                className="form-control w-25"
                type="text"
                placeholder="12 345 678"
                value={user.adress}
                onChange={(e) => setUser({ ...user, adress: e.target.value })}
                value={user.adress}
              />
            </div>
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
