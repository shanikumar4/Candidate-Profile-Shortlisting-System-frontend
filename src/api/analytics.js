import api from './index';

export const getOverview = () =>
  api.get('/analytics/overview').then(r => r.data);

export const getFunnel = () =>
  api.get('/analytics/funnel').then(r => r.data);

export const getTimeline = () =>
  api.get('/analytics/timeline').then(r => r.data);

export const getSkills = () =>
  api.get('/analytics/skills').then(r => r.data);

export const getTimeToHire = () =>
  api.get('/analytics/time-to-hire').then(r => r.data);

export const getCandidateExperience = () =>
  api.get('/analytics/candidate-experience').then(r => r.data);
