import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

const GoogleMap = forwardRef(({ 
  center = { lat: 18.5204, lng: 73.8567 }, 
  zoom = 12,
  originLocation,      
  destinationLocation,  
  onRouteInfoChange
}, ref) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapStatus, setMapStatus] = useState('loading');
  
  // ✅ NEW: References for directions
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);

  // State for route information
  const [routeInfo, setRouteInfo] = useState(null);

  // Expose map instance to parent components
  useImperativeHandle(ref, () => ({
    getMapInstance: () => mapInstanceRef.current
  }));

  // Pass route information to parent component
  useEffect(() => {
    if (onRouteInfoChange) {
      onRouteInfoChange(routeInfo);
    }
  }, [routeInfo, onRouteInfoChange]);

  useEffect(() => {
    console.log('GoogleMap component mounted');
    setMapStatus('loading');
    
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAIsAOChwsmYOnwyI_FCnQsFlhu7Vgqz-Q';
    
    const loadGoogleMaps = async () => {
      try {
        if (window.google && window.google.maps) {
          console.log('Google Maps already loaded');
          initializeMap();
          return;
        }

        if (window.googleMapsLoading) {
          console.log('Google Maps already loading, waiting...');
          await window.googleMapsLoading;
          initializeMap();
          return;
        }

        window.googleMapsLoading = new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.id = 'google-maps-script';
          
          script.onload = () => {
            console.log('Google Maps script loaded successfully');
            delete window.googleMapsLoading;
            resolve();
          };
          
          script.onerror = (error) => {
            console.error('Failed to load Google Maps script:', error);
            delete window.googleMapsLoading;
            reject(error);
          };
          
          const existingScript = document.querySelector('#google-maps-script');
          if (!existingScript) {
            document.head.appendChild(script);
          } else {
            existingScript.addEventListener('load', resolve);
            existingScript.addEventListener('error', reject);
          }
        });

        await window.googleMapsLoading;
        initializeMap();

      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setMapStatus('error');
      }
    };

    const initializeMap = () => {
      if (!mapRef.current) {
        console.warn('Map container not ready');
        return;
      }

      if (!window.google || !window.google.maps) {
        console.warn('Google Maps not ready');
        setTimeout(initializeMap, 100);
        return;
      }

      try {
        const mapOptions = {
          center: center,
          zoom: zoom,
          mapTypeId: 'roadmap',
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        };

        const map = new window.google.maps.Map(mapRef.current, mapOptions);
        mapInstanceRef.current = map;
        
        // ✅ Initialize Directions Service
        directionsServiceRef.current = new window.google.maps.DirectionsService();
        
        // Add current location marker (only if no origin/destination)
        if (!originLocation && !destinationLocation) {
          currentLocationMarkerRef.current = new window.google.maps.Marker({
            position: center,
            map: map,
            title: 'Current Location',
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF'
            }
          });
        }
        
        console.log('Google Map initialized successfully');
        setMapStatus('loaded');

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapStatus('error');
      }
    };

    loadGoogleMaps();

    return () => {
      // Component cleanup if needed
    };
  }, [center.lat, center.lng, zoom]);

  // Update map center when prop changes
  useEffect(() => {
    if (mapInstanceRef.current && mapStatus === 'loaded') {
      mapInstanceRef.current.setCenter(center);
      console.log('Map center updated to:', center);
    }
  }, [center, mapStatus]);

  // ✅ NEW: Handle directions display when both locations are available
  useEffect(() => {
    if (!mapInstanceRef.current || mapStatus !== 'loaded') return;

    // Clear current location marker when origin/destination is set
    if ((originLocation || destinationLocation) && currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setMap(null);
      currentLocationMarkerRef.current = null;
    }

    // Clear existing renderer and markers
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }
    if (originMarkerRef.current) {
      originMarkerRef.current.setMap(null);
    }
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
    }

    // ✅ If both locations exist, calculate and display route
    if (originLocation && destinationLocation && directionsServiceRef.current) {
      console.log('🗺️ Calculating route between:', originLocation.address, '→', destinationLocation.address);
      
      // Create new DirectionsRenderer for each route request
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false, // Show default markers
        draggable: false,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 6,
          strokeOpacity: 0.8
        }
      });
      
      // Set renderer to map BEFORE making request
      directionsRendererRef.current.setMap(mapInstanceRef.current);
      
      const request = {
        origin: new window.google.maps.LatLng(originLocation.lat, originLocation.lng),
        destination: new window.google.maps.LatLng(destinationLocation.lat, destinationLocation.lng),
        travelMode: window.google.maps.TravelMode.DRIVING, // You can change this to TRANSIT, WALKING, etc.
        unitSystem: window.google.maps.UnitSystem.METRIC
      };

      directionsServiceRef.current.route(request, (result, status) => {
        console.log('🗺️ Directions API Response:', status, result);
        
        if (status === 'OK' && result) {
          console.log('✅ Route calculated successfully');
          
          // Display the route
          directionsRendererRef.current.setDirections(result);
          
          // Extract route information
          const route = result.routes[0];
          const leg = route.legs[0];
          
          setRouteInfo({
            distance: leg.distance.text,
            duration: leg.duration.text,
            steps: leg.steps.length,
            mode: 'Driving'
          });
          
        } else {
          console.error('❌ Directions request failed:', status);
          
          // Fallback: show individual markers
          showFallbackMarkers(originLocation, destinationLocation);
          
          setRouteInfo({
            error: `Route calculation failed: ${status}`
          });
        }
      });
    } 
    // ✅ Single location handling
    else if (originLocation && !destinationLocation) {
      // Show only origin marker
      addOriginMarker(originLocation);
      mapInstanceRef.current.panTo({ lat: originLocation.lat, lng: originLocation.lng });
      mapInstanceRef.current.setZoom(15);
      
    } else if (destinationLocation && !originLocation) {
      // Show only destination marker
      addDestinationMarker(destinationLocation);
      mapInstanceRef.current.panTo({ lat: destinationLocation.lat, lng: destinationLocation.lng });
      mapInstanceRef.current.setZoom(15);
    }

  }, [originLocation, destinationLocation, mapStatus]);

  // ✅ Helper function to add origin marker
  const addOriginMarker = (location) => {
    originMarkerRef.current = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: mapInstanceRef.current,
      title: `From: ${location.address}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeWeight: 3,
        strokeColor: '#FFFFFF'
      }
    });
  };

  // ✅ Helper function to add destination marker
  const addDestinationMarker = (location) => {
    destinationMarkerRef.current = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: mapInstanceRef.current,
      title: `To: ${location.address}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#EF4444',
        fillOpacity: 1,
        strokeWeight: 3,
        strokeColor: '#FFFFFF'
      }
    });
  };

  // ✅ Fallback when route calculation fails
  const showFallbackMarkers = (origin, destination) => {
    addOriginMarker(origin);
    addDestinationMarker(destination);
    
    // Fit bounds to show both locations
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: origin.lat, lng: origin.lng });
    bounds.extend({ lat: destination.lat, lng: destination.lng });
    mapInstanceRef.current.fitBounds(bounds);
  };

  const renderContent = () => {
    switch (mapStatus) {
      case 'loading':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-700 text-lg font-medium">Loading Google Maps...</p>
              <p className="text-gray-500 text-sm">Initializing interactive map</p>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 z-10">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg font-semibold">Map Loading Failed</p>
              <p className="text-red-500 text-sm">Please check your connection and refresh</p>
              <button 
                onClick={() => {
                  setMapStatus('loading');
                  window.location.reload();
                }} 
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        );
      case 'loaded':
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{ 
          minHeight: '400px',
          background: '#f8fafc'
        }}
      />
      {renderContent()}
      



    </div>
  );
});

GoogleMap.displayName = 'GoogleMap';
export default GoogleMap;
