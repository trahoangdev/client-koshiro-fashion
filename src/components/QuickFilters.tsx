import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Flame, 
  Star, 
  Tag, 
  CheckCircle2,
  X,
  Zap
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export interface QuickFilter {
  id: string;
  label: string;
  labelEn: string;
  labelJa: string;
  icon?: React.ReactNode;
  count?: number;
}

interface QuickFiltersProps {
  selectedFilters: string[];
  onFilterToggle: (filterId: string) => void;
  onClearAll?: () => void;
  showCounts?: boolean;
  filters?: QuickFilter[];
  className?: string;
}

const defaultFilters: QuickFilter[] = [
  {
    id: 'onSale',
    label: 'Đang Sale',
    labelEn: 'On Sale',
    labelJa: 'セール中',
    icon: <Tag className="h-3 w-3" />,
  },
  {
    id: 'isNew',
    label: 'Mới',
    labelEn: 'New',
    labelJa: '新着',
    icon: <Sparkles className="h-3 w-3" />,
  },
  {
    id: 'isBestSeller',
    label: 'Bán Chạy',
    labelEn: 'Best Seller',
    labelJa: 'ベストセラー',
    icon: <Flame className="h-3 w-3" />,
  },
  {
    id: 'isFeatured',
    label: 'Nổi Bật',
    labelEn: 'Featured',
    labelJa: 'おすすめ',
    icon: <Star className="h-3 w-3" />,
  },
  {
    id: 'inStock',
    label: 'Còn Hàng',
    labelEn: 'In Stock',
    labelJa: '在庫あり',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  {
    id: 'isLimitedEdition',
    label: 'Giới Hạn',
    labelEn: 'Limited',
    labelJa: '限定',
    icon: <Zap className="h-3 w-3" />,
  },
];

const QuickFilters: React.FC<QuickFiltersProps> = ({
  selectedFilters = [],
  onFilterToggle,
  onClearAll,
  showCounts = false,
  filters = defaultFilters,
  className = '',
}) => {
  const { language } = useLanguage();

  const getLabel = (filter: QuickFilter) => {
    switch (language) {
      case 'vi': return filter.label;
      case 'ja': return filter.labelJa;
      default: return filter.labelEn;
    }
  };

  const translations = {
    en: {
      quickFilters: 'Quick Filters',
      clearAll: 'Clear All',
    },
    vi: {
      quickFilters: 'Lọc Nhanh',
      clearAll: 'Xóa Tất Cả',
    },
    ja: {
      quickFilters: 'クイックフィルター',
      clearAll: 'すべてクリア',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const hasActiveFilters = selectedFilters.length > 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t.quickFilters}
        </h3>
        {hasActiveFilters && onClearAll && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={onClearAll}
          >
            <X className="h-3 w-3 mr-1" />
            {t.clearAll}
          </Button>
        )}
      </div>

      {/* Filter Badges */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isSelected = selectedFilters.includes(filter.id);
          
          return (
            <Badge
              key={filter.id}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-all duration-200 px-3 py-1.5 text-xs font-medium',
                isSelected 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm' 
                  : 'hover:bg-accent hover:border-primary/50'
              )}
              onClick={() => onFilterToggle(filter.id)}
            >
              <div className="flex items-center gap-1.5">
                {filter.icon}
                <span>{getLabel(filter)}</span>
                {showCounts && filter.count !== undefined && (
                  <span className="ml-1 opacity-75">
                    ({filter.count})
                  </span>
                )}
              </div>
            </Badge>
          );
        })}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <span>
            {selectedFilters.length} {language === 'vi' ? 'bộ lọc đang chọn' : language === 'ja' ? 'フィルター選択中' : 'filters active'}
          </span>
        </div>
      )}
    </div>
  );
};

export default QuickFilters;

