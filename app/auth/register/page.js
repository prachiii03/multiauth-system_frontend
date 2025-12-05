'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    departmentId: '',
    roleId: ''
  });
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  // Get API URL from environment variable
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching data from:', API_URL);
      
      // Fetch from PUBLIC endpoints (no authentication required)
      const [deptResponse, roleResponse] = await Promise.all([
        fetch(`${API_URL}/api/departments/public`),
        fetch(`${API_URL}/api/roles/public`)
      ]);

      console.log('Departments response status:', deptResponse.status);
      console.log('Roles response status:', roleResponse.status);

      const deptData = await deptResponse.json();
      const roleData = await roleResponse.json();

      console.log('Departments data:', deptData);
      console.log('Roles data:', roleData);

      if (deptData.success) {
        setDepartments(deptData.data || []);
      } else {
        console.error('Departments API error:', deptData.message);
        setError('Failed to load departments: ' + deptData.message);
      }
      
      if (roleData.success) {
        setRoles(roleData.data || []);
      } else {
        console.error('Roles API error:', roleData.message);
        setError(prev => prev + ' Failed to load roles: ' + roleData.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to connect to server. Please make sure backend is running.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.departmentId || !formData.roleId) {
      setError('Please select a department and role');
      return;
    }

    setLoading(true);

    try {
      console.log('Registering user with:', { 
        name: formData.name,
        email: formData.email,
        departmentId: formData.departmentId,
        roleId: formData.roleId 
      });
      
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          departmentId: formData.departmentId,
          roleId: formData.roleId
        })
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (data.success) {
        // Try auto-login
        try {
          const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password
            })
          });

          const loginData = await loginResponse.json();
          
          if (loginData.success) {
            localStorage.setItem('token', loginData.data.token);
            alert('Registration successful! Redirecting to dashboard...');
            router.push('/dashboard/roles');
          } else {
            alert('Registration successful! Please login with your credentials.');
            router.push('/auth/login');
          }
        } catch (loginError) {
          alert('Registration successful! Please login with your credentials.');
          router.push('/auth/login');
        }
      } else {
        setError(data.message || 'Registration failed. ' + (data.error || ''));
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading registration form...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to existing account
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                id="departmentId"
                name="departmentId"
                required
                value={formData.departmentId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
              {departments.length === 0 && !fetching && (
                <p className="text-red-500 text-sm mt-1">
                  No departments available. Please make sure backend is running and database is seeded.
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                id="roleId"
                name="roleId"
                required
                value={formData.roleId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {roles.length === 0 && !fetching && (
                <p className="text-red-500 text-sm mt-1">
                  No roles available. Please make sure backend is running and database is seeded.
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Minimum 6 characters"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || departments.length === 0 || roles.length === 0}
              className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
        
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Debug Information:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>API URL: {API_URL}</div>
            <div>Departments loaded: {departments.length}</div>
            <div>Roles loaded: {roles.length}</div>
            <div>Selected Department: {formData.departmentId || 'None'}</div>
            <div>Selected Role: {formData.roleId || 'None'}</div>
            <div className="mt-2">
              <strong>Test endpoints:</strong>
              <div><a href={`${API_URL}/api/departments/public`} target="_blank" className="text-blue-500">Departments API</a></div>
              <div><a href={`${API_URL}/api/roles/public`} target="_blank" className="text-blue-500">Roles API</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}