import { io } from 'socket.io-client';

let socket;

const getSocketURL = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  }
  return '/';
};

export const initiateSocketConnection = (token) => {
  if (socket) {
    socket.disconnect();
  }

  const socketURL = getSocketURL();

  socket = io(socketURL, {
    auth: { token },
    query: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
