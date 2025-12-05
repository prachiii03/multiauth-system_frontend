// /app/dashboard/users/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import Can from '@/app/components/ui/Can';
import ProtectedRoute from '@/app/components/ui/ProtectedRoute';

export default function UserDetailPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.status === 403) {
        setError('You do not have permission to view this user');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      } else {
        setError(data.message || 'Failed to fetch user');
      }
    } catch (error) {
      setError('Failed to fetch user');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this user?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !user.isActive
        })
      });

      const data = await response.json();
      if (data.success) {
        setUser(prev => ({ ...prev, isActive: !prev.isActive }));
      } else {
        alert(data.message || 'Failed to update user status');
      }
    } catch (error) {
      alert('Error updating user status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        router.push('/dashboard/users');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">User not found</h3>
        <button
          onClick={() => router.push('/dashboard/users')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={['view_user']}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-4 inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
            
            <div className="flex space-x-2">
              <Can permission="update_user">
                <button
                  onClick={() => router.push(`/dashboard/users/${userId}/edit`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Edit User
                </button>
              </Can>
              
              <Can permission="delete_user">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </Can>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Role</div>
              <div className="text-xl font-bold text-blue-900 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {user.role?.name || 'N/A'}
                </span>
              </div>
              <div className="text-sm text-blue-700 mt-2">
                {user.role?.description || 'No description'}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Department</div>
              <div className="text-xl font-bold text-purple-900 mt-1">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {user.department?.name || 'N/A'}
                </span>
              </div>
              <div className="text-sm text-purple-700 mt-2">
                {user.department?.description || 'No description'}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 font-medium">Status</div>
              <div className="mt-2">
                <button
                  onClick={handleStatusToggle}
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full cursor-pointer ${
                    user.isActive 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Last login: {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <div className="mt-1 text-gray-900">{user.name}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Email Address</label>
                <div className="mt-1 text-gray-900">{user.email}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">Account Created</label>
                <div className="mt-1 text-gray-900">{formatDate(user.createdAt)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500">User ID</label>
                <div className="mt-1 text-gray-900 font-mono text-sm">{user._id}</div>
              </div>
            </div>
          </div>

          {/* User Permissions (if available) */}
          {user.permissions && user.permissions.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Effective Permissions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {user.permissions.map((permission, index) => (
                  <div key={index} className="bg-gray-50 px-3 py-2 rounded flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">{permission.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex space-x-4">
            <Can permission="view_user">
              <button
                onClick={() => router.push(`/dashboard/users?role=${user.role?._id}`)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Similar Users →
              </button>
            </Can>
            
            <Can permission="view_user">
              <button
                onClick={() => router.push(`/dashboard/users?department=${user.department?._id}`)}
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                View Department Users →
              </button>
            </Can>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}