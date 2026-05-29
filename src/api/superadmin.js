import api from './index';

export const getCompanies = () =>
  api.get('/superadmin/companies').then(r => r.data.companies);

export const createCompany = (name, plan) =>
  api.post('/superadmin/companies', { name, plan }).then(r => r.data);

export const inviteUser = (email, companyId, role) =>
  api.post('/superadmin/invite', { email, companyId, role }).then(r => r.data);

export const deleteUser = (userId) =>
  api.delete(`/superadmin/users/${userId}`).then(r => r.data);
