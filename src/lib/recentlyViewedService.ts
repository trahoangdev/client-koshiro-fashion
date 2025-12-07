import { Product } from './api';

const STORAGE_KEY = 'koshiro_recently_viewed';
const MAX_ITEMS = 12; // Maximum number of recently viewed items

class RecentlyViewedService {
  /**
   * Get all recently viewed products
   */
  getRecentlyViewed(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      
      const items: Product[] = JSON.parse(data);
      return items;
    } catch (error) {
      console.error('Error reading recently viewed from localStorage:', error);
      return [];
    }
  }

  /**
   * Add product to recently viewed
   * Removes duplicates and keeps only the most recent MAX_ITEMS
   */
  addProduct(product: Product): void {
    try {
      let items = this.getRecentlyViewed();
      
      // Remove if already exists (to move to top)
      items = items.filter(item => item._id !== product._id);
      
      // Add to beginning
      items.unshift(product);
      
      // Limit to MAX_ITEMS
      items = items.slice(0, MAX_ITEMS);
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving recently viewed to localStorage:', error);
    }
  }

  /**
   * Remove a product from recently viewed
   */
  removeProduct(productId: string): void {
    try {
      let items = this.getRecentlyViewed();
      items = items.filter(item => item._id !== productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error removing product from recently viewed:', error);
    }
  }

  /**
   * Clear all recently viewed products
   */
  clearAll(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  }

  /**
   * Check if product is in recently viewed
   */
  isInRecentlyViewed(productId: string): boolean {
    const items = this.getRecentlyViewed();
    return items.some(item => item._id === productId);
  }

  /**
   * Get count of recently viewed items
   */
  getCount(): number {
    return this.getRecentlyViewed().length;
  }

  /**
   * Get recently viewed products with limit
   */
  getRecentlyViewedLimited(limit: number = MAX_ITEMS): Product[] {
    return this.getRecentlyViewed().slice(0, limit);
  }
}

export const recentlyViewedService = new RecentlyViewedService();

