import { useLanguage } from '@/contexts/LanguageContext';

type TranslationMap = {
  vi: string;
  ja: string;
  en: string;
};

/**
 * Custom hook for handling translations
 * Simplifies the common pattern: language === 'vi' ? ... : language === 'ja' ? ... : ...
 * 
 * @example
 * ```tsx
 * const t = useTranslation({
 *   vi: 'Xin chào',
 *   ja: 'こんにちは',
 *   en: 'Hello'
 * });
 * // Returns the appropriate translation based on current language
 * ```
 */
export function useTranslation(translations: TranslationMap): string {
  const { language } = useLanguage();
  
  switch (language) {
    case 'vi':
      return translations.vi;
    case 'ja':
      return translations.ja;
    case 'en':
    default:
      return translations.en;
  }
}

/**
 * Hook that returns a translation function
 * 
 * @example
 * ```tsx
 * const t = useTranslationFn();
 * const message = t({
 *   vi: 'Thêm vào giỏ hàng',
 *   ja: 'カートに追加',
 *   en: 'Add to Cart'
 * });
 * ```
 */
export function useTranslationFn() {
  const { language } = useLanguage();
  
  return (translations: TranslationMap): string => {
    switch (language) {
      case 'vi':
        return translations.vi;
      case 'ja':
        return translations.ja;
      case 'en':
      default:
        return translations.en;
    }
  };
}

