import React from 'react';
import Icon from "../common/Icon.jsx";
import { formatTimestamp } from '../../utils/timeUtils.js';

const RecentChatsList = ({ 
  recentChats, 
  currentChatId, 
  onSelectChat, 
  isCollapsed 
}) => {
  const getChatIcon = (title) => {
    if (title.includes('→')) {
      // Route icon for travel queries
      return <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />;
    } else if (title.includes('Trip')) {
      // Trip icon
      return <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />;
    } else {
      // Default chat icon
      return <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />;
    }
  };

  if (recentChats.length === 0) {
    return !isCollapsed ? (
      <div style={{
        padding: '16px 8px',
        textAlign: 'center',
        color: 'rgba(0, 0, 0, 0.5)',
        fontSize: '12px'
      }}>
        No recent conversations
      </div>
    ) : null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {recentChats.map((chat) => (
        <button
          key={chat.id}
          className={`cc-recent-item ${currentChatId === chat.id ? 'active' : ''}`}
          onClick={() => onSelectChat(chat.id)}
          style={{
            background: currentChatId === chat.id 
              ? 'rgba(102, 126, 234, 0.15)' 
              : 'rgba(255, 255, 255, 0.05)',
            border: currentChatId === chat.id
              ? '1px solid rgba(102, 126, 234, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            textAlign: 'left',
            width: '100%'
          }}
          onMouseOver={(e) => {
            if (currentChatId !== chat.id) {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }
          }}
          onMouseOut={(e) => {
            if (currentChatId !== chat.id) {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            }
          }}
        >
          <Icon>{getChatIcon(chat.title)}</Icon>
          {!isCollapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '500',
                color: 'rgba(0, 0, 0, 0.8)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {chat.title}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(0, 0, 0, 0.5)',
                marginTop: '2px'
              }}>
                {formatTimestamp(chat.timestamp)}
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default RecentChatsList;
