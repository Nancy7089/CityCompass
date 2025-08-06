import React from 'react';
import MessageBubble from '../../MessageBubble';
import LoadingBubble from './LoadingBubble';

const MessageContainer = ({ messages, isLoading, isLocationEnabled, messagesEndRef }) => {
  return (
    <div 
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 1
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} isFloating={true} />
        ))}
        {isLoading && <LoadingBubble isLocationEnabled={isLocationEnabled} />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageContainer;
