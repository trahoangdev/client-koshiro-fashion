import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnhancedProductGrid from "@/components/EnhancedProductGrid";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, Product, Category } from "@/lib/api";

import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Grid3X3, 
  List, 
  SlidersHorizontal, 
  SortAsc, 
  SortDesc,
  Filter,
  X
} from "lucide-react";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();
  const { toast } = useToast();

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load products
        const productsResponse = await api.getProducts({ 
          isActive: true,
          limit: 50 
        });
        setProducts(productsResponse.products || []);

        // Load categories
        const categoriesResponse = await api.getCategories({ isActive: true });
        setCategories(categoriesResponse.categories || []);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
          description: language === 'vi' ? 'Không thể tải dữ liệu sản phẩm' : 
                       language === 'ja' ? '商品データを読み込めません' : 
                       'Unable to load product data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [language, toast]);

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        // Check categoryId match
        return product.categoryId === selectedCategory;
      });
    }

    // Price range filter
    if (selectedPriceRange !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.onSale && product.originalPrice ? product.originalPrice : product.price;
        
        if (selectedPriceRange === '0-200000') {
          return price < 200000;
        } else if (selectedPriceRange === '200000-500000') {
          return price >= 200000 && price <= 500000;
        } else if (selectedPriceRange === '500000-1000000') {
          return price >= 500000 && price <= 1000000;
        } else if (selectedPriceRange === '1000000-') {
          return price > 1000000;
        }
        
        return true;
      });
    }

    // Color filter
    if (selectedColor !== 'all') {
      filtered = filtered.filter(product => {
        if (!product.colors || product.colors.length === 0) return false;
        
        return product.colors.some(color => {
          if (typeof color === 'string') {
            return color.toLowerCase().includes(selectedColor.toLowerCase());
          } else if (typeof color === 'object' && color !== null) {
            const colorObj = color as { name?: string; value?: string };
            return colorObj.name?.toLowerCase().includes(selectedColor.toLowerCase()) ||
                   colorObj.value?.toLowerCase().includes(selectedColor.toLowerCase());
          }
          return false;
        });
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        // Search in product name
        if (product.name.toLowerCase().includes(query)) return true;
        
        // Search in description
        if (product.description && product.description.toLowerCase().includes(query)) return true;
        
        // Search in tags
        if (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query))) return true;
        
        // Search in category name if available
        const category = categories.find(cat => cat._id === product.categoryId);
        if (category && category.name && category.name.toLowerCase().includes(query)) return true;
        
        return false;
      });
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      default:
        break;
    }

    return filtered;
  }, [products, categories, selectedCategory, selectedPriceRange, selectedColor, searchQuery, sortBy]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedColor('all');
    setSearchQuery('');
    setSortBy('newest');
    setViewMode('grid');
  };

  // Add to cart function
  const addToCart = async (product: Product) => {
    try {
      await api.addToCart(product._id, 1);
      
      // Dispatch custom event to notify Header to refresh cart count
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Đã thêm sản phẩm vào giỏ hàng' : 
                     language === 'ja' ? '商品をカートに追加しました' : 
                     'Product added to cart',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể thêm sản phẩm vào giỏ hàng' : 
                     language === 'ja' ? '商品をカートに追加できません' : 
                     'Unable to add product to cart',
        variant: 'destructive',
      });
    }
  };

  // Add to wishlist function
  const addToWishlist = async (product: Product) => {
    try {
      await api.addToWishlist(product._id);
      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Đã thêm sản phẩm vào danh sách yêu thích' : 
                     language === 'ja' ? '商品をお気に入りに追加しました' : 
                     'Product added to wishlist',
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể thêm sản phẩm vào danh sách yêu thích' : 
                     language === 'ja' ? '商品をお気に入りに追加できません' : 
                     'Unable to add product to wishlist',
        variant: 'destructive',
      });
    }
  };

  // Add to compare function
  const addToCompare = async (product: Product) => {
    try {
      // For now, just show a toast since compare functionality might not be implemented yet
      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Đã thêm sản phẩm vào danh sách so sánh' : 
                     language === 'ja' ? '商品を比較リストに追加しました' : 
                     'Product added to compare list',
      });
    } catch (error) {
      console.error('Error adding to compare:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể thêm sản phẩm vào danh sách so sánh' : 
                     language === 'ja' ? '商品を比較リストに追加できません' : 
                     'Unable to add product to compare list',
        variant: 'destructive',
      });
    }
  };

  const translations = {
    en: {
      title: "All Products",
      subtitle: "Discover our complete collection",
      loading: "Loading products...",
      noProducts: "No products found.",
      clearFilters: "Clear Filters",
      sortBy: "Sort by",
      viewMode: "View",
      filters: "Filters",
      results: "results found",
      priceLow: "Price: Low to High",
      priceHigh: "Price: High to Low",
      name: "Name: A to Z",
      newest: "Newest First",
      oldest: "Oldest First",
      grid: "Grid View",
      list: "List View"
    },
    vi: {
      title: "Tất Cả Sản Phẩm",
      subtitle: "Khám phá bộ sưu tập hoàn chỉnh của chúng tôi",
      loading: "Đang tải sản phẩm...",
      noProducts: "Không tìm thấy sản phẩm nào.",
      clearFilters: "Xóa Bộ Lọc",
      sortBy: "Sắp xếp theo",
      viewMode: "Chế độ xem",
      filters: "Bộ lọc",
      results: "kết quả tìm thấy",
      priceLow: "Giá: Thấp đến Cao",
      priceHigh: "Giá: Cao đến Thấp",
      name: "Tên: A đến Z",
      newest: "Mới nhất",
      oldest: "Cũ nhất",
      grid: "Xem dạng lưới",
      list: "Xem dạng danh sách"
    },
    ja: {
      title: "すべての商品",
      subtitle: "完全なコレクションを発見",
      loading: "商品を読み込み中...",
      noProducts: "商品が見つかりません。",
      clearFilters: "フィルターをクリア",
      sortBy: "並び替え",
      viewMode: "表示",
      filters: "フィルター",
      results: "件の結果",
      priceLow: "価格: 安い順",
      priceHigh: "価格: 高い順",
      name: "名前: あいうえお順",
      newest: "新着順",
      oldest: "古い順",
      grid: "グリッド表示",
      list: "リスト表示"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header cartItemsCount={0} onSearch={() => {}} />
      
      <main className="py-8">
        <div className="container space-y-8">
          {/* Hero Section with Banner Background */}
          <section className="text-center">
            <div className="relative overflow-hidden rounded-xl shadow-2xl">
              {/* Banner Background */}
              <div className="absolute inset-0">
                <img 
                  src="/images/banners/banner-01.png" 
                  alt="Products Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 py-16 text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                  {t.title}
                </h1>
                <p className="text-xl md:text-2xl mb-4 opacity-90">
                  {t.subtitle}
                </p>
                
                {/* Results count */}
                <Badge variant="secondary" className="bg-white/20 text-white text-lg px-4 py-2">
                  {filteredProducts.length} {t.results}
                </Badge>
              </div>
            </div>
          </section>

          {/* Filters and Controls */}
          <section className="space-y-6">
              {/* Filters Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Filter className="h-5 w-5" />
                    <span>{t.filters}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div>
                    <Input
                      placeholder={language === 'vi' ? 'Tìm kiếm sản phẩm...' : 
                                   language === 'ja' ? '商品を検索...' : 
                                   'Search products...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-md"
                    />
                  </div>

                  {/* Filter Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {language === 'vi' ? 'Danh mục' : language === 'ja' ? 'カテゴリー' : 'Category'}
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200"
                      >
                        <option value="all">
                          {language === 'vi' ? 'Tất cả danh mục' : language === 'ja' ? 'すべてのカテゴリー' : 'All Categories'}
                        </option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {language === 'vi' ? 'Khoảng giá' : language === 'ja' ? '価格帯' : 'Price Range'}
                      </label>
                      <select
                        value={selectedPriceRange}
                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200"
                      >
                        <option value="all">
                          {language === 'vi' ? 'Tất cả giá' : language === 'ja' ? 'すべての価格' : 'All Prices'}
                        </option>
                        <option value="0-200000">
                          {language === 'vi' ? 'Dưới 200K' : language === 'ja' ? '200円未満' : 'Under $200'}
                        </option>
                        <option value="200000-500000">
                          {language === 'vi' ? '200K - 500K' : language === 'ja' ? '200円 - 500円' : '$200 - $500'}
                        </option>
                        <option value="500000-1000000">
                          {language === 'vi' ? '500K - 1M' : language === 'ja' ? '500円 - 1,000円' : '$500 - $1000'}
                        </option>
                        <option value="1000000-">
                          {language === 'vi' ? 'Trên 1M' : language === 'ja' ? '1,000円以上' : 'Over $1000'}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {language === 'vi' ? 'Màu sắc' : language === 'ja' ? '色' : 'Color'}
                      </label>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200"
                      >
                        <option value="all">
                          {language === 'vi' ? 'Tất cả màu' : language === 'ja' ? 'すべての色' : 'All Colors'}
                        </option>
                        <option value="black">
                          {language === 'vi' ? 'Đen' : language === 'ja' ? '黒' : 'Black'}
                        </option>
                        <option value="white">
                          {language === 'vi' ? 'Trắng' : language === 'ja' ? '白' : 'White'}
                        </option>
                        <option value="blue">
                          {language === 'vi' ? 'Xanh dương' : language === 'ja' ? '青' : 'Blue'}
                        </option>
                        <option value="red">
                          {language === 'vi' ? 'Đỏ' : language === 'ja' ? '赤' : 'Red'}
                        </option>
                        <option value="green">
                          {language === 'vi' ? 'Xanh lá' : language === 'ja' ? '緑' : 'Green'}
                        </option>
                        <option value="gray">
                          {language === 'vi' ? 'Xám' : language === 'ja' ? 'グレー' : 'Gray'}
                        </option>
                        <option value="brown">
                          {language === 'vi' ? 'Nâu' : language === 'ja' ? '茶色' : 'Brown'}
                        </option>
                        <option value="yellow">
                          {language === 'vi' ? 'Vàng' : language === 'ja' ? '黄色' : 'Yellow'}
                        </option>
                        <option value="pink">
                          {language === 'vi' ? 'Hồng' : language === 'ja' ? 'ピンク' : 'Pink'}
                        </option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full"
                      >
                        {t.clearFilters}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </section>

          {/* Products Grid */}
          <section>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {t.loading}
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {t.noProducts}
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  {t.clearFilters}
                </Button>
              </div>
            ) : (
              <EnhancedProductGrid
                products={filteredProducts}
                onAddToCart={addToCart}
                onAddToWishlist={addToWishlist}
                onAddToCompare={addToCompare}
                loading={isLoading}
              />
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductsPage;
