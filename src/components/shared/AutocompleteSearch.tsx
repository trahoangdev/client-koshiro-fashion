import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, TrendingUp, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, Product, Category } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency } from '@/lib/currency';
import CloudinaryImage from '@/components/shared/CloudinaryImage';

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

interface AutocompleteSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  showHistory?: boolean;
  showSuggestions?: boolean;
}

const STORAGE_KEY = 'koshiro_search_history';
const MAX_HISTORY = 10;

const AutocompleteSearch: React.FC<AutocompleteSearchProps> = ({
  onSearch,
  placeholder,
  className = '',
  showHistory = true,
  showSuggestions = true,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const history: SearchHistoryItem[] = JSON.parse(stored);
        setSearchHistory(history.slice(0, MAX_HISTORY));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  // Load trending searches and categories
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load trending products to extract popular search terms
        const productsResponse = await api.getProducts({
          isFeatured: true,
          limit: 10
        });

        // Extract product names as trending searches
        const trending = (productsResponse.products || [])
          .slice(0, 5)
          .map(p => p.name)
          .filter(Boolean);
        setTrendingSearches(trending);

        // Load categories
        const categoriesResponse = await api.getCategories({ isActive: true });
        setCategories((categoriesResponse.categories || []).slice(0, 5));
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Debounced search for suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.getProducts({
        search: searchQuery.trim(),
        limit: 5,
        isActive: true,
      });

      setSuggestions(response.products || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (value.trim()) {
      setIsOpen(true);

      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Debounce API call
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  // Save search to history
  const saveToHistory = (searchQuery: string) => {
    try {
      const history: SearchHistoryItem[] = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '[]'
      );

      // Remove if already exists
      const filtered = history.filter(item => item.query !== searchQuery);

      // Add to beginning
      const newHistory = [
        { query: searchQuery, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_HISTORY);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Handle search
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query.trim();

    if (!finalQuery) return;

    // Save to history
    saveToHistory(finalQuery);

    // Close dropdown
    setIsOpen(false);
    setQuery('');
    setSuggestions([]);

    // Navigate to search page
    navigate(`/search?q=${encodeURIComponent(finalQuery)}`);

    // Call optional callback
    if (onSearch) {
      onSearch(finalQuery);
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = suggestions.length + (showHistory ? searchHistory.length : 0) +
      (trendingSearches.length && !query ? trendingSearches.length : 0) +
      categories.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          // Navigate to selected item
          let currentIndex = 0;

          // Check categories
          if (currentIndex + categories.length > selectedIndex) {
            const category = categories[selectedIndex];
            setIsOpen(false);
            navigate(`/category/${category.slug}`);
            return;
          }
          currentIndex += categories.length;

          // Check suggestions
          if (currentIndex + suggestions.length > selectedIndex) {
            const product = suggestions[selectedIndex - currentIndex];
            setIsOpen(false);
            navigate(`/product/${product.slug || product._id}`);
            return;
          }
          currentIndex += suggestions.length;

          // Check history
          if (showHistory && currentIndex + searchHistory.length > selectedIndex) {
            const historyItem = searchHistory[selectedIndex - currentIndex];
            handleSearch(historyItem.query);
            return;
          }
          currentIndex += searchHistory.length;

          // Check trending
          if (currentIndex + trendingSearches.length > selectedIndex) {
            const trending = trendingSearches[selectedIndex - currentIndex];
            handleSearch(trending);
            return;
          }
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Clear history
  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSearchHistory([]);
  };

  // Remove single history item
  const removeHistoryItem = (index: number) => {
    const newHistory = searchHistory.filter((_, i) => i !== index);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const translations = {
    en: {
      search: 'Search products...',
      recent: 'Recent Searches',
      trending: 'Trending Searches',
      suggestions: 'Suggestions',
      categories: 'Categories',
      clear: 'Clear',
      noResults: 'No results found',
      viewAll: 'View all results',
    },
    vi: {
      search: 'Tìm kiếm sản phẩm...',
      recent: 'Tìm kiếm gần đây',
      trending: 'Tìm kiếm phổ biến',
      suggestions: 'Gợi ý',
      categories: 'Danh mục',
      clear: 'Xóa',
      noResults: 'Không tìm thấy kết quả',
      viewAll: 'Xem tất cả kết quả',
    },
    ja: {
      search: '商品を検索...',
      recent: '最近の検索',
      trending: '人気の検索',
      suggestions: '提案',
      categories: 'カテゴリ',
      clear: 'クリア',
      noResults: '結果が見つかりません',
      viewAll: 'すべての結果を見る',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const hasResults =
    (query.trim() && (suggestions.length > 0 || categories.length > 0)) ||
    (!query.trim() && (searchHistory.length > 0 || trendingSearches.length > 0 || categories.length > 0));

  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 pointer-events-none" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={placeholder || t.search}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && setIsOpen(true)}
            className="pl-12 pr-4 py-3 text-base rounded-full border-2 focus:border-primary transition-all duration-300"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          />
          {isLoading && (
            <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {/* Dropdown Results */}
      {isOpen && hasResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-[600px] overflow-y-auto">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="p-3 border-b">
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
                {t.categories}
              </div>
              <div className="space-y-1">
                {categories.map((category, index) => {
                  const itemIndex = index;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <button
                      key={category._id}
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/category/${category.slug}`);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center space-x-3 ${isSelected ? 'bg-accent' : ''
                        }`}
                    >
                      {category.cloudinaryImages && category.cloudinaryImages.length > 0 ? (
                        <CloudinaryImage
                          publicId={category.cloudinaryImages[0].publicId}
                          secureUrl={category.cloudinaryImages[0].secureUrl}
                          responsiveUrls={category.cloudinaryImages[0].responsiveUrls}
                          alt={category.name}
                          className="w-8 h-8 rounded object-cover"
                          size="thumbnail"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                          <Search className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="flex-1 truncate">
                        {language === 'vi' ? category.name : language === 'ja' ? category.nameJa || category.name : category.nameEn || category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product Suggestions */}
          {showSuggestions && query.trim() && suggestions.length > 0 && (
            <div className="p-3 border-b">
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
                {t.suggestions}
              </div>
              <div className="space-y-1">
                {suggestions.map((product, index) => {
                  const itemIndex = categories.length + index;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/product/${product.slug || product._id}`);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center space-x-3 ${isSelected ? 'bg-accent' : ''
                        }`}
                    >
                      {product.cloudinaryImages && product.cloudinaryImages.length > 0 ? (
                        <CloudinaryImage
                          publicId={product.cloudinaryImages[0].publicId}
                          secureUrl={product.cloudinaryImages[0].secureUrl}
                          responsiveUrls={product.cloudinaryImages[0].responsiveUrls}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                          size="thumbnail"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                          <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {language === 'vi'
                            ? product.name
                            : language === 'ja'
                              ? product.nameJa || product.name
                              : product.nameEn || product.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(
                            product.salePrice && product.salePrice < product.price
                              ? product.salePrice
                              : product.price
                          )}
                          {product.salePrice && product.salePrice < product.price && (
                            <span className="ml-2 line-through text-xs">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full mt-2 text-sm"
                onClick={() => handleSearch()}
              >
                {t.viewAll} ({suggestions.length}+)
              </Button>
            </div>
          )}

          {/* Search History */}
          {showHistory && !query.trim() && searchHistory.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {t.recent}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={clearHistory}
                >
                  {t.clear}
                </Button>
              </div>
              <div className="space-y-1">
                {searchHistory.map((item, index) => {
                  const itemIndex = categories.length + suggestions.length + index;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <div
                      key={`${item.query}-${item.timestamp}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent transition-colors ${isSelected ? 'bg-accent' : ''
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSearch(item.query)}
                        className="flex-1 text-left flex items-center space-x-2"
                      >
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{item.query}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHistoryItem(index);
                        }}
                        className="p-1 hover:bg-background rounded"
                        aria-label="Remove"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          {!query.trim() && trendingSearches.length > 0 && (
            <div className="p-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {t.trending}
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((trending, index) => {
                  const itemIndex = categories.length + suggestions.length +
                    (showHistory ? searchHistory.length : 0) + index;
                  const isSelected = selectedIndex === itemIndex;
                  return (
                    <Badge
                      key={trending}
                      variant={isSelected ? 'default' : 'secondary'}
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleSearch(trending)}
                    >
                      {trending}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {query.trim() && suggestions.length === 0 && !isLoading && (
            <div className="p-6 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t.noResults}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;

