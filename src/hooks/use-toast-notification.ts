import { useToast } from '@/hooks/use-toast';
import { useTranslationFn } from './use-translation';

type ToastVariant = 'default' | 'destructive';

interface TranslationMap {
  vi: string;
  ja: string;
  en: string;
}

type LocalizedMessage = string | TranslationMap;

/**
 * Custom hook for showing toast notifications with translations
 * Simplifies showing toast messages in multiple languages
 * 
 * @example
 * ```tsx
 * const showToast = useToastNotification();
 * 
 * // Using object (legacy)
 * showToast({
 *   title: { vi: 'Thành công', ja: '成功', en: 'Success' },
 *   description: { vi: '...', ja: '...', en: '...' }
 * }, 'success');
 * 
 * // Using string (new)
 * showToast({
 *   title: 'Success',
 *   description: 'Product added'
 * }, 'success');
 * ```
 */
export function useToastNotification() {
  const { toast } = useToast();
  const t = useTranslationFn();

  return (messages: { title: LocalizedMessage; description?: LocalizedMessage }, variant: ToastVariant = 'default') => {
    const title = typeof messages.title === 'string' ? messages.title : t(messages.title);
    const description = messages.description
      ? (typeof messages.description === 'string' ? messages.description : t(messages.description))
      : undefined;

    toast({
      title,
      description,
      variant,
    });
  };
}

/**
 * Hook that returns error toast helper
 */
export function useErrorToast() {
  const showToast = useToastNotification();

  return (title: LocalizedMessage, description?: LocalizedMessage) => {
    showToast({
      title,
      description,
    }, 'destructive');
  };
}

/**
 * Hook that returns success toast helper
 */
export function useSuccessToast() {
  const showToast = useToastNotification();

  return (title: LocalizedMessage, description?: LocalizedMessage) => {
    showToast({
      title,
      description,
    }, 'default');
  };
}

