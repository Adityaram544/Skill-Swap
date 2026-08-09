import API from './api';

export const getMessagesWithUser = async (userId) => {
  const response = await API.get(`/messages/${userId}`);
  return response.data;
};

export const getRecentConversations = async () => {
  const response = await API.get('/messages/conversations/list');
  return response.data;
};

export const deleteMessageAPI = async (messageId, deleteType) => {
  const response = await API.delete(`/messages/message/${messageId}`, {
    data: { deleteType }
  });
  return response.data;
};

export const deleteContactAPI = async (contactId) => {
  const response = await API.delete(`/messages/contact/${contactId}`);
  return response.data;
};
