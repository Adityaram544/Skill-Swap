import API from './api';

export const getMyProfile = async () => {
  const response = await API.get('/users/me');
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await API.put('/users/me', profileData);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await API.get(`/users/${id}`);
  return response.data;
};

export const getAllUsers = async (params) => {
  const response = await API.get('/users', { params });
  return response.data;
};

export const uploadAvatar = async (data) => {
  const response = await API.post('/users/upload', data);
  return response.data;
};

