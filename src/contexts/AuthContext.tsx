import React, { useEffect, useState } from 'react';
import { api, AuthResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { User, normalizeUser, getUserRoleName, isAdminUser } from './authHelpers';
import type { AuthContextType } from './AuthContextType';
import { AuthContext } from './AuthContextInstance';

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

  // Sync cart from localStorage to server after login
  const syncCartFromLocalStorage = async () => {
    try {
      const { cartService } = await import('@/lib/cartService');
      const localCart = cartService.getCart();
      
      if (localCart.length === 0) {
        return; // No items to sync
      }

      // Get current server cart to merge
      const serverCart = await api.getCart();
      const serverItems = serverCart?.items || [];

      // Create a map of server cart items for quick lookup
      const serverCartMap = new Map<string, { quantity: number; size?: string; color?: string }>();
      serverItems.forEach((item: { productId: string; quantity: number; size?: string; color?: string }) => {
        const key = `${item.productId}-${item.size || ''}-${item.color || ''}`;
        serverCartMap.set(key, { quantity: item.quantity, size: item.size, color: item.color });
      });

      // Merge local cart items into server cart
      for (const localItem of localCart) {
        const key = `${localItem.productId}-${localItem.selectedSize || ''}-${localItem.selectedColor || ''}`;
        const serverItem = serverCartMap.get(key);

        if (serverItem) {
          // Item exists in server cart, update quantity (merge)
          const newQuantity = serverItem.quantity + localItem.quantity;
          await api.updateCartItem(localItem.productId, newQuantity);
        } else {
          // Item doesn't exist in server cart, add it with size and color
          await api.addToCart(
            localItem.productId, 
            localItem.quantity,
            localItem.selectedSize,
            localItem.selectedColor
          );
        }
      }

      // Clear localStorage cart after successful sync
      cartService.clearCart();
    } catch (error) {
      console.error('Error syncing cart from localStorage:', error);
      // Don't throw error - cart sync failure shouldn't block login
    }
  };

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
      
      // Sync cart from localStorage to server
      await syncCartFromLocalStorage();
      
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng bạn trở lại, ${normalizedUser.name}!`,
      });
    } catch (error) {
      console.error('Login error:', error);
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
      console.error('Admin login error:', error);
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
      
      // Sync cart from localStorage to server
      await syncCartFromLocalStorage();
      
      toast({
        title: "Đăng ký thành công",
        description: `Chào mừng bạn đến với Koshiro Fashion, ${normalizedUser.name}!`,
      });
    } catch (error) {
      console.error('Register error:', error);
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
      console.error('Logout error:', error);
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
      console.error('Refresh user error:', error);
      // If token is invalid, clear it
      localStorage.removeItem('token');
      api.updateToken(null);
      setUser(null);
    }
  };

  // OAuth login methods
  const googleLogin = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await api.googleLogin(token);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Update API client token
      api.updateToken(response.token);
      
      // Normalize user data
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      
      // Sync cart from localStorage to server
      await syncCartFromLocalStorage();
      
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng bạn trở lại, ${normalizedUser.name}!`,
      });
    } catch (error) {
      console.error('Google login error:', error);
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

  const facebookLogin = async (token: string) => {
    try {
      setIsLoading(true);
      const response = await api.facebookLogin(token);
      
      // Store token in localStorage
      localStorage.setItem('token', response.token);
      
      // Update API client token
      api.updateToken(response.token);
      
      // Normalize user data
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      
      // Sync cart from localStorage to server
      await syncCartFromLocalStorage();
      
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng bạn trở lại, ${normalizedUser.name}!`,
      });
    } catch (error) {
      console.error('Facebook login error:', error);
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
        console.error('Auth initialization error:', error);
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
    googleLogin,
    facebookLogin,
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