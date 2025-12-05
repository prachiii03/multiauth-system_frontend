// File: frontend/app/dashboard/roles/[id]/edit/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PermissionGuard from '@/app/components/ui/PermissionGuard';

export default function EditRolePage() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  
  const [permissionGroups, setPermissionGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPermissions();
    fetchRole();
  }, [roleId]);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/roles/permissions', {
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

  const fetchRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/roles/${roleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setFormData({
          name: data.data.name,
          description: data.data.description || '',
          permissions: data.data.permissions || []
        });
      }
    } catch (error) {
      setError('Failed to load role');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard/roles');
      } else {
        setError(data.message || 'Failed to update role');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
          <p className="text-gray-600">Update role details and permissions</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Details</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Permissions</h2>
                <div className="text-sm text-gray-500">
                  {formData.permissions.length} permission(s) selected
                </div>
              </div>

              <div className="space-y-8">
                {permissionCategories.map((category) => (
                  <div key={category.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
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
                            id={`edit-${permission.code}`}
                            checked={formData.permissions.includes(permission.code)}
                            onChange={(e) => handlePermissionChange(permission.code, e.target.checked)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`edit-${permission.code}`} className="ml-2 text-sm text-gray-700">
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGuard>
  );
}