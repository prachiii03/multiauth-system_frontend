'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import PermissionGuard from '@/app/components/ui/PermissionGuard';
import Can from '@/app/components/ui/Can';

export default function RoleDetailPage() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const roleId = params.id;

  useEffect(() => {
    fetchRole();
  }, [roleId]);

  const fetchRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/roles/${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch role');
      }

      const data = await response.json();
      if (data.success) {
        setRole(data.data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        router.push('/dashboard/roles');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error deleting role');
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

  if (!role) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Role not found</h3>
        <button
          onClick={() => router.push('/dashboard/roles')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Roles
        </button>
      </div>
    );
  }

  return (
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
            <h1 className="text-2xl font-bold text-gray-900">{role.name}</h1>
            <p className="text-gray-600">{role.description}</p>
          </div>
          
          <div className="flex space-x-2">
            <Can permission="system_management">
              <button
                onClick={() => router.push(`/dashboard/roles/${roleId}/edit`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Edit Role
              </button>
            </Can>
            
            <Can permission="system_management">
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
            <div className="text-sm text-blue-600 font-medium">Total Users</div>
            <div className="text-2xl font-bold text-blue-900">{role.userCount || 0}</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Total Permissions</div>
            <div className="text-2xl font-bold text-green-900">{role.permissionCount || 0}</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Created Date</div>
            <div className="text-lg font-medium text-purple-900">{formatDate(role.createdAt)}</div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Permissions</h2>
          
          {role.permissions && role.permissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {role.permissions.map((permission, index) => (
                <div key={index} className="bg-gray-50 px-3 py-2 rounded flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-gray-700">{permission.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No permissions assigned to this role
            </div>
          )}
        </div>

        <Can permission="view_user">
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => router.push(`/dashboard/users?role=${roleId}`)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Users with this Role →
            </button>
          </div>
        </Can>
      </div>
    </div>
  );
}