// File: frontend/app/dashboard/departments/create/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PermissionGuard from '@/app/components/ui/PermissionGuard';

export default function CreateDepartmentPage() {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    permissions: [],
    isActive: true
  });
  
  const [permissionGroups, setPermissionGroups] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://multiauth-system-backend-f3oe.vercel.app/api/roles/permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setPermissionGroups(data.data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value.toUpperCase()
    }));
  };

  const handlePermissionChange = (permissionCode, checked) => {
    setFormData(prev => {
      let newPermissions = [...prev.permissions];
      if (checked) {
        newPermissions.push(permissionCode);
      } else {
        newPermissions = newPermissions.filter(p => p !== permissionCode);
      }
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleSelectAll = (category) => {
    const categoryPermissions = permissionGroups[category] || [];
    const currentPermissions = new Set(formData.permissions);
    const allSelected = categoryPermissions.every(p => currentPermissions.has(p.code));
    
    if (allSelected) {
      const newPermissions = formData.permissions.filter(p => 
        !categoryPermissions.some(cp => cp.code === p)
      );
      setFormData(prev => ({ ...prev, permissions: newPermissions }));
    } else {
      const newPermissions = [...new Set([...formData.permissions, ...categoryPermissions.map(p => p.code)])];
      setFormData(prev => ({ ...prev, permissions: newPermissions }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://multiauth-system-backend-f3oe.vercel.app/api/departments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard/departments');
      } else {
        setError(data.message || 'Failed to create department');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const permissionCategories = [
    { key: 'user', label: 'User Permissions' },
    { key: 'lead', label: 'Lead Permissions' },
    { key: 'property', label: 'Property Permissions' },
    { key: 'activity', label: 'Activity Permissions' },
    { key: 'system', label: 'System Permissions' },
    { key: 'report', label: 'Report Permissions' },
    { key: 'data', label: 'Data Permissions' }
  ];

  return (
    <PermissionGuard requiredPermission="system_management">
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
          <h1 className="text-2xl font-bold text-gray-900">Create New Department</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-8">
              <h2 className="text-lg font-semibold text-gray-900">Department Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Sales"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., SALES"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Department description..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Active Department
                </label>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
                <span className="text-sm text-gray-500">
                  {formData.permissions.length} selected
                </span>
              </div>

              <div className="space-y-6">
                {permissionCategories.map((category) => (
                  <div key={category.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-900">{category.label}</h3>
                      <button
                        type="button"
                        onClick={() => handleSelectAll(category.key)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Select All
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {permissionGroups[category.key]?.map((permission) => (
                        <div key={permission.code} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`dept-${permission.code}`}
                            checked={formData.permissions.includes(permission.code)}
                            onChange={(e) => handlePermissionChange(permission.code, e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`dept-${permission.code}`} className="ml-2 text-sm text-gray-700">
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Department'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGuard>
  );
}