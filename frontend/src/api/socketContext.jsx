import React, { createContext, useContext, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  // Open the "phone line" to your backend port
  const socket = useMemo(() => {
    return io('http://localhost:3000', {
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