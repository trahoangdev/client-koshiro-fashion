import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth, useLanguage } from '@/contexts';
import { useErrorToast, useSuccessToast } from './use-toast-notification';
import { logger } from '@/lib/logger';
import { Product } from '@/lib/api';
import { CART_QUERY_KEY } from './useCart';

interface CartOperations {
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
}

/**
 * Custom hook for cart operations with consistent error handling and notifications
 * 
 * @example
 * ```tsx
 * const { addToCart, removeFromCart, updateQuantity } = useCartOperations();
 * 
 * await addToCart(product, 1, 'M', 'Red');
 * await removeFromCart(productId);
 * await updateQuantity(productId, 2);
 * ```
 */
export function useCartOperations(): CartOperations {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const showError = useErrorToast();
  const showSuccess = useSuccessToast();
  const queryClient = useQueryClient();

  const addToCart = useCallback(async (
    product: Product,
    quantity: number = 1,
    size?: string,
    color?: string
  ) => {
    if (!isAuthenticated) {
      showError(
        t('login'),
        t('pleaseLoginToAddToCart')
      );
      return;
    }

    try {
      // API currently only supports productId and quantity
      // Size and color will be handled in future API updates
      await api.addToCart(product._id, quantity || 1);

      // Invalidate cart query to trigger refresh
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

      showSuccess(
        t('success'),
        t('addedToCart')
      );
    } catch (error) {
      logger.error('Error adding to cart', error);
      showError(
        t('error'),
        t('unableToAddToCart')
      );
      throw error;
    }
  }, [isAuthenticated, showError, showSuccess, t, queryClient]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      showError(
        t('login'),
        t('pleaseLogin')
      );
      return;
    }

    try {
      await api.removeFromCart(productId);

      // Invalidate cart query to trigger refresh
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

      showSuccess(
        t('success'),
        t('removedFromCart')
      );
    } catch (error) {
      logger.error('Error removing from cart', error);
      showError(
        t('error'),
        t('unableToRemoveFromCart')
      );
      throw error;
    }
  }, [isAuthenticated, showError, showSuccess, t, queryClient]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!isAuthenticated) {
      showError(
        t('login'),
        t('pleaseLogin')
      );
      return;
    }

    if (quantity < 1) {
      showError(
        t('error'),
        t('quantityMustBeGreaterThanZero')
      );
      return;
    }

    try {
      await api.updateCartItem(productId, quantity);

      // Invalidate cart query to trigger refresh
      await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });

      showSuccess(
        t('success'),
        t('quantityUpdated')
      );
    } catch (error) {
      logger.error('Error updating cart quantity', error);
      showError(
        t('error'),
        t('unableToUpdateQuantity')
      );
      throw error;
    }
  }, [isAuthenticated, showError, showSuccess, t, queryClient]);

  return {
    addToCart,
    removeFromCart,
    updateQuantity,
  };
}

