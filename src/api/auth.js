import api from './index';

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then(r => r.data);

export const getMe = () =>
  api.get('/auth/me').then(r => r.data);

export const inviteUser = (email, role, department) =>
  api.post('/auth/invite', { email, role, department }).then(r => r.data);

export const acceptInvite = async (token, email, name, password) => {
  const response = await api.post('/auth/accept-invite', { token, email, name, password });
  return response.data;
};

export const getUsers = () =>
  api.get('/auth/users').then(r => r.data);

export const updateUser = (id, data) =>
  api.patch(`/auth/users/${id}`, data).then(r => r.data);
