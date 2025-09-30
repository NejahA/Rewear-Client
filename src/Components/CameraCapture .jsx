import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCw, Check } from 'lucide-react';
import { MdOutlineCameraswitch } from 'react-icons/md';

const CameraCapture = ({ onCapture, onClose, maxPhotos = 5, currentCount = 0 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState(null);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    checkCameras();
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const checkCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setHasMultipleCameras(videoDevices.length > 1);
    } catch (err) {
      console.error('Error checking cameras:', err);
    }
  };

  const startCamera = async () => {
  try {
    setError(null);
    const constraints = {
      video: {
        facingMode: facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
    }
    setStream(mediaStream);
  } catch (err) {
    console.error('Camera error:', err);
    setError('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.');
  }
};

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageDataUrl);
    }
  };

const confirmPhoto = () => {
  if (capturedImage) {
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        setCapturedImage(null);
        if (currentCount + 1 >= maxPhotos) {
          stopCamera();
          onClose();
        }
      });
  }
};

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setCapturedImage(null);
  };

  if (error) {
    return (
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
           style={{ backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999 }}>
        <div className="text-center text-white p-4">
          <p className="mb-3">{error}</p>
          <button className="btn btn-light" onClick={onClose}>Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100" 
         style={{ backgroundColor: '#000', zIndex: 9999 }}>
      
      {/* Header */}
      <div className="position-absolute top-0 start-0 w-100 d-flex justify-content-between align-items-center p-3" 
           style={{ zIndex: 10000, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <button className="btn btn-link text-white p-2" onClick={onClose}>
          <X size={28} />
        </button>
        <span className="text-white fw-bold">{currentCount}/{maxPhotos} photos</span>
        {hasMultipleCameras && (
          <button className="btn btn-link text-white p-2" onClick={switchCamera}>
            {/* <RotateCw size={24} /> */}
                    <MdOutlineCameraswitch style={{ fontSize: "2rem", color:"white" }}/>

          </button>
        )}
        {!hasMultipleCameras && <div style={{ width: '52px' }}></div>}
      </div>

      {/* Camera View */}
      <div className="w-100 h-100 d-flex align-items-center justify-content-center position-relative">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
            />
            
            {/* Capture Button */}
            <div className="position-absolute bottom-0 start-0 w-100 d-flex justify-content-center pb-5" 
                 style={{ zIndex: 10000 }}>
              <button
                className="rounded-circle border border-white border-4 bg-white"
                style={{ width: '80px', height: '80px', boxShadow: '0 0 20px rgba(255,255,255,0.5)' }}
                onClick={capturePhoto}
              >
                <Camera size={40} className="text-dark" />
              </button>
            </div>
          </>
        ) : (
          <>
            <img
              src={capturedImage}
              alt="Captured"
              className="w-100 h-100"
              style={{ objectFit: 'contain' }}
            />
            
            {/* Confirm/Retake Buttons */}
            <div className="position-absolute bottom-0 start-0 w-100 d-flex justify-content-around align-items-center pb-5 px-4" 
                 style={{ zIndex: 10000 }}>
              <button
                className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '60px', height: '60px' }}
                onClick={retakePhoto}
              >
                <X size={30} />
              </button>
              <button
                className="btn btn-success rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '70px', height: '70px' }}
                onClick={confirmPhoto}
              >
                <Check size={35} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};



export default CameraCapture;