import axios from "axios";
import React, { useState, useEffect } from "react";
import Logout from "../Components/Logout";
import { Link, useNavigate, useParams } from "react-router-dom";
// import Cookies from 'universal-cookies';
import Swal from 'sweetalert2';
import Box from '@mui/material/Box';
import { Checkbox, ListItemText, Slider, Typography } from "@mui/material";
import { Select, MenuItem, InputLabel, FormControl, Input, TextField } from '@mui/material';
import {
  Radio,
  FormLabel,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import CameraCapture from "../Components/CameraCapture ";

const sizeMarks = [
  { value: 0, label: 'XXS' },
  { value: 1, label: 'XS' },
  { value: 2, label: 'S' },
  { value: 3, label: 'M' },
  { value: 4, label: 'L' },
  { value: 5, label: 'XL' },
  { value: 6, label: 'XXL' },
];

const genderOptions = ["Male", "Female", "Unisex"];
const ageOptions = ['Baby', 'Child', 'Teen', 'Adult'];
const categoryOptions = ['T-Shirts', 'Shirts', 'Sweaters', 'Jeans', 'Trousers', 'Shorts',
  'Jackets', 'Coats', 'Dresses', 'Skirts', 'Bags', 'Accessories', 'Activewear', 'Sleepwear',
  'Swimwear', 'Kidswear', 'Babywear', 'Shoes', 'Sneakers',
  'Heels', "Boots", "Sandals"
];
const footwearCategories = ['Shoes', 'Sneakers', 'Heels', "Boots", "Sandals"];
const conditionOptions = ['New with tags', 'Like new', 'Good', 'Acceptable'];
const adultSizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const kidSizes = [
  '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M',
  '2Y', '3Y', '4Y', '5Y', '6Y', '7Y', '8Y', '9Y', '10Y', '12Y', '14Y', '16Y'
];
const tagOptions = ['Eco-friendly', 'Sustainable', 'Vintage', 'Minimal', 'Streetwear', 'Luxury', 'Formal', 'Casual', 'Colorful', 'Neutral', 'Trendy', 'Classic', '90s', 'Y2K', 'Preppy', 'Boho', 'Sporty', 'Plus Size'];

const Create = () => {
  const [item, setItem] = useState({ tags: [] });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState(null);
  const nav = useNavigate();
  const [totalImageCount, setTotalImageCount] = useState(0);
const [showCamera, setShowCamera] = useState(false);


  const handleFileChange0 = (e) => {
    const files = e.target.files;
    setSelectedFiles(files);
    console.log("FILES ====>", files); // This will always be the latest
  };

  const handleFileChange = (e) => {
    if (!e.target.files || totalImageCount >= 5) return;

    const files = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Type de fichier non supporté',
        text: 'Seules les images JPEG, PNG, GIF et JPG sont autorisées',
      });
      return;
    }

    const availableSlots = 5 - totalImageCount;
    const filesToAdd = files.slice(0, availableSlots);
    setSelectedFiles(prev => [...prev, ...filesToAdd]);
  };

  const navigate = useNavigate();
  // const token = localStorage.getItem('token')

  const handleSliderChange = (event, newValue) => {
    setItem({ ...item, size: newValue });
  };

  useEffect(() => {
    // Update total image count whenever selectedFiles changes
    setTotalImageCount(selectedFiles.length);
  }, [selectedFiles]);
  useEffect(() => {
    // if (!token) {
    //     navigate('/')
    // } else
    {
      axios
        .get("" + import.meta.env.VITE_VERCEL_URI + "/api/users/logged", {
          withCredentials: true,
        })
        .then((res) => {
          console.log("create res ==> ", res.data._id);
          setItem({ ...item, user: res.data._id });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);
  const handleRemoveImage0 = (index) => {
    const updatedFiles = Array.from(selectedFiles);
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };
  const handleRemoveImage = (index) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
  };
  const handleUpload = (e) => {
    // const formData = new FormData();
    // formData.append("file", selectedFiles);
    e.preventDefault();
    const formData = new FormData();

    // formData.append("title", item.title);
    // formData.append("category", item.category);
    // formData.append("brand", item.brand);
    // formData.append("size", item.size);
    // formData.append("description", item.description);
    // formData.append("price", item.price);

    formData.append("user", item.user);
    for (const [key, value] of Object.entries(item)) {
      if (key !== "user" && key !== "size" && key !== "tags  " && value) {
        formData.append(key, value); // Append only if value is present
      }
    }
    formData.delete("tags"); // Remove size if it exists, we'll append it later
    if (item.tags && item.tags.length) {
      item.tags.forEach(tag => formData.append('tags', tag));
    }
    const found = sizeMarks.find((mark) => mark.value === item.size);
    console.log("fund ===>", found && found.label);
    if (found) {
      formData.append("size", found.label || null); // Append only if value is present
    }
    else {
      item && item.size  && 
       formData.append("size", item.size) // Append only if value is present
     
    }
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        // newarr.push(selectedFiles[i]);
        formData.append("files", selectedFiles[i]);
      }
    }
    console.log("item ====>", item);
    if (totalImageCount === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez ajouter au moins une image',
      });
      return;
    }
    axios
      .post("" + import.meta.env.VITE_VERCEL_URI + "/api/items", formData, {
        withCredentials: true,
      })
      .then((res) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Article créé avec succès',
        }).then(() => {
          navigate("/");
        });
      })
      .catch((err) => {
        console.log(err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.response?.data?.message || 'Une erreur est survenue',
        });
        setErrors(err.response.data.errors);
      });
  };
  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <div  className="w-100">
        {/* Mobile-optimized container with proper padding */}
        <div className="container-fluid px-3 py-4" style={{ maxWidth: "100%" }}>
          <div className="d-flex flex-column gap-4">
            
            {/* Image Upload Section - Mobile Optimized */}
            <div className="card p-3">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 fw-bold">Photos</h6>
                  <small className="text-muted">({totalImageCount}/5)</small>
                </div>
                







                {/* Mobile-friendly file upload button */}
                <div className={`position-relative file-upload-container ${totalImageCount >= 5 ? 'upload-disabled' : ''}`}>
  <input
    className="position-absolute w-100 h-100 opacity-0"
    style={{ 
      cursor: totalImageCount >= 5 ? 'not-allowed' : 'pointer', 
      zIndex: 2 
    }}
    type="file"
    accept="image/jpeg, image/png, image/gif, image/jpg"
    multiple
    disabled={totalImageCount >= 5}
    onChange={handleFileChange}
  />
  
  <div 
    className="upload-area d-flex flex-column align-items-center justify-content-center gap-2 p-4 text-center"
    style={{ 
      backgroundColor: totalImageCount >= 5 ? "#f8f9fa" : "#f0e6ff", 
      color: totalImageCount >= 5 ? "#6c757d" : "#5a4b81",
      border: `2px dashed ${totalImageCount >= 5 ? "#ced4da" : "#8356C0"}`,
      borderRadius: "12px",
      minHeight: "140px",
      transition: "all 0.3s ease"
    }}
  >
    <i 
      className={`bi ${totalImageCount >= 5 ? 'bi-cloud-slash' : 'bi-cloud-plus-fill'}`} 
      style={{ fontSize: "2.5rem", color: totalImageCount >= 5 ? "#adb5bd" : "#8356C0" }}
    ></i>
    <div>
      <span className="fw-bold d-block">
        {totalImageCount >= 5 ? 'Maximum atteint (5/5)' : `Ajouter des photos (${totalImageCount}/5)`}
      </span>
      <small className="text-muted">
        {totalImageCount >= 5 ? 'Vous avez atteint la limite maximale' : 'Glissez-déposez ou cliquez pour ajouter'}
      </small>
    </div>
    {totalImageCount >= 5 && (
      <small className="text-info mt-1">
        <i className="bi bi-info-circle me-1"></i>
        Supprimez une photo pour en ajouter une nouvelle
      </small>
    )}
  </div>
</div>

<div className="d-flex justify-content-center">
      <button 
        type="button"
        className="btn p-3 d-flex align-items-center justify-content-center"
        onClick={() => setShowCamera(true)}
        disabled={totalImageCount >= 5}
        title="Prendre une photo"
        style={{
          width: "60px", 
          height: "60px",
          borderRadius: "50%",
          backgroundColor: totalImageCount >= 5 ? "#adb5bd" : "#8356C0",
          color: "white",
          border: "none",
          transition: "background-color 0.3s ease",
          cursor: totalImageCount >= 5 ? 'not-allowed' : 'pointer',
          boxShadow: totalImageCount >= 5 ? 'none' : '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <i className="bi bi-camera-fill" style={{ fontSize: "1.5rem" }}></i>
      </button>
    </div>

    
{showCamera && (
  <CameraCapture
    onCapture={(file) => {
      setSelectedFiles(prev => [...prev, file]);
    }}
    onClose={() => setShowCamera(false)}
    maxPhotos={5}
    currentCount={totalImageCount}
  />
)}


                {/* Image preview grid - Mobile optimized */}
                {(item?.itemPics?.length > 0 || selectedFiles.length > 0) && (
                  <div className="row g-2">
                    {/* Existing images */}
                    {item?.itemPics?.map((imagepath, idx) => (
                      <div key={`existing-${idx}`} className="col-6 col-sm-4 col-md-3">
                        <div className="position-relative">
                          <img
                            src={imagepath.url}
                            className="w-100 rounded"
                            style={{ aspectRatio: "1/1", objectFit: "cover" }}
                            alt={`preview-${idx}`}
                          />
                          <button
                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-1 d-flex align-items-center justify-content-center"
                            style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                            type="button"
                            onClick={() => handleRemoveImage(idx, true)}
                          >
                            <i className="bi bi-trash-fill" style={{ fontSize: "0.8rem" }}></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* New selected files */}
 <div 
  className="d-flex gap-2 flex-nowrap overflow-x-auto" 
  style={{ gap: "1rem" }}
>
  {selectedFiles?.map((file, idx) => (
    <div key={`new-${idx}`} className="col-6 col-sm-4 col-md-3" style={{ flex: "0 0 auto" }}>
      <div className="position-relative">
        <img
          src={URL.createObjectURL(file)}
          className="w-100 rounded"
          style={{ aspectRatio: "1/1", objectFit: "cover" }}
          alt={`preview-${idx}`}
        />
        <button
          className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 p-1 d-flex align-items-center justify-content-center"
          style={{ width: "32px", height: "32px", borderRadius: "50%" }}
          type="button"
          onClick={() => handleRemoveImage(idx, false)}
        >
          <i className="bi bi-trash-fill" style={{ fontSize: "0.8rem" }}></i>
        </button>
      </div>
    </div>
  ))}
</div>
                  </div>
                )}
              </div>
            </div>

            {/* Title and Description - Stacked on mobile */}
            <div className="card p-3">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex flex-column gap-2">
                  <label htmlFor="title" className="fw-bold mb-0">Titre</label>
                  <Input
                    fullWidth
                    value={item?.title || ""}
                    sx={{
                      "&:after": { borderBottom: "2px solid #8356C0" },
                    }}
                    type="text"
                    placeholder="ex: sweatshirt noir"
                    onChange={(e) => setItem({ ...item, title: e.target.value })}
                  />
                  {errors?.title?.message && (
                    <small className="text-danger">Veuillez insérer un titre</small>
                  )}
                </div>
                
                <div className="d-flex flex-column gap-2">
                  <label htmlFor="description" className="fw-bold mb-0">Description</label>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    sx={{
                      "& label.Mui-focused": { color: "#8356C0" },
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                      },
                    }}
                    placeholder="ex: porté quelques fois, taille correcte"
                    onChange={(e) => setItem({ ...item, description: e.target.value })}
                    value={item?.description || ""}
                  />
                </div>
              </div>
            </div>

            {/* Category - Mobile optimized */}
            <div className="card p-3">
              <div className="d-flex flex-column gap-2">
                <label className="fw-bold mb-0">Catégorie</label>
                <Select
                  fullWidth
                  sx={{
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8356C0",
                    },
                  }}
                  value={item.category || ""}
                  onChange={(e) => setItem({ ...item, category: e.target.value })}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 300, overflowY: "auto" },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <em>Sélectionner une catégorie</em>
                  </MenuItem>
                  {categoryOptions.map((categoryName, index) => (
                    <MenuItem key={index} value={categoryName}>
                      {categoryName}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Gender - Mobile optimized radio buttons */}
            <div className="card p-3">
              <div className="d-flex flex-column gap-3">
                <label className="fw-bold mb-0">Genre</label>
                <RadioGroup
                  row={false} // Stack vertically on mobile for better touch targets
                  className="d-flex flex-row flex-wrap gap-2"
                  value={item?.gender || ""}
                  onChange={(e) => setItem({ ...item, gender: e.target.value })}
                >
                  {genderOptions.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={
                        <Radio
                          sx={{
                            "&.Mui-checked": { color: "#8356C0" },
                            padding: "12px", // Larger touch target
                          }}
                        />
                      }
                      label={option}
                      sx={{ margin: 0, minWidth: "fit-content" }}
                    />
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Age - Mobile optimized */}
            <div className="card p-3">
              <div className="d-flex flex-column gap-3">
                <label className="fw-bold mb-0">Âge</label>
                <RadioGroup
                  className="d-flex flex-row flex-wrap gap-2"
                  value={item?.age || ""}
                  onChange={(e) => setItem({ ...item, age: e.target.value })}
                >
                  {ageOptions.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={
                        <Radio
                          sx={{
                            "&.Mui-checked": { color: "#8356C0" },
                            padding: "12px",
                          }}
                        />
                      }
                      label={option}
                      sx={{ margin: 0, minWidth: "fit-content" }}
                    />
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Brand */}
            <div className="card p-3">
              <div className="d-flex flex-column gap-2">
                <label className="fw-bold mb-0">Marque</label>
                <Input
                  fullWidth
                  value={item?.brand || ""}
                  sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                  type="text"
                  placeholder="Zara, Bershka, etc.."
                  onChange={(e) => setItem({ ...item, brand: e.target.value })}
                />
              </div>
            </div>

            {/* Size - Mobile optimized */}
            <div className="card p-3">
              <div className="d-flex flex-column gap-3">
                <label className="fw-bold mb-0">Taille</label>
                {footwearCategories.includes(item?.category) ? (
                  <Input
                    fullWidth
                    value={item?.size || ""}
                    sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                    type="number"
                    placeholder="Pointure (ex: 40)"
                    onChange={(e) => setItem({ ...item, size: e.target.value })}
                  />
                ) : item?.gender === "Kids" || item?.category === "Babywear" || item?.category === "Kidswear" ? (
                  <Select
                    fullWidth
                    sx={{
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#8356C0",
                      },
                    }}
                    value={item?.size || ""}
                    onChange={(e) => setItem({ ...item, size: e.target.value })}
                  >
                    {kidSizes.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                ) : (
                  <div className="px-2">
                    <Slider
                      sx={{
                        color: "#8356C0",
                        height: 8, // Thicker slider for easier mobile interaction
                        "& .MuiSlider-thumb": {
                          width: 24,
                          height: 24, // Larger thumb for mobile
                          "&:hover, &.Mui-focusVisible, &.Mui-active": {
                            boxShadow: "0 0 0 8px rgba(131, 86, 192, 0.16)",
                          },
                        },
                      }}
                      disabled={!item?.category}
                      value={item.size || 0}
                      onChange={handleSliderChange}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) =>
                        sizeMarks.find((mark) => mark.value === value)?.label || ""
                      }
                      step={1}
                      marks={sizeMarks}
                      min={0}
                      max={sizeMarks? sizeMarks && sizeMarks.length-1 : 6}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Condition - Mobile optimized */}
            <div className="card p-3">
              <div className="d-flex flex-column gap-3">
                <label className="fw-bold mb-0">État</label>
                <RadioGroup
                  className="d-flex flex-column gap-1"
                  value={item.condition || ""}
                  onChange={(e) => setItem({ ...item, condition: e.target.value })}
                >
                  {conditionOptions.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={
                        <Radio
                          sx={{
                            "&.Mui-checked": { color: "#8356C0" },
                            padding: "12px",
                          }}
                        />
                      }
                      label={option}
                      sx={{ margin: 0 }}
                    />
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Tags - Mobile optimized */}
            <div className="card p-3">
              <div className="d-flex flex-column gap-2">
                <label className="fw-bold mb-0">Tags</label>
                <Select
                  multiple
                  fullWidth
                  sx={{
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#8356C0",
                    },
                  }}
                  value={item.tags || []}
                  onChange={(e) => setItem({ ...item, tags: e.target.value })}
                  displayEmpty
                  renderValue={(selected) =>
                    Array.isArray(selected) ? selected.join(", ") : ""
                  }
                  MenuProps={{
                    PaperProps: {
                      style: { maxHeight: 300, overflowY: "auto" },
                    },
                  }}
                >
                  {tagOptions.map((tag) => (
                    <MenuItem
                      key={tag}
                      value={tag}
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: "rgba(131, 86, 192, 0.1)",
                          color: "black",
                        },
                        "&.Mui-selected:hover": {
                          backgroundColor: "rgba(131, 86, 192, 0.2)",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(131, 86, 192, 0.1)",
                        },
                        // Larger touch targets for mobile
                        minHeight: "48px",
                      }}
                    >
                      <Checkbox
                        sx={{
                          "&.Mui-checked": { color: "#8356C0" },
                          padding: "12px",
                        }}
                        checked={item.tags?.includes(tag)}
                      />
                      <ListItemText primary={tag} />
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Previous Owners and Price - Side by side on larger screens, stacked on mobile */}
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="card p-3">
                  <div className="d-flex flex-column gap-2">
                    <label className="fw-bold mb-0">Propriétaires précédents</label>
                    <Input
                      fullWidth
                      sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                      type="number"
                      min="0"
                      placeholder="1"
                      onChange={(e) => setItem({ ...item, previousOwners: e.target.value })}
                      value={item?.previousOwners || ""}
                    />
                  </div>
                </div>
              </div>
              
              <div className="col-12 col-md-6">
                <div className="card p-3">
                  <div className="d-flex flex-column gap-2">
                    <label className="fw-bold mb-0">Prix</label>
                    <Input
                      fullWidth
                      sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                      type="text"
                      placeholder="0.00 DT"
                      onChange={(e) => setItem({ ...item, price: e.target.value })}
                      value={item?.price || ""}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button - Mobile optimized */}
            <div className="sticky-bottom bg-white p-3 border-top mt-4">
              <button
                onClick={handleUpload}
                className="btn w-100 py-3 fw-bold text-white"
                style={{
                  backgroundColor: "#8356C0",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  minHeight: "56px", // Larger touch target
                }}
              >
                Présenter l'article
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;