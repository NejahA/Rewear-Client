// LocationPicker.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

const LocationPicker = ({ onLocationSelect, initialPosition, initialAddress }) => {
  const [position, setPosition] = useState(initialPosition || null);
  const [address, setAddress] = useState(initialAddress || "");
  const [editableAddress, setEditableAddress] = useState(initialAddress || "");
  const [showAddressCard, setShowAddressCard] = useState(!!initialAddress);
  const [zoomLevel, setZoomLevel] = useState(13);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectionMode, setSelectionMode] = useState('click'); // 'click' or 'button'
  const mapRef = useRef();
  const mapInstance = useRef();
  const markerRef = useRef();
  const geocoderRef = useRef();
  const LRef = useRef();
  const geocoderControlRef = useRef();

  // Function to generate Google Maps URL
  const generateGoogleMapsUrl = useCallback((lat, lng, addressText) => {
    if (addressText) {
      const encodedAddress = encodeURIComponent(addressText);
      return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    } else if (lat && lng) {
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }
    return '';
  }, []);

  // Function to update or create marker
  const updateMarker = useCallback((newPosition) => {
    if (!LRef.current || !mapInstance.current) return;
    
    // Remove any existing markers
    if (markerRef.current) {
      mapInstance.current.removeLayer(markerRef.current);
    }
    
    // Create new marker
    markerRef.current = LRef.current.marker(newPosition).addTo(mapInstance.current);
  }, []);

  // Function to remove marker
  const removeMarker = useCallback(() => {
    if (markerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  }, []);

  // Function to perform reverse geocoding with fallback
  const reverseGeocode = useCallback(async (latlng, zoom) => {
    if (!geocoderRef.current) return null;
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(null);
      }, 500);
      
      geocoderRef.current.reverse(
        latlng, 
        zoom, 
        (results) => {
          clearTimeout(timeout);
          resolve(results);
        }
      );
    });
  }, []);

  // Function to get address from coordinates using a direct API call as fallback
  const getAddressFromCoordinates = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar,fr`
      );
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      return data.display_name || null;
    } catch (error) {
      console.error("Direct API reverse geocoding failed:", error);
      return null;
    }
  }, []);

  const handleLocationSelectComplete = useCallback((newPosition, addressName) => {
    setPosition(newPosition);
    setAddress(addressName);
    setEditableAddress(addressName);
    setShowAddressCard(true);
    updateMarker(newPosition);
    
    // Generate Google Maps URL
    const mapsUrl = generateGoogleMapsUrl(newPosition[0], newPosition[1], addressName);
    setGoogleMapsUrl(mapsUrl);
    
    onLocationSelect(newPosition, addressName);
  }, [updateMarker, generateGoogleMapsUrl, onLocationSelect]);

  const handleRemoveAddressCard = useCallback(() => {
    setShowAddressCard(false);
    setAddress('');
    setEditableAddress('');
    setPosition(null);
    setGoogleMapsUrl('');
    removeMarker();
    
    // Reset map view to default position
    if (mapInstance.current) {
      mapInstance.current.setView([36.8065, 10.1815], 13);
      setZoomLevel(13);
    }
    
    // Call onLocationSelect with null values to indicate removal
    onLocationSelect(null, null);
  }, [removeMarker, onLocationSelect]);

  // Function to open Google Maps in a new tab
  const openGoogleMaps = useCallback(() => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
    }
  }, [googleMapsUrl]);

  // Function to save edited address
  const saveEditedAddress = useCallback(() => {
    setAddress(editableAddress);
    
    // Generate new Google Maps URL with edited address
    const mapsUrl = generateGoogleMapsUrl(position[0], position[1], editableAddress);
    setGoogleMapsUrl(mapsUrl);
    
    // Notify parent component about the address change
    onLocationSelect(position, editableAddress);
    
    setIsEditingAddress(false);
  }, [editableAddress, position, generateGoogleMapsUrl, onLocationSelect]);

  // Function to cancel editing
  const cancelEditing = useCallback(() => {
    setEditableAddress(address);
    setIsEditingAddress(false);
  }, [address]);

  // Function to handle map click for location selection
  const handleMapClick = useCallback(async (e) => {
    if (selectionMode !== 'click') return;
    
    const newPosition = [e.latlng.lat, e.latlng.lng];
    
    // Update marker position
    updateMarker(newPosition);
    
    // Reverse geocode to get address from coordinates
    let addressName = null;
    
    try {
      // Try using the leaflet geocoder first
      const results = await reverseGeocode(e.latlng, zoomLevel);
      
      if (results && results.length > 0 && results[0]) {
        addressName = results[0].name;
      } else {
        // Fallback to direct API call
        addressName = await getAddressFromCoordinates(e.latlng.lat, e.latlng.lng);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
    
    // If we still don't have an address, create a coordinate-based one
    if (!addressName) {
      addressName = `Location at ${newPosition[0].toFixed(6)}, ${newPosition[1].toFixed(6)}`;
    }
    
    // Complete the location selection
    handleLocationSelectComplete(newPosition, addressName);
  }, [zoomLevel, updateMarker, reverseGeocode, getAddressFromCoordinates, handleLocationSelectComplete, selectionMode]);

  // Function to handle selection via button
  const handleSelectButtonClick = useCallback(async () => {
    if (!mapInstance.current) return;
    
    const center = mapInstance.current.getCenter();
    const newPosition = [center.lat, center.lng];
    
    // Update marker position
    updateMarker(newPosition);
    
    // Reverse geocode to get address from coordinates
    let addressName = null;
    
    try {
      // Try using the leaflet geocoder first
      const results = await reverseGeocode(center, zoomLevel);
      
      if (results && results.length > 0 && results[0]) {
        addressName = results[0].name;
      } else {
        // Fallback to direct API call
        addressName = await getAddressFromCoordinates(center.lat, center.lng);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
    
    // If we still don't have an address, create a coordinate-based one
    if (!addressName) {
      addressName = `Location at ${newPosition[0].toFixed(6)}, ${newPosition[1].toFixed(6)}`;
    }
    
    // Complete the location selection
    handleLocationSelectComplete(newPosition, addressName);
  }, [zoomLevel, updateMarker, reverseGeocode, getAddressFromCoordinates, handleLocationSelectComplete]);

  // Function to handle double-click for zooming only
  const handleDoubleClick = useCallback((e) => {
    if (!mapInstance.current) return;
    
    // Zoom in on double-click without changing selection
    const currentZoom = mapInstance.current.getZoom();
    const newZoom = Math.min(currentZoom + 1, 18);
    mapInstance.current.setView(e.latlng, newZoom);
    setZoomLevel(newZoom);
  }, []);

  useEffect(() => {
    setAddress(initialAddress || "");
    setEditableAddress(initialAddress || "");
    setShowAddressCard(!!initialAddress);
    
    // Generate Google Maps URL for initial position if available
    if (initialPosition && initialPosition[0] && initialPosition[1]) {
      const mapsUrl = generateGoogleMapsUrl(initialPosition[0], initialPosition[1], initialAddress);
      setGoogleMapsUrl(mapsUrl);
    }
  }, [initialAddress, initialPosition, generateGoogleMapsUrl]);

  useEffect(() => {
    // Import leaflet and geocoder dynamically
    Promise.all([
      import('leaflet'),
      import('leaflet-control-geocoder')
    ]).then(([L, { default: Geocoder }]) => {
      LRef.current = L;
      
      // Fix for default marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Initialize map
      mapInstance.current = L.map(mapRef.current).setView([36.8065, 10.1815], zoomLevel);

      // Add tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(mapInstance.current);

      // Track zoom changes
      mapInstance.current.on('zoomend', () => {
        setZoomLevel(mapInstance.current.getZoom());
      });

      // Add initial marker if position exists
      if (position && position[0] && position[1]) {
        updateMarker(position);
        setShowAddressCard(true);
        
        // Generate Google Maps URL for initial position
        const mapsUrl = generateGoogleMapsUrl(position[0], position[1], address);
        setGoogleMapsUrl(mapsUrl);
      }

      // Initialize geocoder with language preference
      geocoderRef.current = Geocoder.nominatim({
        geocoder: {
          language: 'ar,fr'
        }
      });
      
      // Create geocoder control without automatically adding markers
      geocoderControlRef.current = L.Control.geocoder({
        geocoder: geocoderRef.current,
        placeholder: 'Search for an address...',
        errorMessage: 'Address not found.',
        showResultIcons: true,
        collapsed: true,
        position: 'topright',
        defaultMarkGeocode: false
      }).addTo(mapInstance.current);

      // Handle geocoder results
      geocoderControlRef.current.on('markgeocode', (e) => {
        const { center, name } = e.geocode;
        const newPosition = [center.lat, center.lng];
        const currentZoom = mapInstance.current.getZoom();
        
        // Update marker position
        updateMarker(newPosition);
        
        // Set appropriate zoom level based on address type
        let newZoom = currentZoom;
        if (name.includes('country') || name.includes('state')) {
          newZoom = 8; // Zoom out for large areas
        } else if (name.includes('city') || name.includes('town')) {
          newZoom = 12; // Medium zoom for cities
        } else {
          newZoom = 16; // High zoom for specific addresses
        }
        
        // Set the view with new position and appropriate zoom
        if (mapInstance.current) {
          mapInstance.current.setView(newPosition, newZoom);
          setZoomLevel(newZoom);
        }
        
        // Complete the location selection
        handleLocationSelectComplete(newPosition, name);
      });

      // Add click handler for location selection
      mapInstance.current.on('click', handleMapClick);
      
      // Add double-click handler for zooming only
      mapInstance.current.on('dblclick', handleDoubleClick);

      // Add custom zoom controls
      const zoomControl = L.control.zoom({ position: 'bottomright' });
      zoomControl.addTo(mapInstance.current);

      setIsMapReady(true);

      // Cleanup function
      return () => {
        if (mapInstance.current) {
          mapInstance.current.remove();
        }
        markerRef.current = null;
      };
    });
  }, [updateMarker, generateGoogleMapsUrl, handleLocationSelectComplete, handleMapClick, handleDoubleClick, address, position, zoomLevel]);

  useEffect(() => {
    if (mapInstance.current && initialPosition && initialPosition[0] && initialPosition[1]) {
      setPosition(initialPosition);
      mapInstance.current.setView(initialPosition, zoomLevel);
      updateMarker(initialPosition);
      setShowAddressCard(true);
      
      // Try to get address for initial position
      if (geocoderRef.current && initialPosition[0] && initialPosition[1]) {
        const latLng = LRef.current.latLng(initialPosition[0], initialPosition[1]);
        geocoderRef.current.reverse(
          latLng, 
          zoomLevel, 
          (results) => {
            if (results && results.length > 0 && results[0]) {
              setAddress(results[0].name);
              setEditableAddress(results[0].name);
              // Generate Google Maps URL for initial position
              const mapsUrl = generateGoogleMapsUrl(initialPosition[0], initialPosition[1], results[0].name);
              setGoogleMapsUrl(mapsUrl);
            }
          }
        );
      }
    }
  }, [initialPosition, zoomLevel, updateMarker, generateGoogleMapsUrl]);

  const handleAddressSearch = useCallback(() => {
    if (!address.trim()) return;

    if (geocoderRef.current) {
      geocoderRef.current.geocode(address, (results) => {
        if (results && results[0]) {
          const { center, name } = results[0];
          const newPosition = [center.lat, center.lng];
          
          // Update marker position
          updateMarker(newPosition);
          
          // Set appropriate zoom level based on address type
          let newZoom = zoomLevel;
          if (name.includes('country') || name.includes('state')) {
            newZoom = 8; // Zoom out for large areas
          } else if (name.includes('city') || name.includes('town')) {
            newZoom = 12; // Medium zoom for cities
          } else {
            newZoom = 16; // High zoom for specific addresses
          }
          
          // Set the view with new position and appropriate zoom
          if (mapInstance.current) {
            mapInstance.current.setView(newPosition, newZoom);
            setZoomLevel(newZoom);
          }
          
          // Complete the location selection
          handleLocationSelectComplete(newPosition, name);
        }
      });
    }
  }, [address, zoomLevel, updateMarker, handleLocationSelectComplete]);

  // Zoom control buttons
  const handleZoomIn = useCallback(() => {
    if (mapInstance.current) {
      mapInstance.current.zoomIn();
      setZoomLevel(mapInstance.current.getZoom());
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapInstance.current) {
      mapInstance.current.zoomOut();
      setZoomLevel(mapInstance.current.getZoom());
    }
  }, []);

  return (
    <div>
      {/* Selection Mode Toggle */}
      <div className="btn-group mb-3" role="group">
        <button
          type="button"
          className={`btn ${selectionMode === 'click' ? 'btn-danger' : 'btn-outline-danger'}`}
          onClick={() => setSelectionMode('click')}
        >
          Click to Select
        </button>
        <button
          type="button"
          className={`btn ${selectionMode === 'button' ? 'btn-danger' : 'btn-outline-danger'}`}
          onClick={() => setSelectionMode('button')}
        >
          Use Center Position
        </button>
      </div>

      {/* Selection Button (only shown in button mode) */}
      {selectionMode === 'button' && (
        <div className="d-grid mb-3">
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSelectButtonClick}
          >
            <i className="bi bi-geo-alt me-2"></i>
            Select Current Map Center
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-3">
        <small className="text-muted">
          {selectionMode === 'click' 
            ? "Click on the map to set your precise location, or use the search box to find an address."
            : "Pan the map to position the center on your desired location, then click the button above to select it."}
        </small>
      </div>

      {/* Map */}
      <div 
        ref={mapRef} 
        style={{ 
          height: '400px', 
          width: '100%', 
          marginBottom: '20px',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
      
      {/* Address Card */}
      {showAddressCard && address && (
        <div className="card mt-3">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Selected Location</h6>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleRemoveAddressCard}
              aria-label="Remove location"
            ></button>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label"><strong>Address:</strong></label>
              {isEditingAddress ? (
                <div>
                  <textarea
                    value={editableAddress}
                    onChange={(e) => setEditableAddress(e.target.value)}
                    className="form-control"
                    rows="3"
                  />
                  <div className="d-flex gap-2 mt-2">
                    <button 
                      type="button"
                      onClick={saveEditedAddress}
                      className="btn btn-success btn-sm"
                    >
                      Save
                    </button>
                    <button 
                      type="button"
                      onClick={cancelEditing}
                      className="btn btn-primary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="card-text">{address}</p>
                  <button 
                    type="button"
                    onClick={() => setIsEditingAddress(true)}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    <i className="bi bi-pencil me-1"></i> Edit Address
                  </button>
                </div>
              )}
            </div>
            
            <p className="card-text">
              <strong>Coordinates:</strong> {position ? `${position[0]?.toFixed(6)}, ${position[1]?.toFixed(6)}` : 'Not set'}
            </p>
            <p className="card-text">
              <strong>Zoom Level:</strong> {zoomLevel}
            </p>
            {googleMapsUrl && (
              <div className="mt-3">
                <button 
                  type="button"
                  onClick={openGoogleMaps}
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-map me-2"></i>
                  View in Google Maps
                </button>
                <small className="d-block text-muted mt-1">
                  Opens in a new tab
                </small>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Additional Instructions */}
      <div className="mt-2">
        <small className="text-muted">
          {!showAddressCard 
            ? "Search for an address or select a location using your preferred method above."
            : "Location selected. You can remove it using the X button above."}
        </small>
      </div>
    </div>
  );
};

export default LocationPicker;