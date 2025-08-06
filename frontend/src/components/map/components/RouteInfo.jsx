import React from 'react';

const RouteInfo = ({ routeInfo }) => {
  if (!routeInfo) return null;

  return (
    <div 
      className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg z-10"
      style={{ fontSize: '0.9rem', maxWidth: '280px' }}
    >
      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
        🗺️ Route Information
      </h3>
      
      {routeInfo.error ? (
        <div className="text-red-600 text-sm">{routeInfo.error}</div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Distance:</span>
            <span className="font-medium text-gray-800">{routeInfo.distance}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium text-gray-800">{routeInfo.duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Steps:</span>
            <span className="font-medium text-gray-800">{routeInfo.steps}</span>
          </div>
          {routeInfo.mode && (
            <div className="text-sm text-orange-600 mt-2">
              {routeInfo.mode}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteInfo;
