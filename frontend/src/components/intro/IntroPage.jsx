import React, { useState, useEffect } from 'react';

const IntroPage = ({ onGetStarted }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullText = 'Welcome to CityCompass';
  const typingSpeed = 100; // milliseconds per character

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typingSpeed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  // Initialize Google Map for background using the same loading system as main app
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyAIsAOChwsmYOnwyI_FCnQsFlhu7Vgqz-Q';
    
    const loadGoogleMapsAndInit = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          console.log('Google Maps already loaded, initializing intro map...');
          initIntroMap();
          return;
        }

        // Check if Google Maps is currently loading
        if (window.googleMapsLoading) {
          console.log('Google Maps already loading, waiting for intro map...');
          await window.googleMapsLoading;
          initIntroMap();
          return;
        }

        // Start loading Google Maps
        console.log('Loading Google Maps for intro page...');
        window.googleMapsLoading = new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          script.defer = true;
          script.id = 'google-maps-script';
          
          script.onload = () => {
            console.log('Google Maps script loaded successfully for intro');
            delete window.googleMapsLoading;
            resolve();
          };
          
          script.onerror = (error) => {
            console.error('Failed to load Google Maps script for intro:', error);
            delete window.googleMapsLoading;
            reject(error);
          };
          
          const existingScript = document.querySelector('#google-maps-script');
          if (!existingScript) {
            document.head.appendChild(script);
          } else {
            // Script already exists, wait for it to load
            if (window.google && window.google.maps) {
              resolve();
            } else {
              existingScript.addEventListener('load', resolve);
              existingScript.addEventListener('error', reject);
            }
          }
        });

        await window.googleMapsLoading;
        initIntroMap();

      } catch (error) {
        console.error('Error loading Google Maps for intro:', error);
        showFallbackBackground();
      }
    };

    const initIntroMap = () => {
      const mapElement = document.getElementById('intro-map');
      if (!mapElement) {
        console.warn('Intro map element not found');
        return;
      }

      if (!window.google || !window.google.maps) {
        console.warn('Google Maps not ready for intro map');
        setTimeout(initIntroMap, 100);
        return;
      }

      try {
        console.log('Initializing intro map...');
        const map = new window.google.maps.Map(mapElement, {
          center: { lat: 18.5204, lng: 73.8567 }, // Pune coordinates
          zoom: 12,
          disableDefaultUI: true,
          gestureHandling: 'none',
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels',
              stylers: [{ visibility: 'simplified' }]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#4285f4' }, { weight: 1 }]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#1976d2' }]
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }]
            }
          ]
        });
        console.log('Intro map initialized successfully');
      } catch (error) {
        console.error('Error initializing intro map:', error);
        showFallbackBackground();
      }
    };

    const showFallbackBackground = () => {
      console.log('Showing fallback background for intro map');
      const mapElement = document.getElementById('intro-map');
      if (mapElement) {
        mapElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        mapElement.style.opacity = '0.3';
      }
    };

    // Start the loading process
    loadGoogleMapsAndInit();
  }, []);
  return (
    <div className="appLayout">
      {/* Google Maps Background */}
      <div className="mapUnderlay">
        <div 
          id="intro-map" 
          style={{
            width: '100%',
            height: '100%',
            filter: 'grayscale(20%) brightness(0.7) contrast(1.1)',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 0
          }}
        />
        {/* Overlay to ensure readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.2)',
          zIndex: 1
        }} />
      </div>
      
      <div className="mainStage">
        {/* Center overlay with iOS-style glassmorphism card */}
        <div className="centerOverlay" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px'
        }}>
          <div className="glassCard" style={{
            width: 'min(900px, 90vw)',
            maxWidth: '900px',
            padding: '24px 20px 20px',
            backdropFilter: 'blur(40px) saturate(180%)',
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            borderRadius: '20px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* iOS-style glassmorphism overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.2) 100%)',
              borderRadius: '24px',
              pointerEvents: 'none'
            }} />
            
            {/* Subtle noise texture for iOS authenticity */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")`,
              borderRadius: '24px',
              pointerEvents: 'none',
              mixBlendMode: 'multiply'
            }} />
            
            <div className="hero-wrap" style={{ position: 'relative', zIndex: 1 }}>
              {/* Main Title with Typewriter Effect */}
              <h1 className="hero-title" style={{ 
                textAlign: 'center', 
                marginBottom: '12px', 
                minHeight: '60px',
                color: '#1d1d1f',
                fontWeight: '700',
                letterSpacing: '-0.02em',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                fontSize: '48px'
              }}>
                {displayText.includes('Welcome to') ? (
                  <>
                    {displayText.substring(0, 10)}{' '}
                    <span className="hero-gradient">
                      {displayText.substring(10)}
                      {currentIndex < fullText.length && (
                        <span 
                          style={{
                            borderRight: '3px solid #2563eb',
                            animation: 'blink 1s infinite',
                            marginLeft: '2px'
                          }}
                        />
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    {displayText}
                    {currentIndex < fullText.length && (
                      <span 
                        style={{
                          borderRight: '3px solid #c4c7c5',
                          animation: 'blink 1s infinite',
                          marginLeft: '2px'
                        }}
                      />
                    )}
                  </>
                )}
              </h1>
              
              {/* Add CSS animation for blinking cursor */}
              <style jsx>{`
                @keyframes blink {
                  0%, 50% { opacity: 1; }
                  51%, 100% { opacity: 0; }
                }
              `}</style>
              
              <p className="hero-sub" style={{ 
                textAlign: 'center', 
                marginBottom: '28px',
                color: '#6e6e73',
                fontSize: '18px',
                fontWeight: '400',
                lineHeight: '1.4',
                letterSpacing: '-0.01em'
              }}>
                Your intelligent urban mobility companion
              </p>

              {/* Feature Cards - iOS-style Layout */}
              <div className="hero-cards" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '12px',
                padding: '0 12px 24px 12px',
                marginBottom: '20px'
              }}>
                <div 
                  className="hero-card"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '18px',
                    padding: '20px',
                    minHeight: '160px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                  }}
                >
                  <div className="hero-dot" style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#1d1d1f', 
                    marginBottom: '8px',
                    letterSpacing: '-0.01em'
                  }}>Smart Navigation</h3>
                  <p style={{
                    color: '#6e6e73',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    fontWeight: '400',
                    margin: 0
                  }}>Get the fastest routes across multiple transport modes with real-time updates and traffic insights.</p>
                </div>

                <div 
                  className="hero-card"
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: '16px',
                    padding: '20px',
                    minHeight: '150px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                  }}
                >
                  <div className="hero-dot" style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                      <path d="M13 3L4 14h7v7l9-11h-7V3z"/>
                    </svg>
                  </div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#1d1d1f', 
                    marginBottom: '8px',
                    letterSpacing: '-0.01em'
                  }}>Real-time Updates</h3>
                  <p style={{
                    color: '#6e6e73',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    fontWeight: '400',
                    margin: 0
                  }}>Stay informed with live transit schedules, delays, and alternative route suggestions.</p>
                </div>

                <div 
                  className="hero-card"
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: '16px',
                    padding: '20px',
                    minHeight: '150px',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                  }}
                >
                  <div className="hero-dot" style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                    </svg>
                  </div>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#1d1d1f', 
                    marginBottom: '8px',
                    letterSpacing: '-0.01em'
                  }}>Personal Insights</h3>
                  <p style={{
                    color: '#6e6e73',
                    fontSize: '14px',
                    lineHeight: '1.4',
                    fontWeight: '400',
                    margin: 0
                  }}>Track your travel patterns and get personalized recommendations for better commuting.</p>
                </div>
              </div>

              {/* Get Started Section */}
              <div style={{
                textAlign: 'center',
                padding: '20px',
                marginTop: '20px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  Ready to transform your city travel experience?
                </h2>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '24px',
                  fontSize: '16px'
                }}>
                  Join thousands of smart commuters who trust CityCompass for their daily journeys.
                </p>
                
                <button
                  onClick={onGetStarted}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '14px 32px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
                  }}
                >
                  Get Started →
                </button>
              </div>

              {/* Footer note */}
              <p className="hero-note" style={{
                marginTop: '20px',
                textAlign: 'center'
              }}>
                Powered by advanced AI and real-time data • Built for urban mobility
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;
