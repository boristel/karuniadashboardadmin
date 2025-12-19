'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';
import { toast } from 'sonner';

interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role_custom?: string;  // Custom role field (ADMIN, SALES, etc.)
  role?: {
    id: number;
    name: string;
    description: string;
    type: string;
  };
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored user session on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          // Verify token is still valid
          const userData = await authAPI.me();
          
          // ⭐ ROLE-BASED ACCESS CONTROL CHECK
          console.log('🔐 checkAuth: Verifying role_custom for existing session:', userData?.role_custom);
          
          if (!userData.role_custom || userData.role_custom !== 'ADMIN') {
            console.log('❌ checkAuth: User is not ADMIN - clearing session');
            console.log('❌ checkAuth: role_custom value:', userData.role_custom || 'undefined');

            // Show toast notification for session termination
            toast.error('Session Terminated: Your account does not have administrative privileges. Access denied.', {
              duration: 5000,
              position: 'top-center'
            });

            // Clear unauthorized session
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user');

            throw new Error('Access denied. Your session has been terminated.');
          }
          
          console.log('✅ checkAuth: ADMIN role verified');
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid session
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🚀 STARTING LOGIN PROCESS');
      console.log('📧 Email:', email);
      console.log('🔑 Password length:', password.length);

      setError(null);
      setIsLoading(true);

      const response = await authAPI.login(email, password);

      console.log('✅ AUTHENTICATION SUCCESSFUL!');
      console.log('📦 Raw response:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response keys:', Object.keys(response));
      console.log('🔍 Response data:', JSON.stringify(response, null, 2));

      // Handle different response formats
      let token, user;

      console.log('🔍 Checking for token in different formats...');

      if (response.jwt) {
        console.log('✅ Found standard Strapi format (response.jwt)');
        token = response.jwt;
        user = response.user;
      } else if (response.data?.token) {
        console.log('✅ Found admin panel format (response.data.token)');
        token = response.data.token;
        user = response.data.user;
      } else if (response.token) {
        console.log('✅ Found alternative format (response.token)');
        token = response.token;
        user = response.user;
      } else {
        console.error('❌ Unexpected response format - no token found');
        console.error('❌ Response structure:', JSON.stringify(response, null, 2));
        throw new Error('Invalid response format from server - no authentication token found');
      }

      console.log('✅ Token extracted successfully:', token ? 'YES' : 'NO');
      console.log('✅ User extracted successfully:', user ? 'YES' : 'NO');
      console.log('👤 User data:', user);

      // ⭐ ROLE-BASED ACCESS CONTROL CHECK
      console.log('🔐 Checking role_custom field:', user?.role_custom);
      
      if (!user.role_custom || user.role_custom !== 'ADMIN') {
        console.log('❌ ACCESS DENIED: User role is not ADMIN');
        console.log('❌ User role_custom value:', user.role_custom || 'undefined');
        console.log('❌ User will NOT be logged in');

        // Show toast notification for access denied
        toast.error('Access Denied: Only administrators can access this dashboard. Please contact your system administrator.', {
          duration: 5000,
          position: 'top-center'
        });

        throw new Error('Access denied. Only administrators can access this dashboard. Please contact your system administrator.');
      }
      
      console.log('✅ ADMIN role verified - user is authorized');
      console.log('✅ Proceeding with login...');

      // Store JWT token
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('💾 Token and user stored in localStorage');
      console.log('🔄 Setting user in context...');

      setUser(user);

      // Show success notification
      toast.success(`Welcome back, ${user.username || 'Administrator'}!`, {
        duration: 3000,
        position: 'top-center'
      });

      console.log('✅ LOGIN PROCESS COMPLETED SUCCESSFULLY');

    } catch (error: any) {
      console.error('❌ LOGIN FAILED IN CONTEXT');
      console.error('❌ Error object:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      console.error('❌ Error response text:', error.response?.statusText);

      // Handle different error formats
      const errorMessage = error.response?.data?.error?.message ||
                           error.response?.data?.message ||
                           error.message ||
                           'Login failed';

      console.log('❌ Extracted error message:', errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('🏁 LOGIN PROCESS FINISHED (loading: false)');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authAPI.register(username, email, password);

      // Auto-login after successful registration
      localStorage.setItem('jwt_token', response.jwt);
      localStorage.setItem('user', JSON.stringify(response.user));

      setUser(response.user);
    } catch (error: any) {
      setError(error.response?.data?.error?.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
    // Use Next.js router for navigation
    window.location.href = '/auth/login';
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    error,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}