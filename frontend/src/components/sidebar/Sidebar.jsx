import React, { useState, useEffect } from "react";
import { useRecentChats } from "../../hooks/useRecentChats.js";
import RecentChatsList from "./RecentChatsList.jsx";
import NavigationItems from "./NavigationItems.jsx";
import { formatTimestamp } from "../../utils/timeUtils.js"; // Import the utility

export default function Sidebar({ 
  onNewChat, 
  onSelectChat, 
  currentChatId, 
  onMapClick, 
  onChatClick, 
  onSettingsClick, 
  activeView 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { recentChats, createNewChat, updateChatTitle } = useRecentChats();

  // Enhanced handleNewChat function
  const handleNewChat = async () => {
    setIsCreatingChat(true);
    
    try {
      // Get the new chat ID from the hook
      const newChatId = createNewChat();
      
      // Notify parent component
      if (onNewChat) {
        onNewChat(newChatId);
      }

      // Switch to chat view if not already there
      if (activeView !== 'chat') {
        onChatClick?.();
      }

      // Select the new chat
      if (onSelectChat) {
        onSelectChat(newChatId);
      }

      // Focus chat input and reset state
      setTimeout(() => {
        const chatInput = document.querySelector('#chat-input');
        if (chatInput) {
          chatInput.focus();
        }
        setIsCreatingChat(false);
      }, 200);

      console.log('New chat created:', newChatId);
    } catch (error) {
      console.error('Error creating new chat:', error);
      setIsCreatingChat(false);
    }
  };

  // Handle selecting an existing chat
  const handleSelectChat = (chatId) => {
    if (onSelectChat) {
      onSelectChat(chatId);
    }
    
    // Switch to chat view when selecting a chat
    if (activeView !== 'chat') {
      onChatClick?.();
    }
    
    console.log('Selected chat:', chatId);
  };

  // Expose updateChatTitle function to parent component
  useEffect(() => {
    window.updateChatTitle = updateChatTitle;
    return () => {
      delete window.updateChatTitle;
    };
  }, [updateChatTitle]);

  return (
    <aside 
      className={`cc-sidebar ${isCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`} 
      style={{
        // Enhanced iOS-style glassmorphism
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15))',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        // Add subtle noise texture for premium feel
        backgroundImage: `
          radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0),
          linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15))
        `,
        backgroundSize: '20px 20px, 100% 100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh' // Ensure full height
      }}
    >
      {/* Top row: hamburger */}
      <div className="cc-side-top" style={{ padding: '16px' }}>
        <button
          aria-label="Toggle sidebar"
          className="cc-menu-btn"
          onClick={() => setIsCollapsed((v) => !v)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <span className="cc-menu-icon">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      {/* Enhanced New Chat Button */}
      <div style={{ padding: '0 16px' }}>
        <button 
          className="cc-newchat"
          onClick={handleNewChat}
          disabled={isCreatingChat}
          style={{
            background: isCreatingChat 
              ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
              : 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 16px',
            margin: '12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: isCreatingChat ? 'default' : 'pointer',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontWeight: '600',
            opacity: isCreatingChat ? 0.7 : 1,
            transform: isCreatingChat ? 'scale(0.95)' : 'scale(1)',
            width: '100%'
          }}
          onMouseOver={(e) => {
            if (!isCreatingChat) {
              e.target.style.transform = 'translateY(-1px) scale(1)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (!isCreatingChat) {
              e.target.style.transform = 'translateY(0) scale(1)';
              e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
            }
          }}
        >
          <div 
            className="cc-newchat-plus" 
            style={{
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              animation: isCreatingChat ? 'spin 1s linear infinite' : 'none'
            }}
          >
            {isCreatingChat ? '⟳' : '+'}
          </div>
          {!isCollapsed && (
            <span>{isCreatingChat ? 'Creating...' : 'New Chat'}</span>
          )}
        </button>
      </div>

      {/* Recent Conversations */}
      <div className="cc-section" style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
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
            Recent Conversations
          </div>
        )}
        
        <RecentChatsList
          recentChats={recentChats}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          isCollapsed={isCollapsed}
          formatTimestamp={formatTimestamp} // Pass the formatting function
        />
      </div>

      {/* Navigation Items - This already contains Help and Settings */}
      <div style={{ padding: '0 16px 16px 16px', marginTop: 'auto' }}>
        <NavigationItems
          activeView={activeView}
          onMapClick={onMapClick}
          onChatClick={onChatClick}
          onSettingsClick={onSettingsClick}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* ✅ REMOVED: Bottom Footer with duplicate Help and Settings buttons */}

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </aside>
  );
}
