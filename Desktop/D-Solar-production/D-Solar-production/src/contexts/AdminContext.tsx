'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of the admin context
interface AdminContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string) => void;
  logout: () => void;
}

// Create the context with default values
const AdminContext = createContext<AdminContextType>({
  isAuthenticated: false,
  username: null,
  login: () => {},
  logout: () => {},
});

// Custom hook for using the admin context
export const useAdmin = () => useContext(AdminContext);

// Provider component
export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  
  // Check for existing session on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth');
        const data = await response.json();
        
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
          setUsername(data.username);
          localStorage.setItem('adminUsername', data.username);
        } else {
          handleLogout();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        handleLogout();
      }
    };
    
    checkAuth();
    
    // Set up interval to periodically check authentication
    const interval = setInterval(checkAuth, 15 * 60 * 1000); // Check every 15 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  // Login function
  const login = async (username: string) => {
    localStorage.setItem('adminUsername', username);
    setIsAuthenticated(true);
    setUsername(username);
  };
  
  // Logout function with API call
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('adminUsername');
      setIsAuthenticated(false);
      setUsername(null);
    }
  };
  
  return (
    <AdminContext.Provider value={{ 
      isAuthenticated, 
      username, 
      login, 
      logout: handleLogout 
    }}>
      {children}
    </AdminContext.Provider>
  );
}; 