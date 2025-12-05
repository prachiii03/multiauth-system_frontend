const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Generic fetch with auth
export async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  // Handle 401 Unauthorized
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  // Handle 403 Forbidden
  if (response.status === 403) {
    throw new Error('Forbidden: You do not have permission to access this resource');
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  
  return data;
}

// Specific API functions
export const roleAPI = {
  create: (data) => fetchWithAuth('/roles', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  getAll: () => fetchWithAuth('/roles'),
  
  getById: (id) => fetchWithAuth(`/roles/${id}`),
  
  update: (id, data) => fetchWithAuth(`/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  delete: (id) => fetchWithAuth(`/roles/${id}`, {
    method: 'DELETE'
  }),
  
  getPermissions: () => fetchWithAuth('/roles/permissions')
};

export const authAPI = {
  login: (email, password) => fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  
  register: (userData) => fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  getMe: () => fetchWithAuth('/auth/me'),
  
  logout: () => fetchWithAuth('/auth/logout', {
    method: 'POST'
  })
};

export const userAPI = {
  getAll: () => fetchWithAuth('/users'),
  
  create: (data) => fetchWithAuth('/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  update: (id, data) => fetchWithAuth(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  delete: (id) => fetchWithAuth(`/users/${id}`, {
    method: 'DELETE'
  })
};