import { useState, useEffect } from "react";
import { 
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Tag,
  User,
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface SavedFilter {
  searchQuery: string;
  selectedFilters: Record<string, string[]>;
  dateRange: DateRange;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface SearchFilterConfig {
  searchFields: string[];
  filters: {
    [key: string]: FilterOption[];
  };
  dateRanges: {
    [key: string]: string;
  };
  sortOptions: FilterOption[];
}

interface AdminSearchFilterProps {
  config: SearchFilterConfig;
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, string[]>) => void;
  onDateRange: (dateRange: DateRange) => void;
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onClear: () => void;
  onSaveFilter: (name: string, filters: SavedFilter) => void;
  onLoadFilter: (name: string) => void;
  savedFilters?: Array<{ name: string; filters: SavedFilter }>;
  isLoading?: boolean;
  totalResults?: number;
  activeFilters?: Record<string, string[]>;
  currentSort?: { field: string; order: 'asc' | 'desc' };
  currentDateRange?: DateRange;
}

export default function AdminSearchFilter({
  config,
  onSearch,
  onFilter,
  onDateRange,
  onSort,
  onClear,
  onSaveFilter,
  onLoadFilter,
  savedFilters = [],
  isLoading = false,
  totalResults = 0,
  activeFilters = {},
  currentSort,
  currentDateRange
}: AdminSearchFilterProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(activeFilters);
  const [dateRange, setDateRange] = useState<DateRange>(currentDateRange || { from: undefined, to: undefined });
  const [sortBy, setSortBy] = useState(currentSort?.field || "");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(currentSort?.order || 'desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [filterName, setFilterName] = useState("");

  const translations = {
    en: {
      search: 'Search',
      searchPlaceholder: 'Search...',
      filters: 'Filters',
      clear: 'Clear',
      apply: 'Apply',
      sortBy: 'Sort by',
      dateRange: 'Date Range',
      from: 'From',
      to: 'To',
      selectDate: 'Select date',
      advanced: 'Advanced',
      saveFilter: 'Save Filter',
      loadFilter: 'Load Filter',
      filterName: 'Filter Name',
      save: 'Save',
      cancel: 'Cancel',
      noFilters: 'No saved filters',
      results: 'results',
      activeFilters: 'Active Filters',
      removeFilter: 'Remove filter',
      all: 'All',
      ascending: 'Ascending',
      descending: 'Descending',
      today: 'Today',
      yesterday: 'Yesterday',
      last7Days: 'Last 7 days',
      last30Days: 'Last 30 days',
      thisMonth: 'This month',
      lastMonth: 'Last month',
      custom: 'Custom range',
      error: 'Error',
      success: 'Success'
    },
    vi: {
      search: 'Tìm kiếm',
      searchPlaceholder: 'Tìm kiếm...',
      filters: 'Bộ lọc',
      clear: 'Xóa',
      apply: 'Áp dụng',
      sortBy: 'Sắp xếp theo',
      dateRange: 'Khoảng thời gian',
      from: 'Từ',
      to: 'Đến',
      selectDate: 'Chọn ngày',
      advanced: 'Nâng cao',
      saveFilter: 'Lưu bộ lọc',
      loadFilter: 'Tải bộ lọc',
      filterName: 'Tên bộ lọc',
      save: 'Lưu',
      cancel: 'Hủy',
      noFilters: 'Không có bộ lọc đã lưu',
      results: 'kết quả',
      activeFilters: 'Bộ lọc đang hoạt động',
      removeFilter: 'Xóa bộ lọc',
      all: 'Tất cả',
      ascending: 'Tăng dần',
      descending: 'Giảm dần',
      today: 'Hôm nay',
      yesterday: 'Hôm qua',
      last7Days: '7 ngày qua',
      last30Days: '30 ngày qua',
      thisMonth: 'Tháng này',
      lastMonth: 'Tháng trước',
      custom: 'Tùy chỉnh',
      error: 'Lỗi',
      success: 'Thành công'
    },
    ja: {
      search: '検索',
      searchPlaceholder: '検索...',
      filters: 'フィルター',
      clear: 'クリア',
      apply: '適用',
      sortBy: '並び替え',
      dateRange: '日付範囲',
      from: '開始',
      to: '終了',
      selectDate: '日付を選択',
      advanced: '詳細',
      saveFilter: 'フィルターを保存',
      loadFilter: 'フィルターを読み込み',
      filterName: 'フィルター名',
      save: '保存',
      cancel: 'キャンセル',
      noFilters: '保存されたフィルターがありません',
      results: '件の結果',
      activeFilters: 'アクティブなフィルター',
      removeFilter: 'フィルターを削除',
      all: 'すべて',
      ascending: '昇順',
      descending: '降順',
      today: '今日',
      yesterday: '昨日',
      last7Days: '過去7日間',
      last30Days: '過去30日間',
      thisMonth: '今月',
      lastMonth: '先月',
      custom: 'カスタム範囲',
      error: 'エラー',
      success: '成功'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    setSelectedFilters(activeFilters);
  }, [activeFilters]);

  useEffect(() => {
    setDateRange(currentDateRange || { from: undefined, to: undefined });
  }, [currentDateRange]);

  useEffect(() => {
    setSortBy(currentSort?.field || "");
    setSortOrder(currentSort?.order || 'desc');
  }, [currentSort]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (filterKey: string, value: string, checked: boolean) => {
    const currentValues = selectedFilters[filterKey] || [];
    let newValues: string[];

    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    const updatedFilters = {
      ...selectedFilters,
      [filterKey]: newValues
    };

    setSelectedFilters(updatedFilters);
  };

  const handleApplyFilters = () => {
    onFilter(selectedFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedFilters({});
    setDateRange({ from: undefined, to: undefined });
    setSortBy("");
    setSortOrder('desc');
    onClear();
  };

  const handleSortChange = (field: string) => {
    const newOrder = field === sortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    onSort(field, newOrder);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    onDateRange(range);
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast({
        title: t.error || 'Error',
        description: 'Please enter a filter name',
        variant: 'destructive',
      });
      return;
    }

    const filterData: SavedFilter = {
      searchQuery,
      selectedFilters,
      dateRange,
      sortBy,
      sortOrder
    };

    onSaveFilter(filterName, filterData);
    setFilterName("");
    toast({
      title: t.success || 'Success',
      description: 'Filter saved successfully',
    });
  };

  const handleLoadFilter = (filterName: string) => {
    onLoadFilter(filterName);
    toast({
      title: t.success || 'Success',
      description: 'Filter loaded successfully',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.values(selectedFilters).forEach(values => {
      count += values.length;
    });
    if (dateRange.from || dateRange.to) count++;
    if (sortBy) count++;
    return count;
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              {t.filters}
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{t.filters}</h4>
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  {t.clear}
                </Button>
              </div>
              
              <Separator />
              
              {/* Filter Options */}
              {Object.entries(config.filters).map(([filterKey, options]) => (
                <div key={filterKey} className="space-y-2">
                  <Label className="text-sm font-medium capitalize">
                    {filterKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Label>
                  <div className="space-y-2">
                    {options.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${filterKey}-${option.value}`}
                          checked={selectedFilters[filterKey]?.includes(option.value) || false}
                          onCheckedChange={(checked) => 
                            handleFilterChange(filterKey, option.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`${filterKey}-${option.value}`} className="text-sm">
                          {option.label}
                          {option.count !== undefined && (
                            <span className="text-muted-foreground ml-1">({option.count})</span>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
                  {t.cancel}
                </Button>
                <Button onClick={handleApplyFilters}>
                  {t.apply}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t.sortBy} />
          </SelectTrigger>
          <SelectContent>
            {config.sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Order Toggle */}
        {sortBy && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSortChange(sortBy)}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        )}

        {/* Advanced Options */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          {isAdvancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {t.advanced}
        </Button>
      </div>

      {/* Advanced Options Panel */}
      {isAdvancedOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t.advanced}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">{t.from}</Label>
                <Input
                  type="date"
                  value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    handleDateRangeChange({ ...dateRange, from: date });
                  }}
                />
              </div>
              <div>
                <Label className="text-sm">{t.to}</Label>
                <Input
                  type="date"
                  value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    handleDateRangeChange({ ...dateRange, to: date });
                  }}
                />
              </div>
            </div>

            {/* Quick Date Presets */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(config.dateRanges).map(([key, label]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Handle quick date range selection
                    const today = new Date();
                    let from: Date | undefined;
                    let to: Date | undefined;

                    switch (key) {
                      case 'today':
                        from = today;
                        to = today;
                        break;
                      case 'yesterday':
                        from = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                        to = from;
                        break;
                      case 'last7Days':
                        from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        to = today;
                        break;
                      case 'last30Days':
                        from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        to = today;
                        break;
                      case 'thisMonth':
                        from = new Date(today.getFullYear(), today.getMonth(), 1);
                        to = today;
                        break;
                      case 'lastMonth':
                        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                        to = new Date(today.getFullYear(), today.getMonth(), 0);
                        break;
                    }

                    handleDateRangeChange({ from, to });
                  }}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Save/Load Filters */}
            <div className="flex items-center gap-2">
              <Input
                placeholder={t.filterName}
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleSaveFilter}>
                <Save className="h-4 w-4 mr-1" />
                {t.save}
              </Button>
            </div>

            {savedFilters.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm">{t.loadFilter}</Label>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map((filter) => (
                    <Button
                      key={filter.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadFilter(filter.name)}
                    >
                      {filter.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalResults} {t.results}
        </span>
        {getActiveFiltersCount() > 0 && (
          <div className="flex items-center gap-2">
            <span>{t.activeFilters}:</span>
            {Object.entries(selectedFilters).map(([key, values]) =>
              values.map((value) => (
                <Badge key={`${key}-${value}`} variant="secondary" className="text-xs">
                  {value}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => handleFilterChange(key, value, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))
            )}
            {(dateRange.from || dateRange.to) && (
              <Badge variant="secondary" className="text-xs">
                {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 