import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts';
import { api, Product, ProductVideo, Color, Review } from '@/lib/api';
import { guestCartService, guestWishlistService, guestCompareService } from '@/lib/guestStorage';
import { formatCurrency } from '@/lib/currency';
import ProductMediaGallery, { MediaItem } from '@/components/shared/ProductMediaGallery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  MoreHorizontal,
  Ruler,
  Package,
  GitCompare
} from 'lucide-react';
import MarkdownRenderer from '@/components/shared/MarkdownRenderer';



const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [refreshWishlistTrigger, setRefreshWishlistTrigger] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [apiColors, setApiColors] = useState<Color[]>([]);
  const [colorsLoading, setColorsLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([0, 0, 0, 0, 0]);

  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Load reviews from API
  const loadReviews = async (productId: string) => {
    try {
      setReviewsLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        api.getReviews({ productId, limit: 20 }), // Default limit 20
        api.getReviewStats(productId)
      ]);

      setReviews(reviewsData.data || []);
      setAverageRating(statsData.averageRating);
      setTotalReviews(statsData.totalReviews);

      const dist = [0, 0, 0, 0, 0];
      statsData.ratingDistribution.forEach((stat) => {
        if (stat._id >= 1 && stat._id <= 5) {
          dist[stat._id - 1] = stat.count;
        }
      });
      setRatingDistribution(dist);

    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadReviews(id);
    }
  }, [id]);

  const handleHelpfulReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast({
        title: language === 'vi' ? 'Vui lòng đăng nhập' : language === 'ja' ? 'ログインしてください' : 'Please login',
        description: language === 'vi' ? 'Bạn cần đăng nhập để tương tác' : language === 'ja' ? '対話するにはログインが必要です' : 'You need to login to interact',
        variant: "destructive"
      });
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    try {
      await api.markReviewHelpful(reviewId);
      // Update local state
      setReviews(prevReviews => prevReviews.map(review =>
        review._id === reviewId
          ? { ...review, helpful: (review.helpful || 0) + 1 }
          : review
      ));
      toast({
        title: language === 'vi' ? 'Đã ghi nhận' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Cảm ơn bạn đã đánh giá' : language === 'ja' ? 'フィードバックありがとうございます' : 'Thanks for your feedback',
      });
    } catch (error) {
      console.error('Error marking review helpful:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể thực hiện' : language === 'ja' ? '失敗しました' : 'Failed to mark as helpful',
        variant: "destructive"
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast({
        title: language === 'vi' ? 'Vui lòng đăng nhập' : language === 'ja' ? 'ログインしてください' : 'Please login',
        description: language === 'vi' ? 'Bạn cần đăng nhập để viết đánh giá' : language === 'ja' ? 'レビューを書くにはログインが必要です' : 'You need to login to write a review',
        variant: "destructive"
      });
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    if (!newReviewComment.trim()) {
      toast({
        title: language === 'vi' ? 'Thiếu thông tin' : language === 'ja' ? '情報不足' : 'Missing information',
        description: language === 'vi' ? 'Vui lòng nhập nội dung đánh giá' : language === 'ja' ? 'レビュー内容を入力してください' : 'Please enter review content',
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmittingReview(true);

      const title = newReviewTitle.trim() || (language === 'vi' ? 'Đánh giá sản phẩm' : 'Product Review');

      await api.createReview({
        productId: id,
        rating: newReviewRating,
        title: title,
        comment: newReviewComment
      });

      // Reload reviews to show new one
      if (id) await loadReviews(id);

      setNewReviewComment('');
      setNewReviewTitle('');
      setNewReviewRating(5);

      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Đánh giá của bạn đã được gửi' : language === 'ja' ? 'レビューが送信されました' : 'Your review has been submitted',
      });
    } catch (error: any) {
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: error.message || (language === 'vi' ? 'Không thể gửi đánh giá' : language === 'ja' ? 'レビューを送信できませんでした' : 'Failed to submit review'),
        variant: "destructive"
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const translations = {
    vi: {
      addToCart: 'Thêm vào giỏ hàng',
      buyNow: 'Mua ngay',
      addToWishlist: 'Thêm vào yêu thích',
      addToCompare: 'Thêm vào so sánh',
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
      addToCompare: 'Add to Compare',
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
      addToCompare: '比較に追加',
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
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  // Helper functions for multilingual support
  const getProductName = () => {
    if (!product) return '';
    switch (language) {
      case 'vi': return product.name;
      case 'ja': return product.nameJa || product.name;
      default: return product.nameEn || product.name;
    }
  };

  const getProductDescription = () => {
    if (!product) return '';
    switch (language) {
      case 'vi': return product.description;
      case 'ja': return product.descriptionJa || product.description;
      default: return product.descriptionEn || product.description;
    }
  };

  const getCareInstructions = () => {
    if (!product) return '';
    switch (language) {
      case 'vi': return product.careInstructions || '';
      case 'ja': return product.careInstructionsJa || product.careInstructions || '';
      default: return product.careInstructionsEn || product.careInstructions || '';
    }
  };

  const getOrigin = () => {
    if (!product) return '';
    switch (language) {
      case 'vi': return product.origin || '';
      case 'ja': return product.originJa || product.origin || '';
      default: return product.originEn || product.origin || '';
    }
  };

  const getCategoryName = () => {
    if (!product || typeof product.categoryId === 'string') return 'Category';
    switch (language) {
      case 'vi': return product.categoryId.name;
      case 'ja': return product.categoryId.nameJa || product.categoryId.name;
      default: return product.categoryId.nameEn || product.categoryId.name;
    }
  };

  // Fetch colors from API
  useEffect(() => {
    const loadColors = async () => {
      try {
        setColorsLoading(true);
        const response = await api.getColors({
          activeOnly: true,
          language: language as 'vi' | 'en' | 'ja'
        });
        setApiColors(response.colors || []);
      } catch (error) {
        console.error('Error loading colors:', error);
        // Fallback to empty array if API fails
        setApiColors([]);
      } finally {
        setColorsLoading(false);
      }
    };

    loadColors();
  }, [language]);

  // Helper function to get hex color from color name (with API fallback)
  const getColorHex = (colorName: string): string => {
    // Check if it's already a hex code
    if (/^#[0-9A-Fa-f]{6}$/.test(colorName) || /^#[0-9A-Fa-f]{3}$/.test(colorName)) {
      return colorName;
    }

    // Try to find color in API colors first
    if (apiColors.length > 0) {
      const normalizedName = colorName.trim();
      const colorInApi = apiColors.find(c =>
        c.name.toLowerCase() === normalizedName.toLowerCase() ||
        c.nameEn?.toLowerCase() === normalizedName.toLowerCase() ||
        c.nameJa?.toLowerCase() === normalizedName.toLowerCase()
      );

      if (colorInApi) {
        return colorInApi.hexValue;
      }
    }

    // Fallback to hardcoded color map if API colors not loaded yet
    const colorMap: { [key: string]: string } = {
      // Vietnamese colors
      'Đỏ': '#ef4444',
      'Xanh dương': '#3b82f6',
      'Xanh ngọc': '#06b6d4',
      'Xanh nhạt': '#93c5fd',
      'Xanh lá': '#22c55e',
      'Vàng': '#eab308',
      'Hồng': '#ec4899',
      'Pink': '#ec4899',
      'Tím': '#a855f7',
      'Cam': '#f97316',
      'Nâu': '#a16207',
      'Đen': '#000000',
      'Black': '#000000',
      'Trắng': '#ffffff',
      'White': '#ffffff',
      'Xám': '#6b7280',
      'Xám đậm': '#374151',
      'Xám nhạt': '#d1d5db',
      'Bạc': '#c0c0c0',
      'Vàng kim': '#ffd700',

      // English colors
      'Red': '#ef4444',
      'Blue': '#3b82f6',
      'Green': '#22c55e',
      'Yellow': '#eab308',
      'Purple': '#a855f7',
      'Orange': '#f97316',
      'Brown': '#a16207',
      'Gray': '#6b7280',
      'Grey': '#6b7280',
      'Silver': '#c0c0c0',
      'Gold': '#ffd700',

      // Japanese colors
      '赤': '#ef4444',
      '青': '#3b82f6',
      '緑': '#22c55e',
      '黄色': '#eab308',
      'ピンク': '#ec4899',
      '紫': '#a855f7',
      'オレンジ': '#f97316',
      '茶色': '#a16207',
      '黒': '#000000',
      '白': '#ffffff',
      '灰色': '#6b7280',
      '銀': '#c0c0c0',
      '金': '#ffd700'
    };

    // Check if it's already a hex code
    if (/^#[0-9A-Fa-f]{6}$/.test(colorName) || /^#[0-9A-Fa-f]{3}$/.test(colorName)) {
      return colorName;
    }

    // Check color map (case-insensitive)
    const normalizedName = colorName.trim();
    if (colorMap[normalizedName]) {
      return colorMap[normalizedName];
    }

    // Try case-insensitive search
    const lowerName = normalizedName.toLowerCase();
    for (const [key, value] of Object.entries(colorMap)) {
      if (key.toLowerCase() === lowerName) {
        return value;
      }
    }

    // Default fallback
    return '#6b7280';
  };

  // Helper function to get english display name for color
  const getColorDisplayName = (colorName: string): string => {
    // Check if it's already a hex code
    if (/^#[0-9A-Fa-f]{6}$/.test(colorName) || /^#[0-9A-Fa-f]{3}$/.test(colorName)) {
      return colorName;
    }

    // Try to find color in API colors first
    if (apiColors.length > 0) {
      const normalizedName = colorName.trim();
      const colorInApi = apiColors.find(c =>
        c.name.toLowerCase() === normalizedName.toLowerCase() ||
        c.nameEn?.toLowerCase() === normalizedName.toLowerCase() ||
        c.nameJa?.toLowerCase() === normalizedName.toLowerCase()
      );

      if (colorInApi && colorInApi.nameEn) {
        return colorInApi.nameEn;
      }
    }

    // Fallback translation map for common Vietnamese colors
    const enColorMap: { [key: string]: string } = {
      'Đỏ': 'Red',
      'Xanh dương': 'Blue',
      'Xanh da trời': 'Sky Blue',
      'Xanh lá': 'Green',
      'Xanh': 'Green',
      'Vàng': 'Yellow',
      'Hồng': 'Pink',
      'Tím': 'Purple',
      'Cam': 'Orange',
      'Nâu': 'Brown',
      'Đen': 'Black',
      'Trắng': 'White',
      'Xám': 'Gray',
      'Bạc': 'Silver',
      'Vàng kim': 'Gold',
      'Be': 'Beige',
      'Kem': 'Cream',
    };

    // Try exact or case-insensitive match
    const mapped = enColorMap[colorName] ||
      Object.entries(enColorMap).find(([k, v]) => k.toLowerCase() === colorName.toLowerCase())?.[1];

    if (mapped) return mapped;

    return colorName;
  };

  // Helper function to get color name and value
  const getColorInfo = (color: string | { name: string; value: string }): { name: string; value: string } => {
    if (typeof color === 'string') {
      // Check if color string is a hex code
      if (/^#[0-9A-Fa-f]{6}$/.test(color) || /^#[0-9A-Fa-f]{3}$/.test(color)) {
        return {
          name: color,
          value: color
        };
      }
      // Otherwise, treat as color name and get hex
      return {
        name: color,
        value: getColorHex(color)
      };
    }
    // If it's already an object
    return {
      name: color.name,
      value: color.value || getColorHex(color.name)
    };
  };

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Track view when loading product detail
        const response = await api.getProduct(id, true);
        setProduct(response.product);

        // Create media items from images and videos
        const media: MediaItem[] = [];

        // Add Cloudinary images first (priority)
        if (response.product.cloudinaryImages && response.product.cloudinaryImages.length > 0) {
          response.product.cloudinaryImages.forEach((cloudinaryImage, index) => {
            media.push({
              id: `cloudinary-image-${index}`,
              type: 'image',
              url: cloudinaryImage.responsiveUrls.large,
              alt: `${response.product.name} ${index + 1}`
            });
          });
        } else {
          // Fallback to legacy images
          response.product.images.forEach((image, index) => {
            media.push({
              id: `image-${index}`,
              type: 'image',
              url: image,
              alt: `${response.product.name} ${index + 1}`
            });
          });
        }

        // Add videos (if product has videos property)
        if (response.product.videos && Array.isArray(response.product.videos)) {
          response.product.videos.forEach((video, index) => {
            const videoUrl = video.secureUrl || video.url;
            if (!videoUrl) {
              return;
            }

            media.push({
              id: `video-${index}`,
              type: 'video',
              url: videoUrl,
              thumbnail: video.thumbnail || response.product.cloudinaryImages?.[0]?.responsiveUrls?.medium || response.product.images[0],
              alt: `${response.product.name} video ${index + 1}`
            });
          });
        }

        setMediaItems(media);

        // Set default selections
        if (response.product.sizes.length > 0) {
          setSelectedSize(response.product.sizes[0]);
        }
        if (response.product.colors.length > 0) {
          setSelectedColor(response.product.colors[0]);
        }

        // Load related products
        try {
          const relatedResponse = await api.getProducts({
            category: typeof response.product.categoryId === 'string'
              ? response.product.categoryId
              : response.product.categoryId._id,
            limit: 8
          });
          setRelatedProducts(relatedResponse.products.filter(p => p._id !== response.product._id));
        } catch (error) {
          console.error('Error loading related products:', error);
        }

        // Check if product is in wishlist
        if (isAuthenticated) {
          try {
            const wishlistResponse = await api.getWishlist();
            const wishlistProducts = Array.isArray(wishlistResponse) ? wishlistResponse : [];
            setIsInWishlist(wishlistProducts.some((item: Product | string) =>
              (typeof item === 'string' ? item : item._id) === response.product._id
            ));
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
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, toast, t.errorLoading, t.errorLoadingDesc, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      if (isAuthenticated) {
        // Authenticated user: use API
        await api.addToCart(product._id, quantity);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      } else {
        // Guest user: use localStorage
        guestCartService.addToCart(product, quantity, selectedSize, selectedColor);
        window.dispatchEvent(new CustomEvent('guestCartUpdated'));
      }

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
  };

  const handleAddToWishlist = async () => {
    if (!product) return;

    try {
      if (isAuthenticated) {
        // Authenticated user: use API
        if (isInWishlist) {
          await api.removeFromWishlist(product._id);
          setIsInWishlist(false);
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
          setIsInWishlist(true);
          toast({
            title: language === 'vi' ? "Đã thêm vào yêu thích" :
              language === 'ja' ? "お気に入りに追加されました" :
                "Added to Wishlist",
            description: language === 'vi' ? "Sản phẩm đã được thêm vào danh sách yêu thích" :
              language === 'ja' ? "商品がお気に入りに追加されました" :
                "Product has been added to wishlist",
          });
        }
        setRefreshWishlistTrigger(prev => prev + 1);
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      } else {
        // Guest user: use localStorage
        const isInGuestWishlist = guestWishlistService.isInWishlist(product._id);

        if (isInGuestWishlist) {
          guestWishlistService.removeFromWishlist(product._id);
          setIsInWishlist(false);
          toast({
            title: language === 'vi' ? "Đã xóa khỏi yêu thích" :
              language === 'ja' ? "お気に入りから削除されました" :
                "Removed from Wishlist",
            description: language === 'vi' ? "Sản phẩm đã được xóa khỏi danh sách yêu thích" :
              language === 'ja' ? "商品がお気に入りから削除されました" :
                "Product has been removed from wishlist",
          });
        } else {
          guestWishlistService.addToWishlist(product);
          setIsInWishlist(true);
          toast({
            title: language === 'vi' ? "Đã thêm vào yêu thích" :
              language === 'ja' ? "お気に入りに追加されました" :
                "Added to Wishlist",
            description: language === 'vi' ? "Sản phẩm đã được thêm vào danh sách yêu thích" :
              language === 'ja' ? "商品がお気に入りに追加されました" :
                "Product has been added to wishlist",
          });
        }
        window.dispatchEvent(new CustomEvent('guestWishlistUpdated'));
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
  };

  const handleAddToCompare = () => {
    if (!product) return;

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

    window.dispatchEvent(new CustomEvent('guestCompareUpdated'));

    toast({
      title: language === 'vi' ? "Đã thêm vào so sánh" :
        language === 'ja' ? "比較リストに追加" :
          "Added to Compare",
      description: language === 'vi' ? "Sản phẩm đã được thêm vào danh sách so sánh" :
        language === 'ja' ? "商品が比較リストに追加されました" :
          "Product has been added to compare list",
    });
  };

  const handleShare = (platform: string) => {
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
    setShareMenuOpen(false);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    return distribution;
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      if (isAuthenticated) {
        // Authenticated user: use API, then go to checkout
        await api.addToCart(product._id, quantity);
        window.dispatchEvent(new CustomEvent('cartUpdated'));

        toast({
          title: language === 'vi' ? "Đã thêm vào giỏ hàng" :
            language === 'ja' ? "カートに追加されました" :
              "Added to Cart",
          description: language === 'vi' ? "Sản phẩm đã được thêm vào giỏ hàng" :
            language === 'ja' ? "商品がカートに追加されました" :
              "Product has been added to cart",
        });
        navigate('/checkout');
      } else {
        // Guest user: add to localStorage cart, then redirect to login with checkout redirect
        guestCartService.addToCart(product, quantity, selectedSize, selectedColor);
        window.dispatchEvent(new CustomEvent('guestCartUpdated'));

        toast({
          title: language === 'vi' ? "Cần đăng nhập để thanh toán" :
            language === 'ja' ? "チェックアウトにはログインが必要です" :
              "Login Required for Checkout",
          description: language === 'vi' ? "Sản phẩm đã được thêm vào giỏ hàng. Vui lòng đăng nhập để thanh toán." :
            language === 'ja' ? "商品がカートに追加されました。チェックアウトするにはログインしてください。" :
              "Product added to cart. Please login to proceed to checkout.",
        });
        navigate('/login?redirect=/checkout');
      }
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-muted-foreground font-medium text-lg">{t.loading}</span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">

        <div className="container mx-auto px-4 py-8">
          <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <h1 className="text-2xl font-bold mb-4">Product not found</h1>
              <Button
                onClick={() => navigate('/')}
                className="rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {t.continueShopping}
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">


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
              onClick={() => setShareMenuOpen(!shareMenuOpen)}
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

      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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
                {product.stock <= 0 && (
                  <Badge variant="secondary" className="bg-stone-500/90 text-white">
                    {language === 'vi' ? 'Hết hàng' : language === 'ja' ? '在庫切れ' : 'Out of Stock'}
                  </Badge>
                )}

                {/* Sale Badge - Show when on sale and in stock */}
                {product.stock > 0 && product.onSale && product.originalPrice && product.originalPrice > product.price && (
                  <Badge variant="destructive" className="bg-red-500/90 text-white">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% {language === 'vi' ? 'GIẢM' : language === 'ja' ? 'セール' : 'OFF'}
                  </Badge>
                )}

                {/* Limited Edition Badge - Show when in stock */}
                {product.stock > 0 && product.isLimitedEdition && (
                  <Badge className="bg-purple-500/90 text-white">
                    {language === 'vi' ? 'Phiên bản giới hạn' : language === 'ja' ? '限定版' : 'Limited Edition'}
                  </Badge>
                )}

                {/* Featured Badge - Show when in stock */}
                {product.stock > 0 && product.isFeatured && (
                  <Badge variant="default" className="bg-stone-800/90 dark:bg-stone-200/90 text-white dark:text-stone-800">
                    {language === 'vi' ? 'Nổi bật' : language === 'ja' ? 'おすすめ' : 'Featured'}
                  </Badge>
                )}

                {/* New Badge - Show when in stock */}
                {product.stock > 0 && product.isNew && (
                  <Badge className="bg-green-500/90 text-white">
                    {language === 'vi' ? 'MỚI' : language === 'ja' ? '新着' : 'NEW'}
                  </Badge>
                )}

                {/* Best Seller Badge - Show when in stock */}
                {product.stock > 0 && product.isBestSeller && (
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
                    {product.salePrice && product.salePrice < product.price ? formatCurrency(product.salePrice, language) : formatCurrency(product.price, language)}
                  </span>
                  {product.salePrice && product.salePrice < product.price && (
                    <>
                      <span className="text-2xl text-muted-foreground line-through">
                        {formatCurrency(product.price, language)}
                      </span>
                      <Badge variant="destructive" className="text-sm">
                        -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                        {language === 'vi' ? ' GIẢM' : language === 'ja' ? ' セール' : ' OFF'}
                      </Badge>
                    </>
                  )}
                  {product.originalPrice && product.originalPrice > product.price && !product.salePrice && (
                    <>
                      <span className="text-2xl text-muted-foreground line-through">
                        {formatCurrency(product.originalPrice, language)}
                      </span>
                      <Badge variant="destructive" className="text-sm">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
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
                        onClick={() => setSelectedSize(size)}
                        className="min-w-[3rem] h-10"
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
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => {
                      if (!color) return null;

                      const colorInfo = getColorInfo(color);
                      let colorName: string;

                      if (typeof color === 'string') {
                        colorName = color;
                      } else if (typeof color === 'object' && 'name' in color) {
                        colorName = (color as { name: string; value?: string }).name;
                      } else {
                        colorName = String(color);
                      }

                      const isSelected = selectedColor === colorName;

                      return (
                        <button
                          key={colorName}
                          type="button"
                          onClick={() => setSelectedColor(colorName)}
                          className={`
                            relative flex flex-col items-center justify-center
                            w-14 h-14 rounded-full
                            border-2 transition-all duration-200
                            ${isSelected
                              ? 'border-primary ring-2 ring-primary ring-offset-2 scale-110'
                              : 'border-muted-foreground/30 hover:border-primary/50 hover:scale-105'
                            }
                            shadow-md hover:shadow-lg
                          `}
                          style={{
                            backgroundColor: colorInfo.value,
                          }}
                          title={colorInfo.name}
                        >
                          {/* White or black checkmark for contrast */}
                          {(colorInfo.value === '#ffffff' || colorInfo.value === '#FFFFFF' || colorInfo.value.toLowerCase() === '#ffffff') && isSelected && (
                            <CheckCircle className="h-5 w-5 text-gray-800" />
                          )}
                          {colorInfo.value !== '#ffffff' && colorInfo.value !== '#FFFFFF' && colorInfo.value.toLowerCase() !== '#ffffff' && isSelected && (
                            <CheckCircle className="h-5 w-5 text-white drop-shadow-lg" />
                          )}
                          {!isSelected && (
                            <span className="sr-only">{colorInfo.name}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {/* Show selected color name */}
                  {selectedColor && (
                    <p className="text-sm text-muted-foreground">
                      {language === 'vi' ? 'Đã chọn: ' : language === 'ja' ? '選択済み: ' : 'Selected: '}
                      <span className="font-medium text-foreground">{getColorDisplayName(selectedColor)}</span>
                    </p>
                  )}
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
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 py-2 h-10 rounded-l-lg rounded-r-none"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="px-4 py-2 min-w-[3rem] text-center font-medium border-x">
                      {quantity}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="px-3 py-2 h-10 rounded-r-lg rounded-l-none"
                    >
                      <Plus className="h-4 w-4" />
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
                  className="flex-1 h-12 text-base font-semibold"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.isActive}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {t.addToCart}
                </Button>

                <Button
                  variant="outline"
                  className="h-12 text-base font-semibold"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={!product.isActive}
                >
                  {t.buyNow}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddToWishlist}
                  className={`text-muted-foreground hover:text-primary ${isInWishlist ? 'text-red-500' : ''}`}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                  {isInWishlist ? 'Remove from Wishlist' : t.addToWishlist}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddToCompare}
                  className="text-muted-foreground hover:text-primary"
                >
                  <GitCompare className="h-4 w-4 mr-2" />
                  {t.addToCompare}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="description" className="text-sm font-medium">
                {t.description}
              </TabsTrigger>
              <TabsTrigger value="specifications" className="text-sm font-medium">
                {t.specifications}
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

                    {/* Key Features & Care Instructions */}
                    {(product.materials && product.materials.length > 0) || getCareInstructions() || getOrigin() ? (
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {product.materials && product.materials.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              {language === 'vi' ? 'Chất Liệu' : language === 'ja' ? '素材' : 'Materials'}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {product.materials.map((material, index) => (
                                <Badge key={index} variant="secondary" className="text-sm">
                                  {material}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-4">
                          {getOrigin() && (
                            <div>
                              <h4 className="font-semibold mb-2 text-foreground flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                {language === 'vi' ? 'Xuất Xứ' : language === 'ja' ? '原産国' : 'Origin'}
                              </h4>
                              <p className="text-sm text-muted-foreground">{getOrigin()}</p>
                            </div>
                          )}
                          {getCareInstructions() && (
                            <div>
                              <h4 className="font-semibold mb-2 text-foreground flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                {language === 'vi' ? 'Hướng Dẫn Bảo Quản' : language === 'ja' ? 'お手入れ方法' : 'Care Instructions'}
                              </h4>
                              <div className="text-sm text-muted-foreground">
                                <MarkdownRenderer
                                  content={getCareInstructions()}
                                  className="prose prose-sm max-w-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="h-5 w-5" />
                    {t.specifications}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                      {/* Category */}
                      <div className="flex justify-between py-3 border-b">
                        <span className="font-medium text-foreground">
                          {language === 'vi' ? 'Danh Mục' : language === 'ja' ? 'カテゴリ' : 'Category'}
                        </span>
                        <span className="text-muted-foreground">
                          {getCategoryName()}
                        </span>
                      </div>

                      {/* Stock */}
                      <div className="flex justify-between py-3 border-b">
                        <span className="font-medium text-foreground">
                          {language === 'vi' ? 'Tồn Kho' : language === 'ja' ? '在庫' : 'Stock'}
                        </span>
                        <span className="text-muted-foreground">
                          {product.stock} {language === 'vi' ? 'sản phẩm' : language === 'ja' ? '個' : 'items'}
                        </span>
                      </div>

                      {/* Dimensions */}
                      {product.dimensions && (product.dimensions.length > 0 || product.dimensions.width > 0 || product.dimensions.height > 0) && (
                        <div className="flex justify-between py-3 border-b">
                          <span className="font-medium text-foreground flex items-center gap-2">
                            <Ruler className="h-4 w-4" />
                            {language === 'vi' ? 'Kích Thước' : language === 'ja' ? 'サイズ' : 'Dimensions'}
                          </span>
                          <span className="text-muted-foreground">
                            {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                          </span>
                        </div>
                      )}

                      {/* Weight */}
                      {product.weight && product.weight > 0 && (
                        <div className="flex justify-between py-3 border-b">
                          <span className="font-medium text-foreground flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {language === 'vi' ? 'Trọng Lượng' : language === 'ja' ? '重量' : 'Weight'}
                          </span>
                          <span className="text-muted-foreground">{product.weight} kg</span>
                        </div>
                      )}

                      {/* SKU */}
                      {product.sku && (
                        <div className="flex justify-between py-3 border-b">
                          <span className="font-medium text-foreground">SKU</span>
                          <span className="text-muted-foreground font-mono text-sm">{product.sku}</span>
                        </div>
                      )}

                      {/* Barcode */}
                      {product.barcode && (
                        <div className="flex justify-between py-3 border-b">
                          <span className="font-medium text-foreground">
                            {language === 'vi' ? 'Mã Vạch' : language === 'ja' ? 'バーコード' : 'Barcode'}
                          </span>
                          <span className="text-muted-foreground font-mono text-sm">{product.barcode}</span>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Materials - Always show section */}
                      <div className="flex flex-col py-3 border-b">
                        <span className="font-medium text-foreground mb-2 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {language === 'vi' ? 'Chất Liệu' : language === 'ja' ? '素材' : 'Materials'}
                        </span>
                        {product.materials && Array.isArray(product.materials) && product.materials.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {product.materials.map((material, index) => {
                              const materialText = typeof material === 'string'
                                ? material
                                : (material && typeof material === 'object' && ('name' in material || 'value' in material))
                                  ? ((material as { name?: string; value?: string }).name || (material as { name?: string; value?: string }).value || String(material))
                                  : String(material);
                              return (
                                <Badge key={index} variant="secondary" className="text-sm">
                                  {materialText}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            {language === 'vi' ? 'Chưa có thông tin' : language === 'ja' ? '情報なし' : 'No information available'}
                          </span>
                        )}
                      </div>

                      {/* Origin */}
                      {getOrigin() && (
                        <div className="flex justify-between py-3 border-b">
                          <span className="font-medium text-foreground flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {language === 'vi' ? 'Xuất Xứ' : language === 'ja' ? '原産国' : 'Origin'}
                          </span>
                          <span className="text-muted-foreground">{getOrigin()}</span>
                        </div>
                      )}

                      {/* Care Instructions */}
                      {getCareInstructions() && (
                        <div className="flex flex-col py-3 border-b">
                          <span className="font-medium text-foreground mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {language === 'vi' ? 'Hướng Dẫn Bảo Quản' : language === 'ja' ? 'お手入れ方法' : 'Care Instructions'}
                          </span>
                          <span className="text-muted-foreground text-sm whitespace-pre-line">
                            {getCareInstructions()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Info Section */}
                  {(product.tags && product.tags.length > 0) && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold mb-3 text-foreground">
                        {language === 'vi' ? 'Thẻ' : language === 'ja' ? 'タグ' : 'Tags'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>


          </Tabs>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <Card key={relatedProduct._id} className="group cursor-pointer hover:shadow-lg transition-shadow rounded-md">
                <div className="aspect-square bg-muted rounded-t-md overflow-hidden">
                  <img
                    src={relatedProduct.images[0] || '/placeholder.svg'}
                    alt={language === 'vi' ? relatedProduct.name :
                      language === 'ja' ? (relatedProduct.nameJa || relatedProduct.name) :
                        (relatedProduct.nameEn || relatedProduct.name)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onClick={() => navigate(`/product/${relatedProduct.slug || relatedProduct._id}`)}
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
        </div>

        {/* Reviews Section - Moved below Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">{t.reviews} ({totalReviews})</h2>
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
                  <span className="text-muted-foreground">Based on {totalReviews} reviews</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingDistribution[rating - 1];
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
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

            {/* Review Input Form */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">
                  {language === 'vi' ? 'Viết đánh giá' : language === 'ja' ? 'レビューを書く' : 'Write a Review'}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {language === 'vi' ? 'Đánh giá chung' : language === 'ja' ? '総合評価' : 'Overall rating'}:
                    </span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="p-1 focus:outline-none transition-transform active:scale-95"
                        >
                          <Star
                            className={`h-6 w-6 ${star <= newReviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'vi' ? 'Tiêu đề' : language === 'ja' ? 'タイトル' : 'Title'}
                    </label>
                    <Input
                      placeholder={language === 'vi' ? 'Tóm tắt đánh giá của bạn' : language === 'ja' ? 'レビューの要約' : 'Summarize your review'}
                      value={newReviewTitle}
                      onChange={(e) => setNewReviewTitle(e.target.value)}
                    />
                  </div>

                  <Textarea
                    placeholder={language === 'vi' ? 'Chia sẻ trải nghiệm của bạn về sản phẩm này...' : language === 'ja' ? 'この製品についての経験を共有してください...' : 'Share your experience with this product...'}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview}
                    >
                      {isSubmittingReview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {language === 'vi' ? 'Gửi đánh giá' : language === 'ja' ? 'レビューを送信' : 'Submit Review'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Reviews */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {review.userId?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold">{review.userId?.name || (language === 'vi' ? 'Ẩn danh' : 'Anonymous')}</p>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(review.createdAt).toLocaleDateString(
                                language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US',
                                { year: 'numeric', month: 'long', day: 'numeric' }
                              )}
                            </span>
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
                        <h4 className="font-bold text-sm">{review.title}</h4>
                        <p className="text-muted-foreground">{review.comment}</p>
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => handleHelpfulReview(review._id)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Helpful ({review.helpful})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
