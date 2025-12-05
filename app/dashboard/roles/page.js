'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import Can from '@/app/components/ui/Can';
import Link from 'next/link';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.status === 403) {
        setError('You do not have permission to view roles');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      setError('Failed to fetch roles');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600">Manage system roles and permissions</p>
        </div>
        
        <Can permission="system_management">
          <Link
            href="/dashboard/roles/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Add Role
          </Link>
        </Can>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role._id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{role.description}</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {role.userCount} users
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Permissions:</span>
                <span className="font-medium">{role.permissionCount}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created:</span>
                <span className="font-medium">{formatDate(role.createdAt)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Can permission="system_management">
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/dashboard/roles/${role._id}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/roles/${role._id}/edit`)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                </div>
              </Can>
              
              <Can permission="view_user">
                <button
                  onClick={() => router.push(`/dashboard/users?role=${role._id}`)}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  View Users
                </button>
              </Can>
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first role</p>
          <Can permission="system_management">
            <Link
              href="/dashboard/roles/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Role
            </Link>
          </Can>
        </div>
      )}
    </div>
  );
}