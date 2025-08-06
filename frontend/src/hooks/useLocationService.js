import { useState, useEffect } from 'react';
import LocationService from '../services/locationService';

export const useLocationService = (mapInstance, userLocation) => {
  const [locationService, setLocationService] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

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

  useEffect(() => {
    const checkLocationEnabled = () => {
      const hasValidUserLocation = !!(userLocation && userLocation.lat && userLocation.lng);
      const hasGoogleMaps = !!(window.google && window.google.maps);
      const enabled = hasValidUserLocation && hasGoogleMaps;
      setIsLocationEnabled(enabled);
    };

    checkLocationEnabled();
  }, [mapInstance, userLocation, locationService]);

  return { locationService, isLocationEnabled };
};
