'use client';

import React from 'react';
import { AdminProvider } from '@/contexts/AdminContext';
import AdminLayout from './components/AdminLayout';
import { usePathname } from 'next/navigation';

export default function RootAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  
  return (
    <AdminProvider>
      {isLoginPage ? (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden">
          {children}
        </div>
      ) : (
        <AdminLayout>
          {children}
        </AdminLayout>
      )}
    </AdminProvider>
  );
} 