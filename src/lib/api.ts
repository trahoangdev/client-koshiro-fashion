import { logger } from './logger';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

import {
  ApiResponse,
  PaginationResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ProductVideo,
  CloudinaryImage,
  Product,
  Category,
  OrderItem,
  User,
  Permission,
  Role,
  Order,
  PaymentMethod,
  Address,
  Review,
  CreateReviewRequest,
  ShippingZone,
  Settings,
  ActivityLog,
  Notification,
  FlashSale,
  Color,
  CreateColorRequest,
  UpdateColorRequest,
  CartItem
} from '../types/api-types';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'returned' | 'refunded';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface ApiKey {
  _id: string;
  name: string;
  key: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  lastUsed?: string;
  usageCount: number;
  rateLimit: number;
  expiresAt?: string;
  createdBy?: string | { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface Integration {
  _id: string;
  name: string;
  nameEn?: string;
  nameJa?: string;
  type: 'payment' | 'shipping' | 'email' | 'sms' | 'analytics' | 'social' | 'other';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  description: string;
  descriptionEn?: string;
  descriptionJa?: string;
  config: Record<string, unknown>;
  webhookUrl?: string;
  lastSync?: string;
  errorCount: number;
  successCount: number;
  lastError?: string;
  createdBy?: string | { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface ApiLog {
  _id: string;
  apiKey: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent?: string;
  error?: string;
  timestamp: string;
}

interface ApiManagementResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Re-export types for backward compatibility
export type {
  ApiResponse,
  PaginationResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ProductVideo,
  CloudinaryImage,
  Product,
  Category,
  OrderItem,
  User,
  Permission,
  Role,
  Order,
  PaymentMethod,
  Address,
  Review,
  CreateReviewRequest,
  ShippingZone,
  Settings,
  ActivityLog,
  Notification,
  FlashSale,
  Color,
  CreateColorRequest,
  UpdateColorRequest,
  CartItem
};

// API Client
class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  // Method to update token
  updateToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const headers: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
      logger.debug(`API Request to ${endpoint} with token`, { token: this.token.substring(0, 20) + '...' });
    } else {
      logger.debug(`API Request to ${endpoint} without token`);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error(`API Error for ${endpoint}`, errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // If response has success field and it's false, throw error
      if (data && typeof data === 'object' && 'success' in data && data.success === false) {
        logger.error(`API Error for ${endpoint}`, data);
        const errorMessage = data.message || 'Request failed';
        throw new Error(errorMessage);
      }

      logger.debug(`API Success for ${endpoint}`, data);
      return data;
    } catch (error) {
      logger.error('API request failed', error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.request<{ message: string; token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.token) {
        this.token = response.token;
        localStorage.setItem('token', response.token);
      }

      return {
        token: response.token,
        user: response.user
      };
    } catch (error) {
      logger.error('Login API error', error);
      throw error;
    }
  }

  async adminLogin(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.request<{ message: string; token: string; user: User }>('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.token) {
        this.token = response.token;
        localStorage.setItem('token', response.token);
      }

      return {
        token: response.token,
        user: response.user
      };
    } catch (error) {
      logger.error('Admin login API error', error);
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.request<{ message: string; token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.token) {
        this.token = response.token;
        localStorage.setItem('token', response.token);
      }

      return {
        token: response.token,
        user: response.user
      };
    } catch (error) {
      logger.error('Register API error', error);
      throw error;
    }
  }

  async googleLogin(token: string): Promise<AuthResponse> {
    try {
      const response = await this.request<{ message: string; token: string; user: User }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      if (response.token) {
        this.token = response.token;
        localStorage.setItem('token', response.token);
      }

      return {
        token: response.token,
        user: response.user
      };
    } catch (error) {
      logger.error('Google login API error', error);
      throw error;
    }
  }

  async facebookLogin(token: string): Promise<AuthResponse> {
    try {
      const response = await this.request<{ message: string; token: string; user: User }>('/auth/facebook', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      if (response.token) {
        this.token = response.token;
        localStorage.setItem('token', response.token);
      }

      return {
        token: response.token,
        user: response.user
      };
    } catch (error) {
      logger.error('Facebook login API error', error);
      throw error;
    }
  }

  async getProfile(): Promise<{ user: User }> {
    try {
      return await this.request<{ user: User }>('/auth/profile');
    } catch (error) {
      logger.error('Get profile API error', error);
      throw error;
    }
  }

  async updateProfile(userData: {
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
  }): Promise<{ message: string; user: User }> {
    try {
      return await this.request<{ message: string; user: User }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      logger.error('Update profile API error', error);
      throw error;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch (error) {
      logger.error('Change password API error', error);
      throw error;
    }
  }

  async deleteAccount(password: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });
    } catch (error) {
      logger.error('Delete account API error', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch (error) {
      logger.error('Forgot password API error', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    } catch (error) {
      logger.error('Reset password API error', error);
      throw error;
    }
  }



  async getOrderById(orderId: string): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}`);
  }

  async trackOrder(orderNumber: string): Promise<Order> {
    return this.request<Order>(`/orders/track/${orderNumber}`);
  }

  async trackOrderByEmail(email: string): Promise<Order[]> {
    return this.request<Order[]>(`/orders/track-email/${email}`);
  }

  // Customer Payment Methods (for user's saved payment methods)
  async getCustomerPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      return await this.request<PaymentMethod[]>('/payment-methods');
    } catch (error) {
      logger.error('Get customer payment methods API error', error);
      throw error;
    }
  }

  async addCustomerPaymentMethod(paymentData: {
    type: 'credit_card' | 'debit_card' | 'paypal';
    name: string;
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    paypalEmail?: string;
  }): Promise<PaymentMethod> {
    try {
      return await this.request<PaymentMethod>('/payment-methods', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      logger.error('Add customer payment method API error', error);
      throw error;
    }
  }

  async updateCustomerPaymentMethod(id: string, paymentData: {
    type: 'credit_card' | 'debit_card' | 'paypal';
    name: string;
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    paypalEmail?: string;
  }): Promise<PaymentMethod> {
    try {
      return await this.request<PaymentMethod>(`/payment-methods/${id}`, {
        method: 'PUT',
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      logger.error('Update customer payment method API error', error);
      throw error;
    }
  }

  async deleteCustomerPaymentMethod(id: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>(`/payment-methods/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      logger.error('Delete customer payment method API error', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(id: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>(`/payment-methods/${id}/default`, {
        method: 'PUT',
      });
    } catch (error) {
      logger.error('Set default payment method API error', error);
      throw error;
    }
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Address methods
  async getUserAddresses(): Promise<{ addresses: Address[] }> {
    try {
      return await this.request<{ addresses: Address[] }>('/auth/addresses');
    } catch (error) {
      logger.error('Get addresses API error', error);
      throw error;
    }
  }

  async addAddress(addressData: {
    type: 'shipping' | 'billing';
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
  }): Promise<{ message: string; address: Address }> {
    try {
      return await this.request<{ message: string; address: Address }>('/auth/addresses', {
        method: 'POST',
        body: JSON.stringify(addressData),
      });
    } catch (error) {
      logger.error('Add address API error', error);
      throw error;
    }
  }

  async updateAddress(id: string, addressData: {
    type?: 'shipping' | 'billing';
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    isDefault?: boolean;
  }): Promise<{ message: string; address: Address }> {
    try {
      return await this.request<{ message: string; address: Address }>(`/auth/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(addressData),
      });
    } catch (error) {
      logger.error('Update address API error', error);
      throw error;
    }
  }

  async deleteAddress(id: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>(`/auth/addresses/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      logger.error('Delete address API error', error);
      throw error;
    }
  }

  async setDefaultAddress(id: string): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>(`/auth/addresses/${id}/default`, {
        method: 'PUT',
      });
    } catch (error) {
      logger.error('Set default address API error', error);
      throw error;
    }
  }

  // Product methods
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: Product[] }> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    return this.request<{ products: Product[] }>(endpoint);
  }

  async getProduct(id: string, trackView: boolean = false): Promise<{ product: Product }> {
    const url = trackView ? `/products/${id}?trackView=true` : `/products/${id}`;
    return this.request<{ product: Product }>(url);
  }

  async getFeaturedProducts(limit: number = 6): Promise<{ products: Product[] }> {
    return this.request<{ products: Product[] }>(`/products/featured?limit=${limit}`);
  }

  async searchProducts(query: string, limit: number = 10): Promise<{ products: Product[] }> {
    return this.request<{ products: Product[] }>(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  // Category methods
  async getCategories(params?: {
    isActive?: boolean;
    parentId?: string;
  }): Promise<{ categories: Category[] }> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;

    return this.request<{ categories: Category[] }>(endpoint);
  }

  async getCategoryTree(params?: {
    isActive?: boolean;
  }): Promise<{ categories: Category[] }> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/categories/tree${queryString ? `?${queryString}` : ''}`;

    return this.request<{ categories: Category[] }>(endpoint);
  }

  async getCategoryBySlug(slug: string): Promise<{ category: Category }> {
    return this.request<{ category: Category }>(`/categories/slug/${slug}`);
  }

  async getCategoryWithProducts(
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<{
    category: Category;
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/categories/${id}/products${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  // Order methods
  async getUserOrders(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginationResponse<Order>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/orders/my-orders${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginationResponse<Order>>(endpoint);
  }

  async validateCoupon(code: string, subtotal: number): Promise<{ success: boolean; data?: { discountAmount: number }; message?: string }> {
    return this.request<{ success: boolean; data?: { discountAmount: number }; message?: string }>('/promotions/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderValue: subtotal }),
    });
  }

  async getUserOrder(id: string): Promise<{ order: Order }> {
    return this.request<{ order: Order }>(`/orders/my-orders/${id}`);
  }



  async createOrder(orderData: {
    userId?: string;
    items: Array<{
      productId: string;
      quantity: number;
      size?: string;
      color?: string;
    }>;
    shippingAddress: {
      name: string;
      phone: string;
      address: string;
      city: string;
      district: string;
    };
    billingAddress?: {
      name: string;
      phone: string;
      address: string;
      city: string;
      district: string;
    };
    paymentMethod: string;
    notes?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    trackingNumber?: string;
  }): Promise<{ message: string; order: Order }> {
    // Use admin route if userId is provided (admin creating order for customer)
    const endpoint = orderData.userId ? '/orders/admin' : '/orders';
    return this.request<{ message: string; order: Order }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async cancelOrder(id: string): Promise<{ message: string; order: Order }> {
    return this.request<{ message: string; order: Order }>(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  }

  async cancelOrderAdmin(id: string): Promise<{ message: string; order: Order }> {
    return this.request<{ message: string; order: Order }>(`/admin/orders/${id}/cancel`, {
      method: 'PUT',
    });
  }

  async updateOrder(id: string, orderData: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    paymentMethod?: string;
    notes?: string;
    trackingNumber?: string;
    shippingAddress?: {
      name: string;
      phone: string;
      address: string;
      city: string;
      district: string;
    };
  }): Promise<{ message: string; order: Order }> {
    return this.request<{ message: string; order: Order }>(`/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  // Review methods
  async getReviews(params?: {
    page?: number;
    limit?: number;
    productId?: string;
    rating?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginationResponse<Review>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/reviews${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginationResponse<Review>>(endpoint);
  }

  async getReviewStats(productId?: string): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { _id: number; count: number }[];
  }> {
    const endpoint = productId ? `/reviews/stats?productId=${productId}` : '/reviews/stats';
    return this.request(endpoint);
  }

  async createReview(reviewData: CreateReviewRequest): Promise<{ message: string; review: Review }> {
    return this.request<{ message: string; review: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async markReviewHelpful(reviewId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  }

  async updateReview(reviewId: string, updateData: Partial<CreateReviewRequest & { verified: boolean }>): Promise<{ message: string; review: Review }> {
    return this.request<{ message: string; review: Review }>(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteReview(reviewId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    return this.request<{ status: string; message: string; timestamp: string }>('/health');
  }

  // Admin Dashboard methods
  async getAdminStats(): Promise<{
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalRevenue: number;
    ordersTrend: number;
    productsTrend: number;
    usersTrend: number;
    revenueTrend: number;
  }> {
    return this.request('/admin/stats');
  }

  async getAdminOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginationResponse<Order>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/admin/orders${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginationResponse<Order>>(endpoint);
  }

  async getAdminProducts(params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<PaginationResponse<Product>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/admin/products${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginationResponse<Product>>(endpoint);
  }

  async createProduct(productData: {
    name: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    price: number;
    originalPrice?: number;
    categoryId: string;
    images: string[];
    cloudinaryImages?: CloudinaryImage[];
    sizes: string[];
    colors: string[];
    stock: number;
    isActive?: boolean;
    isFeatured?: boolean;
    onSale?: boolean;
    isNew?: boolean;
    isLimitedEdition?: boolean;
    isBestSeller?: boolean;
    tags?: string[];
    metaTitle?: string;
    metaDescription?: string;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    sku?: string;
    barcode?: string;
    slug?: string;
  }): Promise<{ message: string; product: Product }> {
    return this.request<{ message: string; product: Product }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: {
    name?: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    price?: number;
    originalPrice?: number;
    categoryId?: string;
    images?: string[];
    cloudinaryImages?: CloudinaryImage[];
    sizes?: string[];
    colors?: string[];
    stock?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    onSale?: boolean;
    isNew?: boolean;
    isLimitedEdition?: boolean;
    isBestSeller?: boolean;
    tags?: string[];
    metaTitle?: string;
    metaDescription?: string;
    weight?: number;
    dimensions?: { length: number; width: number; height: number };
    sku?: string;
    barcode?: string;
    slug?: string;
  }): Promise<{ message: string; product: Product }> {
    return this.request<{ message: string; product: Product }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminCategories(params?: {
    isActive?: boolean;
  }): Promise<{ categories: Category[] }> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/admin/categories${queryString ? `?${queryString}` : ''}`;

    return this.request<{ categories: Category[] }>(endpoint);
  }

  async createCategory(categoryData: {
    name: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    slug: string;
    image?: string; // Legacy field
    cloudinaryImages?: CloudinaryImage[]; // New Cloudinary images
    bannerImage?: string; // Legacy field
    cloudinaryBannerImages?: CloudinaryImage[]; // New Cloudinary banner images
    isActive?: boolean;
    parentId?: string;
    status?: 'active' | 'inactive';
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    sortOrder?: number;
    isFeatured?: boolean;
    isVisible?: boolean;
    displayType?: 'grid' | 'list' | 'carousel';
    color?: string;
    icon?: string;
    seoUrl?: string;
    canonicalUrl?: string;
    schemaMarkup?: string;
  }): Promise<{ message: string; category: Category }> {
    return this.request<{ message: string; category: Category }>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: {
    name?: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    slug?: string;
    image?: string; // Legacy field
    cloudinaryImages?: CloudinaryImage[]; // New Cloudinary images
    bannerImage?: string; // Legacy field
    cloudinaryBannerImages?: CloudinaryImage[]; // New Cloudinary banner images
    isActive?: boolean;
    parentId?: string;
    status?: 'active' | 'inactive';
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    sortOrder?: number;
    isFeatured?: boolean;
    isVisible?: boolean;
    displayType?: 'grid' | 'list' | 'carousel';
    color?: string;
    icon?: string;
    seoUrl?: string;
    canonicalUrl?: string;
    schemaMarkup?: string;
  }): Promise<{ message: string; category: Category }> {
    return this.request<{ message: string; category: Category }>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
  }): Promise<PaginationResponse<User>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;

    return this.request<PaginationResponse<User>>(endpoint);
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    role?: 'customer' | 'admin';
    status?: 'active' | 'inactive' | 'blocked';
  }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    role?: 'customer' | 'admin';
    status?: 'active' | 'inactive' | 'blocked';
  }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }



  // Wishlist methods
  async getWishlist(): Promise<Product[]> {
    return this.request<Product[]>('/wishlist');
  }

  async addToWishlist(productId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearWishlist(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/wishlist', {
      method: 'DELETE',
    });
  }

  // Cart methods
  async getCart(): Promise<{
    items: Array<{
      productId: string;
      quantity: number;
      size?: string;
      color?: string;
      product: Product;
    }>; total: number
  }> {
    return this.request<{
      items: Array<{
        productId: string;
        quantity: number;
        size?: string;
        color?: string;
        product: Product;
      }>; total: number
    }>('/cart');
  }

  async addToCart(productId: string, quantity: number = 1, size?: string, color?: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, size, color }),
    });
  }

  async updateCartItem(productId: string, quantity: number, size?: string, color?: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, size, color }),
    });
  }

  async removeFromCart(productId: string, size?: string, color?: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/cart/${productId}`, {
      method: 'DELETE',
      body: JSON.stringify({ size, color }),
    });
  }

  async clearCart(): Promise<{ message: string }> {
    return this.request('/cart', { method: 'DELETE' });
  }

  // Dashboard Analytics
  async getRevenueData(): Promise<Array<{
    month: string;
    revenue: number;
    orders: number;
  }>> {
    return this.request('/admin/revenue-data');
  }

  async getProductStats(): Promise<Array<{
    category: string;
    count: number;
    revenue: number;
  }>> {
    return this.request<Array<{
      category: string;
      count: number;
      revenue: number;
    }>>('/admin/product-stats');
  }



  // Settings methods
  async getSettings(): Promise<Settings> {
    return this.request<Settings>('/settings');
  }

  async getPublicSettings(): Promise<Settings> {
    return this.request<Settings>('/settings/public');
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    return this.request<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Activity Log APIs
  async getActivityLogs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    severity?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<PaginationResponse<ActivityLog>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.severity) searchParams.append('severity', params.severity);
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);

    return this.request<PaginationResponse<ActivityLog>>(`/admin/activity-logs?${searchParams}`);
  }

  async clearActivityLogs(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/admin/activity-logs', {
      method: 'DELETE',
    });
  }

  // Export/Import APIs
  async exportData(type: string, format: string): Promise<{ downloadUrl: string }> {
    return this.request<{ downloadUrl: string }>(`/admin/export/${type}`, {
      method: 'POST',
      body: JSON.stringify({ format }),
    });
  }

  async importData(type: string, file: File): Promise<{ message: string; importedCount: number }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request<{ message: string; importedCount: number }>(`/admin/import/${type}`, {
      method: 'POST',
      body: formData,
    });
  }

  // Enhanced User Management APIs
  async getUserById(id: string): Promise<{ user: User }> {
    return this.request<{ user: User }>(`/admin/users/${id}`);
  }

  async updateUserStatus(id: string, status: 'active' | 'inactive' | 'blocked'): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async bulkUpdateUserStatus(userIds: string[], status: 'active' | 'inactive' | 'blocked'): Promise<{ message: string; updatedCount: number }> {
    return this.request<{ message: string; updatedCount: number }>('/admin/users/bulk-status', {
      method: 'PATCH',
      body: JSON.stringify({ userIds, status }),
    });
  }

  // Enhanced Order Management APIs
  async updateOrderStatus(id: string, status: OrderStatus): Promise<{ message: string; order: Order }> {
    return this.request<{ message: string; order: Order }>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async bulkUpdateOrderStatus(orderIds: string[], status: OrderStatus): Promise<{ message: string; updatedCount: number }> {
    return this.request<{ message: string; updatedCount: number }>('/admin/orders/bulk-status', {
      method: 'PUT',
      body: JSON.stringify({ orderIds, status }),
    });
  }

  async getOrderDetails(id: string): Promise<{ order: Order }> {
    return this.request<{ order: Order }>(`/admin/orders/${id}`);
  }

  async printOrder(id: string): Promise<{ printUrl: string }> {
    return this.request<{ printUrl: string }>(`/admin/orders/${id}/print`, {
      method: 'POST',
    });
  }

  async sendOrderEmail(id: string, emailType: 'confirmation' | 'shipping' | 'delivery'): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/orders/${id}/email`, {
      method: 'POST',
      body: JSON.stringify({ emailType }),
    });
  }

  async deleteOrder(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics APIs
  async getAnalyticsData(params?: {
    period?: 'today' | 'week' | 'month' | 'year';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    revenue: {
      total: number;
      trend: number;
      byPeriod: Array<{ period: string; amount: number }>;
    };
    orders: {
      total: number;
      trend: number;
      byStatus: Record<string, number>;
      byPeriod: Array<{ period: string; count: number }>;
    };
    customers: {
      total: number;
      new: number;
      active: number;
      byPeriod: Array<{ period: string; count: number }>;
    };
    products: {
      total: number;
      active: number;
      lowStock: number;
      topSelling: Array<{ product: Product; sales: number }>;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append('period', params.period);
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);

    return this.request(`/admin/analytics?${searchParams}`);
  }

  // Comprehensive Analytics APIs
  async getOrderAnalytics(): Promise<{
    byStatus: Array<{ status: string; count: number; percentage: number }>;
    byHour: Array<{ hour: string; orders: number }>;
    byMonth: Array<{ month: string; orders: number; revenue: number }>;
  }> {
    return this.request('/admin/analytics/orders');
  }

  async getCustomerAnalytics(): Promise<{
    topSpenders: Array<{ name: string; email: string; totalSpent: number; orders: number }>;
    byLocation: Array<{ location: string; customers: number; revenue: number }>;
    activity: Array<{ date: string; newCustomers: number; activeCustomers: number }>;
  }> {
    return this.request('/admin/analytics/customers');
  }

  async getSalesAnalytics(): Promise<{
    byPaymentMethod: Array<{ method: string; count: number; amount: number }>;
    conversionRate: number;
    cartAbandonment: number;
    averageOrderValue: number;
  }> {
    return this.request('/admin/analytics/sales');
  }

  async getProductAnalytics(): Promise<{
    topSelling: Array<{ name: string; sales: number; revenue: number; stock: number }>;
    performance: Array<{ name: string; views: number; sales: number; rating: number }>;
    lowStock: Array<{ name: string; stock: number; category: string }>;
  }> {
    return this.request('/admin/analytics/products');
  }

  async getDailyRevenueData(days: number = 30): Promise<Array<{ date: string; revenue: number; orders: number }>> {
    return this.request(`/admin/analytics/daily-revenue?days=${days}`);
  }

  // Reports APIs
  async generateReport(type: 'sales' | 'customers' | 'inventory' | 'performance', params?: {
    dateFrom?: string;
    dateTo?: string;
    format?: 'pdf' | 'excel' | 'csv';
  }): Promise<{ downloadUrl: string }> {
    return this.request<{ downloadUrl: string }>('/admin/reports', {
      method: 'POST',
      body: JSON.stringify({ type, ...params }),
    });
  }

  // API keys and integrations management
  async getApiKeys(params?: { page?: number; limit?: number; search?: string; status?: 'all' | 'active' | 'inactive' }): Promise<ApiManagementResponse<{
    apiKeys: ApiKey[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    return this.request(`/admin/api/keys${queryString ? `?${queryString}` : ''}`);
  }

  async createApiKey(data: {
    name: string;
    description: string;
    permissions: string[];
    rateLimit?: number;
    expiresAt?: string;
  }): Promise<ApiManagementResponse<ApiKey>> {
    return this.request('/admin/api/keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApiKey(id: string, data: Partial<ApiKey>): Promise<ApiManagementResponse<ApiKey>> {
    return this.request(`/admin/api/keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteApiKey(id: string): Promise<ApiManagementResponse<null>> {
    return this.request(`/admin/api/keys/${id}`, {
      method: 'DELETE',
    });
  }

  async regenerateApiKey(id: string): Promise<ApiManagementResponse<ApiKey>> {
    return this.request(`/admin/api/keys/${id}/regenerate`, {
      method: 'POST',
    });
  }

  async getIntegrations(params?: { page?: number; limit?: number; search?: string; type?: string; status?: string }): Promise<ApiManagementResponse<{
    integrations: Integration[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    return this.request(`/admin/api/integrations${queryString ? `?${queryString}` : ''}`);
  }

  async createIntegration(data: Partial<Integration>): Promise<ApiManagementResponse<Integration>> {
    return this.request('/admin/api/integrations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIntegration(id: string, data: Partial<Integration>): Promise<ApiManagementResponse<Integration>> {
    return this.request(`/admin/api/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIntegration(id: string): Promise<ApiManagementResponse<null>> {
    return this.request(`/admin/api/integrations/${id}`, {
      method: 'DELETE',
    });
  }

  async testIntegration(id: string): Promise<ApiManagementResponse<{ success: boolean }>> {
    return this.request(`/admin/api/integrations/${id}/test`, {
      method: 'POST',
    });
  }

  async syncIntegration(id: string): Promise<ApiManagementResponse<{ success: boolean }>> {
    return this.request(`/admin/api/integrations/${id}/sync`, {
      method: 'POST',
    });
  }

  async getApiLogs(params?: { page?: number; limit?: number; apiKey?: string; endpoint?: string; statusCode?: number; startDate?: string; endDate?: string }): Promise<ApiManagementResponse<{
    logs: ApiLog[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.apiKey) searchParams.append('apiKey', params.apiKey);
    if (params?.endpoint) searchParams.append('endpoint', params.endpoint);
    if (params?.statusCode) searchParams.append('statusCode', params.statusCode.toString());
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const queryString = searchParams.toString();
    return this.request(`/admin/api/logs${queryString ? `?${queryString}` : ''}`);
  }

  async getApiStats(): Promise<ApiManagementResponse<{
    apiStats: {
      totalRequests: number;
      successRequests: number;
      errorRequests: number;
      successRate: number;
      avgResponseTime: number;
      uniqueApiKeys: number;
      uniqueEndpoints: number;
    };
    apiKeyStats: { totalKeys: number; activeKeys: number; expiredKeys: number };
    integrationStats: { totalIntegrations: number; activeIntegrations: number; errorIntegrations: number };
  }>> {
    return this.request('/admin/api/stats');
  }

  async clearApiLogs(olderThan?: string): Promise<ApiManagementResponse<{ deletedCount: number }>> {
    return this.request('/admin/api/logs', {
      method: 'DELETE',
      body: JSON.stringify({ olderThan }),
    });
  }

  async exportApiKeys(format: 'json' | 'csv' = 'json', includeInactive = false): Promise<Blob> {
    const searchParams = new URLSearchParams();
    searchParams.append('format', format);
    searchParams.append('includeInactive', includeInactive.toString());

    const headers: HeadersInit = {};
    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/admin/api/export?${searchParams}`, { headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  async importApiKeys(data: unknown, overwrite = false): Promise<ApiManagementResponse<{
    apiKeys: { created: number; updated: number; errors: number };
    integrations: { created: number; updated: number; errors: number };
  }>> {
    return this.request('/admin/api/import', {
      method: 'POST',
      body: JSON.stringify({ data, overwrite }),
    });
  }

  // Notification APIs
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    read?: boolean;
    unreadOnly?: boolean;
  }): Promise<PaginationResponse<Notification> & { unreadCount: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.read !== undefined) searchParams.append('read', params.read.toString());
    if (params?.unreadOnly) searchParams.append('unreadOnly', 'true');

    return this.request<PaginationResponse<Notification> & { unreadCount: number }>(`/notifications?${searchParams}`);
  }

  async getNotificationById(id: string): Promise<{ data: Notification }> {
    return this.request<{ data: Notification }>(`/notifications/${id}`);
  }

  async createNotification(notificationData: {
    userId?: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category: 'system' | 'order' | 'product' | 'user' | 'marketing';
    actionUrl?: string;
    expiresAt?: string;
  }): Promise<{ message: string; data: Notification }> {
    return this.request<{ message: string; data: Notification }>('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async updateNotification(id: string, notificationData: {
    title?: string;
    message?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    category?: 'system' | 'order' | 'product' | 'user' | 'marketing';
    actionUrl?: string;
    expiresAt?: string;
    read?: boolean;
  }): Promise<{ message: string; data: Notification }> {
    return this.request<{ message: string; data: Notification }>(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(notificationData),
    });
  }

  async markNotificationAsRead(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/notifications/all/read', {
      method: 'PUT',
    });
  }

  async bulkMarkAsRead(notificationIds: string[]): Promise<{ message: string; modifiedCount: number }> {
    return this.request<{ message: string; modifiedCount: number }>('/notifications/bulk/read', {
      method: 'PUT',
      body: JSON.stringify({ notificationIds }),
    });
  }

  async bulkDelete(notificationIds: string[]): Promise<{ message: string; deletedCount: number }> {
    return this.request<{ message: string; deletedCount: number }>('/notifications/bulk/delete', {
      method: 'PUT',
      body: JSON.stringify({ notificationIds }),
    });
  }

  async bulkDeleteNotifications(notificationIds: string[]): Promise<{ message: string; deletedCount: number }> {
    return this.bulkDelete(notificationIds);
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async getNotificationStats(params?: {
    period?: '1d' | '7d' | '30d' | '90d';
  }): Promise<{
    period: { startDate: string; endDate: string };
    totalNotifications: number;
    unreadNotifications: number;
    readNotifications: number;
    categoryStats: Array<{ _id: string; count: number; unread: number }>;
    typeStats: Array<{ _id: string; count: number; unread: number }>;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append('period', params.period);

    return this.request(`/notifications/stats?${searchParams}`);
  }

  // Admin Shipping APIs
  async getShippingMethods(): Promise<Array<{
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    description: string;
    descriptionEn?: string;
    descriptionJa?: string;
    type: 'standard' | 'express' | 'overnight' | 'pickup';
    cost: number;
    freeShippingThreshold?: number;
    estimatedDays: number;
    isActive: boolean;
    supportedRegions: string[];
    weightLimit?: number;
    dimensionsLimit?: string;
    createdAt: string;
    updatedAt: string;
  }>> {
    return this.request('/admin/shipping/methods');
  }

  async createShippingMethod(methodData: {
    name: string;
    nameEn?: string;
    nameJa?: string;
    description: string;
    descriptionEn?: string;
    descriptionJa?: string;
    type: 'standard' | 'express' | 'overnight' | 'pickup';
    cost: number;
    freeShippingThreshold?: number;
    estimatedDays: number;
    isActive?: boolean;
    supportedRegions: string[];
    weightLimit?: number;
    dimensionsLimit?: string;
  }): Promise<{
    message: string; method: {
      _id: string;
      name: string;
      nameEn?: string;
      nameJa?: string;
      type: 'standard' | 'express' | 'overnight' | 'pickup';
      cost: number;
      freeShippingThreshold?: number;
      estimatedDays: number;
      isActive: boolean;
      supportedRegions: string[];
      weightLimit?: number;
      dimensionsLimit?: string;
      createdAt: string;
      updatedAt: string;
    }
  }> {
    return this.request('/admin/shipping/methods', {
      method: 'POST',
      body: JSON.stringify(methodData),
    });
  }

  async updateShippingMethod(id: string, methodData: {
    name?: string;
    nameEn?: string;
    nameJa?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
    type?: 'standard' | 'express' | 'overnight' | 'pickup';
    cost?: number;
    freeShippingThreshold?: number;
    estimatedDays?: number;
    isActive?: boolean;
    supportedRegions?: string[];
    weightLimit?: number;
    dimensionsLimit?: string;
  }): Promise<{
    message: string; method: {
      _id: string;
      name: string;
      nameEn?: string;
      nameJa?: string;
      type: 'standard' | 'express' | 'overnight' | 'pickup';
      cost: number;
      freeShippingThreshold?: number;
      estimatedDays: number;
      isActive: boolean;
      supportedRegions: string[];
      weightLimit?: number;
      dimensionsLimit?: string;
      createdAt: string;
      updatedAt: string;
    }
  }> {
    return this.request(`/admin/shipping/methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(methodData),
    });
  }

  async deleteShippingMethod(id: string): Promise<{ message: string }> {
    return this.request(`/admin/shipping/methods/${id}`, {
      method: 'DELETE',
    });
  }

  async getShipments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    shipments: Array<{
      _id: string;
      orderId: string;
      orderNumber: string;
      trackingNumber: string;
      shippingMethod: string;
      status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
      customerName: string;
      customerPhone: string;
      shippingAddress: {
        name: string;
        phone: string;
        address: string;
        city: string;
        district: string;
      };
      carrier: string;
      carrierTrackingUrl?: string;
      estimatedDelivery: string;
      actualDelivery?: string;
      notes?: string;
      weight?: number;
      dimensions?: string;
      shippingCost: number;
      createdAt: string;
      updatedAt: string;
    }>;
    totalPages: number;
    currentPage: number;
    total: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.method) searchParams.append('method', params.method);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    return this.request(`/admin/shipping/shipments?${searchParams}`);
  }

  async getShipment(id: string): Promise<{
    shipment: {
      _id: string;
      orderId: string;
      orderNumber: string;
      trackingNumber: string;
      shippingMethod: string;
      status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
      customerName: string;
      customerPhone: string;
      shippingAddress: {
        name: string;
        phone: string;
        address: string;
        city: string;
        district: string;
      };
      carrier: string;
      carrierTrackingUrl?: string;
      estimatedDelivery: string;
      actualDelivery?: string;
      notes?: string;
      weight?: number;
      dimensions?: string;
      shippingCost: number;
      createdAt: string;
      updatedAt: string;
    }
  }> {
    return this.request(`/admin/shipping/shipments/${id}`);
  }

  async updateShipmentStatus(id: string, statusData: {
    status: string;
    notes?: string;
    location?: string;
    description?: string;
  }): Promise<{
    message: string; shipment: {
      _id: string;
      orderId: string;
      orderNumber: string;
      trackingNumber: string;
      shippingMethod: string;
      status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
      customerName: string;
      customerPhone: string;
      shippingAddress: {
        name: string;
        phone: string;
        address: string;
        city: string;
        district: string;
      };
      carrier: string;
      carrierTrackingUrl?: string;
      estimatedDelivery: string;
      actualDelivery?: string;
      notes?: string;
      weight?: number;
      dimensions?: string;
      shippingCost: number;
      createdAt: string;
      updatedAt: string;
    }
  }> {
    return this.request(`/admin/shipping/shipments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async getTrackingEvents(shipmentId: string): Promise<Array<{
    _id: string;
    shipmentId: string;
    status: string;
    location: string;
    description: string;
    timestamp: string;
    carrier?: string;
  }>> {
    return this.request(`/admin/shipping/shipments/${shipmentId}/tracking`);
  }

  async addTrackingEvent(shipmentId: string, eventData: {
    status: string;
    location: string;
    description: string;
    carrier?: string;
  }): Promise<{
    message: string; event: {
      _id: string;
      shipmentId: string;
      status: string;
      location: string;
      description: string;
      timestamp: string;
      carrier?: string;
    }
  }> {
    return this.request(`/admin/shipping/shipments/${shipmentId}/tracking`, {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async getShippingStats(): Promise<{
    total: number;
    pending: number;
    delivered: number;
    inTransit: number;
    failed: number;
    totalCost: number;
  }> {
    return this.request('/admin/shipping/stats');
  }

  // Admin Payment APIs
  async getAdminPaymentMethods(): Promise<Array<{
    _id: string;
    name: string;
    nameEn?: string;
    nameJa?: string;
    type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'cod' | 'crypto';
    provider: string;
    isActive: boolean;
    processingFee: number;
    minAmount?: number;
    maxAmount?: number;
    supportedCurrencies: string[];
    icon?: string;
    description: string;
    descriptionEn?: string;
    descriptionJa?: string;
    createdAt: string;
    updatedAt: string;
  }>> {
    return this.request('/admin/payments/methods');
  }

  async createAdminPaymentMethod(methodData: {
    name: string;
    nameEn?: string;
    nameJa?: string;
    type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'cod' | 'crypto';
    provider: string;
    isActive?: boolean;
    processingFee: number;
    minAmount?: number;
    maxAmount?: number;
    supportedCurrencies: string[];
    icon?: string;
    description: string;
    descriptionEn?: string;
    descriptionJa?: string;
  }): Promise<{
    message: string; method: {
      _id: string;
      name: string;
      nameEn?: string;
      nameJa?: string;
      type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'cod' | 'crypto';
      provider: string;
      isActive: boolean;
      processingFee: number;
      minAmount?: number;
      maxAmount?: number;
      supportedCurrencies: string[];
      icon?: string;
      description: string;
      descriptionEn?: string;
      descriptionJa?: string;
      createdAt: string;
      updatedAt: string;
    }
  }> {
    return this.request('/admin/payments/methods', {
      method: 'POST',
      body: JSON.stringify(methodData),
    });
  }

  async updateAdminPaymentMethod(id: string, methodData: {
    name?: string;
    nameEn?: string;
    nameJa?: string;
    type?: 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'cod' | 'crypto';
    provider?: string;
    isActive?: boolean;
    processingFee?: number;
    minAmount?: number;
    maxAmount?: number;
    supportedCurrencies?: string[];
    icon?: string;
    description?: string;
    descriptionEn?: string;
    descriptionJa?: string;
  }): Promise<{
    message: string; method: {
      _id: string;
      name: string;
      nameEn?: string;
      nameJa?: string;
      type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet' | 'cod' | 'crypto';
      provider: string;
      isActive: boolean;
      processingFee: number;
      minAmount?: number;
      maxAmount?: number;
      supportedCurrencies: string[];
      icon?: string;
      description: string;
      descriptionEn?: string;
      descriptionJa?: string;
      createdAt: string;
      updatedAt: string;
    }
  }> {
    return this.request(`/admin/payments/methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(methodData),
    });
  }

  async deleteAdminPaymentMethod(id: string): Promise<{ message: string }> {
    return this.request(`/admin/payments/methods/${id}`, {
      method: 'DELETE',
    });
  }

  async getPaymentMethods() {
    return this.getAdminPaymentMethods();
  }

  async createPaymentMethod(methodData: Parameters<ApiClient['createAdminPaymentMethod']>[0]) {
    return this.createAdminPaymentMethod(methodData);
  }

  async updatePaymentMethod(id: string, methodData: Parameters<ApiClient['updateAdminPaymentMethod']>[1]) {
    return this.updateAdminPaymentMethod(id, methodData);
  }

  async deletePaymentMethod(id: string) {
    return this.deleteAdminPaymentMethod(id);
  }

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    method?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    transactions: Array<{
      _id: string;
      orderId: string;
      orderNumber: string;
      transactionId: string;
      paymentMethod: string;
      paymentProvider: string;
      amount: number;
      currency: string;
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      gatewayResponse?: Record<string, unknown>;
      gatewayTransactionId?: string;
      refundAmount?: number;
      refundReason?: string;
      processedAt?: string;
      failedAt?: string;
      refundedAt?: string;
      notes?: string;
      createdAt: string;
      updatedAt: string;
    }>;
    totalPages: number;
    currentPage: number;
    total: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.method) searchParams.append('method', params.method);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    return this.request(`/admin/payments/transactions?${searchParams}`);
  }

  async getTransaction(id: string): Promise<{
    transaction: {
      _id: string;
      orderId: string;
      orderNumber: string;
      transactionId: string;
      paymentMethod: string;
      paymentProvider: string;
      amount: number;
      currency: string;
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      gatewayResponse?: Record<string, unknown>;
      gatewayTransactionId?: string;
      refundAmount?: number;
      refundReason?: string;
      processedAt?: string;
      failedAt?: string;
      refundedAt?: string;
      notes?: string;
      createdAt: string;
      updatedAt: string;
    }
  }> {
    return this.request(`/admin/payments/transactions/${id}`);
  }

  async updateTransactionStatus(id: string, statusData: {
    status: string;
    notes?: string;
  }): Promise<{
    message: string; transaction: {
      _id: string;
      orderId: string;
      orderNumber: string;
      transactionId: string;
      paymentMethod: string;
      paymentProvider: string;
      amount: number;
      currency: string;
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      gatewayResponse?: Record<string, unknown>;
      gatewayTransactionId?: string;
      refundAmount?: number;
      refundReason?: string;
      processedAt?: string;
      failedAt?: string;
      refundedAt?: string;
      notes?: string;
      createdAt: string;
      updatedAt: string;
    }
  }> {
    return this.request(`/admin/payments/transactions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  async processRefund(transactionId: string, refundData: {
    amount: number;
    reason: string;
  }): Promise<{
    message: string; refund: {
      _id: string;
      transactionId: string;
      orderId: string;
      amount: number;
      reason: string;
      status: 'pending' | 'approved' | 'rejected' | 'processed';
      requestedBy: string;
      approvedBy?: string;
      processedAt?: string;
      createdAt: string;
    }
  }> {
    return this.request(`/admin/payments/transactions/${transactionId}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  }

  async getRefunds(params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    refunds: Array<{
      _id: string;
      transactionId: string;
      orderId: string;
      amount: number;
      reason: string;
      status: 'pending' | 'approved' | 'rejected' | 'processed';
      requestedBy: string;
      approvedBy?: string;
      processedAt?: string;
      createdAt: string;
    }>;
    totalPages: number;
    currentPage: number;
    total: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    return this.request(`/admin/payments/refunds?${searchParams}`);
  }

  async updateRefundStatus(id: string, status: string): Promise<{
    message: string; refund: {
      _id: string;
      transactionId: string;
      orderId: string;
      amount: number;
      reason: string;
      status: 'pending' | 'approved' | 'rejected' | 'processed';
      requestedBy: string;
      approvedBy?: string;
      processedAt?: string;
      createdAt: string;
    }
  }> {
    return this.request(`/admin/payments/refunds/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getPaymentStats(): Promise<{
    total: number;
    completed: number;
    failed: number;
    pending: number;
    refunded: number;
    totalAmount: number;
    refundStats: Array<{ _id: string; count: number; total: number }>;
  }> {
    return this.request('/admin/payments/stats');
  }

  // FlashSale methods
  async getActiveFlashSales(): Promise<{ success: boolean; flashSales: FlashSale[] }> {
    return this.request<{ success: boolean; flashSales: FlashSale[] }>('/flash-sales/active');
  }

  async getCurrentFlashSale(): Promise<{
    success: boolean;
    flashSale: FlashSale | null;
    nextFlashSale?: FlashSale;
    message?: string;
  }> {
    return this.request<{
      success: boolean;
      flashSale: FlashSale | null;
      nextFlashSale?: FlashSale;
      message?: string;
    }>('/flash-sales/current');
  }

  async getFlashSaleById(id: string): Promise<{ success: boolean; flashSale: FlashSale }> {
    return this.request<{ success: boolean; flashSale: FlashSale }>(`/flash-sales/${id}`);
  }

  async getFlashSaleProducts(id: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    products: Array<Product & {
      flashSalePrice: number;
      flashSaleDiscount: number;
      flashSaleDiscountType: string;
    }>;
    flashSale: {
      id: string;
      name: string;
      nameEn?: string;
      nameJa?: string;
      discountType: string;
      discountValue: number;
      startTime: string;
      endTime: string;
      maxQuantity?: number;
      soldQuantity: number;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/flash-sales/${id}/products${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  // Role Management API
  async getRoles(params?: { isActive?: boolean; isSystem?: boolean; level?: number }): Promise<{ success: boolean; roles: Role[] }> {
    const searchParams = new URLSearchParams();
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params?.isSystem !== undefined) searchParams.append('isSystem', params.isSystem.toString());
    if (params?.level !== undefined) searchParams.append('level', params.level.toString());

    const queryString = searchParams.toString();
    const endpoint = `/roles${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async getRole(id: string): Promise<{ success: boolean; role: Role }> {
    return this.request(`/roles/${id}`);
  }

  async createRole(data: Partial<Role>): Promise<{ success: boolean; role: Role }> {
    return this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: string, data: Partial<Role>): Promise<{ success: boolean; role: Role }> {
    return this.request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async getRoleStats(): Promise<{ success: boolean; stats: Record<string, unknown> }> {
    return this.request('/roles/stats');
  }

  async cloneRole(id: string, data: { name: string; nameEn?: string; nameJa?: string; level: number }): Promise<{ success: boolean; role: Role }> {
    return this.request(`/roles/${id}/clone`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Permission Management API
  async getPermissions(params?: { isActive?: boolean; isSystem?: boolean; category?: string; resource?: string; action?: string }): Promise<{ success: boolean; permissions: Permission[] }> {
    const searchParams = new URLSearchParams();
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params?.isSystem !== undefined) searchParams.append('isSystem', params.isSystem.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.resource) searchParams.append('resource', params.resource);
    if (params?.action) searchParams.append('action', params.action);

    const queryString = searchParams.toString();
    const endpoint = `/permissions${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async getPermission(id: string): Promise<{ success: boolean; permission: Permission }> {
    return this.request(`/permissions/${id}`);
  }

  async createPermission(data: Partial<Permission>): Promise<{ success: boolean; permission: Permission }> {
    return this.request('/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePermission(id: string, data: Partial<Permission>): Promise<{ success: boolean; permission: Permission }> {
    return this.request(`/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePermission(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/permissions/${id}`, {
      method: 'DELETE',
    });
  }

  async getPermissionStats(): Promise<{ success: boolean; stats: Record<string, unknown> }> {
    return this.request('/permissions/stats');
  }

  async getPermissionsByCategory(params?: { isActive?: boolean }): Promise<{ success: boolean; permissions: Record<string, Permission[]> }> {
    const searchParams = new URLSearchParams();
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());

    const queryString = searchParams.toString();
    const endpoint = `/permissions/by-category${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async bulkCreatePermissions(permissions: Partial<Permission>[]): Promise<{ success: boolean; permissions: Permission[]; errors?: string[] }> {
    return this.request('/permissions/bulk', {
      method: 'POST',
      body: JSON.stringify({ permissions }),
    });
  }

  // Color API methods
  async getColors(params?: { activeOnly?: boolean; language?: 'vi' | 'en' | 'ja' }): Promise<{ success: boolean; colors: Color[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.activeOnly !== undefined) searchParams.append('activeOnly', params.activeOnly.toString());
    if (params?.language) searchParams.append('language', params.language);

    const queryString = searchParams.toString();
    const endpoint = `/colors${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async getColor(id: string): Promise<{ success: boolean; color: Color }> {
    return this.request(`/colors/${id}`);
  }

  async getColorByName(name: string): Promise<{ success: boolean; color: Color }> {
    return this.request(`/colors/name/${encodeURIComponent(name)}`);
  }

  async getColorHex(name: string): Promise<{ success: boolean; name: string; hexValue: string }> {
    return this.request(`/colors/hex/${encodeURIComponent(name)}`);
  }

  async createColor(color: CreateColorRequest): Promise<{ success: boolean; message: string; color: Color; isExisting?: boolean }> {
    return this.request('/colors', {
      method: 'POST',
      body: JSON.stringify(color),
    });
  }

  async updateColor(id: string, color: UpdateColorRequest): Promise<{ success: boolean; message: string; color: Color }> {
    return this.request(`/colors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(color),
    });
  }

  async deleteColor(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/colors/${id}`, {
      method: 'DELETE',
    });
  }
}



// Create and export API client instance
export const api = new ApiClient(API_BASE_URL); 
