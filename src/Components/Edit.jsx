import axios from "axios";
import React, { useState, useEffect } from "react";
import Logout from "../Components/Logout";
import { Link, useNavigate, useParams } from "react-router-dom";

import Box from "@mui/material/Box";
import { Checkbox, ListItemText, Slider, Typography } from "@mui/material";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Input,
  TextField,
} from "@mui/material";
import { FormLabel, RadioGroup, FormControlLabel } from "@mui/material";
import { Radio } from "@material-tailwind/react";

const sizeMarks = [
  { value: 0, label: "XXS" },
  { value: 1, label: "XS" },
  { value: 2, label: "S" },
  { value: 3, label: "M" },
  { value: 4, label: "L" },
  { value: 5, label: "XL" },
  { value: 6, label: "XXL" },
  // { value: 7, label: "XXXL" },
];

const genderOptions = ["Male", "Female", "Unisex"];
const ageOptions = ["Baby", "Child", "Teen", "Adult"];

// const genderOptions = ['Men', 'Women', 'Unisex', 'Kids'];
const categoryOptions = [
  "T-Shirts",
  "Shirts",
  "Sweaters",
  "Jeans",
  "Trousers",
  "Shorts",
  "Jackets",
  "Coats",
  "Dresses",
  "Skirts",
  "Bags",
  "Accessories",
  "Activewear",
  "Sleepwear",
  "Swimwear",
  "Kidswear",
  "Babywear",
  "Shoes",
  "Sneakers",
  "Heels",
  "Boots",
  "Sandals",
];
const footwearCategories = ["Shoes", "Sneakers", "Heels", "Boots", "Sandals"]; // Based on your model

const conditionOptions = ["New with tags", "Like new", "Good", "Acceptable"];
const adultSizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const kidSizes = [
  "0-3M",
  "3-6M",
  "6-9M",
  "9-12M",
  "12-18M",
  "18-24M",
  "2Y",
  "3Y",
  "4Y",
  "5Y",
  "6Y",
  "7Y",
  "8Y",
  "9Y",
  "10Y",
  "12Y",
  "14Y",
  "16Y",
];
const tagOptions = [
  "Eco-friendly",
  "Sustainable",
  "Vintage",
  "Minimal",
  "Streetwear",
  "Luxury",
  "Formal",
  "Casual",
  "Colorful",
  "Neutral",
  "Trendy",
  "Classic",
  "90s",
  "Y2K",
  "Preppy",
  "Boho",
  "Sporty",
  "Plus Size",
];

const Edit = () => {
  const [item, setItem] = useState({});

  // const [item, setItem] = useState({
  //   title: "",
  //   category: "",
  //   brand: "",
  //   size: "",
  //   description: "",
  //   price: "",
  //   status:""
  // });

  const handleSliderChange = (event, newValue) => {
    setItem({ ...item, size: newValue });
  };
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [errors, setErrors] = useState(null);
  useEffect(() => {
    console.log("item changed ===>", item);
  }, [item]);
  // const nav = useNavigate();
  const navigate = useNavigate();

  // const token = localStorage.getItem("token");
  const { id } = useParams();
  // console.log("this is id : ",id);

  useEffect(() => {
    
      axios
        .get(""+import.meta.env.VITE_LOCAL_URL+"/api/items/" + id, {
          withCredentials: true,
        })
        .then(async (res) => {
          const itemData = res.data;
          const found = sizeMarks.find((mark) => mark.label === itemData.size);
          // const match = sizeMarks.find(mark => mark.value === value);
          const updatedItem = {
            ...itemData,
            size: found ? found.value : itemData.size,
            // size: match ? match.label : null
          };
          setItem(updatedItem);
          console.log("updated state item ===>", res.data);
        })

        .catch((err) => {
      setUserNav(null); // user is NOT logged in
      navigate('/'); // redirect to homepage
    });

      console.log();
      // }axios
      // axios.get(""+import.meta.env.VITE_LOCAL_URL+"/api/users/logged", { withCredentials: true })selectedFilesit
      // .then((res) => {
      //   console.log("user obj ===>", res.data);
      //   setItem({ ...item, user: res.data.id })

      // }).catch((err) => console.log(err));
    
  }, []);
  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
    console.log("FILE =====> :", selectedFiles);
  };
  const handleRemoveImage = (index) => {
    if (selectedFiles) {
      const updatedFiles = Array.from(selectedFiles);
      updatedFiles.splice(index, 1);
      setSelectedFiles(updatedFiles);
    }
    if (item && item.itemPics) {
      item &&
        item.itemPics &&
        setItem({ ...item, itemPics: item.itemPics.filter(() => false) });
    }
  };
  const handleUpload = async (e) => {
    // const formData = new FormData();
    // formData.append("file", selectedFiles);
    e.preventDefault();

    const formData = new FormData();
    setItem({
      ...item,
      gender:
        item?.category === "Babywear" || item?.category === "Kidswear"
          ? "kid"
          : item?.gender,
    });

    formData.append("user", item.user._id);
    console.log("user from formdata ===>", item.user);
    for (const [key, value] of Object.entries(item)) {
      if (key !== "user" && key !== "size" && value) {
        formData.append(key, value); /// Append only if value is present
      }
    }
    const found = sizeMarks.find((mark) => mark.value === item.size);
    console.log("fund ===>", found && found.label);
    if (found) {
      formData.append("size", found.label); // Append only if value is present
    } // formData.append("user", item.user  )
    else {
      formData.append("size", item.size);
    }
    // console.log("selected files ===>", selectedFiles&&selectedFiles);
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        // newarr.push(selectedFiles[i]);
        formData.append("files", selectedFiles[i]);
      }
    }

    const oldPics = item.itemPics || [];
    const serializedPics = await JSON.stringify(oldPics);
    console.log(
      "serializedPics ===>",
      serializedPics,
      "type:",
      typeof serializedPics
    );
    formData.delete("itemPics");

    formData.append("itemPics", serializedPics);

    console.log("raw itemPics from formdata ==>", formData.get("itemPics")); // should print the JSON string
    console.log(
      "type of itemPics in formdata:",
      typeof formData.get("itemPics")
    ); // should be "string"

    axios
      .put(""+import.meta.env.VITE_LOCAL_URL+"/api/items/" + id, formData, {
        withCredentials: true,
      })
      .then((res) => {
        console.log("update result ===>", JSON.stringify(res.data));
        // console.log(JSON.stringify(formData));
        navigate("/");
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
        style={{ position: "relative" }}
      >
        <div className="container d-flex flex-column gap-5 p-5">
          <div className="card p-3 d-flex flex-column gap-3">
            <p>Ajoute jusqu'à 5 photos</p>
            <div className=" p-3 d-flex gap-5 imageCompo ">
              <div className="file-btn upload col-2">
                <input
                  className="inputPic "
                  type="file"
                  multiple
                  required={false}
                  onChange={handleFileChange}
                />
                <span className="material-symbols-rounded">
                  <i class="bi bi-cloud-plus"></i>
                </span>{" "}
                Upload File
              </div>
              <div className="d-flex flex-row flex-wrap gap-2">
                {
                  selectedFiles
                    ? Array.from(selectedFiles).map((file, idx) => (
                        <div key={idx} className="imgsel">
                          <img
                            src={URL.createObjectURL(file)}
                            className="selectedImg "
                            alt={`preview-${idx}`}
                          />
                          <button
                            className="x rounded-circle "
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                          >
                            <i class="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      ))
                    : item.itemPics &&
                      Array.from(item.itemPics).map((imagepath, idx) => (
                        <div key={idx} className="imgsel">
                          <img
                            src={imagepath.url}
                            className="selectedImg "
                            alt={`preview-${idx}`}
                          />
                          <button
                            className="x rounded-circle "
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                          >
                            <i class="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      ))

                  // <img src={item.itemPics[0]} />
                }
              </div>
            </div>
            <div className="d-flex gap-2 border p-3">
              <div>
                <i
                  style={{ color: "#5C2D9A" }}
                  class="bi bi-info-circle-fill"
                ></i>
              </div>
              <div>
                <h5 style={{ color: "#5C2D9A" }}>
                  Utilise uniquement tes propres photos
                </h5>
                <h6>
                  Cette annonce peut être masquée ou supprimée si elle contient
                  des photos qui ne sont pas les tiennes
                </h6>
              </div>
            </div>
          </div>

          <div className="card p-3">
            <div className="d-flex justify-content-between">
              <label htmlFor="title">Title</label>
              <Input
                value={item && item.title}
                sx={{
                  "&:after": {
                    borderBottom: "2px solid #8356C0", // underline color on focus
                  },
                }}
                className="form-control w-25"
                type="text"
                placeholder="ex: sweatshirt noir"
                onChange={(e) => setItem({ ...item, title: e.target.value })}
              />

              {/* !!!!!!!!!!!!!!!!!!!!!!!!!!! ERROR VALIDATOR FOR TITLE (COPY PASTE FOR ALL FEILDS) */}

              {errors && errors.title && errors.title.message && (
                <p>Veuillez inserer un titre</p>
              )}
            </div>
            <hr />
            <div className="d-flex justify-content-between">
              <label htmlFor="description">Description</label>
              <TextField
                sx={{
                  "& label.Mui-focused": {
                    color: "#8356C0", // your custom color for the label
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "#8356C0", // your custom color for the border
                    },
                  },
                }}
                className="form-control description w-50"
                name=""
                id="description"
                cols=""
                multiline
                rows={4}
                placeholder="ex: porté quelques fois,taille correcte"
                onChange={(e) =>
                  setItem({ ...item, description: e.target.value })
                }
                value={item && item.title}
                type="text"
              />
            </div>
          </div>

          {/* Category */}

          <div className="card p-3">
            <div className="d-flex justify-content-between">
              <label htmlFor="category" className=" w-25 align-content-center">
                Categories
              </label>
              {/* <FormControl fullWidth> */}
              {/* <InputLabel id="category-label">Category</InputLabel> */}
              <Select
                sx={{
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#8356C0", // border color on focus
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "#8356C0", // another way to ensure border color
                    },
                  },
                }}
                className="form-control w-25 align-content-center"
                labelId="category-label"
                value={item.category || ""}
                defaultValue={item && item.category}
                onChange={(e) => setItem({ ...item, category: e.target.value })}
                displayEmpty
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      overflowY: "auto",
                    },
                  },
                  MenuListProps: {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)", // 3 columns across
                      gap: "8px", // spacing between items
                    },
                  },
                }}
              >
                {categoryOptions.map((categoryName, index) => (
                  <MenuItem key={index} value={categoryName}>
                    {categoryName}
                  </MenuItem>
                ))}
              </Select>
              {/* </FormControl> */}
            </div>
          </div>

          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <label>Genre</label>
              
              <div className="d-flex gap-4">
                <RadioGroup
                  row
                  aria-labelledby="condition-label"
                  name="condition"
                  value={item && item.gender}
                  onChange={(e) => {
                    setItem({ ...item, gender: e.target.value });
                  }}
                >
                  {genderOptions.map((c) => (
                    <FormControlLabel
                      key={c}
                      value={c}
                      control={
                        <Radio
                          checked={
                            ((item?.category === "Babywear" ||
                              item?.category === "Kidswear") &&
                              c == "Kids") ||
                            (c == item?.gender &&
                              item?.category !== "Babywear" &&
                              item?.category !== "Kidswear")
                          }
                          disabled={
                            (item?.category === "Babywear" ||
                              item?.category === "Kidswear") &&
                            c !== "Kids"
                          }
                          // sx={{
                          //   "&.Mui-checked": {
                          //     color: "#8356C0", // custom checked color
                          //   },
                          //   "&.Mui-focusVisible": {
                          //     outline: "2px solid #8356C0", // optional focus ring
                          //   },
                          // }}
                        />
                      }
                      label={c}
                    />
                  ))}
                </RadioGroup>
              </div>

              {/* 
                           <select className="form-select w-25"
                             onChange={(e) => setItem({ ...item, gender: e.target.value })}>
                             <option value="">Sélectionner un genre</option>
                             {genderOptions.map(g => (
                               <option key={g} value={g}>{g}</option>
                             ))}
                           </select> */}
            </div>
          </div>
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <label>Age</label>

              <div className="d-flex gap-4">
                <RadioGroup
                  row
                  aria-labelledby="condition-label"
                  name="condition"
                  value={item && item.age}
                  onChange={(e) => {
                    const selectedAge = e.target.value;
                    setItem({ ...item, age: e.target.value });
                    console.log("age", selectedAge);
                  }}
                >
                  {ageOptions.map((c) => (
                    <FormControlLabel
                      key={c}
                      value={c}
                      control={
                        <Radio
                          // checked={
                          checked={item?.age === c}
                          //   // (
                          //   //  (item?.category === "Babywear" || item?.category === "Kidswear" )&& c== "Kids"  ||
                          //   //       c== item?.gender&& (item?.category !== "Babywear" && item?.category !== "Kidswear" )   )
                          // }
                          // disabled={(item?.category === "Babywear" || item?.category === "Kidswear" )&& c!== "Kids" }
                          sx={{
                            "&.Mui-checked": {
                              color: "#8356C0", // custom checked color
                            },
                            "&.Mui-focusVisible": {
                              outline: "2px solid #8356C0", // optional focus ring
                            },
                          }}
                        />
                      }
                      label={c}
                    />
                  ))}
                </RadioGroup>
              </div>

              {/* 
                  <select className="form-select w-25"
                    onChange={(e) => setItem({ ...item, gender: e.target.value })}>
                    <option value="">Sélectionner un genre</option>
                    {genderOptions.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select> */}
            </div>
          </div>
          <div className="card p-3">
            <div className="d-flex justify-content-between">
              <label
                htmlFor="brand"
                className=" form-check-label align-content-center"
              >
                Brand
              </label>
              <Input
                sx={{
                  "&:after": {
                    borderBottom: "2px solid #8356C0", // underline color on focus
                  },
                }}
                value={item && item.brand}
                className="form-control w-25"
                type="text"
                placeholder="Zara,Bershka,ect.."
                onChange={(e) => setItem({ ...item, brand: e.target.value })}
              />
            </div>
          </div>

          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <label>Taille</label>
              {footwearCategories.includes(item?.category) ? (
                <Input
                  value={item && item.size}
                  sx={{
                    "&:after": {
                      borderBottom: "2px solid #8356C0", // underline color on focus
                    },
                  }}
                  className="form-control w-25"
                  type="number"
                  placeholder="Pointure (ex: 40)"
                  onChange={(e) => setItem({ ...item, size: e.target.value })}
                />
              ) : item?.gender === "Kids" ||
                item?.category === "Babywear" ||
                item?.category === "Kidswear" ? (
                <Select
                  sx={{
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8356C0", // border color on focus
                    },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: "#8356C0", // another way to ensure border color
                      },
                    },
                  }}
                  className="form-control w-25 align-content-center"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                        overflowY: "auto",
                      },
                    },
                    MenuListProps: {
                      style: {
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)", // 3 columns across
                        gap: "8px", // spacing between items
                      },
                    },
                  }}
                  labelId="size-select-label"
                  value={item && item.size}
                  // label="Sélectionner une taille"
                  onChange={(e) => setItem({ ...item, size: e.target.value })}
                >
                  {kidSizes.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <>
                  <Slider
                    sx={{
                      color: "#8356C0", // base color (thumb, track, active state)
                      "& .MuiSlider-thumb": {
                        "&:hover, &.Mui-focusVisible, &.Mui-active": {
                          boxShadow: "0 0 0 8px #8356C0)", // optional focus ring
                        },
                      },
                    }}
                    className=" w-25"
                    disabled={!item?.category}
                    value={item.size || ""}
                    onChange={handleSliderChange}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) =>
                      sizeMarks.find((mark) => mark.value === value)?.label
                    }
                    step={1}
                    marks={sizeMarks}
                    min={0}
                    max={7}
                  />
                </>
              )}
            </div>
          </div>

          {/* Condition */}
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <label>Condition</label>
              <div className="d-flex gap-4">
                <RadioGroup
                  row
                  aria-labelledby="condition-label"
                  name="condition"
                  value={item.condition || ""}
                  onChange={(e) =>
                    setItem({ ...item, condition: e.target.value })
                  }
                >
                  {conditionOptions.map((c) => (
                    <FormControlLabel
                      key={c}
                      value={c}
                      control={
                        <Radio
                          sx={{
                            "&.Mui-checked": {
                              color: "#8356C0", // custom checked color
                            },
                            "&.Mui-focusVisible": {
                              outline: "2px solid #8356C0", // optional focus ring
                            },
                          }}
                        />
                      }
                      label={c}
                    />
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Tags (multi-select) */}
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <label>Tags</label>
              {/* <select multiple className="form-select w-50"
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions, o => o.value);
          setItem({ ...item, tags: selected });
        }}>
        {tagOptions.map(tag => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select> */}

              <Select
                sx={{
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#8356C0", // border color on focus
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: "#8356C0", // another way to ensure border color
                    },
                  },
                }}
                className="form-control w-25 align-content-center"
                labelId="category-label"
                value={item.tags || ""}
                onChange={(e) => setItem({ ...item, tags: e.target.value })}
                displayEmpty
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      overflowY: "auto",
                    },
                  },
                  MenuListProps: {
                    style: {
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)", // 3 columns across
                      gap: "8px", // spacing between items
                    },
                  },
                }}
              >
                {tagOptions.map((tag, index) => (
                  <MenuItem
                    selected={item.tags?.includes(tag)}
                    key={index}
                    value={tag}
                    sx={{
                      "&.Mui-selected": {
                        // backgroundColor: "violet.main", // selected color
                        backgroundColor: "rgba(131, 86, 192, 0.1)", // selected color
                        color: "black", // text color when selected
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "white", // darker shade on hover
                        color: "black", // text color on hover
                      },
                      "&:hover": {
                        backgroundColor: "rgba(131, 86, 192, 0.1)", // hover color
                      },
                    }}
                  >
                    {/* <Checkbox checked={item.tags?.includes(tag)} />
                    <ListItemText primary={tag} />{" "} */}
                    
                                        <Checkbox
                                          sx={{
                                            
                                            "&.Mui-checked": {
                                              color: "violet.main",
                                            },
                                          }}
                                          checked={item.tags?.includes(tag)}
                                        />
                                                            <ListItemText primary={tag} />
                                        
                    {/* {tag} */}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>

          <div className="card p-3">
            <div className="d-flex justify-content-between">
              <label
                htmlFor="previousOwners"
                className=" form-check-label align-content-center"
              >
                Previous Owners
              </label>
              <Input
                sx={{
                  "&:after": {
                    borderBottom: "2px solid #8356C0", // underline color on focus
                  },
                }}
                className="form-control w-25"
                type="number"
                min="0"
                placeholder="1"
                onChange={(e) =>
                  setItem({ ...item, previousOwners: e.target.value })
                }
                value={item && item.previousOwners}
              />
            </div>
          </div>
          <div className="card p-3">
            <div className="d-flex justify-content-between">
              <label
                htmlFor="price"
                className=" form-check-label align-content-center"
              >
                Price
              </label>
              <Input
                sx={{
                  "&:after": {
                    borderBottom: "2px solid #8356C0", // underline color on focus
                  },
                }}
                className="form-control w-25"
                type="text"
                placeholder="0.00 DT"
                onChange={(e) => setItem({ ...item, price: e.target.value })}
                value={item && item.price}
              />
            </div>
          </div>

          <button className="btn-submit w-25 rounded p-2 text-light">
            Add Article
          </button>
        </div>
      </form>
    </div>
  );
};

export default Edit;
