import React from 'react';

const MapLoadingStates = ({ mapStatus, onRetry }) => {
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
                onClick={onRetry}
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

  return renderContent();
};

export default MapLoadingStates;
