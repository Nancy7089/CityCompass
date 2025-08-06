import React from 'react';
import MessageContainer from './components/MessageContainer';
import ChatInputArea from './components/ChatInputArea';


const ChatInterfaceUI = ({ 
  messages, 
  input, 
  setInput, 
  isLoading, 
  isLocationEnabled, 
  messagesEndRef,
  onSubmit 
}) => {
  return (
    <div 
      className="flex flex-col h-full"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0.02) 100%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <MessageContainer 
        messages={messages}
        isLoading={isLoading}
        isLocationEnabled={isLocationEnabled}
        messagesEndRef={messagesEndRef}
      />

      <ChatInputArea
        input={input}
        setInput={setInput}
        onSubmit={onSubmit}
        isLoading={isLoading}
        isLocationEnabled={isLocationEnabled}
      />

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        div::-webkit-scrollbar { width: 8px; }
        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }
        * { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
};

export default ChatInterfaceUI;
