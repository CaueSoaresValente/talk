const API_URL = 'http://localhost:3000/api';

function getToken() {
  return localStorage.getItem('talkmaster_token');
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisição');
  }

  return data;
}

// Auth
export const authAPI = {
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => apiRequest('/auth/me'),
};

// Chat
export const chatAPI = {
  start: () => apiRequest('/chat/start', { method: 'POST' }),
  sendMessage: (conversationId, content) =>
    apiRequest('/chat/message', { method: 'POST', body: JSON.stringify({ conversationId, content }) }),
  end: (conversationId) =>
    apiRequest('/chat/end', { method: 'POST', body: JSON.stringify({ conversationId }) }),
};

// Level Test
export const levelTestAPI = {
  getQuestions: () => apiRequest('/level-test/questions'),
  submit: (answers) => apiRequest('/level-test/submit', { method: 'POST', body: JSON.stringify({ answers }) }),
};

// Exercises
export const exerciseAPI = {
  getExercises: (type) => apiRequest(`/exercises${type ? `?type=${type}` : ''}`),
  submit: (exerciseId, answer) =>
    apiRequest('/exercises/submit', { method: 'POST', body: JSON.stringify({ exerciseId, answer }) }),
};

// Dashboard
export const dashboardAPI = {
  get: () => apiRequest('/dashboard'),
  getProgress: (period) => apiRequest(`/dashboard/progress?period=${period}`),
};

// History
export const historyAPI = {
  list: () => apiRequest('/history'),
  search: (q) => apiRequest(`/history/search?q=${encodeURIComponent(q)}`),
  getDetail: (id) => apiRequest(`/history/${id}`),
};

// Admin
export const adminAPI = {
  getUsers: () => apiRequest('/admin/users'),
  updateUser: (id, data) => apiRequest(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
};
