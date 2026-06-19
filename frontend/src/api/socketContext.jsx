import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const getSocketUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiBaseUrl) {
    return apiBaseUrl.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:5000`;
  }

  return 'http://localhost:5000';
};

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    const socketUrl = getSocketUrl();
    
    return io(socketUrl, {
      autoConnect: true,
      withCredentials: true,
      // Prefer long-polling first (more reliable in dev/proxy setups), then upgrade to websocket
      transports: ['polling', 'websocket']
    });
  }, []);

  useEffect(() => {
    console.log('[SOCKET_DEBUG] Initializing Socket connection with URL:', getSocketUrl());
    
    socket.on('connect', () => {
      console.log('[SOCKET_DEBUG] Socket connected successfully! ID:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[SOCKET_DEBUG] Socket disconnected. Reason:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message, socket.io.uri);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
