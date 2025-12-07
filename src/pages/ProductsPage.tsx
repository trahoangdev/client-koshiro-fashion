import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EnhancedProductGrid from "@/components/EnhancedProductGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, Product, Category } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";
import { 
  Filter,
  Package,
  Percent,
  Star,
  Sparkles,
  Clock,
  Grid3X3,
  List,
  ArrowUpDown
} from "lucide-react";

interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.getCategories({ isActive: true });
        setCategories(res.categories || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const res = await api.getProducts({ limit: 100, isActive: true });
        setProducts(res.products || []);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
          description: language === 'vi' ? 'Không thể tải dữ liệu' : 
                       language === 'ja' ? 'データを読み込めません' : 'Unable to load data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [language, toast]);


  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        if (product.name.toLowerCase().includes(query)) return true;
        if (product.description?.toLowerCase().includes(query)) return true;
        if (product.tags?.some(tag => tag.toLowerCase().includes(query))) return true;
        return false;
      });
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    if (selectedPriceRange !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.salePrice || product.price;
        switch (selectedPriceRange) {
          case 'under-200': return price < 200000;
          case '200-500': return price >= 200000 && price < 500000;
          case '500-1000': return price >= 500000 && price < 1000000;
          case 'over-1000': return price >= 1000000;
          default: return true;
        }
      });
    }

    if (selectedColor !== 'all') {
      filtered = filtered.filter(product => {
        if (!product.colors?.length) return false;
        return product.colors.some(color => 
          typeof color === 'string' && color.toLowerCase().includes(selectedColor.toLowerCase())
        );
      });
    }

    if (activeTab !== 'all') {
      filtered = filtered.filter(product => {
        switch (activeTab) {
          case 'sale': return product.onSale || (product.salePrice && product.salePrice < product.price);
          case 'featured': return product.isFeatured;
          case 'new': return product.isNew;
          case 'bestseller': return product.isBestSeller;
          default: return true;
        }
      });
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
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
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedPriceRange, selectedColor, activeTab, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedColor('all');
    setSearchQuery('');
    setSortBy('newest');
    setActiveTab('all');
  };

  const addToCart = async (product: Product) => {
    try {
      if (isAuthenticated) {
        await api.addToCart(product._id, 1);
      } else {
        const { cartService } = await import('@/lib/cartService');
        const color = product.colors?.[0];
        const size = product.sizes?.[0];
        cartService.addToCart(product, 1, size, color);
      }

      setCartItems(prev => {
        const existing = prev.find(item => item.product._id === product._id);
        if (existing) {
          return prev.map(item =>
            item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prev, { product, selectedColor: '', selectedSize: '', quantity: 1 }];
      });
      
      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Đã thêm vào giỏ hàng' : 
                     language === 'ja' ? 'カートに追加しました' : 'Added to cart',
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const addToWishlist = async (product: Product) => {
    try {
      await api.addToWishlist(product._id);
      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Đã thêm vào yêu thích' : 
                     language === 'ja' ? 'お気に入りに追加' : 'Added to wishlist',
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const addToCompare = async (product: Product) => {
    toast({
      title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
      description: language === 'vi' ? 'Đã thêm vào so sánh' : 
                   language === 'ja' ? '比較に追加' : 'Added to compare',
    });
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const t = {
    en: {
      title: "All Products",
      subtitle: "Discover our complete collection",
      description: "Explore our curated selection of Japanese fashion",
      loading: "Loading products...",
      noProducts: "No products found.",
      clearFilters: "Clear All",
      filters: "Filters",
      search: "Search products...",
      category: "Category",
      priceRange: "Price Range",
      color: "Color",
      allCategories: "All Categories",
      allPrices: "All Prices",
      allColors: "All Colors",
      under200: "Under $200",
      range200500: "$200 - $500",
      range5001000: "$500 - $1,000",
      over1000: "Over $1,000",
      productsFound: "products found",
      moreAvailable: "More available",
      allProducts: "All Products",
      onSale: "On Sale",
      featured: "Featured",
      newArrivals: "New Arrivals",
      bestSellers: "Best Sellers",
      sortBy: "Sort by",
      newest: "Newest First",
      oldest: "Oldest First",
      priceLow: "Price: Low to High",
      priceHigh: "Price: High to Low",
      nameAZ: "Name: A to Z"
    },
    vi: {
      title: "Tất Cả Sản Phẩm",
      subtitle: "Khám phá bộ sưu tập hoàn chỉnh",
      description: "Khám phá bộ sưu tập thời trang Nhật Bản được tuyển chọn",
      loading: "Đang tải sản phẩm...",
      noProducts: "Không tìm thấy sản phẩm nào.",
      clearFilters: "Xóa bộ lọc",
      filters: "Bộ lọc",
      search: "Tìm kiếm sản phẩm...",
      category: "Danh mục",
      priceRange: "Khoảng giá",
      color: "Màu sắc",
      allCategories: "Tất cả danh mục",
      allPrices: "Tất cả giá",
      allColors: "Tất cả màu",
      under200: "Dưới 200K",
      range200500: "200K - 500K",
      range5001000: "500K - 1M",
      over1000: "Trên 1M",
      productsFound: "sản phẩm tìm thấy",
      moreAvailable: "Còn thêm",
      allProducts: "Tất Cả",
      onSale: "Giảm Giá",
      featured: "Nổi Bật",
      newArrivals: "Hàng Mới",
      bestSellers: "Bán Chạy",
      sortBy: "Sắp xếp",
      newest: "Mới nhất",
      oldest: "Cũ nhất",
      priceLow: "Giá: Thấp đến Cao",
      priceHigh: "Giá: Cao đến Thấp",
      nameAZ: "Tên: A đến Z"
    },
    ja: {
      title: "すべての商品",
      subtitle: "完全なコレクションを発見",
      description: "厳選された日本のファッションコレクション",
      loading: "商品を読み込み中...",
      noProducts: "商品が見つかりません。",
      clearFilters: "すべてクリア",
      filters: "フィルター",
      search: "商品を検索...",
      category: "カテゴリー",
      priceRange: "価格帯",
      color: "色",
      allCategories: "すべてのカテゴリー",
      allPrices: "すべての価格",
      allColors: "すべての色",
      under200: "200円未満",
      range200500: "200円 - 500円",
      range5001000: "500円 - 1,000円",
      over1000: "1,000円以上",
      productsFound: "商品が見つかりました",
      moreAvailable: "さらに利用可能",
      allProducts: "すべて",
      onSale: "セール",
      featured: "おすすめ",
      newArrivals: "新着",
      bestSellers: "ベストセラー",
      sortBy: "並び替え",
      newest: "新着順",
      oldest: "古い順",
      priceLow: "価格: 安い順",
      priceHigh: "価格: 高い順",
      nameAZ: "名前順"
    }
  }[language as 'en' | 'vi' | 'ja'] || {
    title: "All Products",
    subtitle: "Discover our complete collection",
    description: "Explore our curated selection of Japanese fashion",
    loading: "Loading products...",
    noProducts: "No products found.",
    clearFilters: "Clear All",
    filters: "Filters",
    search: "Search products...",
    category: "Category",
    priceRange: "Price Range",
    color: "Color",
    allCategories: "All Categories",
    allPrices: "All Prices",
    allColors: "All Colors",
    under200: "Under $200",
    range200500: "$200 - $500",
    range5001000: "$500 - $1,000",
    over1000: "Over $1,000",
    productsFound: "products found",
    moreAvailable: "More available",
    allProducts: "All Products",
    onSale: "On Sale",
    featured: "Featured",
    newArrivals: "New Arrivals",
    bestSellers: "Best Sellers",
    sortBy: "Sort by",
    newest: "Newest First",
    oldest: "Oldest First",
    priceLow: "Price: Low to High",
    priceHigh: "Price: High to Low",
    nameAZ: "Name: A to Z"
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header cartItemsCount={cartItemsCount} onSearch={setSearchQuery} />
      
      <main className="py-8">
        <div className="container space-y-8">
          {/* Hero Section - Same as SalePage */}
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
                <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in italic">
                  {t.title}
                </h1>
                <p className="text-xl md:text-2xl mb-4 opacity-90">
                  {t.subtitle}
                </p>
                <p className="text-lg opacity-80 max-w-2xl mx-auto mb-6">
                  {t.description}
                </p>
                <Badge variant="secondary" className="bg-white/20 text-white text-lg px-4 py-2">
                  {filteredProducts.length} {t.productsFound}
                </Badge>
              </div>
            </div>
          </section>

          {/* Filters Section */}
          <section className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>{t.filters}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t.category}</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.allCategories} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allCategories}</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t.priceRange}</label>
                    <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.allPrices} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allPrices}</SelectItem>
                        <SelectItem value="under-200">{t.under200}</SelectItem>
                        <SelectItem value="200-500">{t.range200500}</SelectItem>
                        <SelectItem value="500-1000">{t.range5001000}</SelectItem>
                        <SelectItem value="over-1000">{t.over1000}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">{t.color}</label>
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.allColors} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allColors}</SelectItem>
                        <SelectItem value="black">{language === 'vi' ? 'Đen' : language === 'ja' ? '黒' : 'Black'}</SelectItem>
                        <SelectItem value="white">{language === 'vi' ? 'Trắng' : language === 'ja' ? '白' : 'White'}</SelectItem>
                        <SelectItem value="blue">{language === 'vi' ? 'Xanh dương' : language === 'ja' ? '青' : 'Blue'}</SelectItem>
                        <SelectItem value="red">{language === 'vi' ? 'Đỏ' : language === 'ja' ? '赤' : 'Red'}</SelectItem>
                        <SelectItem value="green">{language === 'vi' ? 'Xanh lá' : language === 'ja' ? '緑' : 'Green'}</SelectItem>
                        <SelectItem value="gray">{language === 'vi' ? 'Xám' : language === 'ja' ? 'グレー' : 'Gray'}</SelectItem>
                        <SelectItem value="brown">{language === 'vi' ? 'Nâu' : language === 'ja' ? '茶色' : 'Brown'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button variant="outline" onClick={clearFilters} className="w-full">
                      {t.clearFilters}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.allProducts}</span>
                </TabsTrigger>
                <TabsTrigger value="sale" className="flex items-center space-x-2">
                  <Percent className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.onSale}</span>
                </TabsTrigger>
                <TabsTrigger value="featured" className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.featured}</span>
                </TabsTrigger>
                <TabsTrigger value="new" className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.newArrivals}</span>
                </TabsTrigger>
                <TabsTrigger value="bestseller" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.bestSellers}</span>
                </TabsTrigger>
              </TabsList>

              {/* Sort and View Controls */}
              <div className="flex items-center justify-between mt-6 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredProducts.length} {t.productsFound}
                  </span>
                  {products.length > filteredProducts.length && (
                    <Badge variant="outline" className="text-xs">{t.moreAvailable}</Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={t.sortBy} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">{t.newest}</SelectItem>
                        <SelectItem value="oldest">{t.oldest}</SelectItem>
                        <SelectItem value="price-low">{t.priceLow}</SelectItem>
                        <SelectItem value="price-high">{t.priceHigh}</SelectItem>
                        <SelectItem value="name">{t.nameAZ}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <TabsContent value={activeTab} className="mt-4">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t.loading}</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg mb-4">{t.noProducts}</p>
                    <Button variant="outline" onClick={clearFilters}>{t.clearFilters}</Button>
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
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductsPage;
