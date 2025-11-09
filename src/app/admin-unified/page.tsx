'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLogin from '@/components/AdminLogin';
import UnifiedAdminDashboard from '@/components/UnifiedAdminDashboard';

export default function UnifiedAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateStoredToken = async () => {
      const storedToken = localStorage.getItem('adminToken');
      if (storedToken) {
        try {
          // Validate token with server by making a test API call
          const response = await fetch('/api/admin/stats', {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            // Token is valid
            setToken(storedToken);
            setIsAuthenticated(true);
          } else {
            // Token is invalid/expired, remove it
            localStorage.removeItem('adminToken');
            setToken(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Network error or token validation failed
          localStorage.removeItem('adminToken');
          setToken(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    validateStoredToken();
  }, []);

  const handleLoginSuccess = (newToken: string) => {
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="spinner h-12 w-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Unified Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <UnifiedAdminDashboard token={token} onLogout={handleLogout} />;
}

