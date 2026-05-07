import api from './axios';

export const authApi = {
  loginOperator: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  loginOfficer: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  registerOperator: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register/operator', data),
  registerOfficer: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register/officer', data),
};

export const applicationsApi = {
  create: (data: object) => api.post('/applications', data),
  list: () => api.get('/applications'),
  get: (id: string) => api.get(`/applications/${id}`),
  updateStatus: (id: string, status: string, note?: string) =>
    api.patch(`/applications/${id}/status`, { status, note }),
  addFeedback: (id: string, data: object) =>
    api.post(`/applications/${id}/feedback`, data),
  resubmit: (id: string, data: object) =>
    api.post(`/applications/${id}/resubmit`, data),
  getRounds: (id: string) => api.get(`/applications/${id}/rounds`),
  getTemplates: () => api.get('/applications/meta/templates'),
};

export const documentsApi = {
  upload: (appId: string, file: File, sectionKey: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('sectionKey', sectionKey);
    return api.post(`/applications/${appId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: (appId: string) => api.get(`/applications/${appId}/documents`),
};

export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
