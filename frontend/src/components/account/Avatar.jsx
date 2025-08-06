import React from 'react';
import userIcon from '../../assets/user_icon.png';

const Avatar = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative group transition-all duration-200 hover:scale-105"
      aria-label="Open account details"
    >
      {/* Avatar Image */}
      <div className="relative">
        <img 
          src={userIcon} 
          alt="User Avatar"
          className="w-10 h-10 rounded-full object-cover border-2 border-white/20 group-hover:border-white/40 transition-all duration-200 shadow-lg"
        />
        
        {/* Online Status Indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        
        {/* Hover Effect */}
        <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-all duration-200"></div>
      </div>

      {/* Tooltip */}
      <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
        Account Details
        <div className="absolute bottom-full right-2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/80"></div>
      </div>
    </button>
  );
};

export default Avatar;
