import api from './index';

export const getJobs = (params = {}) =>
  api.get('/jobs', { params }).then(r => r.data);

export const getJob = (id) =>
  api.get(`/jobs/${id}`).then(r => r.data);

export const createJob = (data) =>
  api.post('/jobs', data).then(r => r.data);

export const updateJob = (id, data) =>
  api.patch(`/jobs/${id}`, data).then(r => r.data);

export const deleteJob = (id) =>
  api.delete(`/jobs/${id}`).then(r => r.data);

export const generateJD = (id, bulletPoints) =>
  api.post(`/jobs/${id}/generate-jd`, { bulletPoints }).then(r => r.data);

export const generateJDPreview = (title, bulletPoints) =>
  api.post('/jobs/generate-jd-preview', { title, bulletPoints }).then(r => r.data);
