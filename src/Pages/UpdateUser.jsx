import { FormControlLabel, Switch, TextField, Input, Typography, Collapse, IconButton, Alert, Button } from "@mui/material";
import { ExpandMore, ExpandLess, Email, CheckCircle, Cancel } from "@mui/icons-material";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from 'sweetalert2';
import LocationPicker from "../Components/LocationPicker";

const UpdateUser = () => {
  const [user, setUser] = useState({
    email: "",
    fName: "",
    lName: "",
    adress: "",
    location: { lat: null, lng: null },
    profilePic: {},
    itemHistory: [],
    phone: "",
    showEmail: false,
    showPhone: false,
    showAdress: false,
    pendingEmail: null, // New field for pending email changes
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [originalEmail, setOriginalEmail] = useState(""); // Track original email
  const [emailChangeRequested, setEmailChangeRequested] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    axios
      .get("" + import.meta.env.VITE_VERCEL_URI + "/api/users/logged", {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data);
        setOriginalEmail(res.data.email); // Store original email
        
        // Set initial preview if user has existing profile pic
        if (res.data.profilePic && res.data.profilePic.url) {
          setPreviewUrl(res.data.profilePic.url);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

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

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Fichier trop volumineux',
          text: 'La taille du fichier ne doit pas dépasser 5MB',
        });
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      console.log("FILE from change/add=====> :", file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setUser((prev) => ({
      ...prev,
      profilePic: null,
    }));
    // Clean up preview URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleToggle = (field) => (event) => {
    setUser((prev) => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const handleLocationSelect = async (coordinates, addressName = null) => {
    if (addressName) console.log("Selected address name:", addressName);
    if (coordinates) console.log("Selected coordinates:", coordinates);

    if (coordinates && addressName) {
      setUser(prev => ({
        ...prev,
        location: { lat: coordinates[0], lng: coordinates[1] },
        adress: addressName
      }));
    }
    console.log("user after update ===>", JSON.stringify(user));
  };

  // New function to cancel pending email change
  const handleCancelEmailChange = async () => {
    try {
      const response = await axios.post(
        "" + import.meta.env.VITE_VERCEL_URI + "/api/cancel-email-change",
        {},
        { withCredentials: true }
      );

      Swal.fire({
        icon: 'success',
        title: 'Email change cancelled',
        text: response.data.message,
        timer: 3000,
        showConfirmButton: false
      });

      // Update user state to remove pending email
      setUser(prev => ({
        ...prev,
        pendingEmail: null
      }));
      setEmailChangeRequested(false);

    } catch (error) {
      console.error('Cancel email change error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.message || 'Erreur lors de l\'annulation du changement d\'email',
      });
    }
  };

  // New function to resend verification email for email change
  const handleResendEmailVerification = async () => {
    if (!user.pendingEmail) return;

    try {
      const response = await axios.post(
        "" + import.meta.env.VITE_VERCEL_URI + "/api/resend-verification-email",
        { email: user.pendingEmail },
        { withCredentials: true }
      );

      Swal.fire({
        icon: 'success',
        title: 'Email envoyé',
        text: 'Un nouvel email de vérification a été envoyé à votre nouvelle adresse.',
        timer: 3000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Resend verification error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email de vérification',
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("fName", user.fName);
    formData.append("lName", user.lName);
    formData.append("adress", user.adress);
    formData.append("phone", user.phone);
    formData.append("showEmail", user.showEmail);
    formData.append("showPhone", user.showPhone);
    formData.append("showAdress", user.showAdress);
    formData.append("lat", user.location.lat);
    formData.append("lng", user.location.lng);

    if (selectedFile) {
      formData.append("files", selectedFile);
    }

    const oldPics = user.profilePic || {};
    const serializedPics = JSON.stringify(oldPics);
    formData.delete("profilePic");
    formData.append("profilePic", serializedPics);

    try {
      const response = await axios.put(
        "" + import.meta.env.VITE_VERCEL_URI + "/api/users/" + user._id,
        formData,
        { withCredentials: true }
      );

      // Check if email change was requested
      if (response.data.emailChangeRequested) {
        setEmailChangeRequested(true);
        setUser(prev => ({
          ...prev,
          pendingEmail: response.data.pendingEmail
        }));

        Swal.fire({
          icon: 'info',
          title: 'Profil mis à jour',
          html: `
            <p>Votre profil a été mis à jour avec succès.</p>
            <p><strong>Vérification d'email requise:</strong> Un email de vérification a été envoyé à <strong>${response.data.pendingEmail}</strong>.</p>
            <p>Veuillez vérifier votre nouvelle adresse email pour finaliser le changement.</p>
          `,
          confirmButtonText: 'Compris',
          confirmButtonColor: '#8356C0'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Profil mis à jour avec succès',
        }).then(() => {
          navigate(-1);
        });
      }

    } catch (err) {
      console.log(err);
      setErrors(err.response?.data);

      // Handle specific email validation errors
      if (err.response?.data?.email) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur de validation email',
          text: err.response.data.email.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.response?.data?.message || 'Une erreur est survenue',
        });
      }
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const [passwordFields, setPasswordFields] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  // New handler for updating password state
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFields({ ...passwordFields, [name]: value });
  };

  // New handler for submitting password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordFields.currentPassword || !passwordFields.newPassword || !passwordFields.confirmNewPassword) {
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: "Veuillez remplir tous les champs de mot de passe.",
      });
      return;
    }

    if (passwordFields.newPassword !== passwordFields.confirmNewPassword) {
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: "Les nouveaux mots de passe ne correspondent pas.",
      });
      return;
    }

    if (passwordFields.newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
      });
      return;
    }

    try {
      console.log("inside handlePasswordSubmit with fields:", passwordFields);
      const response = await axios.put(
        "" + import.meta.env.VITE_VERCEL_URI + "/api/update-password",
        passwordFields,
        { withCredentials: true }
      );
      Swal.fire({
        icon: "success",
        title: "Mot de passe mis à jour!",
        text: response.data.message,
        showConfirmButton: false,
        timer: 2000
      });
      // Reset password fields and close section after successful update
      setPasswordFields({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
      setShowPasswordSection(false);
    } catch (err) {
      console.error("Password update error :", err);
      Swal.fire({
        icon: "error",
        title: "Erreur!",
        text: err.response?.data?.message || "Échec de la mise à jour du mot de passe.",
      });
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordFields({
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: ""
    });
    setShowPasswordSection(false);
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f8f9fa" }}>
      <form onSubmit={handleUpload} className="w-100">
        <div className="container-fluid px-3 py-4" style={{ maxWidth: "100%" }}>
          <div className="d-flex flex-column gap-4">

            {/* Header */}
            <div className="d-flex align-items-center gap-3 mb-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-light d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <h4 className="mb-0 fw-bold">Modifier le profil</h4>
            </div>

            {/* Profile Picture Section */}
            <div className="card p-4">
              <div className="d-flex flex-column align-items-center gap-3">
                <h6 className="fw-bold mb-0">Photo de profil</h6>

                {/* Profile Picture Preview */}
                <div className="position-relative">
                  {previewUrl ? (
                    <div className="position-relative">
                      <img
                        src={previewUrl}
                        className="rounded-circle"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          border: "4px solid #8356C0"
                        }}
                        alt="Profile preview"
                      />
                      <button
                        className="btn btn-danger btn-sm position-absolute"
                        style={{
                          top: "-8px",
                          right: "-8px",
                          borderRadius: "50%",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                        type="button"
                        onClick={handleRemoveImage}
                      >
                        <i className="bi bi-trash-fill" style={{ fontSize: "0.8rem" }}></i>
                      </button>
                    </div>
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "120px",
                        height: "120px",
                        backgroundColor: "#f0f0f0",
                        border: "2px dashed #8356C0"
                      }}
                    >
                      <i className="bi bi-person" style={{ fontSize: "3rem", color: "#8356C0" }}></i>
                    </div>
                  )}
                </div>

                {/* File Upload Button */}
                <div className="position-relative">
                  <input
                    className="position-absolute w-100 h-100 opacity-0"
                    style={{ cursor: "pointer", zIndex: 2 }}
                    type="file"
                    accept="image/jpeg, image/png, image/gif, image/jpg"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    className="btn d-flex align-items-center gap-2 px-4 py-2"
                    style={{
                      backgroundColor: "#8356C0",
                      color: "white",
                      border: "none",
                      borderRadius: "25px"
                    }}
                  >
                    <i className="bi bi-camera"></i>
                    <span>Choisir une photo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="card p-3">
              <h6 className="fw-bold mb-3">Informations personnelles</h6>

              {/* First Name */}
              <div className="mb-3">
                <label className="fw-bold mb-2 d-block">Prénom</label>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Prénom"
                  value={user.fName || ""}
                  onChange={(e) => setUser({ ...user, fName: e.target.value })}
                  sx={{
                    "& label.Mui-focused": { color: "#8356C0" },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                    },
                  }}
                />
                {errors?.fName && (
                  <small className="text-danger">{errors.fName.message}</small>
                )}
              </div>

              {/* Last Name */}
              <div className="mb-3">
                <label className="fw-bold mb-2 d-block">Nom</label>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Nom"
                  value={user.lName || ""}
                  onChange={(e) => setUser({ ...user, lName: e.target.value })}
                  sx={{
                    "& label.Mui-focused": { color: "#8356C0" },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                    },
                  }}
                />
                {errors?.lName && (
                  <small className="text-danger">{errors.lName.message}</small>
                )}
              </div>
            </div>

            {/* Password Change Section - Collapsible */}
            <div className="card p-3">
              <div 
                className="d-flex justify-content-between align-items-center cursor-pointer"
                style={{ cursor: "pointer" }}
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                <h6 className="fw-bold mb-0">Changer le mot de passe</h6>
                <IconButton 
                  size="small" 
                  style={{ color: "#8356C0" }}
                >
                  {showPasswordSection ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </div>
              
              <Collapse in={showPasswordSection} timeout="auto" unmountOnExit>
                <div className="mt-3 p-3" style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                  <Typography variant="body2" className="text-muted mb-3">
                    Entrez votre mot de passe actuel et choisissez-en un nouveau
                  </Typography>
                  
                  <div className="mb-3">
                    <TextField
                      fullWidth
                      label="Mot de passe actuel"
                      variant="outlined"
                      type="password"
                      name="currentPassword"
                      value={passwordFields.currentPassword}
                      onChange={handlePasswordChange}
                      sx={{
                        "& label.Mui-focused": { color: "#8356C0" },
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                        },
                      }}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <TextField
                      fullWidth
                      label="Nouveau mot de passe"
                      variant="outlined"
                      type="password"
                      name="newPassword"
                      value={passwordFields.newPassword}
                      onChange={handlePasswordChange}
                      helperText="Minimum 6 caractères"
                      sx={{
                        "& label.Mui-focused": { color: "#8356C0" },
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                        },
                      }}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <TextField
                      fullWidth
                      label="Confirmer le nouveau mot de passe"
                      variant="outlined"
                      type="password"
                      name="confirmNewPassword"
                      value={passwordFields.confirmNewPassword}
                      onChange={handlePasswordChange}
                      sx={{
                        "& label.Mui-focused": { color: "#8356C0" },
                        "& .MuiOutlinedInput-root": {
                          "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                        },
                      }}
                    />
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary flex-fill py-2"
                      onClick={handleCancelPasswordChange}
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      className="btn flex-fill py-2 text-white"
                      style={{
                        backgroundColor: "#8356C0",
                        border: "none",
                      }}
                      onClick={handlePasswordSubmit}
                    >
                      Mettre à jour
                    </button>
                  </div>
                </div>
              </Collapse>
            </div>

            {/* Contact Information */}
            <div className="card p-3">
              <h6 className="fw-bold mb-3">Informations de contact</h6>

              {/* Email with Pending Verification Alert */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="fw-bold mb-0">Adresse e-mail</label>
                  <FormControlLabel
                    control={
                      <Switch
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#8356C0",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: "#8356C0",
                          },
                        }}
                        checked={user.showEmail || false}
                        onChange={(e) => {
                          const check = e.target.checked;
                          setUser({ ...user, showEmail: check });
                        }}
                      />
                    }
                    label={
                      <small className="text-muted">
                        Visible: {user.showEmail ? "Oui" : "Non"}
                      </small>
                    }
                    labelPlacement="start"
                  />
                </div>

                {/* Show pending email verification alert */}
                {user.pendingEmail && (
                  <Alert 
                    severity="info" 
                    className="mb-3"
                    action={
                      <div className="d-flex gap-1">
                        <Button
                          size="small"
                          startIcon={<Email />}
                          onClick={handleResendEmailVerification}
                          sx={{ color: '#1976d2' }}
                        >
                          Renvoyer
                        </Button>
                        <Button
                          size="small"
                          startIcon={<Cancel />}
                          onClick={handleCancelEmailChange}
                          sx={{ color: '#f44336' }}
                        >
                          Annuler
                        </Button>
                      </div>
                    }
                  >
                    <div>
                      <strong>Changement d'email en attente</strong>
                      <br />
                      Nouvel email: <strong>{user.pendingEmail}</strong>
                      <br />
                      <small>Vérifiez votre nouvelle adresse email pour confirmer le changement.</small>
                    </div>
                  </Alert>
                )}

                <TextField
                  fullWidth
                  variant="outlined"
                  type="email"
                  placeholder="exemple@email.com"
                  value={user.email || ""}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  helperText={
                    user.email !== originalEmail && !user.pendingEmail 
                      ? "Un email de vérification sera envoyé à la nouvelle adresse." 
                      : undefined
                  }
                  sx={{
                    "& label.Mui-focused": { color: "#8356C0" },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                    },
                  }}
                />
                {errors?.email && (
                  <small className="text-danger">{errors.email.message}</small>
                )}
              </div>

              {/* Phone */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="fw-bold mb-0">Téléphone</label>
                  <FormControlLabel
                    control={
                      <Switch
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#8356C0",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: "#8356C0",
                          },
                        }}
                        checked={user.showPhone || false}
                        onChange={handleToggle("showPhone")}
                      />
                    }
                    label={
                      <small className="text-muted">
                        Visible: {user.showPhone ? "Oui" : "Non"}
                      </small>
                    }
                    labelPlacement="start"
                  />
                </div>
                <TextField
                  fullWidth
                  variant="outlined"
                  type="tel"
                  placeholder="12 345 678"
                  value={user.phone || ""}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  sx={{
                    "& label.Mui-focused": { color: "#8356C0" },
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": { borderColor: "#8356C0" },
                    },
                  }}
                />
                {errors?.phone && (
                  <small className="text-danger">{errors.phone.message}</small>
                )}
              </div>
            </div>

            {/* Address/Location */}
            <div className="card p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Adresse</h6>
                <FormControlLabel
                  control={
                    <Switch
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#8356C0",
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#8356C0",
                        },
                      }}
                      checked={user.showAdress || false}
                      onChange={handleToggle("showAdress")}
                    />
                  }
                  label={
                    <small className="text-muted">
                      Visible: {user.showAdress ? "Oui" : "Non"}
                    </small>
                  }
                  labelPlacement="start"
                />
              </div>

              {/* Location Picker Component */}
              <div className="mt-3">
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialAddress={user?.adress || ''}
                  initialPosition={user?.location?.lat ? [user.location.lat, user.location.lng] : null}
                />
              </div>
            </div>

            {/* Submit Button - Sticky at bottom */}
            <div className="sticky-bottom bg-white p-3 border-top mt-4">
              <button
                type="submit"
                className="btn w-100 py-3 fw-bold text-white"
                style={{
                  backgroundColor: "#8356C0",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  minHeight: "56px",
                }}
              >
                Sauvegarder les modifications
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default UpdateUser;