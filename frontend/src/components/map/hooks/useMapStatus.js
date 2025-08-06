import { useState } from 'react';

export const useMapStatus = () => {
  const [mapStatus, setMapStatus] = useState('loading');

  const loadGoogleMaps = async (apiKey) => {
    try {
      if (window.google && window.google.maps) {
        console.log('Google Maps already loaded');
        return Promise.resolve();
      }

      if (window.googleMapsLoading) {
        console.log('Google Maps already loading, waiting...');
        await window.googleMapsLoading;
        return Promise.resolve();
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
      return Promise.resolve();

    } catch (error) {
      console.error('Error loading Google Maps:', error);
      setMapStatus('error');
      throw error;
    }
  };

  return {
    mapStatus,
    setMapStatus,
    loadGoogleMaps
  };
};
