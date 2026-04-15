import { useState, useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, Category } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Package, Search, Grid, List, SortAsc, SortDesc, Filter, TrendingUp, Star, Eye, Users } from "lucide-react";
import CloudinaryImage from "@/components/shared/CloudinaryImage";

// Helper function to render category image
const renderCategoryImage = (category: Category, className: string = "w-12 h-12") => {
  // Priority: Cloudinary images > Legacy image > Placeholder
  if (category.cloudinaryImages && category.cloudinaryImages.length > 0) {
    const cloudinaryImage = category.cloudinaryImages[0];
    return (
      <div className={`${className} rounded-lg overflow-hidden bg-muted`}>
        <CloudinaryImage
          publicId={cloudinaryImage.publicId}
          secureUrl={cloudinaryImage.secureUrl}
          responsiveUrls={cloudinaryImage.responsiveUrls}
          alt={category.name}
          className="w-full h-full object-cover"
          size="thumbnail"
          loading="lazy"
        />
      </div>
    );
  }

  if (category.image) {
    return (
      <div className={`${className} rounded-lg overflow-hidden bg-muted`}>
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback to icon
  return (
    <div className={`${className} bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors`}>
      <Package className="h-6 w-6 text-primary" />
    </div>
  );
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings } = useSettings();

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await api.getCategories({ isActive: true });
        const categoriesData = response.categories || [];
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast({
          title: "Lỗi tải dữ liệu",
          description: "Không thể tải danh mục sản phẩm",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [toast]);

  // Filter and sort categories
  useEffect(() => {
    let filtered = [...categories];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(category => {
        const name = getCategoryName(category);
        const description = getCategoryDescription(category);
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (description && description.toLowerCase().includes(searchQuery.toLowerCase()));
      });
    }

    // Sort categories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return getCategoryName(a).localeCompare(getCategoryName(b));
        case 'nameDesc':
          return getCategoryName(b).localeCompare(getCategoryName(a));
        case 'products':
          return (b.productCount || 0) - (a.productCount || 0);
        case 'newest':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
        default:
          return 0;
      }
    });

    setFilteredCategories(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, searchQuery, sortBy, language]);

  const translations = {
    en: {
      title: "Categories",
      subtitle: "Explore Our Collections",
      description: "Discover our carefully curated categories of Japanese fashion",
      loading: "Loading categories...",
      noCategories: "No categories available at the moment.",
      viewProducts: "View Products",
      products: "products",
      search: "Search categories...",
      sortBy: "Sort by",
      name: "Name A-Z",
      nameDesc: "Name Z-A",
      newest: "Newest",
      mostProducts: "Most Products",
      viewMode: "View",
      grid: "Grid",
      list: "List",
      exploreAll: "Explore All Categories",
      totalCategories: "categories available",
      noResults: "No categories found",
      tryDifferent: "Try a different search term",
      clearSearch: "Clear search",
      browse: "Browse All Products",
      ready: "Ready to Shop?",
      exploreCollection: "Explore our complete collection of Japanese fashion"
    },
    vi: {
      title: "Danh Mục",
      subtitle: "Khám Phá Bộ Sưu Tập",
      description: "Khám phá các danh mục thời trang Nhật Bản được tuyển chọn cẩn thận",
      loading: "Đang tải danh mục...",
      noCategories: "Hiện tại không có danh mục nào.",
      viewProducts: "Xem Sản Phẩm",
      products: "sản phẩm",
      search: "Tìm kiếm danh mục...",
      sortBy: "Sắp xếp theo",
      name: "Tên A-Z",
      nameDesc: "Tên Z-A",
      newest: "Mới nhất",
      mostProducts: "Nhiều sản phẩm nhất",
      viewMode: "Hiển thị",
      grid: "Lưới",
      list: "Danh sách",
      exploreAll: "Khám phá tất cả danh mục",
      totalCategories: "danh mục có sẵn",
      noResults: "Không tìm thấy danh mục nào",
      tryDifferent: "Thử từ khóa tìm kiếm khác",
      clearSearch: "Xóa tìm kiếm",
      browse: "Duyệt tất cả sản phẩm",
      ready: "Sẵn sàng mua sắm?",
      exploreCollection: "Khám phá bộ sưu tập thời trang Nhật Bản hoàn chỉnh"
    },
    ja: {
      title: "カテゴリ",
      subtitle: "コレクションを探索",
      description: "厳選された日本のファッションカテゴリをご覧ください",
      loading: "カテゴリを読み込み中...",
      noCategories: "現在カテゴリはありません。",
      viewProducts: "商品を見る",
      products: "商品",
      search: "カテゴリを検索...",
      sortBy: "並び替え",
      name: "名前A-Z",
      nameDesc: "名前Z-A",
      newest: "最新",
      mostProducts: "商品数順",
      viewMode: "表示",
      grid: "グリッド",
      list: "リスト",
      exploreAll: "すべてのカテゴリを探索",
      totalCategories: "カテゴリが利用可能",
      noResults: "カテゴリが見つかりません",
      tryDifferent: "別の検索語を試してください",
      clearSearch: "検索をクリア",
      browse: "すべての商品を閲覧",
      ready: "お買い物の準備はできましたか？",
      exploreCollection: "日本のファッションコレクション全体をご覧ください"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const getCategoryName = (category: Category) => {
    switch (language) {
      case 'vi': return category.name;
      case 'ja': return category.nameJa || category.name;
      default: return category.nameEn || category.name;
    }
  };

  const getCategoryDescription = (category: Category) => {
    switch (language) {
      case 'vi': return category.description;
      case 'ja': return category.descriptionJa || category.description;
      default: return category.descriptionEn || category.description;
    }
  };

  // Calculate total products across all categories
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);

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
                  src={settings?.banners?.categories || "/images/banners/koshiro-categories-bg.png"}
                  alt="Categories Banner"
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
                <p className="text-lg max-w-2xl mx-auto text-white/80 mb-8 leading-relaxed">
                  {t.description}
                </p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white text-lg px-6 py-2 border border-white/30">
                    <Package className="h-4 w-4 mr-2" />
                    {filteredCategories.length} {t.totalCategories}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white text-lg px-6 py-2 border border-white/30">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {totalProducts} {t.products}
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          {/* Controls Section */}
          <section>
            <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">{t.exploreAll}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-lg border-2 focus:border-primary transition-all"
                    />
                  </div>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="rounded-lg border-2">
                      <SelectValue placeholder={t.sortBy} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">{t.name}</SelectItem>
                      <SelectItem value="nameDesc">{t.nameDesc}</SelectItem>
                      <SelectItem value="products">{t.mostProducts}</SelectItem>
                      <SelectItem value="newest">{t.newest}</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-end space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">{t.viewMode}:</span>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-lg"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-lg"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Categories Grid/List */}
          <section>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-lg">
                  {t.loading}
                </p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? t.noResults : t.noCategories}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? t.tryDifferent : t.noCategories}
                    </p>
                    {searchQuery && (
                      <Button onClick={() => setSearchQuery('')} variant="outline">
                        {t.clearSearch}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredCategories.map((category) => (
                  <Card
                    key={category._id}
                    className={`group hover:shadow-xl transition-all duration-300 cursor-pointer rounded-xl border-2 overflow-hidden ${viewMode === 'list' ? 'flex hover:border-primary' : 'hover:scale-[1.02] hover:border-primary'
                      }`}
                    onClick={() => navigate(`/category/${category.slug}`)}
                  >
                    {viewMode === 'grid' ? (
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="relative">
                            {renderCategoryImage(category, "w-16 h-16 rounded-xl")}
                          </div>
                          <Badge variant="secondary" className="text-xs font-semibold px-3 py-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {category.productCount || 0}
                          </Badge>
                        </div>

                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                          {getCategoryName(category)}
                        </h3>

                        {getCategoryDescription(category) && (
                          <p className="text-muted-foreground mb-4 line-clamp-2 text-sm leading-relaxed">
                            {getCategoryDescription(category)}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm font-medium text-muted-foreground flex items-center">
                            <Package className="h-3.5 w-3.5 mr-1.5" />
                            {category.productCount || 0} {t.products}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-lg group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                          >
                            {t.viewProducts}
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </CardContent>
                    ) : (
                      <CardContent className="p-6 flex items-center space-x-6 w-full">
                        <div className="relative flex-shrink-0">
                          {renderCategoryImage(category, "w-20 h-20 rounded-xl")}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                              {getCategoryName(category)}
                            </h3>
                            <Badge variant="secondary" className="text-xs font-semibold px-3 py-1">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {category.productCount || 0} {t.products}
                            </Badge>
                          </div>

                          {getCategoryDescription(category) && (
                            <p className="text-muted-foreground mb-3 line-clamp-2 text-sm leading-relaxed">
                              {getCategoryDescription(category)}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-sm font-medium text-muted-foreground flex items-center">
                              <Package className="h-3.5 w-3.5 mr-1.5" />
                              {category.productCount || 0} {t.products}
                            </span>

                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-lg group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                            >
                              {t.viewProducts}
                              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Enhanced CTA Section */}
          <section className="mt-12">
            <Card className="rounded-2xl border-2 shadow-2xl overflow-hidden bg-gradient-to-br from-muted/50 via-background to-muted/30">
              <CardContent className="p-12 md:p-16">
                <div className="text-center max-w-3xl mx-auto">
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Star className="h-8 w-8 text-primary fill-primary" />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {t.ready}
                  </h2>
                  <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    {t.exploreCollection}
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                      size="lg"
                      className="px-8 py-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      onClick={() => navigate('/products')}
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      {t.browse}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-6 rounded-xl font-semibold text-lg border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-105"
                      onClick={() => navigate('/sale')}
                    >
                      <TrendingUp className="h-5 w-5 mr-2" />
                      {language === 'vi' ? 'Sản Phẩm Giảm Giá' : language === 'ja' ? 'セール商品' : 'Sale Items'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>


    </div>
  );
};

export default CategoriesPage; 