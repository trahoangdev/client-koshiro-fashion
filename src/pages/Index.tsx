import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import EnhancedProductGrid from "@/components/EnhancedProductGrid";
import ProductCard from "@/components/ProductCard";
import FilterBar from "@/components/FilterBar";
import Cart from "@/components/Cart";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, Product, Category } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/types/cart";
import CloudinaryImage from "@/components/CloudinaryImage";

// Helper function to render category image
const renderCategoryImage = (category: Category) => {
  // Priority: Cloudinary images > Legacy image > Placeholder
  if (category.cloudinaryImages && category.cloudinaryImages.length > 0) {
    const cloudinaryImage = category.cloudinaryImages[0];
    return (
      <CloudinaryImage
        publicId={cloudinaryImage.publicId}
        secureUrl={cloudinaryImage.secureUrl}
        responsiveUrls={cloudinaryImage.responsiveUrls}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        size="medium"
        loading="lazy"
      />
    );
  }
  
  if (category.image) {
    return (
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    );
  }
  
  // Fallback to placeholder
  return (
    <img
      src="/placeholder.svg"
      alt={category.name}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
    />
  );
};

const Index = () => {
  const navigate = useNavigate();
  
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // View state
  const [showCart, setShowCart] = useState(false);
  
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.getProducts({ isActive: true, limit: 50 }),
          api.getCategories({ isActive: true })
        ]);
        
        logger.debug('Data loaded', { 
          productCount: productsResponse.products?.length || 0,
          categoryCount: categoriesResponse.categories?.length || 0
        });
        
        // Handle response structures
        const productsData = productsResponse.products || [];
        const categoriesData = categoriesResponse.categories || [];
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        logger.error('Error loading data', error);
        toast({
          title: language === 'vi' ? "Lỗi tải dữ liệu" : 
                 language === 'ja' ? "データ読み込みエラー" : 
                 "Data Loading Error",
          description: language === 'vi' ? "Không thể tải sản phẩm và danh mục" :
                       language === 'ja' ? "商品とカテゴリを読み込めませんでした" :
                       "Could not load products and categories",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast, language]);

  // Load cart from API if authenticated
  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        setCartItems([]);
        return;
      }

      try {
        const response = await api.getCart();
        if (response && response.items) {
          const cartItemsData = response.items.map((item: { 
            productId: string; 
            quantity: number; 
            size?: string; 
            color?: string; 
            product: Product; 
          }) => ({
            product: item.product,
            quantity: item.quantity,
            selectedColor: item.color || item.product.colors[0],
            selectedSize: item.size || item.product.sizes[0]
          }));
          setCartItems(cartItemsData);
        }
      } catch (error) {
        logger.error('Error loading cart', error);
        // Don't show error toast for cart loading as it's not critical
      }
    };

    loadCart();
  }, [isAuthenticated]);

  // Helper function to get product name in current language - memoized
  const getProductName = useCallback((product: Product) => {
    if (language === 'vi') return product.name;
    if (language === 'ja') return product.nameJa || product.name;
    return product.nameEn || product.name;
  }, [language]);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
    }
    
    return products.filter(product => {
      // Category filter
      if (selectedCategory !== 'all') {
        const categorySlug = typeof product.categoryId === 'string' 
          ? null 
          : product.categoryId?.slug;
        if (categorySlug !== selectedCategory) {
          return false;
        }
      }
      
      // Price filter
      if (selectedPriceRange !== 'all') {
        if (selectedPriceRange === 'under50' && product.price >= 50000) return false;
        if (selectedPriceRange === '50-100' && (product.price < 50000 || product.price > 100000)) return false;
        if (selectedPriceRange === 'over100' && product.price <= 100000) return false;
      }
      
      // Color filter
      if (selectedColor !== 'all' && !product.colors.includes(selectedColor)) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          product.name,
          product.nameEn, 
          product.nameJa,
          product.description,
          product.descriptionEn,
          product.descriptionJa
        ].filter(Boolean);
        return searchFields.some(field => field.toLowerCase().includes(query));
      }
      
      return true;
    });
  }, [products, selectedCategory, selectedPriceRange, selectedColor, searchQuery]);

  const addToCart = useCallback(async (product: Product) => {
    try {
      // For demo purposes, use default color and size
      const selectedColor = product.colors[0];
      const selectedSize = product.sizes[0];
      
      // Add to cart via API if authenticated
      if (isAuthenticated) {
        await api.addToCart(product._id, 1);
        // Dispatch custom event to notify Header to refresh cart count
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
      
      const existingItem = cartItems.find(item => 
        item.product._id === product._id && 
        item.selectedColor === selectedColor && 
        item.selectedSize === selectedSize
      );

      if (existingItem) {
        setCartItems(items => 
          items.map(item => 
            item === existingItem 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setCartItems(items => [...items, {
          product,
          quantity: 1,
          selectedColor,
          selectedSize
        }]);
      }

      toast({
        title: language === 'vi' ? "Đã thêm vào giỏ hàng" : 
               language === 'ja' ? "カートに追加されました" : 
               "Added to Cart",
        description: language === 'vi' ? `${getProductName(product)} đã được thêm vào giỏ hàng` :
                     language === 'ja' ? `${getProductName(product)}がカートに追加されました` :
                     `${getProductName(product)} has been added to your cart.`,
      });
    } catch (error) {
      logger.error('Error adding to cart', error);
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
  }, [isAuthenticated, language, toast, getProductName, cartItems]);

  const updateCartQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      // Note: removeFromCart will be defined below, but we need to handle this circular dependency
      // For now, we'll handle quantity 0 directly
      try {
        if (isAuthenticated) {
          const item = cartItems.find(item => 
            `${item.product._id}-${item.selectedColor}-${item.selectedSize}` === itemId
          );
          if (item) {
            await api.removeFromCart(item.product._id);
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('cartUpdated'));
            }, 100);
          }
        }
        setCartItems(items =>
          items.filter(item => 
            `${item.product._id}-${item.selectedColor}-${item.selectedSize}` !== itemId
          )
        );
      } catch (error) {
        logger.error('Error removing from cart', error);
      }
      return;
    }
    
    try {
      // Update cart via API if authenticated
      if (isAuthenticated) {
        const item = cartItems.find(item => 
          `${item.product._id}-${item.selectedColor}-${item.selectedSize}` === itemId
        );
        if (item) {
          await api.updateCartItem(item.product._id, quantity);
          
          // Wait a bit to ensure API call is complete, then dispatch event
          setTimeout(() => {
            logger.debug('Dispatching cartUpdated event (update quantity)');
            window.dispatchEvent(new CustomEvent('cartUpdated'));
          }, 100);
        }
      }
      
      setCartItems(items =>
        items.map(item =>
          `${item.product._id}-${item.selectedColor}-${item.selectedSize}` === itemId
            ? { ...item, quantity }
            : item
        )
      );
    } catch (error) {
      logger.error('Error updating cart quantity', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể cập nhật số lượng" :
                     language === 'ja' ? "数量を更新できませんでした" :
                     "Could not update quantity",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, language, toast, cartItems]);

  const removeFromCart = useCallback(async (itemId: string) => {
    try {
      // Remove from cart via API if authenticated
      if (isAuthenticated) {
        const item = cartItems.find(item => 
          `${item.product._id}-${item.selectedColor}-${item.selectedSize}` === itemId
        );
        if (item) {
          await api.removeFromCart(item.product._id);
          
          // Wait a bit to ensure API call is complete, then dispatch event
          setTimeout(() => {
            logger.debug('Dispatching cartUpdated event (remove item)');
            window.dispatchEvent(new CustomEvent('cartUpdated'));
          }, 100);
        }
      }
      
      setCartItems(items =>
        items.filter(item => 
          `${item.product._id}-${item.selectedColor}-${item.selectedSize}` !== itemId
        )
      );
    } catch (error) {
      logger.error('Error removing from cart', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể xóa khỏi giỏ hàng" :
                     language === 'ja' ? "カートから削除できませんでした" :
                     "Could not remove from cart",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, language, toast, cartItems]);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: language === 'vi' ? "Giỏ hàng trống" : 
               language === 'ja' ? "カートが空です" : 
               "Empty Cart",
        description: language === 'vi' ? "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán" :
                     language === 'ja' ? "チェックアウトする前に商品をカートに追加してください" :
                     "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: language === 'vi' ? "Cần đăng nhập" : 
               language === 'ja' ? "ログインが必要です" : 
               "Login Required",
        description: language === 'vi' ? "Vui lòng đăng nhập để tiếp tục thanh toán" :
                     language === 'ja' ? "チェックアウトを続行するにはログインしてください" :
                     "Please login to continue checkout",
        variant: "destructive",
      });
      return;
    }

    // Close cart sidebar
    setShowCart(false);
    
    // Navigate to checkout page
    navigate('/checkout');
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedColor('all');
    setSearchQuery('');
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addToWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      toast({
        title: language === 'vi' ? "Cần đăng nhập" : 
               language === 'ja' ? "ログインが必要です" : 
               "Login Required",
        description: language === 'vi' ? "Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích" :
                     language === 'ja' ? "お気に入りリストに商品を追加するにはログインしてください" :
                     "Please login to add products to wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.addToWishlist(product._id);
      
      toast({
        title: language === 'vi' ? "Đã thêm vào danh sách yêu thích" : 
               language === 'ja' ? "お気に入りに追加されました" : 
               "Added to Wishlist",
        description: language === 'vi' ? `${getProductName(product)} đã được thêm vào danh sách yêu thích` :
                     language === 'ja' ? `${getProductName(product)}がお気に入りに追加されました` :
                     `${getProductName(product)} has been added to wishlist`,
      });
    } catch (error) {
      logger.error('Error adding to wishlist', error);
      toast({
        title: language === 'vi' ? "Lỗi" : 
               language === 'ja' ? "エラー" : 
               "Error",
        description: language === 'vi' ? "Không thể thêm vào danh sách yêu thích" :
                     language === 'ja' ? "お気に入りに追加できませんでした" :
                     "Could not add to wishlist",
        variant: "destructive",
      });
    }
  };

  const addToCompare = (product: Product) => {
    const savedCompareList = localStorage.getItem('koshiro_compare_list');
    let compareList: Product[] = [];
    
    if (savedCompareList) {
      try {
        compareList = JSON.parse(savedCompareList);
      } catch (error) {
        logger.error('Error parsing compare list', error);
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
    
    toast({
      title: language === 'vi' ? "Đã thêm vào so sánh" : 
             language === 'ja' ? "比較リストに追加" : 
             "Added to Compare",
      description: language === 'vi' ? "Sản phẩm đã được thêm vào danh sách so sánh" :
                   language === 'ja' ? "商品が比較リストに追加されました" :
                   "Product has been added to compare list",
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <Header
        cartItemsCount={cartItemsCount}
        onSearch={setSearchQuery}
      />

      {/* Zen Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-stone-900">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/banners/banner-01.png"
            alt="Koshiro Fashion Background"
            className="w-full h-full object-cover object-center"
            loading="eager"
            fetchpriority="high"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900/70 via-stone-800/50 to-stone-900/70"></div>
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255 255 255) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
        </div>
        
        {/* Content */}
        <div className="container relative z-10 text-center">
          <div className="max-w-4xl mx-auto px-6">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div className="relative animate-logo-float">
                <img
                  src="/koshino_logo.png"
                  alt="Koshino Fashion Logo"
                  className="h-16 md:h-20 lg:h-24 w-auto opacity-90 hover:opacity-100 transition-all duration-300 animate-logo-glow"
                  loading="eager"
                  fetchpriority="high"
                />
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-white/10 rounded-full blur-xl scale-110 opacity-50 animate-pulse"></div>
              </div>
            </div>
            
            {/* Japanese-inspired Typography with Modern Touch */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-white mb-6">
                <span className="block font-extralight">
                  {language === 'vi' ? 'KOSHIRO' : language === 'ja' ? 'コシロ' : 'KOSHIRO'}
                </span>
                <span className="block text-2xl md:text-3xl lg:text-4xl font-light text-stone-200 mt-4 tracking-widest">
                  {language === 'vi' ? 'THỜI TRANG NHẬT BẢN' : 
                   language === 'ja' ? '日本ファッション' : 
                   'JAPANESE FASHION'}
                </span>
              </h1>
            </div>
            
            {/* Minimalist Description */}
            <p className="text-lg md:text-xl text-stone-200 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              {language === 'vi' ? 'Tìm kiếm sự cân bằng hoàn hảo giữa truyền thống và hiện đại' :
               language === 'ja' ? '伝統と現代の完璧なバランスを探す' :
               'Finding the perfect balance between tradition and modernity'}
            </p>
            
            {/* Modern Zen CTA Button */}
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/30 text-white hover:bg-white hover:text-stone-900 px-8 py-3 rounded-lg font-light tracking-wide transition-all duration-300 backdrop-blur-sm bg-white/10"
              onClick={() => {
                const collectionSection = document.querySelector('[data-section="collection"]');
                if (collectionSection) {
                  collectionSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              {language === 'vi' ? 'KHÁM PHÁ' : language === 'ja' ? '探す' : 'EXPLORE'}
            </Button>
          </div>
        </div>
        
        {/* Custom Scroll Wheel Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            {/* Mouse Body */}
            <div className="w-6 h-10 border-2 border-white/40 rounded-full bg-white/10 backdrop-blur-sm animate-scroll-wheel">
              {/* Scroll Wheel */}
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-white/80 rounded-full"></div>
              {/* Scroll Wheel Lines */}
              <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-white/60 rounded-full"></div>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-white/40 rounded-full"></div>
            </div>
            {/* Scroll Animation Lines */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-white/30 animate-scroll-indicator"></div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-white/20 animate-scroll-indicator" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-white/10 animate-scroll-indicator" style={{animationDelay: '0.6s'}}></div>
          </div>
        </div>
      </section>
      
      <main className="py-24">
        <div className="container space-y-32">

          {/* Philosophy Section - Zen Style */}
          <section className="relative py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-stone-900 dark:text-stone-100 mb-6 tracking-wide">
                  {language === 'vi' ? 'Triết Lý Thiết Kế' : 
                   language === 'ja' ? 'デザイン哲学' : 
                   'Design Philosophy'}
                </h2>
                <div className="w-20 h-px bg-stone-300 dark:bg-stone-700 mx-auto mb-8"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Zen */}
                <div className="group">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white dark:glassmorphism-dark border border-stone-200 dark:border-stone-700 flex items-center justify-center transition-all duration-500 group-hover:scale-110 modern-shadow">
                    <div className="w-8 h-8 border-2 border-stone-400 dark:border-stone-500 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-light text-stone-900 dark:text-stone-100 mb-4">
                    {language === 'vi' ? 'Zen' : language === 'ja' ? '禅' : 'Zen'}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                    {language === 'vi' ? 'Tìm kiếm sự cân bằng và hài hòa trong mọi thiết kế' :
                     language === 'ja' ? 'すべてのデザインでバランスと調和を求める' :
                     'Seeking balance and harmony in every design'}
                  </p>
                </div>

                {/* Wabi-sabi */}
                <div className="group">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white dark:glassmorphism-dark border border-stone-200 dark:border-stone-700 flex items-center justify-center transition-all duration-500 group-hover:scale-110 modern-shadow">
                    <div className="w-6 h-6 bg-stone-400 dark:bg-stone-500 rounded-full opacity-60"></div>
                  </div>
                  <h3 className="text-xl font-light text-stone-900 dark:text-stone-100 mb-4">
                    {language === 'vi' ? 'Wabi-sabi' : language === 'ja' ? '侘寂' : 'Wabi-sabi'}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                    {language === 'vi' ? 'Vẻ đẹp trong sự không hoàn hảo và tính tự nhiên' :
                     language === 'ja' ? '不完全さと自然さの中の美しさ' :
                     'Beauty in imperfection and naturalness'}
                  </p>
                </div>

                {/* Minimalism */}
                <div className="group">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white dark:glassmorphism-dark border border-stone-200 dark:border-stone-700 flex items-center justify-center transition-all duration-500 group-hover:scale-110 modern-shadow">
                    <div className="w-8 h-1 bg-stone-400 dark:bg-stone-500"></div>
                  </div>
                  <h3 className="text-xl font-light text-stone-900 dark:text-stone-100 mb-4">
                    {language === 'vi' ? 'Tối Giản' : language === 'ja' ? 'ミニマリズム' : 'Minimalism'}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                    {language === 'vi' ? 'Loại bỏ những gì không cần thiết, giữ lại bản chất' :
                     language === 'ja' ? '不要なものを取り除き、本質を保つ' :
                     'Removing the unnecessary, keeping the essential'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* New Arrivals - Zen Style */}
          <section className="relative">
            <div className="text-center mb-16">
              <div className="inline-block">
                <h2 className="text-3xl md:text-4xl font-light text-stone-900 dark:text-stone-100 mb-4 tracking-wide">
                  {language === 'vi' ? 'Sản Phẩm Mới' : language === 'ja' ? '新着商品' : 'New Arrivals'}
                </h2>
                <div className="w-16 h-px bg-stone-300 dark:bg-stone-700 mx-auto"></div>
              </div>
              <p className="text-stone-600 dark:text-stone-400 mt-6 max-w-xl mx-auto font-light">
                {language === 'vi' ? 'Những thiết kế mới nhất được tạo ra với tinh thần Wabi-sabi' :
                 language === 'ja' ? '侘寂の精神で作られた最新デザイン' :
                 'Latest designs created with the spirit of Wabi-sabi'}
              </p>
            </div>
            
            {(() => {
              const newProducts = products.filter(product => {
                const createdDate = new Date(product.createdAt || '');
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - createdDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 30;
              }).slice(0, 4);
              
              if (isLoading) {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="bg-stone-200 dark:bg-stone-700 aspect-square rounded-lg mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4"></div>
                          <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
              
              return newProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {newProducts.map((product, index) => (
                    <div 
                      key={product._id}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards',
                        opacity: 0,
                        transform: 'translateY(20px)'
                      }}
                    >
                      <ProductCard
                        product={product}
                        viewMode="grid"
                        onAddToCart={addToCart}
                        onAddToWishlist={addToWishlist}
                        onAddToCompare={addToCompare}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-stone-500 dark:text-stone-500 font-light">
                    {language === 'vi' ? 'Hiện tại không có sản phẩm mới' :
                     language === 'ja' ? '現在新着商品はありません' : 'No new arrivals currently available'}
                  </p>
                </div>
              );
            })()}
          </section>

          {/* Featured Categories - Zen Style */}
          <section className="relative py-20">
            <div className="text-center mb-16">
              <div className="inline-block">
                <h2 className="text-3xl md:text-4xl font-light text-stone-900 dark:text-stone-100 mb-4 tracking-wide">
                  {language === 'vi' ? 'Danh Mục Nổi Bật' : 
                   language === 'ja' ? '注目のカテゴリー' : 
                   'Featured Categories'}
                </h2>
                <div className="w-16 h-px bg-stone-300 dark:bg-stone-700 mx-auto"></div>
              </div>
              <p className="text-stone-600 dark:text-stone-400 mt-6 max-w-xl mx-auto font-light">
                {language === 'vi' ? 'Khám phá các bộ sưu tập được tuyển chọn cẩn thận' :
                 language === 'ja' ? '厳選されたコレクションをご覧ください' :
                 'Discover our carefully curated collections'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {isLoading ? (
                [...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-stone-200 dark:bg-stone-700 aspect-[4/3] rounded-lg"></div>
                  </div>
                ))
              ) : (
                categories.slice(0, 6).map((category, index) => (
                <div 
                  key={category._id}
                  className="group cursor-pointer"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                    opacity: 0,
                    transform: 'translateY(20px)'
                  }}
                  onClick={() => navigate(`/category/${category.slug}`)}
                >
                  <div className="relative overflow-hidden bg-white dark:glassmorphism-dark border border-stone-200 dark:border-stone-700 transition-all duration-500 modern-hover modern-shadow">
                    <div className="aspect-[4/3] relative">
                      {renderCategoryImage(category)}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="text-white text-xl font-light mb-2">
                          {language === 'vi' ? category.name : 
                           language === 'ja' ? category.nameJa || category.name : 
                           category.nameEn || category.name}
                        </h3>
                        <p className="text-white/80 text-sm font-light">
                          {language === 'vi' ? 'Khám phá bộ sưu tập' :
                           language === 'ja' ? 'コレクションを見る' :
                           'Explore collection'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
            
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/categories')}
                className="px-8 py-3 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all duration-300 font-light tracking-wide"
              >
                {language === 'vi' ? 'Xem Tất Cả Danh Mục' : 
                 language === 'ja' ? 'すべてのカテゴリーを見る' : 
                 'View All Categories'}
              </button>
            </div>
          </section>

          {/* Collection Section - Wabi-sabi Style */}
          <section data-section="collection" className="relative">
            <div className="text-center mb-16">
              <div className="inline-block">
                <h2 className="text-3xl md:text-4xl font-light text-stone-900 dark:text-stone-100 mb-4 tracking-wide">
                  {language === 'vi' ? 'Bộ Sưu Tập' : language === 'ja' ? 'コレクション' : 'Collection'}
                </h2>
                <div className="w-16 h-px bg-stone-300 dark:bg-stone-700 mx-auto"></div>
              </div>
              <p className="text-stone-600 dark:text-stone-400 mt-6 max-w-2xl mx-auto font-light">
                {language === 'vi' ? 'Mỗi sản phẩm đều kể một câu chuyện về vẻ đẹp không hoàn hảo' :
                 language === 'ja' ? '各商品は不完全な美しさについての物語を語る' :
                 'Each product tells a story about imperfect beauty'}
              </p>
            </div>

            {/* Minimalist Filter Bar */}
            <div className="mb-12">
              <FilterBar
                selectedCategory={selectedCategory}
                selectedPriceRange={selectedPriceRange}
                selectedColor={selectedColor}
                onCategoryChange={setSelectedCategory}
                onPriceRangeChange={setSelectedPriceRange}
                onColorChange={setSelectedColor}
                onClearFilters={clearFilters}
              />
            </div>

            {/* Products Grid */}
            <div>
            {isLoading ? (
              <div className="text-center py-20">
                <div className="relative">
                  <div className="w-12 h-12 border-2 border-stone-200 dark:border-stone-700 rounded-full mx-auto mb-6"></div>
                  <div className="w-12 h-12 border-2 border-stone-400 dark:border-stone-500 border-t-transparent rounded-full animate-spin absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                </div>
                <p className="text-stone-500 dark:text-stone-500 font-light animate-pulse">
                  {language === 'vi' ? 'Đang tải sản phẩm...' :
                   language === 'ja' ? '商品を読み込み中...' : 'Loading products...'}
                </p>
              </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-stone-500 dark:text-stone-500 font-light">
                    {language === 'vi' ? 'Không tìm thấy sản phẩm nào.' :
                     language === 'ja' ? '商品が見つかりません。' : 'No products found.'}
                  </p>
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
            </div>
          </section>

          {/* Newsletter Section - Modern Zen Style */}
          <section className="relative py-20 bg-stone-100 dark:modern-gradient-subtle">
            <div className="max-w-2xl mx-auto text-center">
              {/* Logo */}
              <div className="mb-8 flex justify-center">
                <div className="relative animate-newsletter-logo-float">
                  {/* Light mode: dark logo, Dark mode: light logo */}
                  <img
                    src="/koshino_logo_dark.png"
                    alt="Koshino Fashion Logo"
                    className="h-12 md:h-14 lg:h-16 w-auto opacity-80 hover:opacity-100 transition-all duration-300 animate-newsletter-logo-glow dark:hidden"
                    loading="lazy"
                  />
                  <img
                    src="/koshino_logo.png"
                    alt="Koshino Fashion Logo"
                    className="h-12 md:h-14 lg:h-16 w-auto opacity-80 hover:opacity-100 transition-all duration-300 animate-newsletter-logo-glow hidden dark:block"
                    loading="lazy"
                  />
                  {/* Subtle glow effect for both light and dark mode */}
                  <div className="absolute inset-0 bg-stone-900/10 dark:bg-white/10 rounded-full blur-lg scale-110 opacity-30 dark:opacity-50 animate-pulse"></div>
                </div>
              </div>
              
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-light text-stone-900 dark:text-stone-100 mb-6 tracking-wide">
                  {language === 'vi' ? 'Kết Nối Với Chúng Tôi' : 
                   language === 'ja' ? '私たちとつながる' : 
                   'Connect With Us'}
                </h2>
                <div className="w-20 h-px bg-stone-300 dark:bg-stone-700 mx-auto mb-8"></div>
                <p className="text-stone-600 dark:text-stone-400 font-light leading-relaxed">
                  {language === 'vi' ? 'Nhận thông tin về những thiết kế mới và câu chuyện đằng sau mỗi sản phẩm' :
                   language === 'ja' ? '新しいデザインと各商品の背景ストーリーについての情報を受け取る' :
                   'Receive updates on new designs and the stories behind each product'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={language === 'vi' ? 'Email của bạn' : language === 'ja' ? 'あなたのメール' : 'Your email'}
                  className="flex-1 px-4 py-3 bg-white dark:glassmorphism-dark border border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 placeholder-stone-500 dark:placeholder-stone-400 focus:outline-none focus:border-stone-500 dark:focus:border-stone-400 transition-colors duration-300 font-light rounded-lg"
                />
                <button className="px-6 py-3 modern-gradient text-white hover:opacity-90 transition-all duration-300 font-light tracking-wide rounded-lg modern-hover">
                  {language === 'vi' ? 'Đăng Ký' : language === 'ja' ? '登録' : 'Subscribe'}
                </button>
              </div>
            </div>
          </section>

          {/* Cart Toggle Button - Modern Zen Style */}
          {cartItemsCount > 0 && (
            <div className="fixed bottom-24 right-6 z-40">
              <Button
                onClick={() => setShowCart(!showCart)}
                size="lg"
                className="rounded-full modern-gradient text-white hover:opacity-90 modern-shadow-lg border-0 modern-hover"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                {language === 'vi' ? 'Giỏ Hàng' : language === 'ja' ? 'カート' : 'Cart'}
                <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">
                  {cartItemsCount}
                </Badge>
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          
          {/* Sidebar */}
          <div className="absolute right-0 top-0 h-full w-full sm:max-w-md bg-white dark:glassmorphism-dark modern-shadow-lg overflow-hidden transform transition-transform duration-300 ease-out border-l border-stone-200 dark:border-stone-700">
            <div className="h-full">
              <Cart
                cartItems={cartItems}
                onUpdateQuantity={updateCartQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={handleCheckout}
                onClose={() => setShowCart(false)}
              />
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Index;