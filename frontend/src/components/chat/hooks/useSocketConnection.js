import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const useSocketConnection = ({ onAIResponse, onError }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to backend with location services!');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection failed:', error);
    });

    newSocket.on('receive_message', onAIResponse);
    newSocket.on('error', onError);

    return () => {
      newSocket.close();
      console.log('Socket connection closed');
    };
  }, []); // ✅ CRITICAL: Empty dependency array - don't include onAIResponse or onError

  return socket;
};
