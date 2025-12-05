'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import Navbar from '@/app/components/layout/Navbar';
import Sidebar from '@/app/components/layout/Sidebar';

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        {/* Sidebar for larger screens */}
        <div className="hidden md:block w-64">
          <Sidebar />
        </div>
        
        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}