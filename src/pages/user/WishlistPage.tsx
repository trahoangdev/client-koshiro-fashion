import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { api, Product } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { useAuth } from "@/contexts";
import { guestWishlistService, guestCartService, GuestWishlistItem } from "@/lib/guestStorage";

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const { settings } = useSettings();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Load wishlist - from API if authenticated, from localStorage if guest
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setIsLoading(true);

        if (isAuthenticated) {
          // Load from API for authenticated users
          const response = await api.getWishlist();
          let wishlistData: Product[] = [];

          if (Array.isArray(response)) {
            wishlistData = response;
          } else if (response && typeof response === 'object') {
            const responseObj = response as Record<string, unknown>;
            if ('data' in responseObj && Array.isArray(responseObj.data)) {
              wishlistData = responseObj.data as Product[];
            } else if ('wishlist' in responseObj && Array.isArray(responseObj.wishlist)) {
              wishlistData = responseObj.wishlist as Product[];
            }
          }

          setWishlistItems(wishlistData);
        } else {
          // Load from localStorage for guests
          const guestWishlist = guestWishlistService.getWishlist();
          setWishlistItems(guestWishlist.map(item => item.product));
        }
      } catch (error) {
        console.error('Error loading wishlist:', error);
        toast({
          title: language === 'vi' ? "Lỗi tải dữ liệu" :
            language === 'ja' ? "データ読み込みエラー" :
              "Data Loading Error",
          description: language === 'vi' ? "Không thể tải danh sách yêu thích" :
            language === 'ja' ? "お気に入りリストを読み込めませんでした" :
              "Could not load wishlist",
          variant: "destructive",
        });
        setWishlistItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();

    // Listen for guest wishlist updates
    const handleGuestWishlistUpdate = () => {
      if (!isAuthenticated) {
        const guestWishlist = guestWishlistService.getWishlist();
        setWishlistItems(guestWishlist.map(item => item.product));
      }
    };

    window.addEventListener('guestWishlistUpdated', handleGuestWishlistUpdate);
    return () => window.removeEventListener('guestWishlistUpdated', handleGuestWishlistUpdate);
  }, [toast, language, isAuthenticated]);

  const getProductName = (product: Product) => {
    if (language === 'vi') return product.name;
    if (language === 'ja') return product.nameJa || product.name;
    return product.nameEn || product.name;
  };

  const addToCart = async (product: Product) => {
    try {
      if (isAuthenticated) {
        await api.addToCart(product._id, 1);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        guestCartService.addToCart(product, 1);
      }

      toast({
        title: language === 'vi' ? "Đã thêm vào giỏ hàng" :
          language === 'ja' ? "カートに追加されました" :
            "Added to Cart",
        description: language === 'vi' ? `${getProductName(product)} đã được thêm vào giỏ hàng` :
          language === 'ja' ? `${getProductName(product)}がカートに追加されました` :
            `${getProductName(product)} has been added to cart`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: language === 'vi' ? "Lỗi" :
          language === 'ja' ? "エラー" :
            "Error",
        description: language === 'vi' ? "Không thể thêm vào giỏ hàng" :
          language === 'ja' ? "カートに追加できませんでした" :
            "Could not add to cart",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      if (isAuthenticated) {
        await api.removeFromWishlist(productId);
      } else {
        guestWishlistService.removeFromWishlist(productId);
      }

      setWishlistItems(prev => prev.filter(item => item._id !== productId));

      toast({
        title: language === 'vi' ? "Đã xóa khỏi danh sách yêu thích" :
          language === 'ja' ? "お気に入りから削除されました" :
            "Removed from Wishlist",
        description: language === 'vi' ? "Sản phẩm đã được xóa khỏi danh sách yêu thích" :
          language === 'ja' ? "商品がお気に入りから削除されました" :
            "Product has been removed from wishlist",
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: language === 'vi' ? "Lỗi" :
          language === 'ja' ? "エラー" :
            "Error",
        description: language === 'vi' ? "Không thể xóa khỏi danh sách yêu thích" :
          language === 'ja' ? "お気に入りから削除できませんでした" :
            "Could not remove from wishlist",
        variant: "destructive",
      });
    }
  };

  const clearWishlist = async () => {
    try {
      if (isAuthenticated) {
        await api.clearWishlist();
      } else {
        guestWishlistService.clearWishlist();
      }
      setWishlistItems([]);

      toast({
        title: language === 'vi' ? "Đã xóa tất cả" :
          language === 'ja' ? "すべて削除されました" :
            "All Cleared",
        description: language === 'vi' ? "Tất cả sản phẩm đã được xóa khỏi danh sách yêu thích" :
          language === 'ja' ? "すべての商品がお気に入りから削除されました" :
            "All products have been removed from wishlist",
      });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast({
        title: language === 'vi' ? "Lỗi" :
          language === 'ja' ? "エラー" :
            "Error",
        description: language === 'vi' ? "Không thể xóa danh sách yêu thích" :
          language === 'ja' ? "お気に入りリストを削除できませんでした" :
            "Could not clear wishlist",
        variant: "destructive",
      });
    }
  };

  const getProductImage = (product: Product) => {
    if (product.cloudinaryImages && product.cloudinaryImages.length > 0) {
      return product.cloudinaryImages[0].secureUrl;
    }
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return '/placeholder.svg';
  };

  const translations = {
    en: {
      title: "My Wishlist",
      subtitle: "Your Favorite Items",
      description: "Keep track of items you love and want to purchase later",
      empty: "Your wishlist is empty",
      emptyDescription: "Start adding items to your wishlist to see them here",
      startShopping: "Start Shopping",
      clearAll: "Clear All",
      addToCart: "Add to Cart",
      remove: "Remove",
      items: "items",
      loading: "Loading wishlist...",
      guestMode: "Guest Mode"
    },
    vi: {
      title: "Danh Sách Yêu Thích",
      subtitle: "Những Sản Phẩm Bạn Yêu Thích",
      description: "Theo dõi những sản phẩm bạn yêu thích và muốn mua sau",
      empty: "Danh sách yêu thích của bạn trống",
      emptyDescription: "Bắt đầu thêm sản phẩm vào danh sách yêu thích để xem chúng ở đây",
      startShopping: "Bắt Đầu Mua Sắm",
      clearAll: "Xóa Tất Cả",
      addToCart: "Thêm Vào Giỏ",
      remove: "Xóa",
      items: "sản phẩm",
      loading: "Đang tải danh sách yêu thích...",
      guestMode: "Chế độ khách"
    },
    ja: {
      title: "お気に入りリスト",
      subtitle: "お気に入りの商品",
      description: "お気に入りの商品を追跡し、後で購入したい商品を管理",
      empty: "お気に入りリストが空です",
      emptyDescription: "お気に入りリストに商品を追加してここで確認してください",
      startShopping: "ショッピングを始める",
      clearAll: "すべて削除",
      addToCart: "カートに追加",
      remove: "削除",
      items: "商品",
      loading: "お気に入りリストを読み込み中...",
      guestMode: "ゲストモード"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <main className="py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Header */}
          <section className="text-center mb-12">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="absolute inset-0">
                <img
                  src={settings?.banners?.wishlist || "/images/banners/koshiro-wishlist-bg.png"}
                  alt="Wishlist Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
              </div>

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
                {!isAuthenticated && (
                  <Badge variant="outline" className="bg-amber-500/20 backdrop-blur-sm text-amber-100 text-sm px-4 py-2 border border-amber-300/30">
                    {t.guestMode}
                  </Badge>
                )}
              </div>
            </div>
          </section>

          {/* Wishlist Content */}
          <section>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  {t.loading}
                </p>
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  {t.empty}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {t.emptyDescription}
                </p>
                <Link to="/">
                  <Button size="lg">
                    {t.startShopping}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Wishlist Header */}
                <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-lg px-6 py-2 font-semibold">
                        <Heart className="h-4 w-4 mr-2" />
                        {wishlistItems.length} {t.items}
                      </Badge>
                      <Button
                        variant="outline"
                        onClick={clearWishlist}
                        className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t.clearAll}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Wishlist Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((product) => (
                    <Card key={product._id} className="group hover:shadow-xl transition-all duration-300 rounded-xl border-2 overflow-hidden hover:scale-[1.02] hover:border-primary">
                      <CardContent className="p-6">
                        <div className="relative mb-4 rounded-xl overflow-hidden bg-muted">
                          <img
                            src={getProductImage(product)}
                            alt={getProductName(product)}
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg shadow-md"
                            onClick={() => removeFromWishlist(product._id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <h3 className="font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {getProductName(product)}
                        </h3>

                        <div className="flex items-center justify-between mb-4 pb-4 border-b">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <span className="text-xl font-bold text-primary">
                              {product.salePrice && product.salePrice < product.price ? formatCurrency(product.salePrice, language) : formatCurrency(product.price, language)}
                            </span>
                            {product.salePrice && product.salePrice < product.price && (
                              <>
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(product.price, language)}
                                </span>
                                <Badge variant="destructive" className="text-xs font-semibold">
                                  -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                                </Badge>
                              </>
                            )}
                            {product.originalPrice && product.originalPrice > product.price && !product.salePrice && (
                              <>
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(product.originalPrice, language)}
                                </span>
                                <Badge variant="destructive" className="text-xs font-semibold">
                                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>

                        <Button
                          className="w-full rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                          onClick={() => addToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {t.addToCart}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Back to Shopping */}
          {wishlistItems.length > 0 && (
            <section className="text-center">
              <Link to="/">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {language === 'vi' ? "Tiếp Tục Mua Sắm" :
                    language === 'ja' ? "ショッピングを続ける" :
                      "Continue Shopping"}
                </Button>
              </Link>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default WishlistPage;