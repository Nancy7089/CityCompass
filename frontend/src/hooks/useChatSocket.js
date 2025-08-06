import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const useChatSocket = (userLocation) => {
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to backend with location services!');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection failed:', error);
    });

    return () => {
      newSocket.close();
      console.log('Socket connection closed');
    };
  }, []);

  const sendMessage = (messageData) => {
    if (socket) {
      socket.emit('send_message', messageData);
      setIsLoading(true);
    }
  };

  return { socket, isLoading, setIsLoading, sendMessage };
};
