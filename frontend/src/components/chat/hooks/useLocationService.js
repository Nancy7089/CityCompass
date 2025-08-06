import { useState, useEffect } from 'react';
import LocationService from '../../../services/locationService';

export const useLocationService = ({ mapInstance, userLocation }) => {
  const [locationService, setLocationService] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  // Initialize location service
  useEffect(() => {
    if (mapInstance && window.google) {
      try {
        const locService = new LocationService(window.google.maps);
        locService.initializePlacesService(mapInstance);
        setLocationService(locService);
        setIsLocationEnabled(true);
        console.log('Location service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize location service:', error);
        setIsLocationEnabled(false);
      }
    }
  }, [mapInstance]);

  // Enhanced location enabled check
  useEffect(() => {
    const checkLocationEnabled = () => {
      const hasValidUserLocation = !!(userLocation && userLocation.lat && userLocation.lng);
      const hasGoogleMaps = !!(window.google && window.google.maps);
      const hasLocationService = !!(locationService && locationService.isReady());
      
      const enabled = hasValidUserLocation && hasGoogleMaps;
      
      setIsLocationEnabled(enabled);
      
      console.log('Enhanced location enabled check:', {
        enabled,
        hasValidUserLocation,
        hasGoogleMaps,  
        hasLocationService,
        userLocationCoords: userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'None'
      });
    };

    checkLocationEnabled();
  }, [mapInstance, userLocation, locationService]);

  return {
    locationService,
    isLocationEnabled
  };
};
