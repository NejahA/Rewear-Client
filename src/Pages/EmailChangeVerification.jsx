import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Alert, Button } from '@mui/material';
import { CheckCircle, Error, Email } from '@mui/icons-material';
import axios from 'axios';
import Swal from 'sweetalert2';

const EmailChangeVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [emailDetails, setEmailDetails] = useState(null);

  useEffect(() => {
    if (!token) {
      setVerificationState('error');
      setMessage('Token de vérification manquant.');
      return;
    }

    verifyEmailChange();
  }, [token]);

  const verifyEmailChange = async () => {
    try {
      setVerificationState('loading');
      
      const response = await axios.put(
        `${import.meta.env.VITE_VERCEL_URI}/api/verify-email-change/${token}`,
        { withCredentials: true }
      );

      if (response.data.valid) {
        setVerificationState('success');
        setMessage(response.data.message);
        setEmailDetails({
          oldEmail: response.data.oldEmail,
          newEmail: response.data.newEmail
        });

        // Show success notification
        Swal.fire({
          icon: 'success',
          title: 'Email vérifié avec succès!',
          text: response.data.message,
          confirmButtonText: 'Continuer',
          confirmButtonColor: '#8356C0'
        });

      } else {
        setVerificationState('error');
        setMessage(response.data.message || 'Erreur lors de la vérification de l\'email.');
      }

    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationState('error');
      setMessage(
        error.response?.data?.message || 
        'Erreur lors de la vérification de l\'email. Le lien peut être expiré ou invalide.'
      );
    }
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const renderLoadingState = () => (
    <div className="d-flex flex-column align-items-center text-center p-4">
      <CircularProgress 
        size={60} 
        sx={{ color: '#8356C0', mb: 3 }} 
      />
      <h5 className="fw-bold mb-2">Vérification en cours...</h5>
      <p className="text-muted">
        Nous vérifions votre nouvelle adresse email.
      </p>
    </div>
  );

  const renderSuccessState = () => (
    <div className="d-flex flex-column align-items-center text-center p-4">
      <CheckCircle 
        sx={{ 
          fontSize: 80, 
          color: '#28a745', 
          mb: 3 
        }} 
      />
      <h4 className="fw-bold text-success mb-3">
        Email mis à jour avec succès!
      </h4>
      <p className="text-muted mb-4">
        {message}
      </p>
      
      {emailDetails && (
        <div className="card w-100 mb-4" style={{ maxWidth: '400px' }}>
          <div className="card-body">
            <h6 className="fw-bold mb-3">Détails du changement:</h6>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Ancien email:</small>
                <small className="fw-bold">{emailDetails.oldEmail}</small>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Nouvel email:</small>
                <small className="fw-bold text-success">{emailDetails.newEmail}</small>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="d-flex gap-2 w-100" style={{ maxWidth: '300px' }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={handleGoToLogin}
          sx={{
            borderColor: '#8356C0',
            color: '#8356C0',
            '&:hover': {
              borderColor: '#6a4ba0',
              backgroundColor: 'rgba(131, 86, 192, 0.04)'
            }
          }}
        >
          Se connecter
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={handleGoToProfile}
          sx={{
            backgroundColor: '#8356C0',
            '&:hover': {
              backgroundColor: '#6a4ba0'
            }
          }}
        >
          Mon profil
        </Button>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="d-flex flex-column align-items-center text-center p-4">
      <Error 
        sx={{ 
          fontSize: 80, 
          color: '#dc3545', 
          mb: 3 
        }} 
      />
      <h4 className="fw-bold text-danger mb-3">
        Erreur de vérification
      </h4>
      <Alert severity="error" className="w-100 mb-4" style={{ maxWidth: '400px' }}>
        {message}
      </Alert>
      
      <div className="d-flex flex-column gap-3 w-100" style={{ maxWidth: '300px' }}>
        <p className="text-muted small">
          Le lien peut avoir expiré ou être invalide. Vous pouvez demander un nouveau lien 
          depuis les paramètres de votre profil.
        </p>
        
        <div className="d-flex gap-2">
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate('/profile/edit')}
            sx={{
              borderColor: '#8356C0',
              color: '#8356C0',
              '&:hover': {
                borderColor: '#6a4ba0',
                backgroundColor: 'rgba(131, 86, 192, 0.04)'
              }
            }}
          >
            Paramètres
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleGoToLogin}
            sx={{
              backgroundColor: '#8356C0',
              '&:hover': {
                backgroundColor: '#6a4ba0'
              }
            }}
          >
            Se connecter
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header text-center" style={{ backgroundColor: '#8356C0' }}>
                <h5 className="text-white mb-0 d-flex align-items-center justify-content-center gap-2">
                  <Email />
                  Vérification Email
                </h5>
              </div>
              <div className="card-body">
                {verificationState === 'loading' && renderLoadingState()}
                {verificationState === 'success' && renderSuccessState()}
                {verificationState === 'error' && renderErrorState()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailChangeVerification;