import api from './index';

export const getCandidates = (params = {}) =>
  api.get('/candidates', { params }).then(r => r.data);

export const getCandidate = (id) =>
  api.get(`/candidates/${id}`).then(r => r.data);

export const createCandidate = (formData) =>
  api.post('/candidates', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

export const updateCandidate = (id, data) =>
  api.patch(`/candidates/${id}`, data).then(r => r.data);

export const deleteCandidate = (id) =>
  api.delete(`/candidates/${id}`).then(r => r.data);

export const scoreCandidate = (id) =>
  api.post(`/candidates/${id}/score`).then(r => r.data);

export const bulkScore = (jobId) =>
  api.post('/candidates/bulk-score', { jobId }).then(r => r.data);

export const bulkStage = (ids, stage) =>
  api.post('/candidates/bulk-stage', { ids, stage }).then(r => r.data);

export const addNote = (id, text) =>
  api.post(`/candidates/${id}/note`, { text }).then(r => r.data);

export const getInterviewQuestions = (id) =>
  api.post(`/candidates/${id}/interview-questions`).then(r => r.data);

export const getEmailTemplate = (id, type) =>
  api.post(`/candidates/${id}/email-template`, { type }).then(r => r.data);

export const explainScore = (id) =>
  api.post(`/candidates/${id}/explain-score`).then(r => r.data);

export const exportCandidates = async (params = {}) => {
  try {
    const response = await api.get('/candidates/export', { 
      params, 
      responseType: 'blob' 
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'candidates.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Export failed', err);
    throw err;
  }
};
