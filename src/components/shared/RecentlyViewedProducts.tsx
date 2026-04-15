import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/lib/api';
import { recentlyViewedService } from '@/lib/recentlyViewedService';
import CloudinaryImage from '@/components/shared/CloudinaryImage';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentlyViewedProductsProps {
  maxItems?: number;
  showHeader?: boolean;
  showClearButton?: boolean;
  className?: string;
  onProductClick?: (product: Product) => void;
}

const RecentlyViewedProducts: React.FC<RecentlyViewedProductsProps> = ({
  maxItems = 8,
  showHeader = true,
  showClearButton = true,
  className = '',
  onProductClick,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load recently viewed products
    const loadRecentlyViewed = () => {
      try {
        setIsLoading(true);
        const recentlyViewed = recentlyViewedService.getRecentlyViewedLimited(maxItems);
        setProducts(recentlyViewed);
      } catch (error) {
        console.error('Error loading recently viewed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentlyViewed();

    // Listen for storage changes (in case another tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'koshiro_recently_viewed') {
        loadRecentlyViewed();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also reload periodically to catch updates from same tab
    const interval = setInterval(loadRecentlyViewed, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [maxItems]);

  const handleProductClick = (product: Product) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      navigate(`/product/${product.slug || product._id}`);
    }
  };

  const handleClearAll = () => {
    recentlyViewedService.clearAll();
    setProducts([]);
  };

  const getProductName = (product: Product) => {
    switch (language) {
      case 'vi': return product.name;
      case 'ja': return product.nameJa || product.name;
      default: return product.nameEn || product.name;
    }
  };

  const translations = {
    en: {
      title: 'Recently Viewed',
      subtitle: 'Products you recently browsed',
      empty: 'No recently viewed products',
      emptyDesc: 'Start browsing to see your recently viewed items here',
      clear: 'Clear All',
    },
    vi: {
      title: 'Sản Phẩm Đã Xem',
      subtitle: 'Các sản phẩm bạn đã xem gần đây',
      empty: 'Chưa có sản phẩm đã xem',
      emptyDesc: 'Bắt đầu duyệt để xem các sản phẩm đã xem ở đây',
      clear: 'Xóa Tất Cả',
    },
    ja: {
      title: '最近閲覧した商品',
      subtitle: '最近閲覧した商品',
      empty: '最近閲覧した商品はありません',
      emptyDesc: '閲覧を開始すると、最近閲覧した商品がここに表示されます',
      clear: 'すべてクリア',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            {showClearButton && <Skeleton className="h-8 w-24" />}
          </div>
        )}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="min-w-[200px] flex-shrink-0">
              <CardContent className="p-4">
                <Skeleton className="aspect-square w-full rounded-lg mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showHeader && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
            </div>
          </div>
        )}
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold mb-2">{t.empty}</h3>
            <p className="text-sm text-muted-foreground">{t.emptyDesc}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
          </div>
          {showClearButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              {t.clear}
            </Button>
          )}
        </div>
      )}

      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {products.map((product, index) => (
            <Card
              key={product._id}
              className="min-w-[200px] max-w-[200px] flex-shrink-0 cursor-pointer group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              onClick={() => handleProductClick(product)}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <CardContent className="p-4">
                {/* Product Image */}
                <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-muted">
                  {product.cloudinaryImages && product.cloudinaryImages.length > 0 ? (
                    <CloudinaryImage
                      publicId={product.cloudinaryImages[0].publicId}
                      secureUrl={product.cloudinaryImages[0].secureUrl}
                      responsiveUrls={product.cloudinaryImages[0].responsiveUrls}
                      alt={getProductName(product)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      size="medium"
                    />
                  ) : (
                    <img
                      src={product.images?.[0] || '/placeholder.svg'}
                      alt={getProductName(product)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isNew && (
                      <Badge variant="default" className="text-xs">New</Badge>
                    )}
                    {product.onSale && product.salePrice && (
                      <Badge variant="destructive" className="text-xs">
                        -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-1">
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {getProductName(product)}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {formatCurrency(
                        product.salePrice && product.salePrice < product.price
                          ? product.salePrice
                          : product.price,
                        language
                      )}
                    </span>
                    {product.salePrice && product.salePrice < product.price && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatCurrency(product.price, language)}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RecentlyViewedProducts;

