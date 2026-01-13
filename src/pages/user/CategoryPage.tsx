import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { api, Product, Category } from '@/lib/api';
import { guestCompareService, guestWishlistService } from '@/lib/guestStorage';
import { useAuth } from '@/contexts';
import { formatCurrency } from '@/lib/currency';
import EnhancedProductGrid from '@/components/shared/EnhancedProductGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Loader2, Grid, List, Filter, Search, X, SlidersHorizontal, Tag, Star, Heart, ShoppingCart, ArrowLeft, ChevronDown, Package, TrendingUp } from 'lucide-react';
import CloudinaryImage from '@/components/shared/CloudinaryImage';

// Helper function to render category image
const renderCategoryImage = (category: Category, className: string = "w-32 h-32") => {
  // Priority: Cloudinary images > Legacy image > Placeholder
  if (category.cloudinaryImages && category.cloudinaryImages.length > 0) {
    const cloudinaryImage = category.cloudinaryImages[0];
    return (
      <div className={`${className} bg-muted rounded-xl overflow-hidden shadow-lg`}>
        <CloudinaryImage
          publicId={cloudinaryImage.publicId}
          secureUrl={cloudinaryImage.secureUrl}
          responsiveUrls={cloudinaryImage.responsiveUrls}
          alt={category.name}
          className="w-full h-full object-cover"
          size="medium"
          loading="lazy"
        />
      </div>
    );
  }

  if (category.image) {
    return (
      <div className={`${className} bg-muted rounded-xl overflow-hidden shadow-lg`}>
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return null;
};

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStock, setInStock] = useState<boolean>(false);
  const [onSale, setOnSale] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  const translations = {
    vi: {
      loading: 'Đang tải...',
      errorLoading: 'Lỗi tải dữ liệu',
      errorLoadingDesc: 'Không thể tải thông tin danh mục',
      noProducts: 'Không có sản phẩm nào',
      noProductsDesc: 'Danh mục này chưa có sản phẩm',
      sortBy: 'Sắp xếp theo',
      newest: 'Mới nhất',
      oldest: 'Cũ nhất',
      priceLowToHigh: 'Giá tăng dần',
      priceHighToLow: 'Giá giảm dần',
      nameAZ: 'Tên A-Z',
      nameZA: 'Tên Z-A',
      viewMode: 'Chế độ xem',
      grid: 'Lưới',
      list: 'Danh sách',
      products: 'sản phẩm',
      showing: 'Hiển thị',
      of: 'trên tổng số',
      previous: 'Trước',
      next: 'Tiếp',
      backToCategories: 'Quay lại danh mục',
      filter: 'Lọc',
      clearFilters: 'Xóa bộ lọc',
      search: 'Tìm kiếm sản phẩm...',
      priceRange: 'Khoảng giá',
      size: 'Kích thước',
      color: 'Màu sắc',
      inStock: 'Còn hàng',
      onSale: 'Đang khuyến mãi',
      rating: 'Đánh giá',
      starsAndUp: 'sao trở lên',
      allProducts: 'Tất cả',
      featured: 'Nổi bật',
      bestSelling: 'Bán chạy',
      applyFilters: 'Áp dụng',
      resultsFound: 'kết quả tìm thấy',
      noFiltersMatch: 'Không có sản phẩm nào phù hợp với bộ lọc',
      adjustFilters: 'Hãy thử điều chỉnh bộ lọc của bạn',
      home: 'Trang chủ',
      categories: 'Danh mục'
    },
    en: {
      loading: 'Loading...',
      errorLoading: 'Error Loading Data',
      errorLoadingDesc: 'Unable to load category information',
      noProducts: 'No Products',
      noProductsDesc: 'This category has no products yet',
      sortBy: 'Sort by',
      newest: 'Newest',
      oldest: 'Oldest',
      priceLowToHigh: 'Price Low to High',
      priceHighToLow: 'Price High to Low',
      nameAZ: 'Name A-Z',
      nameZA: 'Name Z-A',
      viewMode: 'View Mode',
      grid: 'Grid',
      list: 'List',
      products: 'products',
      showing: 'Showing',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      backToCategories: 'Back to Categories',
      filter: 'Filter',
      clearFilters: 'Clear Filters',
      search: 'Search products...',
      priceRange: 'Price Range',
      size: 'Size',
      color: 'Color',
      inStock: 'In Stock',
      onSale: 'On Sale',
      rating: 'Rating',
      starsAndUp: 'stars & up',
      allProducts: 'All',
      featured: 'Featured',
      bestSelling: 'Best Selling',
      applyFilters: 'Apply',
      resultsFound: 'results found',
      noFiltersMatch: 'No products match your filters',
      adjustFilters: 'Try adjusting your filters',
      home: 'Home',
      categories: 'Categories'
    },
    ja: {
      loading: '読み込み中...',
      errorLoading: 'データ読み込みエラー',
      errorLoadingDesc: 'カテゴリ情報を読み込めません',
      noProducts: '商品なし',
      noProductsDesc: 'このカテゴリにはまだ商品がありません',
      sortBy: '並び替え',
      newest: '最新',
      oldest: '古い順',
      priceLowToHigh: '価格安い順',
      priceHighToLow: '価格高い順',
      nameAZ: '名前A-Z',
      nameZA: '名前Z-A',
      viewMode: '表示モード',
      grid: 'グリッド',
      list: 'リスト',
      products: '商品',
      showing: '表示中',
      of: 'の',
      previous: '前へ',
      next: '次へ',
      backToCategories: 'カテゴリに戻る',
      filter: 'フィルター',
      clearFilters: 'フィルターをクリア',
      search: '商品を検索...',
      priceRange: '価格帯',
      size: 'サイズ',
      color: '色',
      inStock: '在庫あり',
      onSale: 'セール中',
      rating: '評価',
      starsAndUp: '星以上',
      allProducts: 'すべて',
      featured: 'おすすめ',
      bestSelling: 'ベストセラー',
      applyFilters: '適用',
      resultsFound: '件の結果',
      noFiltersMatch: 'フィルターに一致する商品がありません',
      adjustFilters: 'フィルターを調整してください',
      home: 'ホーム',
      categories: 'カテゴリ'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  // Helper function to get hex color from color name
  const getColorHex = (colorName: string): string => {
    // Check if it's already a hex color
    if (colorName.startsWith('#')) {
      return colorName.toUpperCase();
    }

    const colorMap: { [key: string]: string } = {
      // Vietnamese colors
      'Đỏ': '#ef4444', 'Red': '#ef4444',
      'Xanh dương': '#3b82f6', 'Blue': '#3b82f6',
      'Xanh nhạt': '#93c5fd', 'Light Blue': '#93c5fd',
      'Xanh lá': '#22c55e', 'Green': '#22c55e',
      'Vàng': '#eab308', 'Yellow': '#eab308',
      'Hồng': '#ec4899', 'Pink': '#ec4899',
      'Tím': '#a855f7', 'Purple': '#a855f7',
      'Cam': '#f97316', 'Orange': '#f97316',
      'Nâu': '#a16207', 'Brown': '#a16207',
      'Đen': '#000000', 'Black': '#000000',
      'Trắng': '#ffffff', 'White': '#ffffff',
      'Xám': '#6b7280', 'Gray': '#6b7280', 'Grey': '#6b7280',
      'Bạc': '#c0c0c0', 'Silver': '#c0c0c0',
      'Vàng kim': '#ffd700', 'Gold': '#ffd700',
      'lightcoral': '#f08080',
      'darkviolet': '#9400d3',
      'cornflowerblue': '#6495ed',
    };

    // Try exact match first (case-insensitive)
    const normalizedColor = colorName.toLowerCase();
    for (const [key, hex] of Object.entries(colorMap)) {
      if (key.toLowerCase() === normalizedColor) {
        return hex;
      }
    }

    // Return default gray if not found
    return '#6b7280';
  };

  // Helper function for color translation
  const getColorName = (color: string) => {
    const colorTranslations = {
      black: { vi: "Đen", en: "Black", ja: "ブラック" },
      white: { vi: "Trắng", en: "White", ja: "ホワイト" },
      beige: { vi: "Be", en: "Beige", ja: "ベージュ" },
      brown: { vi: "Nâu", en: "Brown", ja: "ブラウン" },
      navy: { vi: "Xanh đậm", en: "Navy", ja: "ネイビー" },
      natural: { vi: "Tự nhiên", en: "Natural", ja: "ナチュラル" },
      olive: { vi: "Xanh ô liu", en: "Olive", ja: "オリーブ" },
      khaki: { vi: "Ka ki", en: "Khaki", ja: "カーキ" },
      grey: { vi: "Xám", en: "Grey", ja: "グレー" },
      pink: { vi: "Hồng", en: "Pink", ja: "ピンク" },
      purple: { vi: "Tím", en: "Purple", ja: "パープル" },
      green: { vi: "Xanh lá", en: "Green", ja: "グリーン" },
      blue: { vi: "Xanh biển", en: "Blue", ja: "ブルー" },
      burgundy: { vi: "Đỏ rượu", en: "Burgundy", ja: "バーガンディー" },
      gold: { vi: "Vàng", en: "Gold", ja: "ゴールド" },
      red: { vi: "Đỏ", en: "Red", ja: "レッド" },
      emerald: { vi: "Ngọc lục bảo", en: "Emerald", ja: "エメラルド" },
      coral: { vi: "Cam san hô", en: "Coral", ja: "コーラル" },
      turquoise: { vi: "Xanh ngọc", en: "Turquoise", ja: "ターコイズ" },
      yellow: { vi: "Vàng", en: "Yellow", ja: "イエロー" },
      lightcoral: { vi: "Hồng san hô", en: "Light Coral", ja: "ライトコーラル" },
      darkviolet: { vi: "Tím đậm", en: "Dark Violet", ja: "ダークバイオレット" },
      cornflowerblue: { vi: "Xanh ngô", en: "Cornflower Blue", ja: "コーンフラワーブルー" },
    };

    const colorKey = color.toLowerCase() as keyof typeof colorTranslations;
    if (colorTranslations[colorKey]) {
      return colorTranslations[colorKey][language] || color;
    }
    return color; // Fallback to original if no translation found
  };

  // Helper functions for multilingual support
  const getCategoryName = useMemo(() => {
    if (!category) return '';
    switch (language) {
      case 'vi': return category.name;
      case 'ja': return category.nameJa || category.name;
      default: return category.nameEn || category.name;
    }
  }, [category, language]);

  const getCategoryDescription = useMemo(() => {
    if (!category) return '';
    switch (language) {
      case 'vi': return category.description;
      case 'ja': return category.descriptionJa || category.description;
      default: return category.descriptionEn || category.description;
    }
  }, [category, language]);

  const getProductName = (product: Product) => {
    switch (language) {
      case 'vi': return product.name;
      case 'ja': return product.nameJa || product.name;
      default: return product.nameEn || product.name;
    }
  };

  // Advanced filtering logic
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        getProductName(product).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = product.salePrice || product.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product =>
        product.sizes?.some(size => selectedSizes.includes(size))
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product =>
        product.colors?.some(color => selectedColors.includes(color))
      );
    }

    // In stock filter
    if (inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // On sale filter
    if (onSale) {
      filtered = filtered.filter(product =>
        product.onSale ||
        (product.salePrice && product.salePrice < product.price) ||
        (product.originalPrice && product.originalPrice > product.price)
      );
    }

    // Rating filter (only if product has rating property)
    if (minRating > 0) {
      filtered = filtered.filter(product => ((product as Product & { rating?: number }).rating || 0) >= minRating);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priceLowToHigh':
          return (a.salePrice || a.price) - (b.salePrice || b.price);
        case 'priceHighToLow':
          return (b.salePrice || b.price) - (a.salePrice || a.price);
        case 'nameAZ':
          return getProductName(a).localeCompare(getProductName(b));
        case 'nameZA':
          return getProductName(b).localeCompare(getProductName(a));
        case 'oldest':
          return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
        case 'newest':
        default:
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      }
    });

    return filtered;
  }, [products, searchQuery, priceRange, selectedSizes, selectedColors, inStock, onSale, minRating, sortBy, language, getProductName]);

  useEffect(() => {
    let isMounted = true;

    const loadCategoryData = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading category data for slug', slug);

        // Normalize slug to lowercase (backend stores slugs in lowercase)
        const normalizedSlug = slug.toLowerCase().trim();

        // Load category info
        let categoryResponse;
        try {
          categoryResponse = await api.getCategoryBySlug(normalizedSlug);
          console.log('Category response received', { slug: normalizedSlug, response: categoryResponse });
        } catch (apiError: unknown) {
          console.error('API Error loading category', apiError);
          if (!isMounted) return;
          setLoading(false);
          setCategory(null);
          toast({
            title: language === 'vi' ? 'Lỗi tải danh mục' : language === 'ja' ? 'カテゴリ読み込みエラー' : 'Error Loading Category',
            description: language === 'vi' ? `Không thể tải danh mục "${slug}". Vui lòng thử lại.` :
              language === 'ja' ? `カテゴリ「${slug}」を読み込めません。もう一度お試しください。` :
                `Unable to load category "${slug}". Please try again.`,
            variant: "destructive",
          });
          return;
        }

        if (!isMounted) return;

        // Handle different response formats
        let categoryData = null;
        if (categoryResponse) {
          // Check if response has success field (server format)
          if ('success' in categoryResponse && categoryResponse.success && categoryResponse.category) {
            categoryData = categoryResponse.category;
          } else if (categoryResponse.category) {
            // Direct format
            categoryData = categoryResponse.category;
          } else if ('_id' in categoryResponse && 'name' in categoryResponse) {
            // Category object itself
            categoryData = categoryResponse;
          }
        }

        if (!categoryData || !categoryData._id) {
          console.error('Category not found or invalid response');
          console.error('Response structure:', categoryResponse);
          console.error('Normalized slug used:', normalizedSlug);
          if (!isMounted) return;
          setLoading(false);
          setCategory(null);
          return;
        }

        console.log('Category data:', categoryData);
        setCategory(categoryData);

        // Load products in category
        console.log('Loading products for category ID:', categoryData._id);
        let productsResponse = null;
        try {
          productsResponse = await api.getCategoryWithProducts(categoryData._id, {
            page: currentPage,
            limit: 12
          });

          if (!isMounted) return;

          console.log('Products response received', { categoryId: categoryData._id, page: currentPage, response: productsResponse });

          // Handle different response formats
          let products = [];
          let pagination = { pages: 1 };

          if (productsResponse) {
            // Check if response has success field (server format)
            if ('success' in productsResponse && productsResponse.success) {
              products = productsResponse.products || [];
              pagination = productsResponse.pagination || { pages: 1 };
            } else if (productsResponse.products) {
              // Direct format
              products = productsResponse.products;
              pagination = productsResponse.pagination || { pages: 1 };
            } else if (Array.isArray(productsResponse)) {
              // Array format
              products = productsResponse;
            }
          }

          console.log('Products loaded', { count: products.length, pagination });

          setProducts(products);
          setTotalPages(pagination.pages || 1);

          // Extract available sizes and colors
          const allSizes = new Set<string>();
          const allColors = new Set<string>();
          const prices = products.map(p => (p.salePrice || p.price));
          const maxPrice = prices.length > 0 ? Math.max(...prices) : 2000000;

          products.forEach(product => {
            if (product.sizes) {
              product.sizes.forEach(size => allSizes.add(size));
            }
            if (product.colors) {
              product.colors.forEach(color => {
                const colorStr = typeof color === 'string'
                  ? color
                  : (typeof color === 'object' && color !== null && 'name' in color)
                    ? String((color as { name: string }).name)
                    : String(color);
                allColors.add(colorStr);
              });
            }
          });

          setAvailableSizes(Array.from(allSizes));
          setAvailableColors(Array.from(allColors));
          setPriceRange([0, Math.ceil(maxPrice / 100000) * 100000]);
        } catch (productsError: unknown) {
          console.error('Error loading products', productsError);
          if (!isMounted) return;
          setProducts([]);
          setTotalPages(1);
          setAvailableSizes([]);
          setAvailableColors([]);
        }
      } catch (error: unknown) {
        console.error('Error loading category data', error);
        if (!isMounted) return;
        toast({
          title: language === 'vi' ? 'Lỗi tải dữ liệu' : language === 'ja' ? 'データ読み込みエラー' : 'Error Loading Data',
          description: language === 'vi' ? 'Không thể tải thông tin danh mục' :
            language === 'ja' ? 'カテゴリ情報を読み込めません' :
              'Unable to load category information',
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCategoryData();

    return () => {
      isMounted = false;
    };
  }, [slug, currentPage, language, toast]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const addToCompare = (product: Product) => {
    // Check if already in compare list
    if (guestCompareService.isInCompare(product._id)) {
      toast({
        title: language === 'vi' ? "Sản phẩm đã có" :
          language === 'ja' ? "商品は既に追加済み" :
            "Product Already Added",
        description: language === 'vi' ? "Sản phẩm này đã có trong danh sách so sánh" :
          language === 'ja' ? "この商品は既に比較リストにあります" :
            "This product is already in the compare list",
        variant: "destructive",
      });
      return;
    }

    // Check limit
    const currentItems = guestCompareService.getCompareList();
    if (currentItems.length >= 4) {
      toast({
        title: language === 'vi' ? "Giới hạn so sánh" :
          language === 'ja' ? "比較制限" :
            "Compare Limit",
        description: language === 'vi' ? "Bạn chỉ có thể so sánh tối đa 4 sản phẩm" :
          language === 'ja' ? "最大4つの商品を比較できます" :
            "You can compare up to 4 products",
        variant: "destructive",
      });
      return;
    }

    // Add to compare
    guestCompareService.addToCompare(product);

    toast({
      title: language === 'vi' ? "Đã thêm vào so sánh" :
        language === 'ja' ? "比較リストに追加" :
          "Added to Compare",
      description: language === 'vi' ? "Sản phẩm đã được thêm vào danh sách so sánh" :
        language === 'ja' ? "商品が比較リストに追加されました" :
          "Product has been added to compare list",
    });
  };

  const addToCart = async (product: Product) => {
    try {
      await api.addToCart(product._id, 1);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Đã thêm sản phẩm vào giỏ hàng' :
          language === 'ja' ? '商品をカートに追加しました' :
            'Product added to cart',
      });
    } catch (error) {
      console.error('Error adding to cart', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể thêm sản phẩm vào giỏ hàng' :
          language === 'ja' ? '商品をカートに追加できません' :
            'Unable to add product to cart',
        variant: 'destructive',
      });
    }
  };

  const addToWishlist = async (product: Product) => {
    try {
      if (isAuthenticated) {
        await api.addToWishlist(product._id);
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      } else {
        guestWishlistService.addToWishlist(product);
        window.dispatchEvent(new CustomEvent('guestWishlistUpdated'));
      }
      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Đã thêm sản phẩm vào danh sách yêu thích' :
          language === 'ja' ? '商品をお気に入りに追加しました' :
            'Product added to wishlist',
      });
    } catch (error) {
      console.error('Error adding to wishlist', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể thêm sản phẩm vào danh sách yêu thích' :
          language === 'ja' ? '商品をお気に入りに追加できません' :
            'Unable to add product to wishlist',
        variant: 'destructive',
      });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 2000000]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setInStock(false);
    setOnSale(false);
    setMinRating(0);
  };

  const hasActiveFilters = searchQuery || selectedSizes.length > 0 || selectedColors.length > 0 || inStock || onSale || minRating > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-lg">{t.loading}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">

        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Category not found</h1>
            <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')} size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.backToCategories}
            </Button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">


      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer">
                {t.home}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/categories')} className="cursor-pointer">
                {t.categories}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{getCategoryName}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Enhanced Category Header */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => navigate('/categories')} size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t.backToCategories}
                    </Button>
                    <Badge variant="secondary" className="px-3 py-1">
                      {filteredAndSortedProducts.length} {t.resultsFound}
                    </Badge>
                    {hasActiveFilters && (
                      <Badge variant="outline" className="px-3 py-1">
                        <Filter className="h-3 w-3 mr-1" />
                        Filtered
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {getCategoryName}
                    </h1>
                    {getCategoryDescription && (
                      <p className="text-muted-foreground text-lg max-w-2xl">
                        {getCategoryDescription}
                      </p>
                    )}
                  </div>
                </div>

                {renderCategoryImage(category, "w-32 h-32")}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold">{t.filter}</span>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t.clearFilters}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-semibold mb-2 block text-foreground">{t.search}</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-lg border-2 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-sm font-semibold mb-4 block text-foreground">{t.priceRange}</label>
                  <div className="space-y-3">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={2000000}
                      step={50000}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span className="text-primary">{formatCurrency(priceRange[0], language)}</span>
                      <span className="text-primary">{formatCurrency(priceRange[1], language)}</span>
                    </div>
                  </div>
                </div>

                {/* Sizes */}
                {availableSizes.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold mb-3 block text-foreground">{t.size}</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSizes.includes(size) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSizeToggle(size)}
                          className={`h-9 px-4 rounded-lg font-medium transition-all ${selectedSizes.includes(size)
                            ? 'shadow-md ring-2 ring-primary ring-offset-2'
                            : 'hover:border-primary hover:shadow-sm'
                            }`}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {availableColors.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold mb-3 block text-foreground">{t.color}</label>
                    <div className="flex flex-wrap gap-2">
                      {availableColors.map((color) => {
                        const colorHex = getColorHex(color);
                        const isSelected = selectedColors.includes(color);
                        const isLightColor = colorHex === '#FFFFFF' || colorHex === '#FFFF00' || colorHex === '#FFD700';

                        return (
                          <button
                            key={color}
                            onClick={() => handleColorToggle(color)}
                            className={`
                              relative w-10 h-10 rounded-full border-2 transition-all duration-300
                              ${isSelected
                                ? 'ring-2 ring-offset-2 ring-primary shadow-lg scale-110'
                                : 'hover:scale-105 hover:shadow-md'
                              }
                              ${isLightColor ? 'border-stone-300 dark:border-stone-600' : 'border-white dark:border-stone-800'}
                            `}
                            style={{
                              backgroundColor: colorHex,
                            }}
                            title={getColorName(color)}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`w-3 h-3 rounded-full ${isLightColor ? 'bg-stone-800' : 'bg-white'} shadow-sm`} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {/* Color names below swatches */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {availableColors.map((color) => {
                        const isSelected = selectedColors.includes(color);
                        return (
                          <button
                            key={color}
                            onClick={() => handleColorToggle(color)}
                            className={`
                              text-xs px-2 py-1 rounded-md transition-all
                              ${isSelected
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                              }
                            `}
                          >
                            {getColorName(color)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Checkboxes */}
                <div className="space-y-3 p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="inStock"
                      checked={inStock}
                      onCheckedChange={(checked) => setInStock(checked === true)}
                      className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor="inStock" className="text-sm font-medium cursor-pointer flex-1">
                      {t.inStock}
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="onSale"
                      checked={onSale}
                      onCheckedChange={(checked) => setOnSale(checked === true)}
                      className="border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor="onSale" className="text-sm font-medium cursor-pointer flex-1">
                      {t.onSale}
                    </label>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-semibold mb-3 block text-foreground">{t.rating}</label>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <Button
                        key={rating}
                        variant={minRating === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                        className={`w-full justify-start rounded-lg transition-all ${minRating === rating
                          ? 'shadow-md ring-2 ring-primary ring-offset-2'
                          : 'hover:border-primary hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {Array.from({ length: rating }, (_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 ${minRating === rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                            ))}
                            {Array.from({ length: 5 - rating }, (_, i) => (
                              <Star key={i} className={`h-3.5 w-3.5 text-muted-foreground/30`} />
                            ))}
                          </div>
                          <span className="text-xs font-medium ml-1">{rating} {t.starsAndUp}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Products Display */}
            {filteredAndSortedProducts.length > 0 ? (
              <EnhancedProductGrid
                products={filteredAndSortedProducts}
                loading={loading}
                onAddToCompare={addToCompare}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {hasActiveFilters ? t.noFiltersMatch : t.noProducts}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {hasActiveFilters ? t.adjustFilters : t.noProductsDesc}
                    </p>
                    {hasActiveFilters && (
                      <Button onClick={clearAllFilters} variant="outline">
                        {t.clearFilters}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default CategoryPage; 