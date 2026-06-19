import React, { createContext, useContext, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socket = useMemo(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:3000`
      : 'http://localhost:3000');

    return io(socketUrl, {
      withCredentials: true
    });
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// This lets us easily grab the socket phone line in any component
export const useSocket = () => useContext(SocketContext);