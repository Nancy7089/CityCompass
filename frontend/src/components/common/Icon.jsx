import React from 'react';

const Icon = ({ children }) => (
  <svg 
    viewBox="0 0 24 24" 
    width="18" 
    height="18" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.8" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="opacity-80"
  >
    {children}
  </svg>
);

export default Icon;
