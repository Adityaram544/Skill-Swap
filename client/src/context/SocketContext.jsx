import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { initiateSocketConnection, disconnectSocket } from '../services/socket';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user && token) {
      const sock = initiateSocketConnection(token);
      setSocket(sock);

      sock.on('user_status', (data) => {
        if (data.onlineUsers) {
          setOnlineUsers(data.onlineUsers);
        }
      });

      sock.on('new_message_notification', (data) => {
        setNotifications((prev) => [data, ...prev]);
      });

      return () => {
        disconnectSocket();
        setSocket(null);
      };
    } else {
      disconnectSocket();
      setSocket(null);
      setOnlineUsers([]);
    }
  }, [user, token]);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
