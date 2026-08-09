import API from './api';

export const getMatches = async () => {
  const response = await API.get('/matches');
  return response.data;
};
