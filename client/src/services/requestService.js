import API from './api';

export const createSwapRequest = async (requestData) => {
  const response = await API.post('/requests', requestData);
  return response.data;
};

export const getUserRequests = async (params) => {
  const response = await API.get('/requests', { params });
  return response.data;
};

export const updateRequestStatus = async (id, status) => {
  const response = await API.patch(`/requests/${id}`, { status });
  return response.data;
};
