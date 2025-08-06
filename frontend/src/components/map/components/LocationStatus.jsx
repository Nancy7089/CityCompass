import React from 'react';

const LocationStatus = ({ originLocation, destinationLocation }) => {
  if (!originLocation && !destinationLocation) return null;

  return (
    <div 
      className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-10"
      style={{ fontSize: '0.8rem', maxWidth: '200px' }}
    >
      {originLocation && (
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: '#10B981' }}
          />
          <span className="truncate text-gray-700">
            From: {originLocation.address.split(',')[0]}
          </span>
        </div>
      )}
      {destinationLocation && (
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: '#EF4444' }}
          />
          <span className="truncate text-gray-700">
            To: {destinationLocation.address.split(',')[0]}
          </span>
        </div>
      )}
    </div>
  );
};

export default LocationStatus;
