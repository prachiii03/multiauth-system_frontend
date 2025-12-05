// /app/providers/AuthProvider.js
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user || data.data); // Handle both response formats
        setPermissions(data.data.permissions || data.data.user?.permissions || []);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        setUser(data.data.user);
        setPermissions(data.data.user.permissions || []);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPermissions([]);
    router.push('/login');
  };

  const hasPermission = (requiredPermission) => {
    if (!permissions || !Array.isArray(permissions)) return false;
    return permissions.includes(requiredPermission);
  };

  const hasAnyPermission = (requiredPermissions) => {
    if (!permissions || !Array.isArray(permissions)) return false;
    if (!requiredPermissions || !Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  const hasAllPermissions = (requiredPermissions) => {
    if (!permissions || !Array.isArray(permissions)) return false;
    if (!requiredPermissions || !Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  const value = {
    user,
    permissions,
    loading,
    login,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}