import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { api, Product, Category } from "@/lib/api";
import AdvancedSearch from "@/components/AdvancedSearch";
import EnhancedProductGrid from "@/components/EnhancedProductGrid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search as SearchIcon, TrendingUp } from "lucide-react";

interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
  inStock: boolean;
  onSale: boolean;
  featured: boolean;
  sortBy: string;
}

interface QueryParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);
  const [refreshWishlistTrigger, setRefreshWishlistTrigger] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const initialQuery = searchParams.get('q') || '';

  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  // Load trending products and categories on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load trending products
        const productsResponse = await api.getProducts({
          isFeatured: true,
          limit: 8
        });
        setTrendingProducts(productsResponse.products || []);

        // Load categories
        setCategoriesLoading(true);
        const categoriesResponse = await api.getCategories({ isActive: true });
        setCategories(categoriesResponse.categories || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadData();
  }, []);

  // Perform search when URL params change
  useEffect(() => {
    if (initialQuery) {
      handleSearch({
        query: initialQuery,
        category: 'all',
        priceRange: [0, 1000000], // Tăng max price để phù hợp với giá VND
        inStock: false,
        onSale: false,
        featured: false,
        sortBy: 'relevance'
      });
    }
  }, [initialQuery]);

  const handleSearch = async (filters: SearchFilters) => {
    try {
      setLoading(true);
      setCurrentFilters(filters);
      setSearchPerformed(true);

      // Update URL params
      const params = new URLSearchParams();
      if (filters.query) params.set('q', filters.query);
      if (filters.category) params.set('category', filters.category);
      if (filters.priceRange[0] > 0) params.set('minPrice', filters.priceRange[0].toString());
      if (filters.priceRange[1] < 1000000) params.set('maxPrice', filters.priceRange[1].toString());
      if (filters.inStock) params.set('inStock', 'true');
      if (filters.onSale) params.set('onSale', 'true');
      if (filters.featured) params.set('featured', 'true');
      if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);

      setSearchParams(params);

      // Build API query parameters
      const queryParams: QueryParams = {};
      if (filters.query && filters.query.trim()) {
        queryParams.search = filters.query.trim();
      }
      if (filters.category && filters.category !== 'all') queryParams.category = filters.category;
      if (filters.priceRange[0] > 0) queryParams.minPrice = filters.priceRange[0];
      if (filters.priceRange[1] < 1000000) queryParams.maxPrice = filters.priceRange[1];
      if (filters.inStock) queryParams.inStock = true;
      if (filters.onSale) queryParams.onSale = true;
      if (filters.featured) queryParams.isFeatured = true;

      // Map sort options to API params
      switch (filters.sortBy) {
        case 'price-low':
          queryParams.sortBy = 'price';
          queryParams.sortOrder = 'asc';
          break;
        case 'price-high':
          queryParams.sortBy = 'price';
          queryParams.sortOrder = 'desc';
          break;
        case 'newest':
          queryParams.sortBy = 'createdAt';
          queryParams.sortOrder = 'desc';
          break;
        case 'popular':
          queryParams.sortBy = 'featured';
          break;
        default:
          // Relevance - let API handle default sorting
          break;
      }

      const response = await api.getProducts(queryParams);

      setProducts(response.products || []);

      // Show results toast
      toast({
        title: `Found ${response.products?.length || 0} products`,
        description: filters.query ? `Results for "${filters.query}"` : 'Filtered results',
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await api.addToCart(product._id, 1);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    try {
      await api.addToWishlist(product._id);
      setRefreshWishlistTrigger(prev => prev + 1);
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to wishlist.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCompare = (product: Product) => {
    const savedCompareList = localStorage.getItem('koshiro_compare_list');
    let compareList: Product[] = [];

    if (savedCompareList) {
      try {
        compareList = JSON.parse(savedCompareList);
      } catch (error) {
        console.error('Error parsing compare list:', error);
      }
    }

    if (compareList.length >= 4) {
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

    if (compareList.find(p => p._id === product._id)) {
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

    const newCompareList = [...compareList, product];
    localStorage.setItem('koshiro_compare_list', JSON.stringify(newCompareList));
    window.dispatchEvent(new CustomEvent('compareUpdated'));

    toast({
      title: language === 'vi' ? "Đã thêm vào so sánh" :
        language === 'ja' ? "比較リストに追加" :
          "Added to Compare",
      description: language === 'vi' ? "Sản phẩm đã được thêm vào danh sách so sánh" :
        language === 'ja' ? "商品が比較リストに追加されました" :
          "Product has been added to compare list",
    });
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

  const handleCategoryClick = (category: Category) => {
    handleSearch({
      query: '',
      category: category._id,
      priceRange: [0, 1000000], // Tăng max price để phù hợp với giá VND
      inStock: false,
      onSale: false,
      featured: false,
      sortBy: 'relevance'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">


      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 rounded-lg hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'vi' ? 'Quay lại' : language === 'ja' ? '戻る' : 'Back'}
          </Button>
        </div>

        {/* Advanced Search Component */}
        <div className="mb-8">
          <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <AdvancedSearch
                onSearch={handleSearch}
                initialQuery={initialQuery}
                showFilters={searchPerformed}
              />
            </CardContent>
          </Card>
        </div>

        {/* Search Results or Welcome Content */}
        {searchPerformed ? (
          <div className="space-y-6">
            {/* Results Header */}
            {currentFilters && (
              <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {currentFilters.query ? (
                        <>
                          {language === 'vi' ? 'Kết quả tìm kiếm cho ' : language === 'ja' ? '検索結果: ' : 'Search results for '}
                          "<span className="text-primary">{currentFilters.query}</span>"
                        </>
                      ) : currentFilters.category && currentFilters.category !== 'all' ? (
                        <>
                          {language === 'vi' ? 'Sản phẩm trong ' : language === 'ja' ? '商品: ' : 'Products in '}
                          "<span className="text-primary">{
                            categories.find(c => c._id === currentFilters.category)
                              ? getCategoryName(categories.find(c => c._id === currentFilters.category)!)
                              : 'Unknown Category'
                          }</span>"
                        </>
                      ) : (
                        language === 'vi' ? 'Sản phẩm đã lọc' : language === 'ja' ? 'フィルター済み商品' : 'Filtered Products'
                      )}
                    </h2>
                    <Badge variant="secondary" className="text-lg px-4 py-2 font-semibold">
                      <SearchIcon className="h-4 w-4 mr-2" />
                      {products.length} {language === 'vi' ? 'sản phẩm' : language === 'ja' ? '商品' : 'products'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Products Grid */}
            <EnhancedProductGrid
              products={products}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onAddToCompare={handleAddToCompare}
              loading={loading}
            />
          </div>
        ) : (
          /* Welcome Content - No Search Performed Yet */
          <div className="space-y-8">
            {/* Hero Section */}
            <section className="text-center mb-12">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                {/* Banner Background */}
                <div className="absolute inset-0">
                  <img
                    src="/images/banners/banner-04.png"
                    alt="Search Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 py-12 md:py-16 text-white">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm">
                      <SearchIcon className="h-12 w-12 md:h-16 md:w-16 text-white" />
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
                    {language === 'vi' ? 'Tìm Phong Cách Hoàn Hảo' :
                      language === 'ja' ? '完璧なスタイルを見つける' :
                        'Find Your Perfect Style'}
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                    {language === 'vi' ? 'Khám phá hàng ngàn sản phẩm từ các thương hiệu hàng đầu. Tìm kiếm theo tên, danh mục hoặc duyệt qua các bộ sưu tập được tuyển chọn của chúng tôi.' :
                      language === 'ja' ? 'トップブランドから何千もの商品を発見。名前、カテゴリで検索するか、キュレーションされたコレクションを閲覧してください。' :
                        'Discover thousands of products from top brands. Search by name, category, or browse our curated collections.'}
                  </p>
                </div>
              </div>
            </section>

            {/* Popular Categories */}
            <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl font-bold">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  {language === 'vi' ? 'Danh Mục Phổ Biến' :
                    language === 'ja' ? '人気カテゴリ' : 'Popular Categories'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoriesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'vi' ? 'Đang tải danh mục...' :
                        language === 'ja' ? 'カテゴリを読み込み中...' : 'Loading categories...'}
                    </p>
                  </div>
                ) : categories.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.slice(0, 6).map((category) => (
                      <Button
                        key={category._id}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center space-y-2 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all"
                        onClick={() => handleCategoryClick(category)}
                      >
                        <span className="font-semibold">{getCategoryName(category)}</span>
                        <Badge variant="secondary" className="text-xs font-medium">
                          {category.productCount || 0} {language === 'vi' ? 'sản phẩm' :
                            language === 'ja' ? '商品' : 'products'}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {language === 'vi' ? 'Không có danh mục nào' :
                        language === 'ja' ? 'カテゴリがありません' : 'No categories available'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trending Products */}
            {trendingProducts.length > 0 && (
              <div className="space-y-6">
                <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      {language === 'vi' ? 'Đang Thịnh Hành' :
                        language === 'ja' ? '今トレンド' : 'Trending Now'}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {language === 'vi' ? 'Xem những gì đang phổ biến trong khách hàng của chúng tôi' :
                        language === 'ja' ? 'お客様に人気の商品をチェック' :
                          'Check out what\'s popular among our customers'}
                    </p>
                  </CardContent>
                </Card>

                <EnhancedProductGrid
                  products={trendingProducts}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  onAddToCompare={handleAddToCompare}
                  loading={false}
                />
              </div>
            )}

            {/* Search Tips */}
            <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">
                  {language === 'vi' ? 'Mẹo Tìm Kiếm' :
                    language === 'ja' ? '検索のコツ' : 'Search Tips'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-bold mb-3 text-lg">
                      {language === 'vi' ? 'Tìm Kiếm Nhanh' :
                        language === 'ja' ? 'クイック検索' : 'Quick Search'}
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {language === 'vi' ? (
                        <>
                          <li>• Thử tìm kiếm theo danh mục: "kimono", "hakama", "yukata"</li>
                          <li>• Tìm theo loại sản phẩm: "áo haori", "đai obi"</li>
                          <li>• Sử dụng màu sắc: "kimono đỏ", "hakama đen"</li>
                        </>
                      ) : language === 'ja' ? (
                        <>
                          <li>• カテゴリで検索：「着物」「袴」「浴衣」</li>
                          <li>• 商品タイプで検索：「羽織」「帯」</li>
                          <li>• 色で検索：「赤い着物」「黒い袴」</li>
                        </>
                      ) : (
                        <>
                          <li>• Try searching by category: "kimono", "hakama", "yukata"</li>
                          <li>• Search by product type: "haori jacket", "obi belt"</li>
                          <li>• Use colors: "red kimono", "black hakama"</li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border-l-4 border-primary">
                    <h4 className="font-bold mb-3 text-lg">
                      {language === 'vi' ? 'Bộ Lọc Nâng Cao' :
                        language === 'ja' ? '高度なフィルター' : 'Advanced Filters'}
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {language === 'vi' ? (
                        <>
                          <li>• Sử dụng bộ lọc giá để tìm sản phẩm phù hợp với ngân sách</li>
                          <li>• Lọc theo tình trạng để xem sản phẩm còn hàng</li>
                          <li>• Sắp xếp theo giá, độ phổ biến hoặc mới nhất</li>
                        </>
                      ) : language === 'ja' ? (
                        <>
                          <li>• 価格フィルターで予算に合う商品を検索</li>
                          <li>• 在庫状況でフィルターして在庫商品のみ表示</li>
                          <li>• 価格、人気度、新着順で並び替え</li>
                        </>
                      ) : (
                        <>
                          <li>• Use price filters to find products in your budget</li>
                          <li>• Filter by availability to see in-stock items only</li>
                          <li>• Sort by price, popularity, or newest arrivals</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>


    </div>
  );
};

export default SearchPage;