"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MessageCircle, File, Settings, Sun, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-bold">Authentication Required</h1>
        <p className="mb-6">You need to log in to access the admin area.</p>
        <Link 
          href="/admin/login" 
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/appointments', label: 'Appointments', icon: Users },
    { path: '/admin/chatbot', label: 'Chatbot', icon: MessageCircle },
    { path: '/admin/blogs', label: 'Blog Posts', icon: File },
    { path: '/admin/calculator-params', label: 'Calculator', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin" className="flex items-center">
            <Sun className="h-6 w-6 text-yellow-500" />
            <span className="ml-2 text-lg font-bold">D-Solar Admin</span>
          </Link>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`flex items-center rounded-md px-4 py-2 text-sm ${
                      isActive(item.path)
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Log Out
            </button>
          </div>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-x-hidden">
        <main>{children}</main>
      </div>
    </div>
  );
} 