import type { User } from './authHelpers';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    address?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  facebookLogin: (token: string) => Promise<void>;
  getUserRoleName: () => string;
  isAdminUser: () => boolean;
}
