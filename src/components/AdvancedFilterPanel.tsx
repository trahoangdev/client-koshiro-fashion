import React, { useState, useEffect, useMemo } from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Product } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export interface AdvancedFilters {
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  onSale: boolean;
  minRating: number;
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isLimitedEdition: boolean;
}

interface AdvancedFilterPanelProps {
  products: Product[];
  filters: AdvancedFilters;
  availableSizes?: string[];
  availableColors?: string[];
  priceRange?: [number, number];
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  products,
  filters,
  availableSizes = [],
  availableColors = [],
  priceRange: maxPriceRange,
  onFiltersChange,
  onClearFilters,
  className
}) => {
  const { language } = useLanguage();
  
  // Calculate available filter options from products
  const filterOptions = useMemo(() => {
    const sizes = new Set<string>();
    const colors = new Set<string>();
    const prices = products.map(p => p.salePrice || p.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 1000000;

    products.forEach(product => {
      product.sizes?.forEach(size => sizes.add(size));
      product.colors?.forEach(color => colors.add(color));
    });

    return {
      sizes: Array.from(sizes).sort(),
      colors: Array.from(colors).sort(),
      priceRange: [minPrice, maxPrice] as [number, number]
    };
  }, [products]);

  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(
    filters.priceRange || filterOptions.priceRange
  );

  // Update local price range when filters change
  useEffect(() => {
    if (filters.priceRange) {
      setLocalPriceRange(filters.priceRange);
    }
  }, [filters.priceRange]);

  // Determine actual price range to use
  const actualPriceRange = maxPriceRange || filterOptions.priceRange;
  const actualSizes = availableSizes.length > 0 ? availableSizes : filterOptions.sizes;
  const actualColors = availableColors.length > 0 ? availableColors : filterOptions.colors;

  // Calculate product counts for each filter option
  const getFilterCounts = () => {
    const counts = {
      sizes: {} as Record<string, number>,
      colors: {} as Record<string, number>,
      onSale: 0,
      inStock: 0,
      isNew: 0,
      isFeatured: 0,
      isBestSeller: 0,
      isLimitedEdition: 0
    };

    products.forEach(product => {
      product.sizes?.forEach(size => {
        counts.sizes[size] = (counts.sizes[size] || 0) + 1;
      });
      product.colors?.forEach(color => {
        counts.colors[color] = (counts.colors[color] || 0) + 1;
      });
      if (product.onSale || (product.salePrice && product.salePrice < product.price)) {
        counts.onSale++;
      }
      if (product.stock > 0) {
        counts.inStock++;
      }
      if (product.isNew) {
        counts.isNew++;
      }
      if (product.isFeatured) {
        counts.isFeatured++;
      }
      if (product.isBestSeller) {
        counts.isBestSeller++;
      }
      if (product.isLimitedEdition) {
        counts.isLimitedEdition++;
      }
    });

    return counts;
  };

  const filterCounts = getFilterCounts();

  const translations = {
    en: {
      filters: 'Filters',
      priceRange: 'Price Range',
      size: 'Size',
      color: 'Color',
      stock: 'Stock Status',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      other: 'Other Filters',
      onSale: 'On Sale',
      new: 'New Arrivals',
      featured: 'Featured',
      bestSeller: 'Best Seller',
      limitedEdition: 'Limited Edition',
      rating: 'Minimum Rating',
      clearAll: 'Clear All',
      apply: 'Apply Filters',
      products: 'products'
    },
    vi: {
      filters: 'Bộ Lọc',
      priceRange: 'Khoảng Giá',
      size: 'Kích Thước',
      color: 'Màu Sắc',
      stock: 'Tình Trạng Kho',
      inStock: 'Còn Hàng',
      outOfStock: 'Hết Hàng',
      other: 'Bộ Lọc Khác',
      onSale: 'Đang Giảm Giá',
      new: 'Hàng Mới',
      featured: 'Nổi Bật',
      bestSeller: 'Bán Chạy',
      limitedEdition: 'Phiên Bản Giới Hạn',
      rating: 'Đánh Giá Tối Thiểu',
      clearAll: 'Xóa Tất Cả',
      apply: 'Áp Dụng',
      products: 'sản phẩm'
    },
    ja: {
      filters: 'フィルター',
      priceRange: '価格帯',
      size: 'サイズ',
      color: '色',
      stock: '在庫状況',
      inStock: '在庫あり',
      outOfStock: '在庫切れ',
      other: 'その他のフィルター',
      onSale: 'セール中',
      new: '新着',
      featured: 'おすすめ',
      bestSeller: 'ベストセラー',
      limitedEdition: '限定版',
      rating: '最小評価',
      clearAll: 'すべてクリア',
      apply: '適用',
      products: '商品'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handlePriceRangeChange = (range: number[]) => {
    setLocalPriceRange([range[0], range[1]]);
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter(s => s !== size)
      : [...filters.sizes, size];
    onFiltersChange({ ...filters, sizes: newSizes });
  };

  const handleColorToggle = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    onFiltersChange({ ...filters, colors: newColors });
  };

  const handleApplyPriceRange = () => {
    onFiltersChange({ ...filters, priceRange: localPriceRange });
  };

  const hasActiveFilters = 
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.inStock ||
    filters.onSale ||
    filters.minRating > 0 ||
    filters.isNew ||
    filters.isFeatured ||
    filters.isBestSeller ||
    filters.isLimitedEdition ||
    (filters.priceRange && (
      filters.priceRange[0] !== actualPriceRange[0] ||
      filters.priceRange[1] !== actualPriceRange[1]
    ));

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            {t.filters}
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              {t.clearAll}
            </Button>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        <ScrollArea className="h-[calc(100vh-300px)] pr-4">
          <div className="space-y-6">
            {/* Price Range */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">{t.priceRange}</Label>
              <div className="space-y-4">
                <Slider
                  min={actualPriceRange[0]}
                  max={actualPriceRange[1]}
                  step={10000}
                  value={[localPriceRange[0], localPriceRange[1]]}
                  onValueChange={handlePriceRangeChange}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {formatCurrency(localPriceRange[0], language)}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(localPriceRange[1], language)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApplyPriceRange}
                  className="w-full"
                >
                  {t.apply}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Size Filter */}
            {actualSizes.length > 0 && (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">{t.size}</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {actualSizes.map((size) => (
                      <div key={size} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`size-${size}`}
                            checked={filters.sizes.includes(size)}
                            onCheckedChange={() => handleSizeToggle(size)}
                          />
                          <Label
                            htmlFor={`size-${size}`}
                            className="text-sm cursor-pointer font-normal"
                          >
                            {size}
                          </Label>
                        </div>
                        {filterCounts.sizes[size] !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            {filterCounts.sizes[size]}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Color Filter */}
            {actualColors.length > 0 && (
              <>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">{t.color}</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {actualColors.map((color) => (
                      <div key={color} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`color-${color}`}
                            checked={filters.colors.includes(color)}
                            onCheckedChange={() => handleColorToggle(color)}
                          />
                          <Label
                            htmlFor={`color-${color}`}
                            className="text-sm cursor-pointer font-normal"
                          >
                            {color}
                          </Label>
                        </div>
                        {filterCounts.colors[color] !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            {filterCounts.colors[color]}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Stock Status */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">{t.stock}</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={filters.inStock}
                      onCheckedChange={(checked) =>
                        onFiltersChange({ ...filters, inStock: checked as boolean })
                      }
                    />
                    <Label htmlFor="inStock" className="text-sm cursor-pointer font-normal">
                      {t.inStock}
                    </Label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filterCounts.inStock}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Other Filters */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">{t.other}</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onSale"
                      checked={filters.onSale}
                      onCheckedChange={(checked) =>
                        onFiltersChange({ ...filters, onSale: checked as boolean })
                      }
                    />
                    <Label htmlFor="onSale" className="text-sm cursor-pointer font-normal">
                      {t.onSale}
                    </Label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filterCounts.onSale}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isNew"
                      checked={filters.isNew}
                      onCheckedChange={(checked) =>
                        onFiltersChange({ ...filters, isNew: checked as boolean })
                      }
                    />
                    <Label htmlFor="isNew" className="text-sm cursor-pointer font-normal">
                      {t.new}
                    </Label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filterCounts.isNew}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFeatured"
                      checked={filters.isFeatured}
                      onCheckedChange={(checked) =>
                        onFiltersChange({ ...filters, isFeatured: checked as boolean })
                      }
                    />
                    <Label htmlFor="isFeatured" className="text-sm cursor-pointer font-normal">
                      {t.featured}
                    </Label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filterCounts.isFeatured}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBestSeller"
                      checked={filters.isBestSeller}
                      onCheckedChange={(checked) =>
                        onFiltersChange({ ...filters, isBestSeller: checked as boolean })
                      }
                    />
                    <Label htmlFor="isBestSeller" className="text-sm cursor-pointer font-normal">
                      {t.bestSeller}
                    </Label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filterCounts.isBestSeller}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isLimitedEdition"
                      checked={filters.isLimitedEdition}
                      onCheckedChange={(checked) =>
                        onFiltersChange({ ...filters, isLimitedEdition: checked as boolean })
                      }
                    />
                    <Label htmlFor="isLimitedEdition" className="text-sm cursor-pointer font-normal">
                      {t.limitedEdition}
                    </Label>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {filterCounts.isLimitedEdition}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdvancedFilterPanel;

