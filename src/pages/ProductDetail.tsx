import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts';
import { useMiniCart } from '@/contexts/MiniCartContext';
import { api, Product, ProductVideo } from '@/lib/api';
import { recentlyViewedService } from '@/lib/recentlyViewedService';
import { formatCurrency } from '@/lib/currency';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductMediaGallery, { MediaItem } from '@/components/ProductMediaGallery';
import RecentlyViewedProducts from '@/components/RecentlyViewedProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Loader2, 
  ShoppingCart, 
  Heart, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw, 
  Minus, 
  Plus, 
  Share2, 
  ChevronRight,
  MessageCircle,
  ThumbsUp,
  Clock,
  CheckCircle,
  Copy,
  Facebook,
  Twitter,
  Mail,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

// Type definitions for better type safety
interface Review {
  id: number;
  user: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

interface ProductDetailState {
  product: Product | null;
  loading: boolean;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  mediaItems: MediaItem[];
  refreshWishlistTrigger: number;
  relatedProducts: Product[];
  loadingRelatedProducts: boolean;
  isInWishlist: boolean;
  shareMenuOpen: boolean;
}

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}



const ProductDetail: React.FC = memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { openMiniCart } = useMiniCart();
  
  // State management with better organization
  const [state, setState] = useState<ProductDetailState>({
    product: null,
    loading: true,
    selectedSize: '',
    selectedColor: '',
    quantity: 1,
    mediaItems: [],
    refreshWishlistTrigger: 0,
    relatedProducts: [],
    loadingRelatedProducts: false,
    isInWishlist: false,
    shareMenuOpen: false,
  });

  // Memoized reviews data
  const reviews: Review[] = useMemo(() => [
    {
      id: 1,
      user: 'Anh Nguyen',
      avatar: '/api/placeholder/40/40',
      rating: 5,
      comment: 'Excellent quality! The fabric is soft and the fit is perfect. Highly recommend this product.',
      date: '2024-01-15',
      helpful: 23,
      verified: true
    },
    {
      id: 2,
      user: 'Mai Tran',
      avatar: '/api/placeholder/40/40',
      rating: 4,
      comment: 'Good product overall. Fast shipping and great customer service. Will buy again.',
      date: '2024-01-10',
      helpful: 15,
      verified: true
    },
    {
      id: 3,
      user: 'John Smith',
      avatar: '/api/placeholder/40/40',
      rating: 5,
      comment: 'Amazing design and quality. Worth every penny!',
      date: '2024-01-08',
      helpful: 8,
      verified: false
    },
    {
      id: 4,
      user: 'Lisa Chen',
      avatar: '/api/placeholder/40/40',
      rating: 4,
      comment: 'Nice product but could be improved in some areas. Still satisfied with the purchase.',
      date: '2024-01-05',
      helpful: 12,
      verified: true
    }
  ], []);

  // Destructure state for easier access
  const {
    product,
    loading,
    selectedSize,
    selectedColor,
    quantity,
    mediaItems,
    refreshWishlistTrigger,
    relatedProducts,
    loadingRelatedProducts,
    isInWishlist,
    shareMenuOpen
  } = state;

  // State update helper
  const updateState = useCallback((updates: Partial<ProductDetailState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Memoized translations
  const translations: Translations = useMemo(() => ({
    vi: {
      addToCart: 'Thêm vào giỏ hàng',
      buyNow: 'Mua ngay',
      addToWishlist: 'Thêm vào yêu thích',
      description: 'Mô tả',
      specifications: 'Thông số kỹ thuật',
      reviews: 'Đánh giá',
      size: 'Kích thước',
      color: 'Màu sắc',
      quantity: 'Số lượng',
      outOfStock: 'Hết hàng',
      inStock: 'Còn hàng',
      shipping: 'Miễn phí vận chuyển',
      warranty: 'Bảo hành 30 ngày',
      return: 'Đổi trả trong 7 ngày',
      loading: 'Đang tải...',
      errorLoading: 'Lỗi tải dữ liệu',
      errorLoadingDesc: 'Không thể tải thông tin sản phẩm',
      selectSize: 'Chọn kích thước',
      selectColor: 'Chọn màu sắc',
      continueShopping: 'Tiếp tục mua sắm'
    },
    en: {
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      addToWishlist: 'Add to Wishlist',
      description: 'Description',
      specifications: 'Specifications',
      reviews: 'Reviews',
      size: 'Size',
      color: 'Color',
      quantity: 'Quantity',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      shipping: 'Free Shipping',
      warranty: '30-day Warranty',
      return: '7-day Return',
      loading: 'Loading...',
      errorLoading: 'Error Loading Data',
      errorLoadingDesc: 'Unable to load product information',
      selectSize: 'Select Size',
      selectColor: 'Select Color',
      continueShopping: 'Continue Shopping'
    },
    ja: {
      addToCart: 'カートに追加',
      buyNow: '今すぐ購入',
      addToWishlist: 'お気に入りに追加',
      description: '説明',
      specifications: '仕様',
      reviews: 'レビュー',
      size: 'サイズ',
      color: '色',
      quantity: '数量',
      outOfStock: '在庫切れ',
      inStock: '在庫あり',
      shipping: '送料無料',
      warranty: '30日保証',
      return: '7日返品',
      loading: '読み込み中...',
      errorLoading: 'データ読み込みエラー',
      errorLoadingDesc: '商品情報を読み込めません',
      selectSize: 'サイズを選択',
      selectColor: '色を選択',
      continueShopping: '買い物を続ける'
    }
  }), []);

  const t = translations[language] || translations.vi;

  // Memoized handlers
  const handleSearch = useCallback((query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }, [navigate]);

  // Memoized helper functions for multilingual support
  const getProductName = useCallback(() => {
    if (!product) return '';
    switch (language) {
      case 'vi': return product.name;
      case 'ja': return product.nameJa || product.name;
      default: return product.nameEn || product.name;
    }
  }, [product, language]);

  const getProductDescription = useCallback(() => {
    if (!product) return '';
    switch (language) {
      case 'vi': return product.description;
      case 'ja': return product.descriptionJa || product.description;
      default: return product.descriptionEn || product.description;
    }
  }, [product, language]);

  const getCategoryName = useCallback(() => {
    if (!product || typeof product.categoryId === 'string') return 'Category';
    switch (language) {
      case 'vi': return product.categoryId.name;
      case 'ja': return product.categoryId.nameJa || product.categoryId.name;
      default: return product.categoryId.nameEn || product.categoryId.name;
    }
  }, [product, language]);

  // Memoized media creation function
  const createMediaItems = useCallback((product: Product): MediaItem[] => {
    const media: MediaItem[] = [];
    
    // Add Cloudinary images first (priority)
    if (product.cloudinaryImages && product.cloudinaryImages.length > 0) {
      product.cloudinaryImages.forEach((cloudinaryImage, index) => {
        media.push({
          id: `cloudinary-image-${index}`,
          type: 'image',
          url: cloudinaryImage.responsiveUrls.large,
          alt: `${product.name} ${index + 1}`
        });
      });
    } else if (product.images && product.images.length > 0) {
      // Fallback to legacy images
      product.images.forEach((image, index) => {
        media.push({
          id: `image-${index}`,
          type: 'image',
          url: image,
          alt: `${product.name} ${index + 1}`
        });
      });
    }
    
    // Add gallery images (additional images for gallery)
    if (product.galleryImages && product.galleryImages.length > 0) {
      product.galleryImages.forEach((galleryImage, index) => {
        media.push({
          id: `gallery-image-${index}`,
          type: 'image',
          url: galleryImage.responsiveUrls.large,
          alt: `${product.name} gallery ${index + 1}`
        });
      });
    }
    
    // Add videos (if product has videos property)
    if (product.videos && Array.isArray(product.videos)) {
      product.videos.forEach((video, index) => {
        // Get thumbnail from first available image
        let thumbnail = '';
        if (product.cloudinaryImages && product.cloudinaryImages.length > 0) {
          thumbnail = product.cloudinaryImages[0].responsiveUrls.medium;
        } else if (product.galleryImages && product.galleryImages.length > 0) {
          thumbnail = product.galleryImages[0].responsiveUrls.medium;
        } else if (product.images && product.images.length > 0) {
          thumbnail = product.images[0];
        } else {
          thumbnail = '/placeholder.svg';
        }
        
        media.push({
          id: `video-${video.publicId || index}`,
          type: 'video',
          url: video.secureUrl, // Use secureUrl instead of url
          thumbnail: thumbnail,
          alt: `${product.name} video ${index + 1}`
        });
      });
    }
    
    return media;
  }, []);

  // Optimized product loading effect
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        updateState({ loading: true });
        const response = await api.getProduct(id);
        const productData = response.product;
        
        // Create media items
        const media = createMediaItems(productData);
        
        // Set default selections
        const defaultSize = productData.sizes.length > 0 ? productData.sizes[0] : '';
        const defaultColor = productData.colors.length > 0 ? productData.colors[0] : '';
        
        updateState({
          product: productData,
          mediaItems: media,
          selectedSize: defaultSize,
          selectedColor: defaultColor,
          loading: false
        });

        // Save to recently viewed
        if (productData) {
          recentlyViewedService.addProduct(productData);
        }

        // Load related products in parallel
        updateState({ loadingRelatedProducts: true });
        try {
          const relatedResponse = await api.getProducts({ 
            category: typeof productData.categoryId === 'string' 
              ? productData.categoryId 
              : productData.categoryId._id,
            limit: 8
          });
          updateState({
            relatedProducts: relatedResponse.products.filter(p => p._id !== productData._id),
            loadingRelatedProducts: false
          });
        } catch (error) {
          console.error('Error loading related products:', error);
          updateState({ loadingRelatedProducts: false });
        }

        // Check wishlist status
        if (isAuthenticated) {
          try {
            const wishlistResponse = await api.getWishlist();
            const wishlistProducts = Array.isArray(wishlistResponse) ? wishlistResponse : [];
            const inWishlist = wishlistProducts.some((item: Product | string) => 
              (typeof item === 'string' ? item : item._id) === productData._id
            );
            updateState({ isInWishlist: inWishlist });
          } catch (error) {
            console.error('Error checking wishlist:', error);
          }
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast({
          title: t.errorLoading,
          description: t.errorLoadingDesc,
          variant: "destructive",
        });
        updateState({ loading: false });
      }
    };

    loadProduct();
  }, [id, toast, t.errorLoading, t.errorLoadingDesc, isAuthenticated, createMediaItems, updateState]);

  // Memoized cart handler
  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    try {
      if (isAuthenticated) {
        // Add via API for authenticated users
        await api.addToCart(product._id, quantity);
      } else {
        // Save to localStorage for guest users
        const { cartService } = await import('@/lib/cartService');
        // Use empty string if size/color not selected
        const size = selectedSize || undefined;
        const color = selectedColor || undefined;
        cartService.addToCart(product, quantity, size, color);
      }
      
      // Open mini cart to show the added product
      openMiniCart(product, quantity, selectedSize || undefined, selectedColor || undefined);
      
      toast({
        title: language === 'vi' ? "Đã thêm vào giỏ hàng" : 
               language === 'ja' ? "カートに追加されました" : 
               "Added to Cart",
        description: language === 'vi' ? "Sản phẩm đã được thêm vào giỏ hàng" :
                     language === 'ja' ? "商品がカートに追加されました" :
                     "Product has been added to cart",
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể thêm vào giỏ hàng" :
                     language === 'ja' ? "カートに追加できませんでした" :
                     "Failed to add to cart. Please try again.",
        variant: "destructive"
      });
    }
  }, [product, isAuthenticated, quantity, selectedSize, selectedColor, language, toast, openMiniCart]);

  // Memoized wishlist handler
  const handleAddToWishlist = useCallback(async () => {
    if (!product) return;
    
    if (!isAuthenticated) {
      toast({
        title: language === 'vi' ? "Cần đăng nhập" : 
               language === 'ja' ? "ログインが必要です" : 
               "Login Required",
        description: language === 'vi' ? "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích" :
                     language === 'ja' ? "商品をお気に入りに追加するにはログインしてください" :
                     "Please login to add products to wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isInWishlist) {
        await api.removeFromWishlist(product._id);
        updateState({ 
          isInWishlist: false,
          refreshWishlistTrigger: refreshWishlistTrigger + 1
        });
        toast({
          title: language === 'vi' ? "Đã xóa khỏi yêu thích" : 
                 language === 'ja' ? "お気に入りから削除されました" : 
                 "Removed from Wishlist",
          description: language === 'vi' ? "Sản phẩm đã được xóa khỏi danh sách yêu thích" :
                       language === 'ja' ? "商品がお気に入りから削除されました" :
                       "Product has been removed from wishlist",
        });
      } else {
        await api.addToWishlist(product._id);
        updateState({ 
          isInWishlist: true,
          refreshWishlistTrigger: refreshWishlistTrigger + 1
        });
        toast({
          title: language === 'vi' ? "Đã thêm vào yêu thích" : 
                 language === 'ja' ? "お気に入りに追加されました" : 
                 "Added to Wishlist",
          description: language === 'vi' ? "Sản phẩm đã được thêm vào danh sách yêu thích" :
                       language === 'ja' ? "商品がお気に入りに追加されました" :
                       "Product has been added to wishlist",
        });
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể cập nhật danh sách yêu thích" :
                     language === 'ja' ? "お気に入りを更新できませんでした" :
                     "Failed to update wishlist. Please try again.",
        variant: "destructive"
      });
    }
  }, [product, isAuthenticated, isInWishlist, refreshWishlistTrigger, language, toast, updateState]);

  // Memoized share handler
  const handleShare = useCallback((platform: string) => {
    const url = window.location.href;
    const title = `Check out ${product?.name}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Product link has been copied to clipboard",
        });
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
        break;
    }
    updateState({ shareMenuOpen: false });
  }, [product, toast, updateState]);

  // Memoized rating calculations
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    return distribution;
  }, [reviews]);

  // Memoized buy now handler
  const handleBuyNow = useCallback(async () => {
    if (!product) return;

    try {
      // Add to cart first (for authenticated users) or save to local storage (for guests)
      if (isAuthenticated) {
        await api.addToCart(product._id, quantity);
        toast({
          title: language === 'vi' ? "Đã thêm vào giỏ hàng" : 
                 language === 'ja' ? "カートに追加されました" : 
                 "Added to Cart",
          description: language === 'vi' ? "Sản phẩm đã được thêm vào giỏ hàng" :
                       language === 'ja' ? "商品がカートに追加されました" :
                       "Product has been added to cart",
        });
      } else {
        // For guest users, add to local storage cart
        const { cartService } = await import('@/lib/cartService');
        const size = selectedSize || undefined;
        const color = selectedColor || undefined;
        cartService.addToCart(product, quantity, size, color);
        toast({
          title: language === 'vi' ? "Đã thêm vào giỏ hàng" : 
                 language === 'ja' ? "カートに追加されました" : 
                 "Added to Cart",
          description: language === 'vi' ? "Sản phẩm đã được thêm vào giỏ hàng" :
                       language === 'ja' ? "商品がカートに追加されました" :
                       "Product has been added to cart",
        });
      }
      navigate('/checkout');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể thêm vào giỏ hàng" :
                     language === 'ja' ? "カートに追加できませんでした" :
                     "Failed to add to cart. Please try again.",
        variant: "destructive"
      });
    }
  }, [product, isAuthenticated, quantity, selectedSize, selectedColor, language, toast, navigate]);

  // Memoized quantity handlers
  const handleQuantityChange = useCallback((newQuantity: number) => {
    if (product && newQuantity >= 1 && newQuantity <= product.stock) {
      updateState({ quantity: newQuantity });
    }
  }, [product, updateState]);

  const handleSizeChange = useCallback((size: string) => {
    updateState({ selectedSize: size });
  }, [updateState]);

  const handleColorChange = useCallback((color: string) => {
    updateState({ selectedColor: color });
  }, [updateState]);

  const toggleShareMenu = useCallback(() => {
    updateState({ shareMenuOpen: !shareMenuOpen });
  }, [shareMenuOpen, updateState]);

  // Memoized computed values
  const isOutOfStock = useMemo(() => !product || product.stock <= 0, [product]);
  const isOnSale = useMemo(() => product && product.onSale && product.originalPrice && product.originalPrice > product.price, [product]);
  const displayPrice = useMemo(() => {
    if (!product) return 0;
    return product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  }, [product]);

  const discountPercentage = useMemo(() => {
    if (!product || !isOnSale) return 0;
    return Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100);
  }, [product, isOnSale]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemsCount={0} onSearch={handleSearch} refreshWishlistTrigger={refreshWishlistTrigger} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>{t.loading}</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartItemsCount={0} onSearch={handleSearch} refreshWishlistTrigger={refreshWishlistTrigger} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Button onClick={() => navigate('/')}>
              {t.continueShopping}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Remove these lines as they're now memoized above

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header cartItemsCount={0} onSearch={handleSearch} refreshWishlistTrigger={refreshWishlistTrigger} />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="p-0 h-auto hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <span className="mx-2">•</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="p-0 h-auto hover:text-primary"
            >
              Home
            </Button>
            <ChevronRight className="h-4 w-4" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/category/${typeof product.categoryId === 'string' ? product.categoryId : product.categoryId.slug}`)}
              className="p-0 h-auto hover:text-primary"
            >
              {getCategoryName()}
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">{getProductName()}</span>
          </div>

          {/* Share Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleShareMenu}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            {shareMenuOpen && (
              <Card className="absolute right-0 top-full mt-2 z-50 w-48">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleShare('facebook')}
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleShare('twitter')}
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleShare('email')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleShare('copy')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Product Media Gallery */}
          <ProductMediaGallery
            mediaItems={mediaItems}
            productName={getProductName()}
            onSale={product.onSale}
            salePrice={product.salePrice}
            originalPrice={product.originalPrice}
            price={product.price}
            language={language}
          />

          {/* Enhanced Product Info */}
          <div className="space-y-8">
            {/* Header Section */}
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-bold mb-3 leading-tight">{getProductName()}</h1>
                <div className="flex items-center space-x-3 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/category/${typeof product.categoryId === 'string' ? product.categoryId : product.categoryId.slug}`)}
                    className="p-0 h-auto text-primary hover:text-primary/80"
                  >
                    {typeof product.categoryId === 'string' 
                      ? 'Category' 
                      : product.categoryId.name}
                  </Button>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">SKU: {product._id.slice(-8).toUpperCase()}</span>
                </div>
              </div>
              
              {/* Product Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {/* Stock Status - Highest priority */}
                {isOutOfStock && (
                  <Badge variant="secondary" className="bg-stone-500/90 text-white">
                    {language === 'vi' ? 'Hết hàng' : language === 'ja' ? '在庫切れ' : 'Out of Stock'}
                  </Badge>
                )}
                
                {/* Sale Badge - Show when on sale and in stock */}
                {!isOutOfStock && isOnSale && (
                  <Badge variant="destructive" className="bg-red-500/90 text-white">
                    -{discountPercentage}% {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'OFF'}
                  </Badge>
                )}
                
                {/* Limited Edition Badge - Show when in stock */}
                {!isOutOfStock && product.isLimitedEdition && (
                  <Badge className="bg-purple-500/90 text-white">
                    {language === 'vi' ? 'Phiên bản giới hạn' : language === 'ja' ? '限定版' : 'Limited Edition'}
                  </Badge>
                )}
                
                {/* Featured Badge - Show when in stock */}
                {!isOutOfStock && product.isFeatured && (
                  <Badge variant="default" className="bg-stone-800/90 dark:bg-stone-200/90 text-white dark:text-stone-800">
                    {language === 'vi' ? 'Nổi bật' : language === 'ja' ? 'おすすめ' : 'Featured'}
                  </Badge>
                )}
                
                {/* New Badge - Show when in stock */}
                {!isOutOfStock && product.isNew && (
                  <Badge className="bg-green-500/90 text-white">
                    {language === 'vi' ? 'MỚI' : language === 'ja' ? '新着' : 'NEW'}
                  </Badge>
                )}
                
                {/* Best Seller Badge - Show when in stock */}
                {!isOutOfStock && product.isBestSeller && (
                  <Badge className="bg-orange-500/90 text-white">
                    {language === 'vi' ? 'Bán chạy' : language === 'ja' ? 'ベストセラー' : 'Best Seller'}
                  </Badge>
                )}
              </div>
              
              {/* Rating & Reviews */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviews.length} {t.reviews})</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">In stock - Ready to ship</span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl font-bold text-primary">
                    {formatCurrency(displayPrice, language)}
                  </span>
                  {isOnSale && (
                    <>
                      <span className="text-2xl text-muted-foreground line-through">
                        {formatCurrency(product.originalPrice!, language)}
                      </span>
                      <Badge variant="destructive" className="text-sm">
                        -{discountPercentage}% 
                        {language === 'vi' ? ' GIẢM' : language === 'ja' ? ' セール' : ' OFF'}
                      </Badge>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {language === 'vi' ? 'Miễn phí vận chuyển cho đơn hàng trên 500.000đ' : 
                   language === 'ja' ? '5万円以上のご注文で送料無料' : 
                   'Free shipping on orders over $50'}
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{t.shipping}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{t.warranty}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{t.return}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Product Options */}
            <div className="space-y-6">
              {/* Size Selection */}
              {product.sizes.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold">{t.size}</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSizeChange(size)}
                        className="min-w-[3.5rem] h-11 text-base touch-manipulation" // Larger touch target
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold">{t.color}</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <Button
                        key={color}
                        variant={selectedColor === color ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleColorChange(color)}
                        className="min-w-[4rem] h-11 text-base touch-manipulation" // Larger touch target
                      >
                        {color}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold">{t.quantity}</label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-4 py-2 h-11 min-w-[3rem] rounded-l-lg rounded-r-none touch-manipulation" // Larger touch target
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <div className="px-4 py-2 min-w-[4rem] text-center font-medium border-x text-base flex items-center justify-center">
                      {quantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="px-4 py-2 h-11 min-w-[3rem] rounded-r-lg rounded-l-none touch-manipulation" // Larger touch target
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.stock} items available
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 h-12 sm:h-11 text-base font-semibold touch-manipulation" 
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.isActive}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {t.addToCart}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-12 sm:h-11 text-base font-semibold touch-manipulation"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={!product.isActive}
                >
                  {t.buyNow}
                </Button>
              </div>
              
              <div className="flex items-center justify-center">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleAddToWishlist}
                  className={`text-muted-foreground hover:text-primary ${isInWishlist ? 'text-red-500' : ''}`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                  {isInWishlist ? 'Remove from Wishlist' : t.addToWishlist}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description" className="text-sm font-medium">
                {t.description}
              </TabsTrigger>
              <TabsTrigger value="specifications" className="text-sm font-medium">
                {t.specifications}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-sm font-medium">
                {t.reviews} ({reviews.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose max-w-none">
                    <div className="text-base leading-7 text-muted-foreground">
                      <MarkdownRenderer 
                        content={getProductDescription() || 'No description available for this product.'}
                        className="prose prose-sm max-w-none"
                      />
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-foreground">Key Features</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>High-quality materials</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Durable construction</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Modern design</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-foreground">Care Instructions</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          <li>• Machine washable</li>
                          <li>• Do not bleach</li>
                          <li>• Tumble dry low</li>
                          <li>• Iron if needed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Category</span>
                        <span className="text-muted-foreground">
                          {getCategoryName()}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Stock</span>
                        <span className="text-muted-foreground">{product.stock} items</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Weight</span>
                        <span className="text-muted-foreground">1.2 kg</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Dimensions</span>
                        <span className="text-muted-foreground">30 x 20 x 10 cm</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Material</span>
                        <span className="text-muted-foreground">Cotton blend</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium">Origin</span>
                        <span className="text-muted-foreground">Japan</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-8">
              <div className="space-y-6">
                {/* Reviews Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-5 w-5 ${star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-muted-foreground">Based on {reviews.length} reviews</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = ratingDistribution[rating - 1];
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center space-x-4">
                            <span className="text-sm w-8">{rating}</span>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.avatar} />
                            <AvatarFallback>
                              {review.user.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <p className="font-semibold">{review.user}</p>
                                {review.verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{review.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                            <div className="flex items-center space-x-4">
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Helpful ({review.helpful})
                              </Button>
                              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">You might also like</h2>
          {loadingRelatedProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="group cursor-pointer hover:shadow-lg transition-shadow rounded-md">
                  <div className="aspect-square bg-muted rounded-t-md overflow-hidden">
                    <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 w-8 bg-muted rounded animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <Card key={relatedProduct._id} className="group cursor-pointer hover:shadow-lg transition-shadow rounded-md">
                <div className="aspect-square bg-muted rounded-t-md overflow-hidden">
                  <img
                    src={
                      relatedProduct.cloudinaryImages && relatedProduct.cloudinaryImages.length > 0
                        ? relatedProduct.cloudinaryImages[0].responsiveUrls.medium
                        : relatedProduct.galleryImages && relatedProduct.galleryImages.length > 0
                        ? relatedProduct.galleryImages[0].responsiveUrls.medium
                        : relatedProduct.images && relatedProduct.images.length > 0
                        ? relatedProduct.images[0]
                        : '/placeholder.svg'
                    }
                    alt={language === 'vi' ? relatedProduct.name : 
                          language === 'ja' ? (relatedProduct.nameJa || relatedProduct.name) : 
                          (relatedProduct.nameEn || relatedProduct.name)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onClick={() => navigate(`/product/${relatedProduct._id}`)}
                  />
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {language === 'vi' ? relatedProduct.name : 
                     language === 'ja' ? (relatedProduct.nameJa || relatedProduct.name) : 
                     (relatedProduct.nameEn || relatedProduct.name)}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary">
                      {relatedProduct.salePrice 
                        ? formatCurrency(relatedProduct.salePrice, language)
                        : formatCurrency(relatedProduct.price, language)}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">4.5</span>
                    </div>
                  </div>
                  {relatedProduct.salePrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatCurrency(relatedProduct.price, language)}
                    </span>
                  )}
                </CardContent>
              </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No related products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Recently Viewed Products */}
      <div className="container mx-auto px-4 py-12">
        <RecentlyViewedProducts maxItems={8} />
      </div>
      
      <Footer />
    </div>
  );
});

export default ProductDetail;
