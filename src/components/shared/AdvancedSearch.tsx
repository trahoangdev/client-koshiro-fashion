import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, ArrowRight, Clock, TrendingUp, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { api, Product, Category } from '@/lib/api';
import { formatCurrency } from '@/lib/currency';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
  inStock: boolean;
  onSale: boolean;
  featured: boolean;
  sortBy: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialQuery?: string;
  showFilters?: boolean;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  initialQuery = '',
  showFilters = true
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<SearchFilters>({
    query: initialQuery,
    category: 'all',
    priceRange: [0, 1000],
    inStock: false,
    onSale: false,
    featured: false,
    sortBy: 'relevance'
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    'Kimono', 'Hakama', 'Yukata', 'Haori', 'Obi', 'Geta'
  ]);

  // Debounce search query
  const debouncedQuery = useDebounce(filters.query, 300);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.getCategories({ isActive: true });
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await api.getProducts({
          search: debouncedQuery,
          limit: 5
        });
        setSuggestions(response.products || []);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Handle query change
  const handleQueryChange = (value: string) => {
    setFilters(prev => ({ ...prev, query: value }));
    setShowSuggestions(true);
  };

  // Handle search submission
  const handleSearch = () => {
    if (filters.query.trim()) {
      // Save to recent searches
      const newRecentSearches = [
        filters.query,
        ...recentSearches.filter(s => s !== filters.query)
      ].slice(0, 10);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    }

    setShowSuggestions(false);
    onSearch(filters);
  };

  // Handle suggestion click
  const handleSuggestionClick = (product: Product) => {
    setShowSuggestions(false);
    navigate(`/product/${product.slug || product._id}`);
  };

  // Handle recent search click
  const handleRecentSearchClick = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
    setShowSuggestions(false);
    onSearch({ ...filters, query });
  };

  // Handle category click
  const handleCategoryClick = (category: Category) => {
    setFilters(prev => ({ ...prev, category: category._id, query: '' }));
    setShowSuggestions(false);
    onSearch({ ...filters, category: category._id, query: '' });
  };

  // Get category name based on language
  const getCategoryName = (category: Category) => {
    switch (language) {
      case 'vi':
        return category.nameEn || category.name;
      case 'ja':
        return category.nameJa || category.name;
      default:
        return category.nameEn || category.name;
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      priceRange: [0, 5000000],
      inStock: false,
      onSale: false,
      featured: false,
      sortBy: 'relevance'
    });
  };

  const hasActiveFilters = (filters.category && filters.category !== 'all') || filters.inStock || filters.onSale || filters.featured ||
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000;

  return (
    <div className="space-y-6">
      {/* Main Search Bar */}
      <div className="relative">
        <Card className="border-2 border-primary/20 focus-within:border-primary transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder={
                    language === 'vi' ? 'Tìm kiếm sản phẩm, thương hiệu, danh mục...' :
                      language === 'ja' ? '商品、ブランド、カテゴリを検索...' :
                        'Search for products, brands, categories...'
                  }
                  value={filters.query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-12 pr-4 h-12 text-base border-0 focus-visible:ring-0"
                />
              </div>
              <Button
                onClick={handleSearch}
                size="lg"
                className="h-12 px-6"
              >
                <Search className="h-4 w-4 mr-2" />
                {language === 'vi' ? 'Tìm Kiếm' :
                  language === 'ja' ? '検索' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (filters.query.length > 0 || recentSearches.length > 0) && (
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
            <CardContent className="p-0">
              {/* Auto-complete suggestions */}
              {suggestions.length > 0 && (
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                    {language === 'vi' ? 'Sản Phẩm' :
                      language === 'ja' ? '商品' : 'Products'}
                  </h4>
                  <div className="space-y-2">
                    {suggestions.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => handleSuggestionClick(product)}
                        className="flex items-center space-x-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                      >
                        <img
                          src={product.images[0] || '/placeholder.svg'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(product.price, language)}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <>
                  {suggestions.length > 0 && <Separator />}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {language === 'vi' ? 'Gần Đây' :
                          language === 'ja' ? '最近' : 'Recent'}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem('recentSearches');
                        }}
                        className="text-xs"
                      >
                        {language === 'vi' ? 'Xóa' :
                          language === 'ja' ? 'クリア' : 'Clear'}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => handleRecentSearchClick(search)}
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Popular searches */}
              {filters.query.length === 0 && (
                <>
                  {recentSearches.length > 0 && <Separator />}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {language === 'vi' ? 'Phổ Biến' :
                        language === 'ja' ? '人気' : 'Popular'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((search, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary"
                          onClick={() => handleRecentSearchClick(search)}
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Categories */}
              {filters.query.length === 0 && categories.length > 0 && (
                <>
                  {(recentSearches.length > 0 || popularSearches.length > 0) && <Separator />}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      {language === 'vi' ? 'Danh Mục' :
                        language === 'ja' ? 'カテゴリ' : 'Categories'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.slice(0, 6).map((category) => (
                        <Badge
                          key={category._id}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => handleCategoryClick(category)}
                        >
                          {getCategoryName(category)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              {language === 'vi' ? 'Bộ Lọc' :
                language === 'ja' ? 'フィルター' : 'Filters'}
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                {language === 'vi' ? 'Xóa Tất Cả' :
                  language === 'ja' ? 'すべてクリア' : 'Clear All'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {language === 'vi' ? 'Danh Mục' :
                    language === 'ja' ? 'カテゴリ' : 'Category'}
                </Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      language === 'vi' ? 'Tất Cả Danh Mục' :
                        language === 'ja' ? 'すべてのカテゴリ' : 'All Categories'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {language === 'vi' ? 'Tất Cả Danh Mục' :
                        language === 'ja' ? 'すべてのカテゴリ' : 'All Categories'}
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {getCategoryName(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {language === 'vi' ? 'Sắp Xếp' :
                    language === 'ja' ? 'ソート' : 'Sort By'}
                </Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">
                      {language === 'vi' ? 'Liên Quan' :
                        language === 'ja' ? '関連性' : 'Relevance'}
                    </SelectItem>
                    <SelectItem value="price-low">
                      {language === 'vi' ? 'Giá: Thấp đến Cao' :
                        language === 'ja' ? '価格: 安い順' : 'Price: Low to High'}
                    </SelectItem>
                    <SelectItem value="price-high">
                      {language === 'vi' ? 'Giá: Cao đến Thấp' :
                        language === 'ja' ? '価格: 高い順' : 'Price: High to Low'}
                    </SelectItem>
                    <SelectItem value="newest">
                      {language === 'vi' ? 'Mới Nhất' :
                        language === 'ja' ? '最新' : 'Newest'}
                    </SelectItem>
                    <SelectItem value="popular">
                      {language === 'vi' ? 'Phổ Biến Nhất' :
                        language === 'ja' ? '人気順' : 'Most Popular'}
                    </SelectItem>
                    <SelectItem value="rating">
                      {language === 'vi' ? 'Đánh Giá Cao Nhất' :
                        language === 'ja' ? '評価順' : 'Highest Rated'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {language === 'vi' ? 'Khoảng Giá' :
                    language === 'ja' ? '価格帯' : 'Price Range'}: {formatCurrency(filters.priceRange[0], language)} - {formatCurrency(filters.priceRange[1], language)}
                </Label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Quick Filters */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {language === 'vi' ? 'Bộ Lọc Nhanh' :
                    language === 'ja' ? 'クイックフィルター' : 'Quick Filters'}
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inStock"
                      checked={filters.inStock}
                      onCheckedChange={(checked) =>
                        setFilters(prev => ({ ...prev, inStock: checked as boolean }))
                      }
                    />
                    <Label htmlFor="inStock" className="text-sm">
                      {language === 'vi' ? 'Chỉ Còn Hàng' :
                        language === 'ja' ? '在庫あり' : 'In Stock Only'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="onSale"
                      checked={filters.onSale}
                      onCheckedChange={(checked) =>
                        setFilters(prev => ({ ...prev, onSale: checked as boolean }))
                      }
                    />
                    <Label htmlFor="onSale" className="text-sm">
                      {language === 'vi' ? 'Đang Giảm Giá' :
                        language === 'ja' ? 'セール中' : 'On Sale'}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={filters.featured}
                      onCheckedChange={(checked) =>
                        setFilters(prev => ({ ...prev, featured: checked as boolean }))
                      }
                    />
                    <Label htmlFor="featured" className="text-sm">
                      {language === 'vi' ? 'Nổi Bật' :
                        language === 'ja' ? '注目商品' : 'Featured'}
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.category && filters.category !== 'all' && (
            <Badge variant="secondary" className="px-3 py-1">
              {language === 'vi' ? 'Danh Mục' :
                language === 'ja' ? 'カテゴリ' : 'Category'}: {
                categories.find(c => c._id === filters.category)
                  ? getCategoryName(categories.find(c => c._id === filters.category)!)
                  : 'Unknown'
              }
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
              />
            </Badge>
          )}
          {filters.inStock && (
            <Badge variant="secondary" className="px-3 py-1">
              {language === 'vi' ? 'Chỉ Còn Hàng' :
                language === 'ja' ? '在庫あり' : 'In Stock Only'}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, inStock: false }))}
              />
            </Badge>
          )}
          {filters.onSale && (
            <Badge variant="secondary" className="px-3 py-1">
              {language === 'vi' ? 'Đang Giảm Giá' :
                language === 'ja' ? 'セール中' : 'On Sale'}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, onSale: false }))}
              />
            </Badge>
          )}
          {filters.featured && (
            <Badge variant="secondary" className="px-3 py-1">
              {language === 'vi' ? 'Nổi Bật' :
                language === 'ja' ? '注目商品' : 'Featured'}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, featured: false }))}
              />
            </Badge>
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
            <Badge variant="secondary" className="px-3 py-1">
              {formatCurrency(filters.priceRange[0], language)} - {formatCurrency(filters.priceRange[1], language)}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, 1000] }))}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
