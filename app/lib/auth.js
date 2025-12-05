// Auth utility functions

// Save token to localStorage
export const saveToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Get token from localStorage
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Remove token from localStorage
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Parse JWT token
export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

// Get user from token
export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  const decoded = parseJwt(token);
  return decoded;
};

// Logout user
export const logout = () => {
  removeToken();
  // Redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// API request with auth headers
export const apiRequest = async (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      logout();
      throw new Error('Session expired. Please login again.');
    }
    
    // Handle 403 Forbidden
    if (response.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};