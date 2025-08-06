import React from 'react';
import Icon from "../common/Icon.jsx";

const NavigationItems = ({ 
  activeView, 
  onMapClick, 
  onChatClick, 
  onSettingsClick, 
  isCollapsed 
}) => {
  const navItemStyle = (isActive) => ({
    background: isActive 
      ? 'rgba(102, 126, 234, 0.15)' 
      : 'rgba(255, 255, 255, 0.05)',
    border: isActive
      ? '1px solid rgba(102, 126, 234, 0.3)'
      : '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: '100%',
    marginBottom: '4px'
  });

  return (
    <>
      <div className="cc-section">
        {!isCollapsed && (
          <div className="cc-section-title" style={{
            fontSize: '12px',
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.6)',
            marginBottom: '8px',
            padding: '0 4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Views
          </div>
        )}
        
        <button 
          className={`cc-nav-item ${activeView === 'map' ? 'active' : ''}`}
          onClick={onMapClick}
          style={navItemStyle(activeView === 'map')}
        >
          <Icon><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></Icon>
          {!isCollapsed && <span style={{ fontSize: '13px', fontWeight: '500' }}>Map View</span>}
        </button>

        <button 
          className={`cc-nav-item ${activeView === 'chat' ? 'active' : ''}`}
          onClick={onChatClick}
          style={navItemStyle(activeView === 'chat')}
        >
          <Icon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></Icon>
          {!isCollapsed && <span style={{ fontSize: '13px', fontWeight: '500' }}>Chat View</span>}
        </button>
      </div>

      {/* Bottom actions */}
      <div className="cc-side-bottom" style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '12px',
        marginTop: '12px'
      }}>
        <button className="cc-nav-item" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          width: '100%',
          marginBottom: '4px'
        }}>
          <Icon><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/></Icon>
          {!isCollapsed && <span style={{ fontSize: '13px' }}>Help</span>}
        </button>
        
        <button 
          className={`cc-nav-item ${activeView === 'settings' ? 'active' : ''}`}
          onClick={onSettingsClick}
          style={navItemStyle(activeView === 'settings')}
        >
          <Icon><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 1 1 3.4 19.7l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H2a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 5.04 5.04l.06.06a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 8.42 4V4a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 1 1 20.6 5.04l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H22a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></Icon>
          {!isCollapsed && <span style={{ fontSize: '13px' }}>Settings</span>}
        </button>
      </div>
    </>
  );
};

export default NavigationItems;
