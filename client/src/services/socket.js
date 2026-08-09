import { io } from 'socket.io-client';

let socket;

export const initiateSocketConnection = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io('/', {
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
