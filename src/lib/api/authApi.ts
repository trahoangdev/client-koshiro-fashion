import { logger } from '../logger';
import type { Address, AuthResponse, LoginRequest, RegisterRequest, User } from '../../types/api-types';

type ApiRequest = <T>(endpoint: string, options?: RequestInit) => Promise<T>;
type UpdateToken = (token: string | null) => void;

type AuthApiDeps = {
  request: ApiRequest;
  updateToken: UpdateToken;
};

type UpdateProfileRequest = {
  name?: string;
  phone?: string;
  address?: string;
  preferences?: {
    language?: string;
    currency?: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    marketingEmails?: boolean;
    notificationPreferences?: {
      email?: {
        orderUpdates?: boolean;
        promotions?: boolean;
        newsletters?: boolean;
        productRecommendations?: boolean;
      };
      push?: {
        orderUpdates?: boolean;
        promotions?: boolean;
        backInStock?: boolean;
        priceDrops?: boolean;
      };
      sms?: {
        orderUpdates?: boolean;
        promotions?: boolean;
      };
    };
  };
};

type AddressRequest = {
  type: 'shipping' | 'billing';
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
};

type UpdateAddressRequest = Partial<AddressRequest>;

const persistAuthResponse = (response: { token: string; user: User }, updateToken: UpdateToken): AuthResponse => {
  updateToken(response.token);
  return {
    token: response.token,
    user: response.user
  };
};

export const createAuthApi = ({ request, updateToken }: AuthApiDeps) => ({
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await request<{ message: string; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      return persistAuthResponse(response, updateToken);
    } catch (error) {
      logger.error('Login API error', error);
      throw error;
    }
  },

  async adminLogin(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await request<{ message: string; token: string; user: User }>('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      return persistAuthResponse(response, updateToken);
    } catch (error) {
      logger.error('Admin login API error', error);
      throw error;
    }
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await request<{ message: string; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return persistAuthResponse(response, updateToken);
    } catch (error) {
      logger.error('Register API error', error);
      throw error;
    }
  },

  async googleLogin(token: string): Promise<AuthResponse> {
    try {
      const response = await request<{ message: string; token: string; user: User }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      return persistAuthResponse(response, updateToken);
    } catch (error) {
      logger.error('Google login API error', error);
      throw error;
    }
  },

  async facebookLogin(token: string): Promise<AuthResponse> {
    try {
      const response = await request<{ message: string; token: string; user: User }>('/auth/facebook', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      return persistAuthResponse(response, updateToken);
    } catch (error) {
      logger.error('Facebook login API error', error);
      throw error;
    }
  },

  async getProfile(): Promise<{ user: User }> {
    try {
      return await request<{ user: User }>('/auth/profile');
    } catch (error) {
      logger.error('Get profile API error', error);
      throw error;
    }
  },

  async updateProfile(userData: UpdateProfileRequest): Promise<{ message: string; user: User }> {
    try {
      return await request<{ message: string; user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      logger.error('Update profile API error', error);
      throw error;
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch (error) {
      logger.error('Change password API error', error);
      throw error;
    }
  },

  async deleteAccount(password: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>('/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });
    } catch (error) {
      logger.error('Delete account API error', error);
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      logger.error('Forgot password API error', error);
      throw error;
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    } catch (error) {
      logger.error('Reset password API error', error);
      throw error;
    }
  },

  async getUserAddresses(): Promise<{ addresses: Address[] }> {
    try {
      return await request<{ addresses: Address[] }>('/auth/addresses');
    } catch (error) {
      logger.error('Get addresses API error', error);
      throw error;
    }
  },

  async addAddress(addressData: AddressRequest): Promise<{ message: string; address: Address }> {
    try {
      return await request<{ message: string; address: Address }>('/auth/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
      });
    } catch (error) {
      logger.error('Add address API error', error);
      throw error;
    }
  },

  async updateAddress(id: string, addressData: UpdateAddressRequest): Promise<{ message: string; address: Address }> {
    try {
      return await request<{ message: string; address: Address }>(`/auth/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
      });
    } catch (error) {
      logger.error('Update address API error', error);
      throw error;
    }
  },

  async deleteAddress(id: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>(`/auth/addresses/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      logger.error('Delete address API error', error);
      throw error;
    }
  },

  async setDefaultAddress(id: string): Promise<{ message: string }> {
    try {
      return await request<{ message: string }>(`/auth/addresses/${id}/default`, {
        method: 'PUT',
      });
    } catch (error) {
      logger.error('Set default address API error', error);
      throw error;
    }
  }
});

export type AuthApi = ReturnType<typeof createAuthApi>;
