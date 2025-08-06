import React, { useEffect } from 'react';
import { useChatLogic } from './hooks/useChatLogic';
import { useSocketConnection } from './hooks/useSocketConnection';
import { useLocationService } from './hooks/useLocationService';
import { parseLocationsFromMessage } from './utils/locationParser';
import ChatInterfaceUI from './ChatInterfaceUI';

const ChatInterface = ({ 
  isOverlay = false, 
  initialQuery = '', 
  onQueryProcessed, 
  mapInstance, 
  userLocation,
  chatHistory = {},
  currentChatId,
  onSendMessage
}) => {
  // Custom hooks for logic separation
  const chatLogic = useChatLogic({
    chatHistory,
    currentChatId,
    onSendMessage,
    initialQuery,
    onQueryProcessed
  });

  const { locationService, isLocationEnabled } = useLocationService({
    mapInstance,
    userLocation
  });

  const socket = useSocketConnection({
    onAIResponse: chatLogic.handleAIResponse,
    onError: chatLogic.handleError
  });

  // Handle initial query
  useEffect(() => {
    if (initialQuery && socket) {
      console.log('Processing initial query with location:', initialQuery);
      handleMessageWithLocation(initialQuery);
      if (onQueryProcessed) {
        onQueryProcessed();
      }
    }
  }, [initialQuery, socket]);

  const handleMessageWithLocation = async (messageText) => {
    console.log('🟡 ChatInterface: Handling message:', messageText, 'for chat:', currentChatId);
    // Notify parent component - sync will handle display
    if (onSendMessage && currentChatId) {
      console.log('🟡 ChatInterface: Calling onSendMessage');
      onSendMessage(messageText, 'user');
    } else {
      console.log('🔴 ChatInterface: No onSendMessage or currentChatId');
    }
    
    chatLogic.setIsLoading(true);

    const extractedLocations = parseLocationsFromMessage(messageText);
    
    let locationContext = {
      userLocation: userLocation,
      extractedLocations: extractedLocations,
      nearbyPlaces: null,
      routeInfo: null,
      hasValidLocation: !!(userLocation && userLocation.lat && userLocation.lng)
    };

    if (locationService && locationService.isReady()) {
      try {
        console.log('Extracting enhanced location context for:', messageText);
        const enhancedContext = await locationService.extractLocationContext(messageText, userLocation);
        if (enhancedContext) {
          locationContext = enhancedContext;
        }
        console.log('Enhanced location context extracted:', locationContext);
      } catch (error) {
        console.error('Location context extraction failed:', error);
      }
    }

    const locationEnabled = !!(userLocation && userLocation.lat && userLocation.lng && window.google);

    const conversationHistory = chatLogic.messages.slice(-10).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message,
      timestamp: msg.timestamp
    }));

    socket.emit('send_message', {
      message: messageText,
      userId: 'user-123',
      locationContext: locationContext,
      userLocation: userLocation,
      hasLocationData: locationEnabled,
      conversationHistory: conversationHistory
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!chatLogic.input.trim() || !socket || chatLogic.isLoading) return;

    handleMessageWithLocation(chatLogic.input);
    chatLogic.setInput('');
  };

  return (
    <ChatInterfaceUI
      messages={chatLogic.messages}
      input={chatLogic.input}
      setInput={chatLogic.setInput}
      isLoading={chatLogic.isLoading}
      isLocationEnabled={isLocationEnabled}
      messagesEndRef={chatLogic.messagesEndRef}
      onSubmit={handleSubmit}
    />
  );
};

export default ChatInterface;
