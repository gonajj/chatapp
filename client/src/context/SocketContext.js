import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!token) return;
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || '';
    socketRef.current = io(SOCKET_URL, { auth: { token } });

    socketRef.current.on('users_online', (users) => setOnlineUsers(users));

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
