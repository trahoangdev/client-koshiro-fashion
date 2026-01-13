import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import EnhancedProductGrid from "@/components/shared/EnhancedProductGrid";
import { api, Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Percent, TrendingDown, Clock, Gift } from "lucide-react";

interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

const SalePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discountFilter, setDiscountFilter] = useState<string>('all');
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const { language } = useLanguage();
  const { toast } = useToast();
  const { settings } = useSettings();

  // Load sale products
  useEffect(() => {
    const loadSaleProducts = async () => {
      try {
        setIsLoading(true);
        const response = await api.getProducts({
          isActive: true,
          limit: 100 // Load more products for better filtering
        });

        // Filter products that are on sale
        const saleProducts = (response.products || []).filter(product =>
          product.onSale ||
          product.salePrice ||
          (product.originalPrice && product.originalPrice > product.price)
        );

        setProducts(saleProducts);
        setFilteredProducts(saleProducts);
      } catch (error) {
        console.error('Error loading sale products:', error);
        toast({
          title: language === 'vi' ? "Lỗi tải dữ liệu" : language === 'ja' ? "データ読み込みエラー" : "Error Loading Data",
          description: language === 'vi' ? "Không thể tải sản phẩm khuyến mãi" :
            language === 'ja' ? "セール商品を読み込めません" :
              "Unable to load sale products",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSaleProducts();
  }, [toast, language]);

  // Filter products based on active filters
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => {
        const name = language === 'vi' ? product.name :
          language === 'ja' ? (product.nameJa || product.name) :
            (product.nameEn || product.name);
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Discount filter
    if (discountFilter !== 'all') {
      filtered = filtered.filter(product => {
        // Calculate discount percentage from salePrice vs price, or originalPrice vs price
        let discountPercent = 0;

        if (product.salePrice && product.salePrice < product.price) {
          discountPercent = ((product.price - product.salePrice) / product.price) * 100;
        } else if (product.originalPrice && product.originalPrice > product.price) {
          discountPercent = ((product.originalPrice - product.price) / product.originalPrice) * 100;
        }

        switch (discountFilter) {
          case 'high': return discountPercent >= 50;
          case 'medium': return discountPercent >= 30 && discountPercent < 50;
          case 'low': return discountPercent >= 10 && discountPercent < 30;
          default: return true;
        }
      });
    }

    // Price range filter
    if (priceRangeFilter !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.salePrice || product.price;
        switch (priceRangeFilter) {
          case 'under-200': return price < 200000;
          case '200-500': return price >= 200000 && price < 500000;
          case '500-1000': return price >= 500000 && price < 1000000;
          case 'over-1000': return price >= 1000000;
          default: return true;
        }
      });
    }

    // Tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(product => {
        // Calculate discount percentage consistently
        let discountPercent = 0;

        if (product.salePrice && product.salePrice < product.price) {
          discountPercent = ((product.price - product.salePrice) / product.price) * 100;
        } else if (product.originalPrice && product.originalPrice > product.price) {
          discountPercent = ((product.originalPrice - product.price) / product.originalPrice) * 100;
        }

        switch (activeTab) {
          case 'flash': return discountPercent >= 50; // Flash sales (high discount)
          case 'featured': return product.isFeatured; // Featured sale items
          case 'new': {
            // New products (created within last 30 days) that are also on sale
            const createdDate = new Date(product.createdAt || '');
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - createdDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
          }
          default: return true;
        }
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, discountFilter, priceRangeFilter, activeTab, language]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product._id === product._id);
      if (existingItem) {
        return prev.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, selectedColor: '', selectedSize: '', quantity: 1 }];
    });

    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} đã được thêm vào giỏ hàng`,
    });
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const translations = {
    en: {
      title: "Sale",
      subtitle: "Limited Time Offers",
      description: "Discover amazing deals on our Japanese fashion collection",
      noProducts: "No sale products available at the moment.",
      loading: "Loading sale products...",
      search: "Search sale products...",
      filters: "Filters",
      discount: "Discount",
      priceRange: "Price Range",
      allProducts: "All Sale",
      flashSale: "Flash Sale",
      featuredSale: "Featured",
      newSale: "New Arrivals",
      highDiscount: "50%+ Off",
      mediumDiscount: "30-50% Off",
      lowDiscount: "10-30% Off",
      under200: "Under $200",
      range200500: "$200 - $500",
      range5001000: "$500 - $1,000",
      over1000: "Over $1,000",
      clearFilters: "Clear All",
      productsFound: "products found"
    },
    vi: {
      title: "Khuyến Mãi",
      subtitle: "Ưu Đãi Có Hạn",
      description: "Khám phá những ưu đãi tuyệt vời cho bộ sưu tập thời trang Nhật Bản",
      noProducts: "Hiện tại không có sản phẩm khuyến mãi.",
      loading: "Đang tải sản phẩm khuyến mãi...",
      search: "Tìm kiếm sản phẩm khuyến mãi...",
      filters: "Bộ lọc",
      discount: "Giảm giá",
      priceRange: "Khoảng giá",
      allProducts: "Tất cả khuyến mãi",
      flashSale: "Flash Sale",
      featuredSale: "Nổi bật",
      newSale: "Hàng mới",
      highDiscount: "Giảm 50%+",
      mediumDiscount: "Giảm 30-50%",
      lowDiscount: "Giảm 10-30%",
      under200: "Dưới 200K",
      range200500: "200K - 500K",
      range5001000: "500K - 1M",
      over1000: "Trên 1M",
      clearFilters: "Xóa bộ lọc",
      productsFound: "sản phẩm tìm thấy"
    },
    ja: {
      title: "セール",
      subtitle: "期間限定オファー",
      description: "日本のファッションコレクションの素晴らしいお得情報をご覧ください",
      noProducts: "現在セール商品はありません。",
      loading: "セール商品を読み込み中...",
      search: "セール商品を検索...",
      filters: "フィルター",
      discount: "割引",
      priceRange: "価格帯",
      allProducts: "全セール",
      flashSale: "フラッシュセール",
      featuredSale: "おすすめ",
      newSale: "新着",
      highDiscount: "50%以上オフ",
      mediumDiscount: "30-50%オフ",
      lowDiscount: "10-30%オフ",
      under200: "200円未満",
      range200500: "200円 - 500円",
      range5001000: "500円 - 1,000円",
      over1000: "1,000円以上",
      clearFilters: "すべてクリア",
      productsFound: "商品が見つかりました"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">


      <main className="py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Enhanced Hero Section */}
          <section className="text-center mb-12">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              {/* Banner Background with Gradient */}
              <div className="absolute inset-0">
                <img
                  src={settings?.banners?.sale || "/images/banners/banner-04.png"}
                  alt="Sale Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-12 md:p-16 text-white">
                <div className="flex items-center justify-center mb-4">
                  <Percent className="h-12 w-12 md:h-16 md:w-16 mr-3" />
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                    {t.title}
                  </h1>
                </div>
                <p className="text-xl md:text-2xl mb-4 text-white/90 font-light">
                  {t.subtitle}
                </p>
                <p className="text-lg max-w-2xl mx-auto text-white/80 mb-8 leading-relaxed">
                  {t.description}
                </p>
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white text-lg px-6 py-2 border border-white/30">
                  <TrendingDown className="h-4 w-4 mr-2" />
                  {filteredProducts.length} {t.productsFound}
                </Badge>
              </div>
            </div>
          </section>

          {/* Filters and Tabs Section */}
          <section className="space-y-6">
            <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">{t.filters}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div>
                  <Input
                    placeholder={t.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-md rounded-lg border-2 focus:border-primary transition-all"
                  />
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-foreground">{t.discount}</label>
                    <Select value={discountFilter} onValueChange={setDiscountFilter}>
                      <SelectTrigger className="rounded-lg border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allProducts}</SelectItem>
                        <SelectItem value="high">{t.highDiscount}</SelectItem>
                        <SelectItem value="medium">{t.mediumDiscount}</SelectItem>
                        <SelectItem value="low">{t.lowDiscount}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block text-foreground">{t.priceRange}</label>
                    <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
                      <SelectTrigger className="rounded-lg border-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t.allProducts}</SelectItem>
                        <SelectItem value="under-200">{t.under200}</SelectItem>
                        <SelectItem value="200-500">{t.range200500}</SelectItem>
                        <SelectItem value="500-1000">{t.range5001000}</SelectItem>
                        <SelectItem value="over-1000">{t.over1000}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setDiscountFilter('all');
                        setPriceRangeFilter('all');
                        setActiveTab('all');
                      }}
                      className="w-full rounded-lg"
                    >
                      {t.clearFilters}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sale Categories Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
                <CardContent className="p-4">
                  <TabsList className="grid w-full grid-cols-4 bg-muted/30 rounded-lg p-1">
                    <TabsTrigger value="all" className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                      <Gift className="h-4 w-4" />
                      <span className="font-medium">{t.allProducts}</span>
                    </TabsTrigger>
                    <TabsTrigger value="flash" className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                      <TrendingDown className="h-4 w-4" />
                      <span className="font-medium">{t.flashSale}</span>
                    </TabsTrigger>
                    <TabsTrigger value="featured" className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                      <Percent className="h-4 w-4" />
                      <span className="font-medium">{t.featuredSale}</span>
                    </TabsTrigger>
                    <TabsTrigger value="new" className="flex items-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">{t.newSale}</span>
                    </TabsTrigger>
                  </TabsList>
                </CardContent>
              </Card>

              <TabsContent value={activeTab} className="mt-8">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">
                      {t.loading}
                    </p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingDown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">
                      {t.noProducts}
                    </p>
                  </div>
                ) : (
                  <EnhancedProductGrid
                    products={filteredProducts}
                    onAddToCart={addToCart}
                    loading={isLoading}
                  />
                )}
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>


    </div>
  );
};

export default SalePage; 