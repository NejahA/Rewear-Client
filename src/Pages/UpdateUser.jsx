import { FormControlLabel, Switch, TextField, Typography, Collapse, IconButton, Alert, Button } from "@mui/material";
import { ExpandMore, ExpandLess, Email, Cancel } from "@mui/icons-material";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
    pendingEmail: null,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");
  const [emailChangeRequested, setEmailChangeRequested] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_VERCEL_URI}/api/users/logged`, {
        withCredentials: true,
      })
      .then((res) => {
        const userData = res.data;
        setUser(userData);
        setOriginalEmail(userData.email || "");
        // Set profile picture preview
        if (userData.profilePic?.url) {
          setPreviewUrl(userData.profilePic.url);
        }
      })
      .catch((err) => {
        console.error("Failed to load user data:", err);
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Impossible de charger les données du profil.",
        });
      });
  }, []);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Type de fichier non supporté',
        text: 'Seules les images JPEG, JPG, PNG et GIF sont autorisées.',
      });
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Fichier trop volumineux',
        text: 'La taille maximale autorisée est de 5 Mo.',
      });
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };  const handleRemoveImage = () => {
    setSelectedFile(null);
    setUser(prev => ({ ...prev, profilePic: null }));
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };
  
  const handleToggle = (field) => (event) => {
    setUser(prev => ({ ...prev, [field]: event.target.checked }));
  };

  const handleLocationSelect = (coordinates, addressName) => {
    if (coordinates && addressName) {
      setUser(prev => ({
        ...prev,
        location: { lat: coordinates[0], lng: coordinates[1] },
        adress: addressName
      }));
    }
  };

  const handleCancelEmailChange = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_VERCEL_URI}/api/cancel-email-change`,
        {},
        { withCredentials: true }
      );

      Swal.fire({
        icon: 'success',
        title: 'Annulation réussie',
        text: response.data.message || 'Le changement d\'email a été annulé.',
        timer: 3000,
        showConfirmButton: false
      });
      setUser(prev => ({ ...prev, pendingEmail: null }));
      setEmailChangeRequested(false);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.message || 'Échec de l\'annulation du changement d\'email.',
      });
    }
  };

  const handleResendEmailVerification = async () => {
    if (!user.pendingEmail) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_VERCEL_URI}/api/resend-verification-email`,
        { email: user.pendingEmail },
        { withCredentials: true }
      );

      Swal.fire({
        icon: 'success',
        title: 'Email renvoyé',
        text: 'Un nouvel email de vérification a été envoyé.',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.message || 'Échec de l\'envoi de l\'email de vérification.',
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
    if (user.location?.lat) formData.append("lat", user.location.lat);
    if (user.location?.lng) formData.append("lng", user.location.lng);
    if (selectedFile) {
      formData.append("files", selectedFile);
    }
    const oldPics = user.profilePic || {};
    formData.append("profilePic", JSON.stringify(oldPics));
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_VERCEL_URI}/api/users/${user._id}`,
        formData,
        { withCredentials: true }
      );
      if (response.data.emailChangeRequested) {
        setEmailChangeRequested(true);
        setUser(prev => ({ ...prev, pendingEmail: response.data.pendingEmail }));
        Swal.fire({
          icon: 'info',
          title: 'Profil mis à jour',
          html: `
            <p>Votre profil a été mis à jour avec succès.</p>
            <p><strong>Vérification requise :</strong></p>
            <p>Un email de confirmation a été envoyé à <strong>${response.data.pendingEmail}</strong>.</p>
            <p>Veuillez cliquer sur le lien dans l'email pour finaliser le changement.</p>
          `,
          confirmButtonText: 'Compris',
          confirmButtonColor: '#8356C0'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Profil mis à jour avec succès !',
        }).then(() => navigate(-1));
      }
    } catch (err) {
      setErrors(err.response?.data || {});
      if (err.response?.data?.email) {
        Swal.fire({
          icon: 'error',
          title: 'Email invalide',
          text: err.response.data.email.message,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour.',
        });
      }
    }
  };

  // Cleanup blob URLs
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordFields(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordFields.currentPassword || !passwordFields.newPassword || !passwordFields.confirmNewPassword) {
      Swal.fire({ icon: "error", title: "Champs requis", text: "Tous les champs sont obligatoires." });
      return;
    }

    if (passwordFields.newPassword !== passwordFields.confirmNewPassword) {
      Swal.fire({ icon: "error", title: "Erreur", text: "Les nouveaux mots de passe ne correspondent pas." });
      return;
    }

    if (passwordFields.newPassword.length < 6) {
      Swal.fire({ icon: "error", title: "Erreur", text: "Le mot de passe doit contenir au moins 6 caractères." });
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_VERCEL_URI}/api/update-password`,
        passwordFields,
        { withCredentials: true }
      );

      Swal.fire({
        icon: "success",
        title: "Succès",
        text: response.data.message || "Mot de passe mis à jour avec succès !",
        timer: 2000,
        showConfirmButton: false
      });

      setPasswordFields({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
      setShowPasswordSection(false);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: err.response?.data?.message || "Échec de la mise à jour du mot de passe.",
      });
    }
  };
  const handleCancelPasswordChange = () => {
    setPasswordFields({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
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

            {/* Profile Picture */}
            <div className="card p-4">
              <div className="d-flex flex-column align-items-center gap-3">
                <h6 className="fw-bold mb-0">Photo de profil</h6>

                <div className="position-relative">
                  {previewUrl ? (
                    <div className="position-relative">
                      <img
                        src={previewUrl}
                        alt="Aperçu profil"
                        className="rounded-circle"
                        style={{ width: "120px", height: "120px", objectFit: "cover", border: "4px solid #8356C0" }}
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="btn btn-danger btn-sm position-absolute"
                        style={{ top: "-8px", right: "-8px", borderRadius: "50%", width: "32px", height: "32px" }}
                      >
                        <i className="bi bi-trash-fill" style={{ fontSize: "0.8rem" }}></i>
                      </button>
                    </div>
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "120px", height: "120px", backgroundColor: "#f0f0f0", border: "2px dashed #8356C0" }}
                    >
                      <i className="bi bi-person" style={{ fontSize: "3rem", color: "#8356C0" }}></i>
                    </div>
                  )}
                </div>
                <div className="position-relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleFileChange}
                    className="position-absolute w-100 h-100 opacity-0"
                    style={{ cursor: "pointer", zIndex: 2 }}
                  />
                  <button
                    type="button"
                    className="btn d-flex align-items-center gap-2 px-4 py-2"
                    style={{ backgroundColor: "#8356C0", color: "white", border: "none", borderRadius: "25px" }}
                  >
                    <i className="bi bi-camera"></i>
                    <span>Choisir une photo</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Personal Info */}
            <div className="card p-3">
              <h6 className="fw-bold mb-3">Informations personnelles</h6>
              <div className="mb-3">
                <label className="fw-bold mb-2 d-block">Prénom</label>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Prénom"
                  value={user.fName || ""}
                  onChange={(e) => setUser(prev => ({ ...prev, fName: e.target.value }))}
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#8356C0" } }}
                />
              </div>
              <div className="mb-3">
                <label className="fw-bold mb-2 d-block">Nom</label>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Nom"
                  value={user.lName || ""}
                  onChange={(e) => setUser(prev => ({ ...prev, lName: e.target.value }))}
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#8356C0" } }}
                />
              </div>
            </div>
            {/* Change Password */}
            <div className="card p-3">
              <div
                className="d-flex justify-content-between align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => setShowPasswordSection(!showPasswordSection)}
              >
                <h6 className="fw-bold mb-0">Changer le mot de passe</h6>
                <IconButton size="small" sx={{ color: "#8356C0" }}>
                  {showPasswordSection ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </div>
              <Collapse in={showPasswordSection} timeout="auto" unmountOnExit>
                <div className="mt-3 p-3" style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                  <Typography variant="body2" className="text-muted mb-3">
                    Entrez votre mot de passe actuel et choisissez-en un nouveau
                  </Typography>
                  <TextField fullWidth label="Mot de passe actuel" type="password" name="currentPassword" value={passwordFields.currentPassword} onChange={handlePasswordChange} margin="normal" />
                  <TextField fullWidth label="Nouveau mot de passe" type="password" name="newPassword" value={passwordFields.newPassword} onChange={handlePasswordChange} helperText="Minimum 6 caractères" margin="normal" />
                  <TextField fullWidth label="Confirmer" type="password" name="confirmNewPassword" value={passwordFields.confirmNewPassword} onChange={handlePasswordChange} margin="normal" />
                  <div className="d-flex gap-2 mt-4">
                    <button type="button" className="btn btn-outline-secondary flex-fill py-2" onClick={handleCancelPasswordChange}>Annuler</button>
                    <button type="button" className="btn flex-fill py-2 text-white" style={{ backgroundColor: "#8356C0" }} onClick={handlePasswordSubmit}>Mettre à jour</button>
                  </div>
                </div>
              </Collapse>
            </div>
            {/* Contact Info */}
            <div className="card p-3">
              <h6 className="fw-bold mb-3">Informations de contact</h6>
              {/* Email */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="fw-bold mb-0">Adresse e-mail</label>
                  <FormControlLabel
                    control={<Switch checked={user.showEmail} onChange={(e) => setUser(prev => ({ ...prev, showEmail: e.target.checked }))} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#8356C0" }, "& .MuiSwitch-track": { bgcolor: "#8356C0" } }} />}
                    label={<small className="text-muted">Visible: {user.showEmail ? "Oui" : "Non"}</small>}
                    labelPlacement="start"
                  />
                </div>

                {user.pendingEmail && (
                  <Alert severity="info" className="mb-3" action={
                    <div className="d-flex gap-1">
                      <Button size="small" startIcon={<Email />} onClick={handleResendEmailVerification} sx={{ color: '#1976d2' }}>Renvoyer</Button>
                      <Button size="small" startIcon={<Cancel />} onClick={handleCancelEmailChange} sx={{ color: '#f44336' }}>Annuler</Button>
                    </div>
                  }>
                    <strong>Changement d'email en attente</strong><br />
                    Nouvel email : <strong>{user.pendingEmail}</strong><br />
                    <small>Cliquez sur le lien dans l'email reçu pour confirmer.</small>
                  </Alert>
                )}
                <TextField
                  fullWidth
                  type="email"
                  placeholder="exemple@email.com"
                  value={user.email || ""}
                  onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                  helperText={
                    user.email !== originalEmail && !user.pendingEmail
                      ? "Un email de vérification sera envoyé après sauvegarde."
                      : user.pendingEmail
                      ? "En attente de confirmation"
                      : ""
                  }
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#8356C0" } }}
                />
                {errors?.email && <small className="text-danger d-block mt-1">{errors.email.message}</small>}
              </div>
              {/* Phone */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="fw-bold mb-0">Téléphone</label>
                  <FormControlLabel
                    control={<Switch checked={user.showPhone} onChange={handleToggle("showPhone")} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#8356C0" }, "& .MuiSwitch-track": { bgcolor: "#8356C0" } }} />}
                    label={<small className="text-muted">Visible: {user.showPhone ? "Oui" : "Non"}</small>}
                    labelPlacement="start"
                  />
                </div>
                <TextField
                  fullWidth
                  type="tel"
                  placeholder="12 345 678"
                  value={user.phone || ""}
                  onChange={(e) => setUser(prev => ({ ...prev, phone: e.target.value }))}
                  sx={{ "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#8356C0" } }}
                />
              </div>
            </div>
            {/* Address */}
            <div className="card p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Adresse</h6>
                <FormControlLabel
                  control={<Switch checked={user.showAdress} onChange={handleToggle("showAdress")} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#8356C0" }, "& .MuiSwitch-track": { bgcolor: "#8356C0" } }} />}
                  label={<small className="text-muted">Visible: {user.showAdress ? "Oui" : "Non"}</small>}
                  labelPlacement="start"
                />
              </div>
              <div className="mt-3">
                <LocationPicker
                  onLocationSelect={handleLocationSelect}
                  initialAddress={user.adress || ''}
                  initialPosition={user.location?.lat ? [user.location.lat, user.location.lng] : null}
                />
              </div>
            </div>
            {/* Submit Button */}
            <div className="sticky-bottom bg-white p-3 border-top shadow-sm">
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
