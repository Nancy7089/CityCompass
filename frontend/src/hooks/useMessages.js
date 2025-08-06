import { useState, useEffect } from 'react';

const getInitialMessages = () => {
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
};

export const useMessages = (socket) => {
  const [messages, setMessages] = useState(getInitialMessages);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive_message', (response) => {
      setMessages(prev => [...prev, { ...response, sender: 'ai' }]);
    });

    socket.on('error', (error) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'text',
        message: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      }]);
    });

    return () => {
      socket.off('receive_message');
      socket.off('error');
    };
  }, [socket]);

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  return { messages, setMessages, addMessage };
};
