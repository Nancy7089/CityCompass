import React, { useState, useEffect, useRef } from 'react';

const MODES = ["Any Mode", "Bus", "Auto/Taxi", "Metro/Train", "Bike Share"];
const SUGGESTIONS = [
  "Dighi → Airport",
  "Camp → Railway Station",
  "Hinjewadi → Koregaon Park",
];

export default function LandingSearch({ 
  onSearchSubmit, 
  currentChatId, 
  placeholder = "Where would you like to go today?",
  onLocationUpdate // ← NEW: Callback to update map
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [mode, setMode] = useState(MODES[0]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Refs for Google Places Autocomplete
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const fromAutocompleteRef = useRef(null);
  const toAutocompleteRef = useRef(null);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeAutocomplete();
    } else {
      // Wait for Google Maps to load
      const checkGoogleMaps = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          initializeAutocomplete();
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };
      checkGoogleMaps();
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!fromInputRef.current || !toInputRef.current) return;

    try {
      // Configure autocomplete options
      const options = {
        componentRestrictions: { country: 'IN' }, // Restrict to India
        fields: ['place_id', 'geometry', 'name', 'formatted_address'],
        types: ['establishment', 'geocode'] // Allow all place types
      };

      // Initialize FROM autocomplete
      fromAutocompleteRef.current = new window.google.maps.places.Autocomplete(
        fromInputRef.current,
        options
      );

      // Initialize TO autocomplete
      toAutocompleteRef.current = new window.google.maps.places.Autocomplete(
        toInputRef.current,
        options
      );

      // ✅ ENHANCED: FROM listener with map update
      fromAutocompleteRef.current.addListener('place_changed', () => {
        const place = fromAutocompleteRef.current.getPlace();
        if (place.formatted_address && place.geometry) {
          setFrom(place.formatted_address);
          
          // ✅ NEW: Update map with origin location
          const locationData = {
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          console.log('Origin place selected:', locationData);
          
          if (onLocationUpdate) {
            onLocationUpdate('origin', locationData);
          }
        }
      });

      // ✅ ENHANCED: TO listener with map update
      toAutocompleteRef.current.addListener('place_changed', () => {
        const place = toAutocompleteRef.current.getPlace();
        if (place.formatted_address && place.geometry) {
          setTo(place.formatted_address);
          
          // ✅ NEW: Update map with destination location
          const locationData = {
            address: place.formatted_address,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          console.log('Destination place selected:', locationData);
          
          if (onLocationUpdate) {
            onLocationUpdate('destination', locationData);
          }
        }
      });

      console.log('Google Places Autocomplete initialized successfully');

    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  };

  // ✅ ENHANCED: Get user's current location with map update
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get readable address
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        const result = await new Promise((resolve, reject) => {
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                resolve(results[0]);
              } else {
                reject(new Error('Geocoding failed'));
              }
            }
          );
        });

        const currentLocationData = {
          address: result.formatted_address,
          lat: latitude,
          lng: longitude
        };

        setCurrentLocation(currentLocationData);
        setFrom(result.formatted_address);
        
        // ✅ NEW: Update map with current location
        console.log('Current location detected:', currentLocationData);
        
        if (onLocationUpdate) {
          onLocationUpdate('origin', currentLocationData);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Could not get your current location. Please enter manually.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const submit = (e) => {
    e?.preventDefault();
    if (!to.trim()) return;
    
    // Build enhanced query with location data
    let query = from?.trim()
      ? `from ${from.trim()} to ${to.trim()}`
      : to.trim();
    
    // Add mode if it's not "Any Mode"
    if (mode !== MODES[0]) {
      query += ` by ${mode.toLowerCase()}`;
    }

    // Include location data in the query context
    const queryData = {
      text: query,
      from: from.trim(),
      to: to.trim(),
      mode: mode,
      currentLocation: currentLocation,
      hasGPS: !!currentLocation
    };
    
    console.log('Submitting enhanced query:', queryData);
    onSearchSubmit?.(queryData);
    
    // Clear form after submission
    setFrom("");
    setTo("");
    setMode(MODES[0]);
    setCurrentLocation(null);
  };

  // ✅ ENHANCED: Use suggestion with map update
  const useSuggestion = async (text) => {
    const [sFrom, sTo] = text.split("→").map(s => s.trim());
    setFrom(sFrom);
    setTo(sTo);

    // ✅ NEW: Try to geocode the suggestion locations for map update
    if (window.google && window.google.maps && onLocationUpdate) {
      const geocoder = new window.google.maps.Geocoder();
      
      try {
        // Geocode origin
        if (sFrom) {
          const fromResult = await new Promise((resolve, reject) => {
            geocoder.geocode({ address: sFrom + ', India' }, (results, status) => {
              if (status === 'OK' && results[0]) {
                resolve(results[0]);
              } else {
                reject(new Error('Geocoding failed for origin'));
              }
            });
          });

          const fromLocationData = {
            address: fromResult.formatted_address,
            lat: fromResult.geometry.location.lat(),
            lng: fromResult.geometry.location.lng()
          };

          onLocationUpdate('origin', fromLocationData);
        }

        // Geocode destination
        if (sTo) {
          const toResult = await new Promise((resolve, reject) => {
            geocoder.geocode({ address: sTo + ', India' }, (results, status) => {
              if (status === 'OK' && results[0]) {
                resolve(results[0]);
              } else {
                reject(new Error('Geocoding failed for destination'));
              }
            });
          });

          const toLocationData = {
            address: toResult.formatted_address,
            lat: toResult.geometry.location.lat(),
            lng: toResult.geometry.location.lng()
          };

          onLocationUpdate('destination', toLocationData);
        }
      } catch (error) {
        console.error('Error geocoding suggestion:', error);
      }
    }
  };

  return (
    <div 
      className="hero-wrap" 
      style={{ 
        height: 'auto', 
        maxHeight: '70vh', 
        padding: '20px',
        paddingTop: '40px', 
        paddingBottom: '20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start', 
        alignItems: 'center'
      }}
    >
      {/* Dynamic Greeting */}
      <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '20px' }}>
        <h1 className="hero-title" style={{ fontSize: '2rem', margin: '0 0 6px 0' }}>
          <span className="hero-gradient">
            {currentChatId ? "Continue Planning" : "Hello, Sahil."}
          </span>
        </h1>
        <p className="hero-sub" style={{ margin: '0', fontSize: '1rem' }}>
          {currentChatId ? "Add another destination or modify your route" : placeholder}
        </p>
      </div>

      {/* Enhanced Route Planner */}
      <form className="route-bar" onSubmit={submit} style={{
        width: '100%',
        maxWidth: '500px',
        padding: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        marginBottom: '12px'
      }}>
        {/* Enhanced Input Fields */}
        <div className="route-fields" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '12px'
        }}>
          <label className="field">
            <span className="field-tag" style={{ fontSize: '0.7rem', marginBottom: '3px', display: 'block' }}>
              From
            </span>
            <div style={{ position: 'relative' }}>
              <input
                ref={fromInputRef}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Current Location"
                style={{
                  padding: '6px 35px 6px 10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: isGettingLocation ? 'default' : 'pointer',
                  fontSize: '14px',
                  opacity: isGettingLocation ? 0.5 : 1,
                  transition: 'opacity 0.2s ease'
                }}
                title="Get current location"
              >
                {isGettingLocation ? '⏳' : '📍'}
              </button>
            </div>
          </label>

          <label className="field">
            <span className="field-tag" style={{ fontSize: '0.7rem', marginBottom: '3px', display: 'block' }}>
              To
            </span>
            <input
              ref={toInputRef}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder={currentChatId ? "Continue conversation..." : "Search destination..."}
              required
              style={{
                padding: '6px 10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '0.85rem',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </label>
        </div>

        {/* Mode Selection */}
        <div className="chips" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5px',
          marginBottom: '12px',
          justifyContent: 'center'
        }}>
          {MODES.map(m => (
            <button
              key={m}
              type="button"
              className={`chip ${mode === m ? 'active' : ''}`}
              onClick={() => setMode(m)}
              style={{
                padding: '5px 10px',
                borderRadius: '14px',
                border: '1px solid',
                borderColor: mode === m ? '#3b82f6' : '#e2e8f0',
                backgroundColor: mode === m ? '#3b82f6' : 'white',
                color: mode === m ? 'white' : '#64748b',
                fontSize: '0.7rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Plan Button */}
        <button type="submit" className="plan-btn" style={{
          width: '100%',
          padding: '8px 16px',
          backgroundColor: currentLocation ? '#10b981' : '#6b7280',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '10px',
          transition: 'all 0.2s ease'
        }}>
          {currentChatId ? "Continue Planning →" : "Plan My Route →"}
          {currentLocation && " 🗺️"}
        </button>

        {/* ✅ ENHANCED: Location Status */}
        {currentLocation && (
          <div style={{
            fontSize: '0.65rem',
            color: '#10b981',
            textAlign: 'center',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px'
          }}>
            ✅ GPS Location Detected: {currentLocation.address.split(',').slice(0, 2).join(',')}
          </div>
        )}

        {/* Suggestions */}
        <div className="suggests" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5px',
          justifyContent: 'center'
        }}>
          {SUGGESTIONS.map((s, i) => (
            <button 
              type="button" 
              key={i} 
              className="pill" 
              onClick={() => useSuggestion(s)}
              style={{
                padding: '3px 8px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '0.65rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </form>

      {/* Enhanced Disclaimer */}
      <p className="hero-note" style={{
        fontSize: '0.6rem',
        color: '#64748b',
        textAlign: 'center',
        lineHeight: '1.3',
        maxWidth: '400px',
        margin: '0'
      }}>
        🔒 Your location data is processed securely and used only for route planning. 
        CityCompass integrates with Google Maps for accurate, real-time suggestions.
      </p>
    </div>
  );
}
