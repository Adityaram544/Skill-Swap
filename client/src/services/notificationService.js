import API from './api';

export const getNotifications = async () => {
  const response = await API.get('/notifications');
  return response.data;
};

export const markNotificationsRead = async (id = null) => {
  const response = await API.patch('/notifications/read', { id });
  return response.data;
};

export const clearNotifications = async () => {
  const response = await API.delete('/notifications');
  return response.data;
};
