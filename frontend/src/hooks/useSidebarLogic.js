import { useState, useEffect } from 'react';
import { useRecentChats } from './useRecentChats';
import { generateIntelligentTitle } from '../utils/chatTitleGenerator';

export const useSidebarLogic = ({ onNewChat, onSelectChat, currentChatId }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { recentChats, addChat, updateChat } = useRecentChats();

  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: "New Chat",
      timestamp: new Date().toISOString(),
      lastMessage: null,
      messageCount: 0
    };

    addChat(newChat);
    if (onNewChat) onNewChat(newChatId);
  };

  const handleSelectChat = (chatId) => {
    if (onSelectChat) onSelectChat(chatId);
  };

  const updateChatTitle = (chatId, firstMessage) => {
    const intelligentTitle = generateIntelligentTitle(firstMessage);
    updateChat(chatId, { 
      title: intelligentTitle, 
      lastMessage: firstMessage,
      timestamp: new Date().toISOString()
    });
  };

  return {
    isCollapsed,
    setIsCollapsed,
    recentChats,
    handleNewChat,
    handleSelectChat,
    updateChatTitle
  };
};
