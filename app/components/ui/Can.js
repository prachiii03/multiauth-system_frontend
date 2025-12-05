// /app/components/ui/Can.js
'use client';

import { useAuth } from '@/app/providers/AuthProvider';

export default function Can({ 
  permission, 
  permissions, 
  any = false, 
  children, 
  fallback = null 
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && any) {
    hasAccess = hasAnyPermission(permissions);
  } else if (permissions && !any) {
    hasAccess = hasAllPermissions(permissions);
  }

  return hasAccess ? children : fallback;
}

// Higher Order Component version
export function withPermission(requiredPermission) {
  return function(Component) {
    return function ProtectedComponent(props) {
      const { hasPermission } = useAuth();
      
      if (!hasPermission(requiredPermission)) {
        return null;
      }
      
      return <Component {...props} />;
    };
  };
}