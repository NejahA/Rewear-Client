import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import Box from '@mui/material/Box';
import { Checkbox, ListItemText, Slider, Typography } from "@mui/material";
import { Select, MenuItem, InputLabel, FormControl, Input, TextField } from '@mui/material';
import { Radio, FormLabel, RadioGroup, FormControlLabel } from '@mui/material';
// import CameraCapture from "../Components/CameraCapture";
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
  'Swimwear', 'Kidswear', 'Babywear', 'Shoes', 'Sneakers', 'Heels', "Boots", "Sandals"
];
const footwearCategories = ['Shoes', 'Sneakers', 'Heels', "Boots", "Sandals"];
const conditionOptions = ['New with tags', 'Like new', 'Good', 'Acceptable'];
const kidSizes = [
  '0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M',
  '2Y', '3Y', '4Y', '5Y', '6Y', '7Y', '8Y', '9Y', '10Y', '12Y', '14Y', '16Y'
];
const tagOptions = ['Eco-friendly', 'Sustainable', 'Vintage', 'Minimal', 'Streetwear', 'Luxury', 'Formal', 'Casual', 'Colorful', 'Neutral', 'Trendy', 'Classic', '90s', 'Y2K', 'Preppy', 'Boho', 'Sporty', 'Plus Size'];

const Edit = () => {
  const [item, setItem] = useState({ tags: [], stock: 1 });
  const [totalImageCount, setTotalImageCount] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errors, setErrors] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_VERCEL_URI}/api/items/${id}`, { withCredentials: true })
      .then((res) => {
        const itemData = res.data;
        const found = sizeMarks.find(mark => mark.label === itemData.size);
        const updatedItem = {
          ...itemData,
          size: found ? found.value : itemData.size,
          stock: itemData.stock || 1
        };
        setItem(updatedItem);
        setTotalImageCount(itemData.itemPics?.length || 0);
      })
      .catch((err) => {
        console.error("Error fetching item:", err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Failed to load item data',
        });
      });
  }, [id]);

  useEffect(() => {
    const existingImagesCount = item.itemPics?.length || 0;
    const newFilesCount = selectedFiles.length;
    setTotalImageCount(existingImagesCount + newFilesCount);
  }, [item.itemPics, selectedFiles]);

  const handleFileChange = (e) => {
    if (!e.target.files || totalImageCount >= 5) return;
    const files = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    const availableSlots = 5 - totalImageCount;
    const filesToAdd = validFiles.slice(0, availableSlots);
    setSelectedFiles(prev => [...prev, ...filesToAdd]);
  };

  const handleRemoveImage = (index, isExistingImage = false) => {
    if (isExistingImage) {
      if (item.itemPics) {
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

  const handleSliderChange = (event, newValue) => {
    setItem({ ...item, size: sizeMarks[newValue].label });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", item.title || "");
    formData.append("category", item.category || "");
    formData.append("brand", item.brand || "");
    formData.append("size", item.size || "");
    formData.append("age", item.age || "");
    formData.append("condition", item.condition || "");
    formData.append("gender", item.category === "Babywear" || item.category === "Kidswear" ? "Unisex" : item.gender || "");
    formData.append("tags", JSON.stringify(item.tags || []));
    formData.append("previousOwners", item.previousOwners || "");
    formData.append("description", item.description || "");
    formData.append("price", item.price || "");
    formData.append("stock", item.stock || 1);
    formData.append("user", item.user?._id || "");

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await axios.put(`${import.meta.env.VITE_VERCEL_URI}/api/items/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      Swal.fire({
        icon: 'success',
        title: 'Article modifié avec succès!',
        showConfirmButton: false,
        timer: 1500
      });
      navigate("/");
    } catch (err) {
      console.error("Error updating item:", err);
      setErrors(err.response?.data?.errors || { message: "Failed to update item" });
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: err.response?.data?.errors?.message || 'Failed to update item',
      });
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          {errors && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {Object.values(errors).map((err, idx) => (
                <div key={idx}>{err.message}</div>
              ))}
            </Alert>
          )}
          <div className="card p-3 mb-3">
            <div className="d-flex flex-column gap-2">
              <label className="fw-bold mb-0">Titre</label>
              <Input
                fullWidth
                sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                placeholder="Entrez le titre"
                onChange={(e) => setItem({ ...item, title: e.target.value })}
                value={item.title || ""}
              />
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <div className="card p-3">
                <div className="d-flex flex-column gap-2">
                  <label className="fw-bold mb-0">Catégorie</label>
                  <Select
                    fullWidth
                    sx={{ "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#8356C0" } }}
                    value={item.category || ""}
                    onChange={(e) => setItem({ ...item, category: e.target.value })}
                  >
                    <MenuItem value=""><em>Sélectionnez une catégorie</em></MenuItem>
                    {categoryOptions.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card p-3">
                <div className="d-flex flex-column gap-2">
                  <label className="fw-bold mb-0">Marque</label>
                  <Input
                    fullWidth
                    sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                    placeholder="Entrez la marque"
                    onChange={(e) => setItem({ ...item, brand: e.target.value })}
                    value={item.brand || ""}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <div className="card p-3">
                <div className="d-flex flex-column gap-2">
                  <label className="fw-bold mb-0">Âge</label>
                  <Select
                    fullWidth
                    sx={{ "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#8356C0" } }}
                    value={item.age || ""}
                    onChange={(e) => setItem({ ...item, age: e.target.value })}
                  >
                    <MenuItem value=""><em>Sélectionnez un âge</em></MenuItem>
                    {ageOptions.map((age) => (
                      <MenuItem key={age} value={age}>{age}</MenuItem>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card p-3">
                <div className="d-flex flex-column gap-2">
                  <label className="fw-bold mb-0">Condition</label>
                  <Select
                    fullWidth
                    sx={{ "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#8356C0" } }}
                    value={item.condition || ""}
                    onChange={(e) => setItem({ ...item, condition: e.target.value })}
                  >
                    <MenuItem value=""><em>Sélectionnez une condition</em></MenuItem>
                    {conditionOptions.map((condition) => (
                      <MenuItem key={condition} value={condition}>{condition}</MenuItem>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <div className="card p-3 mb-3">
            <FormControl>
              <FormLabel className="fw-bold">Genre</FormLabel>
              <RadioGroup
                row
                value={item.gender || ""}
                onChange={(e) => setItem({ ...item, gender: e.target.value })}
              >
                {genderOptions.map((gender) => (
                  <FormControlLabel
                    key={gender}
                    value={gender}
                    control={<Radio sx={{ color: "#8356C0", "&.Mui-checked": { color: "#8356C0" } }} />}
                    label={gender}
                    disabled={item.category === "Babywear" || item.category === "Kidswear"}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </div>
          <div className="card p-3 mb-3">
            <div className="d-flex flex-column gap-2">
              <label className="fw-bold mb-0">Taille</label>
              {item.category && footwearCategories.includes(item.category) ? (
                <Input
                  fullWidth
                  sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                  type="number"
                  min="0"
                  placeholder="Entrez la taille (numérique)"
                  onChange={(e) => setItem({ ...item, size: e.target.value })}
                  value={item.size || ""}
                />
              ) : item.age === 'Adult' ? (
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={sizeMarks.findIndex(mark => mark.label === item.size) !== -1 ? sizeMarks.findIndex(mark => mark.label === item.size) : 3}
                    onChange={handleSliderChange}
                    step={1}
                    marks={sizeMarks}
                    min={0}
                    max={6}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => sizeMarks[value].label}
                  />
                </Box>
              ) : (
                <Select
                  fullWidth
                  sx={{ "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#8356C0" } }}
                  value={item.size || ""}
                  onChange={(e) => setItem({ ...item, size: e.target.value })}
                >
                  <MenuItem value=""><em>Sélectionnez une taille</em></MenuItem>
                  {kidSizes.map((size) => (
                    <MenuItem key={size} value={size}>{size}</MenuItem>
                  ))}
                </Select>
              )}
            </div>
          </div>
          <div className="card p-3 mb-3">
            <div className="d-flex flex-column gap-2">
              <label className="fw-bold mb-0">Description</label>
              <TextField
                fullWidth
                multiline
                rows={4}
                sx={{ "& .MuiOutlinedInput-root": { "&.Mui-focused fieldset": { borderColor: "#8356C0" } } }}
                placeholder="Entrez la description"
                onChange={(e) => setItem({ ...item, description: e.target.value })}
                value={item.description || ""}
              />
            </div>
          </div>
          <div className="card p-3 mb-3">
            <div className="d-flex flex-column gap-3">
              <label className="fw-bold mb-0">Images (max 5)</label>
              <button
                onClick={() => setShowCamera(true)}
                className="btn btn-outline-primary w-100 py-3"
                style={{ borderColor: "#8356C0", color: "#8356C0" }}
              >
                <i className="bi bi-camera me-2"></i> Prendre une photo
              </button>
              {showCamera && (
                <CameraCapture
                  onCapture={(file) => {
                    if (totalImageCount < 5) {
                      setSelectedFiles(prev => [...prev, file]);
                    }
                    setShowCamera(false);
                  }}
                  onClose={() => setShowCamera(false)}
                />
              )}
              <div className="position-relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                  style={{ cursor: 'pointer' }}
                  disabled={totalImageCount >= 5}
                />
                <div
                  className="btn btn-outline-secondary w-100 py-3"
                  style={{ borderColor: "#8356C0", color: "#8356C0" }}
                >
                  <i className="bi bi-upload me-2"></i> Choisir des images
                </div>
              </div>
              <div className="row g-2">
                {item.itemPics?.map((pic, index) => (
                  <div key={`existing-${index}`} className="col-4 col-md-3 position-relative">
                    <img
                      src={pic.url}
                      alt={`existing-${index}`}
                      className="img-fluid rounded"
                      style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => handleRemoveImage(index, true)}
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                      style={{ padding: '2px 6px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {selectedFiles.map((file, index) => (
                  <div key={`new-${index}`} className="col-4 col-md-3 position-relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${index}`}
                      className="img-fluid rounded"
                      style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                      style={{ padding: '2px 6px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <small className="text-muted text-center d-block">
                {totalImageCount}/5 images sélectionnées
              </small>
            </div>
          </div>
          <div className="card p-3 mb-3">
            <div className="d-flex flex-column gap-2">
              <label className="fw-bold mb-0">Tags</label>
              <Select
                multiple
                fullWidth
                sx={{ "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#8356C0" } }}
                value={item.tags || []}
                onChange={(e) => setItem({ ...item, tags: e.target.value })}
                renderValue={(selected) => selected.join(", ")}
                MenuProps={{ PaperProps: { style: { maxHeight: 300, overflowY: "auto" } } }}
              >
                {tagOptions.map((tag) => (
                  <MenuItem
                    key={tag}
                    value={tag}
                    sx={{
                      "&.Mui-selected": { backgroundColor: "rgba(131, 86, 192, 0.1)", color: "black" },
                      "&.Mui-selected:hover": { backgroundColor: "rgba(131, 86, 192, 0.2)" },
                      "&:hover": { backgroundColor: "rgba(131, 86, 192, 0.1)" },
                      minHeight: "48px",
                    }}
                  >
                    <Checkbox
                      sx={{ "&.Mui-checked": { color: "#8356C0" }, padding: "12px" }}
                      checked={item.tags?.includes(tag)}
                    />
                    <ListItemText primary={tag} />
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <div className="card p-3">
                <div className="d-flex flex-column gap-2">
                  <label className="fw-bold mb-0">Propriétaires précédents</label>
                  <Input
                    fullWidth
                    sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                    type="number"
                    min="0"
                    placeholder="0"
                    onChange={(e) => setItem({ ...item, previousOwners: e.target.value })}
                    value={item.previousOwners || ""}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card p-3">
                <div className="d-flex flex-column gap-2">
                  <label className="fw-bold mb-0">Prix</label>
                  <Input
                    fullWidth
                    sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00 DT"
                    onChange={(e) => setItem({ ...item, price: e.target.value })}
                    value={item.price || ""}
                  />
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card p-3">
                <div className="d-flex flex-column gap-2">
                  <label className="fw-bold mb-0">Stock</label>
                  <Input
                    fullWidth
                    sx={{ "&:after": { borderBottom: "2px solid #8356C0" } }}
                    type="number"
                    min="1"
                    placeholder="1"
                    onChange={(e) => setItem({ ...item, stock: e.target.value })}
                    value={item.stock || "1"}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="sticky-bottom bg-white p-3 border-top mt-4">
            <button
              onClick={handleUpload}
              className="btn w-100 py-3 fw-bold text-white"
              style={{
                backgroundColor: "#8356C0",
                border: "none",
                borderRadius: "12px",
                fontSize: "1.1rem",
                minHeight: "56px",
              }}
            >
              Modifier l'article
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Edit;