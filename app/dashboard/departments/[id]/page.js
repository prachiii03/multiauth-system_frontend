// /app/dashboard/departments/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import Can from '@/app/components/ui/Can';
import PermissionGuard from '@/app/components/ui/PermissionGuard';

export default function DepartmentDetailPage() {
  const [department, setDepartment] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const params = useParams();
  const router = useRouter();
  const { hasPermission } = useAuth();
  const departmentId = params.id;

  useEffect(() => {
    fetchDepartment();
    fetchDepartmentUsers();
  }, [departmentId]);

  const fetchDepartment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://multiauth-system-backend-f3oe.vercel.app/api/departments/${departmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch department');
      }

      const data = await response.json();
      if (data.success) {
        setDepartment(data.data);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://multiauth-system-backend-f3oe.vercel.app/api/users?department=${departmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching department users:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this department? This will affect all users in this department.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://multiauth-system-backend-f3oe.vercel.app/api/departments/${departmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        router.push('/dashboard/departments');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Error deleting department');
    }
  };

  const handleStatusToggle = async () => {
    if (!confirm(`Are you sure you want to ${department.isActive ? 'deactivate' : 'activate'} this department?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://multiauth-system-backend-f3oe.vercel.app/api/departments/${departmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !department.isActive
        })
      });

      const data = await response.json();
      if (data.success) {
        setDepartment(prev => ({ ...prev, isActive: !prev.isActive }));
      } else {
        alert(data.message || 'Failed to update department status');
      }
    } catch (error) {
      alert('Error updating department status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  if (!department) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Department not found</h3>
        <button
          onClick={() => router.push('/dashboard/departments')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Departments
        </button>
      </div>
    );
  }

  return (
    <PermissionGuard requiredPermission="view_user">
      <div className="p-6 max-w-6xl mx-auto">
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
              <h1 className="text-2xl font-bold text-gray-900">{department.name}</h1>
              <p className="text-gray-600">{department.description}</p>
            </div>
            
            <div className="flex space-x-2">
              <Can permission="system_management">
                <button
                  onClick={() => router.push(`/dashboard/departments/${departmentId}/edit`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Edit Department
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

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Department Code</div>
              <div className="text-2xl font-bold text-blue-900">{department.code}</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Total Users</div>
              <div className="text-2xl font-bold text-green-900">{users.length}</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Total Permissions</div>
              <div className="text-2xl font-bold text-purple-900">{department.permissions?.length || 0}</div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 font-medium">Status</div>
              <div className="mt-2">
                <button
                  onClick={handleStatusToggle}
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full cursor-pointer ${
                    department.isActive 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {department.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Permissions</h2>
            
            {department.permissions && department.permissions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {department.permissions.map((permission, index) => (
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
                No permissions assigned to this department
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Department Users</h2>
              <span className="text-sm text-gray-500">{users.length} user(s)</span>
            </div>
            
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-800 text-xs font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {user.role?.name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/dashboard/users/${user._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No users found in this department
              </div>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Created: {formatDate(department.createdAt)}
        </div>
      </div>
    </PermissionGuard>
  );
}