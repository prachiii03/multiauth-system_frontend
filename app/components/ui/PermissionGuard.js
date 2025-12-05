// /app/components/ui/PermissionGuard.js
'use client';

import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PermissionGuard({ 
  children, 
  requiredPermission,
  redirectTo = '/dashboard/unauthorized'
}) {
  const { hasPermission, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !hasPermission(requiredPermission)) {
      router.push(redirectTo);
    }
  }, [loading, hasPermission, requiredPermission, router, redirectTo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return hasPermission(requiredPermission) ? children : null;
}