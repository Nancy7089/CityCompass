import React from 'react';
import ChatInput from '../../ChatInput';

const ChatInputArea = ({ input, setInput, onSubmit, isLoading, isLocationEnabled }) => {
  return (
    <div 
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        padding: '20px',
        borderRadius: '0 0 24px 24px',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 1
      }}
    >
      <ChatInput 
        value={input}
        onChange={setInput}
        onSubmit={onSubmit}
        isLoading={isLoading}
        isFloating={true}
        placeholder={
          isLocationEnabled 
            ? "Ask about routes with GPS data..." 
            : "Ask about transport routes and planning..."
        }
      />
    </div>
  );
};

export default ChatInputArea;
