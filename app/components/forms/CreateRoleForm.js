'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRoleForm({ roleId, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  
  const [permissionGroups, setPermissionGroups] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchPermissions();
    
    if (roleId) {
      fetchRole();
    }
  }, [roleId]);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://multiauth-system-backend-f3oe.vercel.app/api/roles/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setPermissionGroups(data.data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setFetching(false);
    }
  };

  const fetchRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://multiauth-system-backend-f3oe.vercel.app/api/roles/${roleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      console.error('Error fetching role:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      
      return {
        ...prev,
        permissions: newPermissions
      };
    });
  };

  const handleSelectAll = (category) => {
    const categoryPermissions = permissionGroups[category] || [];
    const currentPermissions = new Set(formData.permissions);
    
    // Check if all permissions in category are already selected
    const allSelected = categoryPermissions.every(p => currentPermissions.has(p.code));
    
    if (allSelected) {
      // Deselect all permissions in this category
      const newPermissions = formData.permissions.filter(p => 
        !categoryPermissions.some(cp => cp.code === p)
      );
      setFormData(prev => ({ ...prev, permissions: newPermissions }));
    } else {
      // Select all permissions in this category
      const newPermissions = [...new Set([...formData.permissions, ...categoryPermissions.map(p => p.code)])];
      setFormData(prev => ({ ...prev, permissions: newPermissions }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = roleId 
        ? `https://multiauth-system-backend-f3oe.vercel.app/api/roles/${roleId}`
        : 'https://multiauth-system-backend-f3oe.vercel.app/api/roles';
      
      const method = roleId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/dashboard/roles');
        }
      } else {
        setError(data.message || 'Operation failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error:', error);
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

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Role Details Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Role Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Manager"
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
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Team management & oversight"
            />
          </div>
        </div>
      </div>

      {/* Permissions Section */}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissionGroups[category.key]?.map((permission) => (
                  <div key={permission.code} className="flex items-center">
                    <input
                      type="checkbox"
                      id={permission.code}
                      checked={formData.permissions.includes(permission.code)}
                      onChange={(e) => handlePermissionChange(permission.code, e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor={permission.code} className="ml-2 text-sm text-gray-700">
                      {permission.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {roleId ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            roleId ? 'Update Role' : 'Create Role'
          )}
        </button>
      </div>
    </form>
  );
}