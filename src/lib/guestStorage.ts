/**
 * Guest Storage Service
 * Manages cart, wishlist, and compare functionality for non-authenticated users
 * Data is stored in localStorage and synced to server when user logs in
 */

import { Product } from './api';

// Storage keys
const GUEST_CART_KEY = 'koshiro_guest_cart';
const GUEST_WISHLIST_KEY = 'koshiro_guest_wishlist';
const GUEST_COMPARE_KEY = 'koshiro_guest_compare';

// Types
export interface GuestCartItem {
    productId: string;
    product: Product;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    addedAt: string;
}

export interface GuestWishlistItem {
    productId: string;
    product: Product;
    addedAt: string;
}

export interface GuestCompareItem {
    productId: string;
    product: Product;
    addedAt: string;
}

// ============================================
// GUEST CART
// ============================================

export const guestCartService = {
    getCart: (): GuestCartItem[] => {
        try {
            const data = localStorage.getItem(GUEST_CART_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading guest cart:', error);
            return [];
        }
    },

    addToCart: (product: Product, quantity: number = 1, size?: string, color?: string): GuestCartItem[] => {
        try {
            const cart = guestCartService.getCart();
            const existingIndex = cart.findIndex(
                item => item.productId === product._id &&
                    item.selectedSize === size &&
                    item.selectedColor === color
            );

            if (existingIndex >= 0) {
                cart[existingIndex].quantity += quantity;
            } else {
                cart.push({
                    productId: product._id,
                    product,
                    quantity,
                    selectedSize: size,
                    selectedColor: color,
                    addedAt: new Date().toISOString()
                });
            }

            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
            window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: { cart } }));
            return cart;
        } catch (error) {
            console.error('Error adding to guest cart:', error);
            return guestCartService.getCart();
        }
    },

    updateQuantity: (productId: string, quantity: number, size?: string, color?: string): GuestCartItem[] => {
        try {
            const cart = guestCartService.getCart();
            const index = cart.findIndex(
                item => item.productId === productId &&
                    item.selectedSize === size &&
                    item.selectedColor === color
            );

            if (index >= 0) {
                if (quantity <= 0) {
                    cart.splice(index, 1);
                } else {
                    cart[index].quantity = quantity;
                }
                localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
                window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: { cart } }));
            }
            return cart;
        } catch (error) {
            console.error('Error updating guest cart:', error);
            return guestCartService.getCart();
        }
    },

    removeFromCart: (productId: string, size?: string, color?: string): GuestCartItem[] => {
        try {
            let cart = guestCartService.getCart();
            cart = cart.filter(
                item => !(item.productId === productId &&
                    item.selectedSize === size &&
                    item.selectedColor === color)
            );
            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
            window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: { cart } }));
            return cart;
        } catch (error) {
            console.error('Error removing from guest cart:', error);
            return guestCartService.getCart();
        }
    },

    clearCart: (): void => {
        try {
            localStorage.removeItem(GUEST_CART_KEY);
            window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: { cart: [] } }));
        } catch (error) {
            console.error('Error clearing guest cart:', error);
        }
    },

    getItemCount: (): number => {
        return guestCartService.getCart().reduce((sum, item) => sum + item.quantity, 0);
    },

    getTotal: (): number => {
        return guestCartService.getCart().reduce(
            (total, item) => total + (item.product.price * item.quantity), 0
        );
    }
};

// ============================================
// GUEST WISHLIST
// ============================================

export const guestWishlistService = {
    getWishlist: (): GuestWishlistItem[] => {
        try {
            const data = localStorage.getItem(GUEST_WISHLIST_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading guest wishlist:', error);
            return [];
        }
    },

    addToWishlist: (product: Product): GuestWishlistItem[] => {
        try {
            const wishlist = guestWishlistService.getWishlist();
            const exists = wishlist.some(item => item.productId === product._id);

            if (!exists) {
                wishlist.push({
                    productId: product._id,
                    product,
                    addedAt: new Date().toISOString()
                });
                localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlist));
                window.dispatchEvent(new CustomEvent('guestWishlistUpdated', { detail: { wishlist } }));
            }
            return wishlist;
        } catch (error) {
            console.error('Error adding to guest wishlist:', error);
            return guestWishlistService.getWishlist();
        }
    },

    removeFromWishlist: (productId: string): GuestWishlistItem[] => {
        try {
            let wishlist = guestWishlistService.getWishlist();
            wishlist = wishlist.filter(item => item.productId !== productId);
            localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlist));
            window.dispatchEvent(new CustomEvent('guestWishlistUpdated', { detail: { wishlist } }));
            return wishlist;
        } catch (error) {
            console.error('Error removing from guest wishlist:', error);
            return guestWishlistService.getWishlist();
        }
    },

    isInWishlist: (productId: string): boolean => {
        return guestWishlistService.getWishlist().some(item => item.productId === productId);
    },

    clearWishlist: (): void => {
        try {
            localStorage.removeItem(GUEST_WISHLIST_KEY);
            window.dispatchEvent(new CustomEvent('guestWishlistUpdated', { detail: { wishlist: [] } }));
        } catch (error) {
            console.error('Error clearing guest wishlist:', error);
        }
    },

    getCount: (): number => {
        return guestWishlistService.getWishlist().length;
    }
};

// ============================================
// GUEST COMPARE
// ============================================

const MAX_COMPARE_ITEMS = 4;

export const guestCompareService = {
    getCompareList: (): GuestCompareItem[] => {
        try {
            const data = localStorage.getItem(GUEST_COMPARE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading guest compare list:', error);
            return [];
        }
    },

    addToCompare: (product: Product): { success: boolean; message?: string; list: GuestCompareItem[] } => {
        try {
            const compareList = guestCompareService.getCompareList();

            if (compareList.length >= MAX_COMPARE_ITEMS) {
                return {
                    success: false,
                    message: `Maximum ${MAX_COMPARE_ITEMS} items allowed`,
                    list: compareList
                };
            }

            const exists = compareList.some(item => item.productId === product._id);
            if (exists) {
                return {
                    success: false,
                    message: 'Product already in compare list',
                    list: compareList
                };
            }

            compareList.push({
                productId: product._id,
                product,
                addedAt: new Date().toISOString()
            });
            localStorage.setItem(GUEST_COMPARE_KEY, JSON.stringify(compareList));
            window.dispatchEvent(new CustomEvent('guestCompareUpdated', { detail: { compareList } }));
            return { success: true, list: compareList };
        } catch (error) {
            console.error('Error adding to guest compare list:', error);
            return { success: false, message: 'Error adding to compare', list: guestCompareService.getCompareList() };
        }
    },

    removeFromCompare: (productId: string): GuestCompareItem[] => {
        try {
            let compareList = guestCompareService.getCompareList();
            compareList = compareList.filter(item => item.productId !== productId);
            localStorage.setItem(GUEST_COMPARE_KEY, JSON.stringify(compareList));
            window.dispatchEvent(new CustomEvent('guestCompareUpdated', { detail: { compareList } }));
            return compareList;
        } catch (error) {
            console.error('Error removing from guest compare list:', error);
            return guestCompareService.getCompareList();
        }
    },

    isInCompare: (productId: string): boolean => {
        return guestCompareService.getCompareList().some(item => item.productId === productId);
    },

    clearCompare: (): void => {
        try {
            localStorage.removeItem(GUEST_COMPARE_KEY);
            window.dispatchEvent(new CustomEvent('guestCompareUpdated', { detail: { compareList: [] } }));
        } catch (error) {
            console.error('Error clearing guest compare list:', error);
        }
    },

    getCount: (): number => {
        return guestCompareService.getCompareList().length;
    }
};

// ============================================
// SYNC SERVICE - Sync guest data to server on login
// ============================================

export const guestSyncService = {
    /**
     * Sync guest cart to server after login
     * @param apiAddToCart Function to add items to server cart
     */
    syncCartToServer: async (
        apiAddToCart: (productId: string, quantity: number, size?: string, color?: string) => Promise<void>
    ): Promise<{ synced: number; failed: number }> => {
        const guestCart = guestCartService.getCart();
        let synced = 0;
        let failed = 0;

        for (const item of guestCart) {
            try {
                await apiAddToCart(item.productId, item.quantity, item.selectedSize, item.selectedColor);
                synced++;
            } catch (error) {
                console.error('Error syncing cart item:', error);
                failed++;
            }
        }

        // Clear guest cart after sync
        if (synced > 0) {
            guestCartService.clearCart();
        }

        return { synced, failed };
    },

    /**
     * Sync guest wishlist to server after login
     * @param apiAddToWishlist Function to add items to server wishlist
     */
    syncWishlistToServer: async (
        apiAddToWishlist: (productId: string) => Promise<void>
    ): Promise<{ synced: number; failed: number }> => {
        const guestWishlist = guestWishlistService.getWishlist();
        let synced = 0;
        let failed = 0;

        for (const item of guestWishlist) {
            try {
                await apiAddToWishlist(item.productId);
                synced++;
            } catch (error) {
                console.error('Error syncing wishlist item:', error);
                failed++;
            }
        }

        // Clear guest wishlist after sync
        if (synced > 0) {
            guestWishlistService.clearWishlist();
        }

        return { synced, failed };
    },

    /**
     * Check if there's any guest data to sync
     */
    hasDataToSync: (): boolean => {
        return guestCartService.getItemCount() > 0 || guestWishlistService.getCount() > 0;
    },

    /**
     * Get summary of guest data
     */
    getGuestDataSummary: (): { cartItems: number; wishlistItems: number; compareItems: number } => {
        return {
            cartItems: guestCartService.getItemCount(),
            wishlistItems: guestWishlistService.getCount(),
            compareItems: guestCompareService.getCount()
        };
    }
};

export default {
    cart: guestCartService,
    wishlist: guestWishlistService,
    compare: guestCompareService,
    sync: guestSyncService
};
