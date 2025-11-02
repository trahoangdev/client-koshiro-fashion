import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts';
import { useErrorToast, useSuccessToast } from './use-toast-notification';
import { logger } from '@/lib/logger';
import { Product } from '@/lib/api';

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
  const showError = useErrorToast();
  const showSuccess = useSuccessToast();

  const addToCart = useCallback(async (
    product: Product,
    quantity: number = 1,
    size?: string,
    color?: string
  ) => {
    if (!isAuthenticated) {
      showError(
        { vi: 'Yêu cầu đăng nhập', ja: 'ログインが必要です', en: 'Login Required' },
        { vi: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', ja: 'カートに商品を追加するにはログインしてください', en: 'Please login to add products to cart' }
      );
      return;
    }

    try {
      // API currently only supports productId and quantity
      // Size and color will be handled in future API updates
      await api.addToCart(product._id, quantity || 1);

      // Dispatch cart updated event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }, 100);

      showSuccess(
        { vi: 'Thành công', ja: '成功', en: 'Success' },
        { vi: 'Đã thêm sản phẩm vào giỏ hàng', ja: '商品をカートに追加しました', en: 'Product added to cart' }
      );
    } catch (error) {
      logger.error('Error adding to cart', error);
      showError(
        { vi: 'Lỗi', ja: 'エラー', en: 'Error' },
        { vi: 'Không thể thêm sản phẩm vào giỏ hàng', ja: '商品をカートに追加できません', en: 'Unable to add product to cart' }
      );
      throw error;
    }
  }, [isAuthenticated, showError, showSuccess]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      showError(
        { vi: 'Yêu cầu đăng nhập', ja: 'ログインが必要です', en: 'Login Required' },
        { vi: 'Vui lòng đăng nhập', ja: 'ログインしてください', en: 'Please login' }
      );
      return;
    }

    try {
      await api.removeFromCart(productId);

      // Dispatch cart updated event
      setTimeout(() => {
        logger.debug('Dispatching cartUpdated event (remove item)...');
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }, 100);

      showSuccess(
        { vi: 'Thành công', ja: '成功', en: 'Success' },
        { vi: 'Đã xóa sản phẩm khỏi giỏ hàng', ja: 'カートから商品を削除しました', en: 'Product removed from cart' }
      );
    } catch (error) {
      logger.error('Error removing from cart', error);
      showError(
        { vi: 'Lỗi', ja: 'エラー', en: 'Error' },
        { vi: 'Không thể xóa sản phẩm khỏi giỏ hàng', ja: 'カートから商品を削除できません', en: 'Unable to remove product from cart' }
      );
      throw error;
    }
  }, [isAuthenticated, showError, showSuccess]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (!isAuthenticated) {
      showError(
        { vi: 'Yêu cầu đăng nhập', ja: 'ログインが必要です', en: 'Login Required' },
        { vi: 'Vui lòng đăng nhập', ja: 'ログインしてください', en: 'Please login' }
      );
      return;
    }

    if (quantity < 1) {
      showError(
        { vi: 'Lỗi', ja: 'エラー', en: 'Error' },
        { vi: 'Số lượng phải lớn hơn 0', ja: '数量は0より大きくなければなりません', en: 'Quantity must be greater than 0' }
      );
      return;
    }

    try {
      await api.updateCartItem(productId, { quantity });

      // Dispatch cart updated event
      setTimeout(() => {
        logger.debug('Dispatching cartUpdated event (update quantity)...');
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }, 100);

      showSuccess(
        { vi: 'Thành công', ja: '成功', en: 'Success' },
        { vi: 'Đã cập nhật số lượng', ja: '数量を更新しました', en: 'Quantity updated' }
      );
    } catch (error) {
      logger.error('Error updating cart quantity', error);
      showError(
        { vi: 'Lỗi', ja: 'エラー', en: 'Error' },
        { vi: 'Không thể cập nhật số lượng', ja: '数量を更新できません', en: 'Unable to update quantity' }
      );
      throw error;
    }
  }, [isAuthenticated, showError, showSuccess]);

  return {
    addToCart,
    removeFromCart,
    updateQuantity,
  };
}

