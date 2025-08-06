import React, { useEffect, useRef, useState } from 'react';
import Sidebar from "./components/sidebar/Sidebar.jsx";
import GoogleMap from './GoogleMap.jsx';
import ChatInterface from './components/chat/ChatInterface';
import LandingSearch from './components/LandingSearch';
import Avatar from './components/account/Avatar';
import AccountDetails from './components/account/AccountDetails';
import IntroPage from './components/intro/IntroPage';
import './index.css';
import './App.css';

export default function App() {
  // App view state - 'intro' or 'main'
  const [appView, setAppView] = useState('intro');
  
  // Existing stage management
  const [stage, setStage] = useState('hero');
  const [initialQuery, setInitialQuery] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 18.5204, lng: 73.8567 });
  const mapRef = useRef(null);

  // Chat management state
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chatHistory, setChatHistory] = useState({});
  const [activeView, setActiveView] = useState('chat');

  // Location state for map synchronization
  const [originLocation, setOriginLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  // ✅ NEW: Account details state
  const [isAccountDetailsOpen, setIsAccountDetailsOpen] = useState(false);

  // Handle location updates from LandingSearch
  const handleLocationUpdate = (type, locationData) => {
    console.log(`${type} location updated:`, locationData);
    
    if (type === 'origin') {
      setOriginLocation(locationData);
      setMapCenter({ lat: locationData.lat, lng: locationData.lng });
    } else if (type === 'destination') {
      setDestinationLocation(locationData);
      setMapCenter({ lat: locationData.lat, lng: locationData.lng });
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  // Hero submit handler
  const handleHeroSubmit = (queryData) => {
    console.log('Enhanced query received:', queryData);
    
    const queryText = typeof queryData === 'string' ? queryData : queryData.text;
    
    if (!queryText?.trim()) return;
    
    setInitialQuery(queryText.trim());
    
    if (typeof queryData === 'object' && queryData.currentLocation) {
      setMapCenter({
        lat: queryData.currentLocation.lat,
        lng: queryData.currentLocation.lng
      });
    }
    
    if (currentChatId) {
      addMessageToChat(currentChatId, queryText.trim(), 'user');
    }
    
    setStage('transitioning');
    setTimeout(() => setStage('split'), 500);
  };

  // Chat management functions
  const handleNewChat = (newChatId) => {
    setCurrentChatId(newChatId);
    
    setChatHistory(prev => ({
      ...prev,
      [newChatId]: {
        messages: [],
        title: 'New Chat',
        timestamp: new Date().toISOString()
      }
    }));
    
    setStage('hero');
    setInitialQuery('');
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    
    const chat = chatHistory[chatId];
    if (chat && chat.messages.length > 0) {
      setStage('split');
      setInitialQuery(chat.messages[0]?.message || '');
    } else {
      setStage('hero');
      setInitialQuery('');
    }
  };

  const addMessageToChat = (chatId, message, sender = 'user') => {
    console.log('🔵 App: Adding message to chat:', chatId, message, sender);
    
    setChatHistory(prev => {
      const currentChat = prev[chatId] || { messages: [] };
      const isFirstMessage = currentChat.messages.length === 0;
      
      const updatedHistory = {
        ...prev,
        [chatId]: {
          ...currentChat,
          messages: [...currentChat.messages, {
            id: Date.now(),
            type: 'text',
            message: message,
            sender: sender,
            timestamp: new Date().toISOString()
          }],
          lastMessage: message,
          timestamp: new Date().toISOString()
        }
      };

      if (isFirstMessage && sender === 'user' && window.updateChatTitle) {
        setTimeout(() => {
          window.updateChatTitle(chatId, message);
        }, 100);
      }

      return updatedHistory;
    });
  };

  // View switching handlers
  const handleMapClick = () => setActiveView('map');
  const handleChatClick = () => setActiveView('chat');
  const handleSettingsClick = () => setActiveView('settings');

  // ✅ NEW: Avatar click handler
  const handleAvatarClick = () => {
    setIsAccountDetailsOpen(true);
  };

  const handleCloseAccountDetails = () => {
    setIsAccountDetailsOpen(false);
  };

  // Handle logout - redirect to intro page
  const handleLogout = () => {
    setIsAccountDetailsOpen(false);
    setAppView('intro');
    // Reset app state
    setStage('hero');
    setCurrentChatId(null);
    setInitialQuery('');
  };

  // Handle get started from intro page
  const handleGetStarted = () => {
    setAppView('main');
  };

  // Show intro page if appView is 'intro'
  if (appView === 'intro') {
    return <IntroPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="appLayout">
      <Sidebar 
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        currentChatId={currentChatId}
        onMapClick={handleMapClick}
        onChatClick={handleChatClick}
        onSettingsClick={handleSettingsClick}
        activeView={activeView}
      />

      <div className="mainStage">
        <div className="mapUnderlay">
          <GoogleMap 
            ref={mapRef} 
            center={mapCenter}
            originLocation={originLocation}
            destinationLocation={destinationLocation}
            onRouteInfoChange={setRouteInfo}
          />
        </div>

        {/* ✅ UPDATED: Header with clickable avatar */}
        <header className="floatHeader">
          <div className="brand">CityCompass</div>
          <Avatar onClick={handleAvatarClick} />
        </header>

        {/* Landing Search - Hide in map view */}
        {(stage === 'hero' || stage === 'transitioning') && activeView !== 'map' && (
          <div className={`leftOverlay ${stage === 'transitioning' ? 'heroOut' : ''}`}>
            <div className="glassCard heroCard">
              <LandingSearch 
                onSearchSubmit={handleHeroSubmit}
                currentChatId={currentChatId}
                placeholder={currentChatId ? "Continue your conversation..." : "Where would you like to go?"}
                onLocationUpdate={handleLocationUpdate}
              />
            </div>
          </div>
        )}

        {/* Chat Interface - Hide in map view */}
        {stage === 'split' && activeView !== 'map' && (
          <div className="leftOverlay">
            <div className="glassCard chatCard">
              <ChatInterface
                isOverlay={true}
                initialQuery={initialQuery}
                onQueryProcessed={() => {}}
                mapInstance={mapRef.current?.getMapInstance?.() || null}
                userLocation={mapCenter}
                chatHistory={chatHistory}
                currentChatId={currentChatId}
                onSendMessage={(message, sender = 'user') => {
                  if (currentChatId) {
                    addMessageToChat(currentChatId, message, sender);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Route Information Panel - beside chat interface, Hide in map view */}
        {stage === 'split' && routeInfo && activeView !== 'map' && (
          <div className="routeInfoOverlay">
            <div className="glassCard routeInfoCard">
              <h3 style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                🗺️ Route Information
              </h3>
              
              {routeInfo.error ? (
                <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>{routeInfo.error}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#6b7280' }}>Distance:</span>
                    <span style={{ fontWeight: '500', color: '#1f2937' }}>{routeInfo.distance}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#6b7280' }}>Duration:</span>
                    <span style={{ fontWeight: '500', color: '#1f2937' }}>{routeInfo.duration}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#6b7280' }}>Steps:</span>
                    <span style={{ fontWeight: '500', color: '#1f2937' }}>{routeInfo.steps}</span>
                  </div>
                  {routeInfo.mode && (
                    <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '4px' }}>
                      Mode: {routeInfo.mode}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ✅ NEW: Account Details Modal */}
      <AccountDetails 
        isOpen={isAccountDetailsOpen}
        onClose={handleCloseAccountDetails}
        onLogout={handleLogout}
      />
    </div>
  );
}