'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';
import Can from '@/app/components/ui/Can';
import ProtectedRoute from '@/app/components/ui/ProtectedRoute';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://multiauth-system-backend-f3oe.vercel.app/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://multiauth-system-backend-f3oe.vercel.app/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRoles(data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://multiauth-system-backend-f3oe.vercel.app/api/departments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role?._id === filterRole;
    const matchesDepartment = !filterDepartment || user.department?._id === filterDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://multiauth-system-backend-f3oe.vercel.app/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers(); // Refresh list
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://multiauth-system-backend-f3oe.vercel.app/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchUsers(); // Refresh list
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
      month: 'short',
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

  return (
    <ProtectedRoute requiredPermissions={['view_user']}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Manage system users and permissions</p>
          </div>
          
          <Can permission="create_user">
            <button
              onClick={() => router.push('/dashboard/users/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Add User
            </button>
          </Can>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                {roles.map(role => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Department
              </label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('');
                  setFilterDepartment('');
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
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
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-800 font-medium">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(user._id, user.isActive)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/dashboard/users/${user._id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <Can permission="update_user">
                          <button
                            onClick={() => router.push(`/dashboard/users/${user._id}/edit`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Edit
                          </button>
                        </Can>
                        <Can permission="delete_user">
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.201a4 4 0 00-6.5-3.197M21 21v-1a6 6 0 00-6-6m-6 6v1a6 6 0 01-6-6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterRole || filterDepartment 
                ? 'Try adjusting your filters' 
                : 'Get started by creating your first user'}
            </p>
            <Can permission="create_user">
              <button
                onClick={() => router.push('/dashboard/users/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Create User
              </button>
            </Can>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>
    </ProtectedRoute>
  );
}