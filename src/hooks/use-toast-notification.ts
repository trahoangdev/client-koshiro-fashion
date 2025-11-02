import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslationFn } from './use-translation';

type ToastVariant = 'default' | 'destructive';

interface ToastMessages {
  title: {
    vi: string;
    ja: string;
    en: string;
  };
  description?: {
    vi: string;
    ja: string;
    en: string;
  };
}

/**
 * Custom hook for showing toast notifications with translations
 * Simplifies showing toast messages in multiple languages
 * 
 * @example
 * ```tsx
 * const showToast = useToastNotification();
 * 
 * showToast({
 *   title: {
 *     vi: 'Thành công',
 *     ja: '成功',
 *     en: 'Success'
 *   },
 *   description: {
 *     vi: 'Đã thêm sản phẩm vào giỏ hàng',
 *     ja: '商品をカートに追加しました',
 *     en: 'Product added to cart'
 *   },
 *   variant: 'success'
 * });
 * ```
 */
export function useToastNotification() {
  const { toast } = useToast();
  const t = useTranslationFn();

  return (messages: ToastMessages, variant: ToastVariant = 'default') => {
    toast({
      title: t(messages.title),
      description: messages.description ? t(messages.description) : undefined,
      variant,
    });
  };
}

/**
 * Hook that returns error toast helper
 * 
 * @example
 * ```tsx
 * const showError = useErrorToast();
 * showError('Lỗi tải dữ liệu', 'Không thể tải sản phẩm');
 * ```
 */
export function useErrorToast() {
  const showToast = useToastNotification();
  
  return (title: { vi: string; ja: string; en: string }, description?: { vi: string; ja: string; en: string }) => {
    showToast({
      title,
      description,
    }, 'destructive');
  };
}

/**
 * Hook that returns success toast helper
 * 
 * @example
 * ```tsx
 * const showSuccess = useSuccessToast();
 * showSuccess('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
 * ```
 */
export function useSuccessToast() {
  const showToast = useToastNotification();
  
  return (title: { vi: string; ja: string; en: string }, description?: { vi: string; ja: string; en: string }) => {
    showToast({
      title,
      description,
    }, 'default');
  };
}

