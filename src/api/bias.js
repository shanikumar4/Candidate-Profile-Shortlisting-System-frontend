import api from './index';

export const runBiasReport = (jobId) =>
  api.post('/bias/report', { jobId }).then(r => r.data);

export const getCompany = () =>
  api.get('/company').then(r => r.data);

export const updateCompany = (data) =>
  api.patch('/company', data).then(r => r.data);
