import { useState, useEffect, useRef } from 'react';
import { generateTitleFromConversation } from '../../../utils/chatTitleGenerator';

export const useChatLogic = ({ 
  chatHistory, 
  currentChatId, 
  onSendMessage,
  initialQuery,
  onQueryProcessed 
}) => {
  const currentChat = chatHistory[currentChatId] || { messages: [] };
  
  const [messages, setMessages] = useState(() => {
    if (currentChat.messages.length > 0) {
      return currentChat.messages;
    }
    
    const hasVisitedBefore = localStorage.getItem('urbanai_first_visit');
    
    if (!hasVisitedBefore) {
      localStorage.setItem('urbanai_first_visit', 'true');
      console.log('First time visitor - showing welcome message');
      
      return [{
        id: 1,
        type: 'text',
        message: "Hello! I'm your urban mobility assistant for Pune. I can help you plan journeys using buses, metros, ride-sharing, and bike-sharing services. Where would you like to go?",
        sender: 'ai',
        timestamp: new Date().toISOString()
      }];
    } else {
      console.log('Returning user - starting with clean chat');
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Message syncing logic
  const lastSyncedChatRef = useRef(null);
  const lastSyncedLengthRef = useRef(0);

  // Message synchronization with chat history
  useEffect(() => {
    if (currentChatId && chatHistory[currentChatId]) {
      const chatMessages = chatHistory[currentChatId].messages || [];
      
      // Always sync when chat changes or when history has more messages than local
      if (lastSyncedChatRef.current !== currentChatId || chatMessages.length > messages.length) {
        console.log('🔄 useChatLogic: Syncing messages for chat:', currentChatId, 'History:', chatMessages.length, 'Local:', messages.length);
        console.log('🔄 useChatLogic: Chat messages:', chatMessages);
        setMessages([...chatMessages]);
        lastSyncedChatRef.current = currentChatId;
        lastSyncedLengthRef.current = chatMessages.length;
      } else {
        console.log('🔴 useChatLogic: No sync needed. Chat:', currentChatId, 'History:', chatMessages.length, 'Local:', messages.length);
      }
    } else if (currentChatId && !chatHistory[currentChatId]) {
      if (lastSyncedChatRef.current !== currentChatId) {
        console.log('New empty chat detected:', currentChatId);
        setMessages([]);
        lastSyncedChatRef.current = currentChatId;
        lastSyncedLengthRef.current = 0;
      }
    }
  }, [currentChatId, chatHistory[currentChatId]?.messages?.length]); // ✅ Simple dependency on chat and message count


  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle AI responses
  const handleAIResponse = (response) => {
    const aiMessage = {
      ...response,
      sender: 'ai'
    };
    
    setMessages(prev => {
      const newMessages = [...prev, aiMessage];
      
      // Generate title using AI response
      if (onSendMessage && currentChatId) {
        const lastUserMessage = newMessages
          .filter(msg => msg.sender === 'user')
          .pop();
        
        const userMessageCount = newMessages.filter(msg => msg.sender === 'user').length;
        
        if (lastUserMessage && userMessageCount === 1) {
          const intelligentTitle = generateTitleFromConversation(
            lastUserMessage.message, 
            aiMessage.message
          );
          
          console.log('Generated intelligent title:', intelligentTitle);
          
          if (window.updateChatTitle) {
            window.updateChatTitle(currentChatId, intelligentTitle, true);
          }
        }
      }
      
      return newMessages;
    });
    
    if (onSendMessage && currentChatId) {
      onSendMessage(aiMessage.message, 'ai');
    }
    
    setIsLoading(false);
  };

  // Handle errors
  const handleError = () => {
    const errorMessage = {
      id: Date.now(),
      type: 'text',
      message: 'Sorry, I encountered an error. Please try again.',
      sender: 'ai',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, errorMessage]);
    
    if (onSendMessage && currentChatId) {
      onSendMessage(errorMessage.message, 'ai');
    }
    
    setIsLoading(false);
  };

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    setIsLoading,
    messagesEndRef,
    handleAIResponse,
    handleError
  };
};
