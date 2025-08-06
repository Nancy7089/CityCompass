import React, { useState, useRef, useEffect } from 'react';
import LandingSearch from './LandingSearch';
import ChatInterface from './ChatInterface';

const UnifiedSearchChat = ({ mapInstance, userLocation }) => {
  const [isSearchMode, setIsSearchMode] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const containerRef = useRef(null);

  const handleSearchSubmit = (query) => {
    setInitialQuery(query);
    setIsTransitioning(true);
    
    // Add transitioning class for particle effects
    if (containerRef.current) {
      containerRef.current.classList.add('transitioning');
    }
    
    // Start the transition animation
    setTimeout(() => {
      setIsSearchMode(false);
      setIsTransitioning(false);
      if (containerRef.current) {
        containerRef.current.classList.remove('transitioning');
      }
    }, 800); // Match the animation duration
  };

  const handleBackToSearch = () => {
    setIsTransitioning(true);
    if (containerRef.current) {
      containerRef.current.classList.add('transitioning');
    }
    
    setTimeout(() => {
      setIsSearchMode(true);
      setInitialQuery('');
      setIsTransitioning(false);
      if (containerRef.current) {
        containerRef.current.classList.remove('transitioning');
      }
    }, 400);
  };

  return (
    <div 
      ref={containerRef}
      className="unified-search-chat"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* Search Mode */}
      <div
        className={`search-container ${isTransitioning && isSearchMode ? 'search-exit' : ''}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: isSearchMode ? 'translateY(0)' : 'translateY(-100%)',
          opacity: isSearchMode ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: isSearchMode ? 2 : 1,
          background: 'transparent'
        }}
      >
        <LandingSearch 
          onSearchSubmit={handleSearchSubmit}
          isTransitioning={isTransitioning}
        />
      </div>

      {/* Chat Mode */}
      <div
        className={`chat-container ${isTransitioning && !isSearchMode ? 'chat-enter' : ''}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: isSearchMode ? 'translateY(100%)' : 'translateY(0)',
          opacity: isSearchMode ? 0 : 1,
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: isSearchMode ? 1 : 2
        }}
      >
        <ChatInterface
          initialQuery={initialQuery}
          onQueryProcessed={() => setInitialQuery('')}
          mapInstance={mapInstance}
          userLocation={userLocation}
          onBackToSearch={handleBackToSearch}
          isOverlay={false}
        />
      </div>

      {/* Floating particles effect during transition */}
      <div className="particles-overlay" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        opacity: 0,
        transition: 'opacity 0.3s ease'
      }}>
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: `linear-gradient(45deg, 
                ${i % 3 === 0 ? '#667eea' : i % 3 === 1 ? '#764ba2' : '#f093fb'}, 
                ${i % 3 === 0 ? '#764ba2' : i % 3 === 1 ? '#f093fb' : '#f5576c'})`,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0,
              boxShadow: '0 0 6px rgba(102, 126, 234, 0.6)'
            }}
          />
        ))}
      </div>

      {/* Enhanced transition styles */}
      <style>{`
        .unified-search-chat.transitioning .particles-overlay {
          opacity: 1;
        }

        .unified-search-chat.transitioning .particle {
          opacity: 0.8 !important;
          animation-duration: 0.8s !important;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          50% {
            transform: translateY(-20px) translateX(10px) rotate(180deg) scale(1.2);
            opacity: 1;
          }
          90% {
            opacity: 0.8;
          }
        }

        .search-container.search-exit {
          animation: wooshUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .chat-container.chat-enter {
          animation: slideUpFromBottom 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes wooshUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
            filter: blur(0px);
          }
          30% {
            transform: translateY(-10px) scale(1.02);
            opacity: 0.9;
            filter: blur(1px);
          }
          70% {
            transform: translateY(-60px) scale(0.95);
            opacity: 0.3;
            filter: blur(3px);
          }
          100% {
            transform: translateY(-100%) scale(0.9);
            opacity: 0;
            filter: blur(8px);
          }
        }

        @keyframes slideUpFromBottom {
          0% {
            transform: translateY(100%) scale(0.9);
            opacity: 0;
            filter: blur(8px);
          }
          30% {
            transform: translateY(60px) scale(0.95);
            opacity: 0.3;
            filter: blur(3px);
          }
          70% {
            transform: translateY(10px) scale(1.02);
            opacity: 0.9;
            filter: blur(1px);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
            filter: blur(0px);
          }
        }

        .unified-search-chat.transitioning {
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.15), 
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            0 0 20px rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .unified-search-chat.transitioning::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 30% 70%, rgba(102, 126, 234, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(118, 75, 162, 0.08) 0%, transparent 50%);
          opacity: 1;
          pointer-events: none;
          z-index: 0;
        }
      `}</style>
    </div>
  );
};

export default UnifiedSearchChat;
