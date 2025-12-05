// /app/components/ui/ProtectedRoute.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

export default function ProtectedRoute({ 
  children, 
  requiredPermissions = [],
  redirectTo = '/auth/login'
}) {
  const { user, loading, hasPermission, hasAnyPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!user) {
        router.push(redirectTo);
        return;
      }

      // Check permissions if required
      if (requiredPermissions.length > 0) {
        const hasAccess = requiredPermissions.length === 1 
          ? hasPermission(requiredPermissions[0])
          : hasAnyPermission(requiredPermissions);
        
        if (!hasAccess) {
          router.push('/dashboard/unauthorized');
        }
      }
    }
  }, [user, loading, requiredPermissions, router, hasPermission, hasAnyPermission, redirectTo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check permissions for rendering
  if (requiredPermissions.length > 0) {
    const hasAccess = requiredPermissions.length === 1 
      ? hasPermission(requiredPermissions[0])
      : hasAnyPermission(requiredPermissions);
    
    if (!hasAccess) {
      return null;
    }
  }

  return <>{children}</>;
}