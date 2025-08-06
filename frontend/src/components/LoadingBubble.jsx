import React from 'react';
import { glassmorphismStyles } from '../styles/glassmorphism';

const LoadingBubble = ({ isLocationEnabled }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={glassmorphismStyles.loadingBubble}>
        {/* Shimmer effect and dots animation */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
          animation: 'shimmer 2s infinite',
          borderRadius: '20px'
        }} />
        
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', justifyContent: 'center' }}>
          {[0, 0.16, 0.32].map((delay, index) => (
            <div key={index} style={{
              width: '10px',
              height: '10px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '50%',
              animation: `bounce 1.4s ease-in-out ${delay}s infinite both`,
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
            }}></div>
          ))}
        </div>
        <p style={{ 
          fontSize: '0.8rem', 
          color: 'rgba(0, 0, 0, 0.7)', 
          textAlign: 'center',
          margin: '0',
          fontWeight: '500',
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
        }}>
          {isLocationEnabled ? 'Analyzing route data...' : 'Processing request...'}
        </p>
      </div>
    </div>
  );
};

export default LoadingBubble;
