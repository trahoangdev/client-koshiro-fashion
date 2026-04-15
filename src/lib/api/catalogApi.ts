import type {
  Category,
  CreateReviewRequest,
  PaginationResponse,
  Product,
  Review
} from '../../types/api-types';

type ApiRequest = <T>(endpoint: string, options?: RequestInit) => Promise<T>;

export type ProductQuery = {
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
};

export type CategoryQuery = {
  isActive?: boolean;
  parentId?: string;
};

export type ReviewsQuery = {
  page?: number;
  limit?: number;
  productId?: string;
  rating?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type CategoryProductsResponse = {
  category: Category;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type ReviewStats = {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { _id: number; count: number }[];
};

export type CartResponse = {
  items: Array<{
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
    product: Product;
  }>;
  total: number;
};

export interface CatalogApi {
  getProducts(params?: ProductQuery): Promise<{ products: Product[] }>;
  getProduct(id: string, trackView?: boolean): Promise<{ product: Product }>;
  getFeaturedProducts(limit?: number): Promise<{ products: Product[] }>;
  searchProducts(query: string, limit?: number): Promise<{ products: Product[] }>;
  getCategories(params?: CategoryQuery): Promise<{ categories: Category[] }>;
  getCategoryTree(params?: Pick<CategoryQuery, 'isActive'>): Promise<{ categories: Category[] }>;
  getCategoryBySlug(slug: string): Promise<{ category: Category }>;
  getCategoryWithProducts(id: string, params?: { page?: number; limit?: number }): Promise<CategoryProductsResponse>;
  getReviews(params?: ReviewsQuery): Promise<PaginationResponse<Review>>;
  getReviewStats(productId?: string): Promise<ReviewStats>;
  createReview(reviewData: CreateReviewRequest): Promise<{ message: string; review: Review }>;
  markReviewHelpful(reviewId: string): Promise<{ message: string }>;
  updateReview(
    reviewId: string,
    updateData: Partial<CreateReviewRequest & { verified: boolean }>
  ): Promise<{ message: string; review: Review }>;
  deleteReview(reviewId: string): Promise<{ message: string }>;
  getWishlist(): Promise<Product[]>;
  addToWishlist(productId: string): Promise<{ message: string }>;
  removeFromWishlist(productId: string): Promise<{ message: string }>;
  clearWishlist(): Promise<{ message: string }>;
  getCart(): Promise<CartResponse>;
  addToCart(productId: string, quantity?: number, size?: string, color?: string): Promise<{ message: string }>;
  updateCartItem(productId: string, quantity: number, size?: string, color?: string): Promise<{ message: string }>;
  removeFromCart(productId: string, size?: string, color?: string): Promise<{ message: string }>;
  clearCart(): Promise<{ message: string }>;
}

type CatalogApiDeps = {
  request: ApiRequest;
};

const toQueryString = (params?: Record<string, string | number | boolean | undefined>): string => {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
  }

  return searchParams.toString();
};

export const createCatalogApi = ({ request }: CatalogApiDeps): CatalogApi => ({
  getProducts(params) {
    const queryString = toQueryString(params);
    return request<{ products: Product[] }>(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getProduct(id, trackView = false) {
    const endpoint = trackView ? `/products/${id}?trackView=true` : `/products/${id}`;
    return request<{ product: Product }>(endpoint);
  },

  getFeaturedProducts(limit = 6) {
    return request<{ products: Product[] }>(`/products/featured?limit=${limit}`);
  },

  searchProducts(query, limit = 10) {
    return request<{ products: Product[] }>(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  getCategories(params) {
    const queryString = toQueryString(params);
    return request<{ categories: Category[] }>(`/categories${queryString ? `?${queryString}` : ''}`);
  },

  getCategoryTree(params) {
    const queryString = toQueryString(params);
    return request<{ categories: Category[] }>(`/categories/tree${queryString ? `?${queryString}` : ''}`);
  },

  getCategoryBySlug(slug) {
    return request<{ category: Category }>(`/categories/slug/${slug}`);
  },

  getCategoryWithProducts(id, params) {
    const queryString = toQueryString(params);
    return request<CategoryProductsResponse>(`/categories/${id}/products${queryString ? `?${queryString}` : ''}`);
  },

  getReviews(params) {
    const queryString = toQueryString(params);
    return request<PaginationResponse<Review>>(`/reviews${queryString ? `?${queryString}` : ''}`);
  },

  getReviewStats(productId) {
    const endpoint = productId ? `/reviews/stats?productId=${productId}` : '/reviews/stats';
    return request<ReviewStats>(endpoint);
  },

  createReview(reviewData) {
    return request<{ message: string; review: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  markReviewHelpful(reviewId) {
    return request<{ message: string }>(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  },

  updateReview(reviewId, updateData) {
    return request<{ message: string; review: Review }>(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  deleteReview(reviewId) {
    return request<{ message: string }>(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },

  getWishlist() {
    return request<Product[]>('/wishlist');
  },

  addToWishlist(productId) {
    return request<{ message: string }>('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  removeFromWishlist(productId) {
    return request<{ message: string }>(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },

  clearWishlist() {
    return request<{ message: string }>('/wishlist', {
      method: 'DELETE',
    });
  },

  getCart() {
    return request<CartResponse>('/cart');
  },

  addToCart(productId, quantity = 1, size, color) {
    return request<{ message: string }>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, size, color }),
    });
  },

  updateCartItem(productId, quantity, size, color) {
    return request<{ message: string }>(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, size, color }),
    });
  },

  removeFromCart(productId, size, color) {
    return request<{ message: string }>(`/cart/${productId}`, {
      method: 'DELETE',
      body: JSON.stringify({ size, color }),
    });
  },

  clearCart() {
    return request<{ message: string }>('/cart', { method: 'DELETE' });
  },
});
