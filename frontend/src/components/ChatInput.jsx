import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ value, onChange, onSubmit, isLoading, compact = false, isFloating = false }) => {
  return (
    <form onSubmit={onSubmit} className="flex space-x-3">
      <div className="flex-1 relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask me about transport routes, delays, or planning a journey..."
          className={`w-full px-5 py-4 text-gray-700 ${
            isFloating 
              ? 'bg-white/80 backdrop-blur-md border border-white/30' 
              : 'bg-gray-50 border border-gray-200'
          } rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 placeholder-gray-500`}
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className={`px-6 py-4 ${
          isFloating 
            ? 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 backdrop-blur-md border border-white/20' 
            : 'bg-gradient-to-r from-blue-500 to-blue-600'
        } text-white rounded-2xl hover:from-blue-600/90 hover:to-blue-700/90 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg`}
      >
        <Send className="w-5 h-5 drop-shadow-sm" />
      </button>
    </form>
  );
};

export default ChatInput;
