import { useLanguage } from '@/contexts/LanguageContext';
import { Product, Category } from '@/lib/api';

/**
 * Custom hook for getting product/category names in current language
 * Simplifies the common pattern of checking language and returning appropriate name
 * 
 * @example
 * ```tsx
 * const getProductName = useProductName();
 * const name = getProductName(product);
 * ```
 */
export function useProductName() {
  const { language } = useLanguage();

  return {
    getProductName: (product: Product): string => {
      switch (language) {
        case 'vi':
          return product.name;
        case 'ja':
          return product.nameJa || product.name;
        case 'en':
        default:
          return product.nameEn || product.name;
      }
    },
    getCategoryName: (category: Category): string => {
      switch (language) {
        case 'vi':
          return category.name;
        case 'ja':
          return category.nameJa || category.name;
        case 'en':
        default:
          return category.nameEn || category.name;
      }
    },
    getProductDescription: (product: Product): string => {
      switch (language) {
        case 'vi':
          return product.description || '';
        case 'ja':
          return product.descriptionJa || product.description || '';
        case 'en':
        default:
          return product.descriptionEn || product.description || '';
      }
    },
    getCategoryDescription: (category: Category): string => {
      switch (language) {
        case 'vi':
          return category.description || '';
        case 'ja':
          return category.descriptionJa || category.description || '';
        case 'en':
        default:
          return category.descriptionEn || category.description || '';
      }
    }
  };
}

