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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, Product, Category } from "@/lib/api";
import { logger } from "@/lib/logger";

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
        logger.error('Error loading data', error);
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
      logger.error('Error adding to cart', error);
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
      logger.error('Error adding to wishlist', error);
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
      logger.error('Error adding to compare', error);
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
          <section className="text-center mb-12">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Banner Background */}
              <div className="absolute inset-0">
                <img 
                  src="/images/banners/banner-01.png" 
                  alt="Products Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 text-white">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-xl md:text-2xl mb-4 text-white/90 font-light">
                  {t.subtitle}
                </p>
                
                {/* Results count */}
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white text-lg px-6 py-2 border border-white/30 font-semibold">
                  {filteredProducts.length} {t.results}
                </Badge>
              </div>
            </div>
          </section>

          {/* Filters and Controls */}
          <section className="space-y-6">
              {/* Filters Card */}
              <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-bold">
                    <Filter className="h-5 w-5 mr-2 text-primary" />
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
                      className="max-w-md rounded-lg border-2 focus:border-primary transition-all pl-10"
                    />
                  </div>

                  {/* Filter Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 block text-foreground">
                        {language === 'vi' ? 'Danh mục' : language === 'ja' ? 'カテゴリー' : 'Category'}
                      </label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full rounded-lg border-2 focus:border-primary transition-all h-11">
                          <SelectValue placeholder={language === 'vi' ? 'Tất cả danh mục' : language === 'ja' ? 'すべてのカテゴリー' : 'All Categories'} />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-2">
                          <SelectItem value="all" className="rounded-md">
                            {language === 'vi' ? 'Tất cả danh mục' : language === 'ja' ? 'すべてのカテゴリー' : 'All Categories'}
                          </SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id} className="rounded-md">
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold mb-2 block text-foreground">
                        {language === 'vi' ? 'Khoảng giá' : language === 'ja' ? '価格帯' : 'Price Range'}
                      </label>
                      <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                        <SelectTrigger className="w-full rounded-lg border-2 focus:border-primary transition-all h-11">
                          <SelectValue placeholder={language === 'vi' ? 'Tất cả giá' : language === 'ja' ? 'すべての価格' : 'All Prices'} />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-2">
                          <SelectItem value="all" className="rounded-md">
                            {language === 'vi' ? 'Tất cả giá' : language === 'ja' ? 'すべての価格' : 'All Prices'}
                          </SelectItem>
                          <SelectItem value="0-200000" className="rounded-md">
                            {language === 'vi' ? 'Dưới 200K' : language === 'ja' ? '200円未満' : 'Under $200'}
                          </SelectItem>
                          <SelectItem value="200000-500000" className="rounded-md">
                            {language === 'vi' ? '200K - 500K' : language === 'ja' ? '200円 - 500円' : '$200 - $500'}
                          </SelectItem>
                          <SelectItem value="500000-1000000" className="rounded-md">
                            {language === 'vi' ? '500K - 1M' : language === 'ja' ? '500円 - 1,000円' : '$500 - $1000'}
                          </SelectItem>
                          <SelectItem value="1000000-" className="rounded-md">
                            {language === 'vi' ? 'Trên 1M' : language === 'ja' ? '1,000円以上' : 'Over $1000'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold mb-2 block text-foreground">
                        {language === 'vi' ? 'Màu sắc' : language === 'ja' ? '色' : 'Color'}
                      </label>
                      <Select value={selectedColor} onValueChange={setSelectedColor}>
                        <SelectTrigger className="w-full rounded-lg border-2 focus:border-primary transition-all h-11">
                          <SelectValue placeholder={language === 'vi' ? 'Tất cả màu' : language === 'ja' ? 'すべての色' : 'All Colors'} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto rounded-lg border-2">
                          <SelectItem value="all" className="rounded-md">
                            {language === 'vi' ? 'Tất cả màu' : language === 'ja' ? 'すべての色' : 'All Colors'}
                          </SelectItem>
                          <SelectItem value="black" className="rounded-md">
                            {language === 'vi' ? 'Đen' : language === 'ja' ? '黒' : 'Black'}
                          </SelectItem>
                          <SelectItem value="white" className="rounded-md">
                            {language === 'vi' ? 'Trắng' : language === 'ja' ? '白' : 'White'}
                          </SelectItem>
                          <SelectItem value="blue" className="rounded-md">
                            {language === 'vi' ? 'Xanh dương' : language === 'ja' ? '青' : 'Blue'}
                          </SelectItem>
                          <SelectItem value="red" className="rounded-md">
                            {language === 'vi' ? 'Đỏ' : language === 'ja' ? '赤' : 'Red'}
                          </SelectItem>
                          <SelectItem value="green" className="rounded-md">
                            {language === 'vi' ? 'Xanh lá' : language === 'ja' ? '緑' : 'Green'}
                          </SelectItem>
                          <SelectItem value="gray" className="rounded-md">
                            {language === 'vi' ? 'Xám' : language === 'ja' ? 'グレー' : 'Gray'}
                          </SelectItem>
                          <SelectItem value="brown" className="rounded-md">
                            {language === 'vi' ? 'Nâu' : language === 'ja' ? '茶色' : 'Brown'}
                          </SelectItem>
                          <SelectItem value="yellow" className="rounded-md">
                            {language === 'vi' ? 'Vàng' : language === 'ja' ? '黄色' : 'Yellow'}
                          </SelectItem>
                          <SelectItem value="pink" className="rounded-md">
                            {language === 'vi' ? 'Hồng' : language === 'ja' ? 'ピンク' : 'Pink'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full rounded-lg border-2 h-11 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all font-semibold"
                      >
                        {t.clearFilters}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sort and View Controls */}
              <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-semibold text-foreground whitespace-nowrap">
                        {t.sortBy}:
                      </label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-48 rounded-lg border-2 focus:border-primary transition-all">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-2">
                          <SelectItem value="newest" className="rounded-md">{t.newest}</SelectItem>
                          <SelectItem value="oldest" className="rounded-md">{t.oldest}</SelectItem>
                          <SelectItem value="price-low" className="rounded-md">{t.priceLow}</SelectItem>
                          <SelectItem value="price-high" className="rounded-md">{t.priceHigh}</SelectItem>
                          <SelectItem value="name" className="rounded-md">{t.name}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="rounded-lg border-2"
                      >
                        <Grid3X3 className="h-4 w-4 mr-2" />
                        {t.grid}
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="rounded-lg border-2"
                      >
                        <List className="h-4 w-4 mr-2" />
                        {t.list}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </section>

          {/* Products Grid */}
          <section>
            {isLoading ? (
              <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground text-lg font-medium">
                    {t.loading}
                  </p>
                </CardContent>
              </Card>
            ) : filteredProducts.length === 0 ? (
              <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground text-lg font-medium mb-4">
                    {t.noProducts}
                  </p>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="rounded-xl font-semibold border-2"
                  >
                    {t.clearFilters}
                  </Button>
                </CardContent>
              </Card>
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
