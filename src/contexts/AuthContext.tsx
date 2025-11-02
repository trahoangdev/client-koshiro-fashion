import React, { useEffect, useState } from 'react';
import { api, AuthResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { User, normalizeUser, getUserRoleName, isAdminUser } from './authHelpers';
import type { AuthContextType } from './AuthContextType';
import { AuthContext } from './AuthContextInstance';
import { logger } from '@/lib/logger';

// Helper functions are imported from authHelpers.ts

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user;
  const isAdmin = isAdminUser(user);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await api.login({ email, password });
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Update API client token
      api.updateToken(response.token);
      
      // Normalize user data
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng bạn trở lại, ${normalizedUser.name}!`,
      });
    } catch (error) {
      logger.error('Login error', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng nhập";
      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await api.adminLogin({ email, password });
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Update API client token
      api.updateToken(response.token);
      
      // Normalize user data
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      
      toast({
        title: "Đăng nhập Admin thành công",
        description: `Chào mừng Admin ${normalizedUser.name}!`,
      });
      
      // Auto-navigate to admin dashboard after successful login
      setTimeout(() => {
        window.location.href = '/admin';
      }, 500);
      
    } catch (error) {
      logger.error('Admin login error', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng nhập Admin";
      toast({
        title: "Đăng nhập Admin thất bại",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await api.register(userData);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Update API client token
      api.updateToken(response.token);
      
      // Normalize user data
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      
      toast({
        title: "Đăng ký thành công",
        description: `Chào mừng bạn đến với Koshiro Fashion, ${normalizedUser.name}!`,
      });
    } catch (error) {
      logger.error('Register error', error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng ký";
      toast({
        title: "Đăng ký thất bại",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // Clear API client token
      api.updateToken(null);
      
      // Clear user state
      setUser(null);
      
      toast({
        title: "Đăng xuất thành công",
        description: "Hẹn gặp lại bạn!",
      });
    } catch (error) {
      logger.error('Logout error', error);
      // Force clear state even if there's an error
      localStorage.removeItem('token');
      api.updateToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      // Update API client token
      api.updateToken(token);
      
      const response = await api.getProfile();
      
      // Normalize user data
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
    } catch (error) {
      logger.error('Refresh user error', error);
      // If token is invalid, clear it
      localStorage.removeItem('token');
      api.updateToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Validate token format (basic check)
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            await refreshUser();
          } else {
            // Invalid token format, clear it
            localStorage.removeItem('token');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        logger.error('Auth initialization error', error);
        // Clear invalid token
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    adminLogin,
    register,
    logout,
    refreshUser,
    getUserRoleName: () => getUserRoleName(user),
    isAdminUser: () => isAdminUser(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth is exported from useAuth.ts 