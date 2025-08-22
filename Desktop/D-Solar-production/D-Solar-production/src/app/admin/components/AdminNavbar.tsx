'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';

export default function AdminNavbar() {
  const { logout, username } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState(0);
  
  // Fetch pending appointments count
  useEffect(() => {
    const fetchPendingAppointments = async () => {
      try {
        const response = await fetch('/api/admin/appointments/pending-count');
        if (response.ok) {
          const data = await response.json();
          setPendingAppointments(data.count);
        }
      } catch (error) {
        console.error('Error fetching pending appointments:', error);
      }
    };
    
    fetchPendingAppointments();
    
    // Refresh count every 5 minutes
    const interval = setInterval(fetchPendingAppointments, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/admin/login');
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/admin' },
    { 
      name: 'Appointments', 
      path: '/admin/appointments',
      badge: pendingAppointments > 0 ? pendingAppointments : null 
    },
    { name: 'Blogs', path: '/admin/blogs' },
    { name: 'Create Blog', path: '/admin/blogs/create' },
    { name: 'Chatbot', path: '/admin/chatbot' },
    { name: 'Calculator', path: '/admin/calculator-params' },
  ];
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin" className="flex items-center">
                <span className="font-bold text-xl text-blue-600">D-Solar Admin</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`${
                    pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path))
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 relative`}
                >
                  {item.name}
                  {item.badge && (
                    <span className="absolute -top-0 -right-3 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center shadow-sm z-20 animate-pulse">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                Logged in as: <span className="font-semibold">{username}</span>
              </span>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 transition-colors duration-200 min-w-[80px]"
              >
                {isLoggingOut ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging out...
                  </span>
                ) : 'Logout'}
              </button>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon for menu */}
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${
                pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path))
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium relative`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center">
                {item.name}
                {item.badge && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 flex items-center justify-center min-w-[20px]">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <span className="text-sm font-medium text-gray-500">{username}</span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="ml-auto bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-medium disabled:bg-red-50 disabled:text-red-400"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 