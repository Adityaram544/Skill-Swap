import API from './api';

export const getSkills = async (params) => {
  const response = await API.get('/skills', { params });
  return response.data;
};

export const addSkill = async (skillData) => {
  const response = await API.post('/skills', skillData);
  return response.data;
};

export const deleteSkill = async (id) => {
  const response = await API.delete(`/skills/${id}`);
  return response.data;
};
