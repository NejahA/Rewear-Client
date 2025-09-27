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

const Edit = () => {
  const [item, setItem] = useState({});
  const [totalImageCount, setTotalImageCount] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState(null);
  
  const handleSliderChange = (event, newValue) => {
    setItem({ ...item, size: newValue });
  };

  useEffect(() => {
    console.log("item changed ===>", item);
    const existingImagesCount = item && item.itemPics ? item.itemPics.length : 0;
    const newFilesCount = selectedFiles.length;
    setTotalImageCount(existingImagesCount + newFilesCount);
  }, [item, selectedFiles]);

  const navigate = useNavigate();
  // const cookies = new Cookies();
  const { id } = useParams();

  useEffect(() => {
    axios
      .get("" + import.meta.env.VITE_VERCEL_URI + "/api/items/" + id, { withCredentials: true })
      .then(async (res) => {
        const itemData = res.data;
        const found = sizeMarks.find(mark => mark.label === itemData.size);
        const updatedItem = {
          ...itemData,
          size: found ? found.value : itemData.size
        };
        setItem(updatedItem);
        console.log("updated state item ===>", res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    const availableSlots = 5 - totalImageCount;
    const filesToAdd = validFiles.slice(0, availableSlots);
    setSelectedFiles(prev => [...prev, ...filesToAdd]);
  };

  const handleRemoveImage = (index, isExistingImage = false) => {
    if (isExistingImage) {
      if (item && item.itemPics) {
        const updatedPics = [...item.itemPics];
        updatedPics.splice(index, 1);
        setItem({ ...item, itemPics: updatedPics });
      }
    } else {
      const updatedFiles = [...selectedFiles];
      updatedFiles.splice(index, 1);
      setSelectedFiles(updatedFiles);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    setItem({
      ...item, gender: (item?.category === "Babywear" ||
        item?.category === "Kidswear") ? "kid" : item?.gender
    });

    formData.append("user", item.user._id)
    console.log("user from formdata ===>", item.user);
    
    for (const [key, value] of Object.entries(item)) {
      if ((key !== 'user' && key !== 'size') && value) {
        formData.append(key, value);
      }
    }
    
    const found = sizeMarks.find(mark => mark.value === item.size);
    console.log("fund ===>", found && found.label);
    if (found) {
      formData.append("size", found.label);
    } else {
      formData.append("size", item.size);
    }
    
    if (selectedFiles) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
      }
    }

    const oldPics = item.itemPics || [];
    const serializedPics = await JSON.stringify(oldPics)
    console.log("serializedPics ===>", serializedPics, "type:", typeof serializedPics);
    formData.delete("itemPics");
    formData.append('itemPics', serializedPics);

    console.log("raw itemPics from formdata ==>", formData.get("itemPics"));
    console.log("type of itemPics in formdata:", typeof formData.get("itemPics"));
    formData.delete("tags");

    if (item.tags && item.tags.length) {
      item.tags.forEach(tag => formData.append('tags', tag));
    }
    
    if (totalImageCount === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez ajouter au moins une image',
      });
      return;
    }
    
    axios
      .put("" + import.meta.env.VITE_VERCEL_URI + "/api/items/" + id, formData, { withCredentials: true })
      .then((res) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Article modifié avec succès',
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
      });
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <form onSubmit={handleUpload} className="w-100">
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

                {/* Image preview grid - Mobile optimized */}
                <div 
  className="d-flex flex-nowrap overflow-x-auto" 
  style={{ gap: "1rem" }}
>
  {/* Existing images */}
  {item?.itemPics?.map((imagepath, idx) => (
    <div key={`existing-${idx}`} className="col-6 col-sm-4 col-md-3" style={{ flex: "0 0 auto" }}>
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
                      max={7}
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
                type="submit"
                className="btn w-100 py-3 fw-bold text-white"
                style={{
                  backgroundColor: "#8356C0",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  minHeight: "56px", // Larger touch target
                }}
              >
                Modifier l'article
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Edit;