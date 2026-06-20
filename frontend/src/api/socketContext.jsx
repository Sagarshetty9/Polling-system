import React, { createContext, useContext, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }

  return 'http://localhost:3000';
};

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    const socketUrl = getSocketUrl();

    console.log("Socket URL:", socketUrl);

    const s = io(socketUrl, {
      withCredentials: true,
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    // 🔥 CONNECTION DEBUGGING
    s.on('connect', () => {
      console.log('CONNECTED:', s.id);
    });

    s.on('connect_error', (err) => {
      console.log('CONNECT ERROR:', err.message);
    });

    s.on('disconnect', (reason) => {
      console.log('DISCONNECTED:', reason);
    });

    s.onAny((event, ...args) => {
      console.log('EVENT:', event, args);
    });

    return s;
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);