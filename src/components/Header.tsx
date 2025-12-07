import { useState, useEffect, useCallback } from "react";
import { Search, ShoppingBag, Menu, X, User, Globe, Heart, LogOut, Settings, Package, CreditCard, MapPin, Bell, LogIn, UserPlus, GitCompare, ChevronDown } from "lucide-react";
import EnhancedMobileMenu from "./EnhancedMobileMenu";
import AutocompleteSearch from "./AutocompleteSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api, Product, Category } from "@/lib/api";
import { logger } from "@/lib/logger";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "@/components/ThemeToggle";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, useSettings } from "@/contexts";

interface HeaderProps {
  cartItemsCount: number;
  onSearch: (query: string) => void;
  refreshWishlistTrigger?: number; // Add this to trigger wishlist count refresh
}

const Header = ({ cartItemsCount: propCartItemsCount, onSearch, refreshWishlistTrigger }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(propCartItemsCount || 0);
  const [categories, setCategories] = useState<Category[]>([]);
  const { language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  
  const websiteName = settings?.websiteName || 'KOSHIRO';

  // Load cart count from API
  const loadCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }

    try {
      logger.debug('Loading cart count from API...');
      const response = await api.getCart();
      const items = response.items || [];
      // Calculate total quantity of all items
      const totalQuantity = items.reduce((sum: number, item: { quantity: number }) => sum + (item.quantity || 0), 0);
      logger.debug('Cart count loaded', { totalQuantity, itemCount: items.length });
      setCartCount(totalQuantity);
    } catch (error) {
      logger.error('Failed to load cart count', error);
      setCartCount(0);
    }
  }, [isAuthenticated]);

  // Load cart count on mount and when authenticated status changes
  useEffect(() => {
    loadCartCount();
  }, [loadCartCount]);

  // Setup event listeners early (before authentication check)
  // Use ref to avoid dependency on loadCartCount
  useEffect(() => {
    // Listen for custom cart update events
    const handleCartUpdate = () => {
      console.log('Cart updated event received, refreshing cart count...');
      // Call loadCartCount directly
      if (isAuthenticated) {
        loadCartCount();
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [isAuthenticated, loadCartCount]);

  // Refresh cart count periodically (every 5 seconds) and on storage events
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial load
    loadCartCount();

    // Set up interval to refresh cart count
    const interval = setInterval(loadCartCount, 5000);

    // Listen for storage events (when cart is updated in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' || e.key === 'token') {
        loadCartCount();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, loadCartCount]);

  // Sync with prop if provided (fallback for non-authenticated or server-side updates)
  // Only sync if prop is provided and different, but prioritize API-loaded cart count
  useEffect(() => {
    if (propCartItemsCount !== undefined && propCartItemsCount !== cartCount && !isAuthenticated) {
      console.log('Syncing cartCount with prop:', propCartItemsCount);
      setCartCount(propCartItemsCount);
    }
  }, [propCartItemsCount, cartCount, isAuthenticated]);

  // Load wishlist count
  useEffect(() => {
    const loadWishlistCount = async () => {
      if (!isAuthenticated) {
        setWishlistCount(0);
        return;
      }

      try {
        const response = await api.getWishlist();
        let wishlistData: Product[] = [];
        if (Array.isArray(response)) {
          wishlistData = response;
        } else if (response && typeof response === 'object') {
          const responseObj = response as unknown as Record<string, unknown>;
          if ('data' in responseObj && Array.isArray(responseObj.data)) {
            wishlistData = responseObj.data as Product[];
          } else if ('wishlist' in responseObj && Array.isArray(responseObj.wishlist)) {
            wishlistData = responseObj.wishlist as Product[];
          }
        }
        setWishlistCount(wishlistData.length);
      } catch (error) {
        console.error('Failed to load wishlist count:', error);
        setWishlistCount(0);
      }
    };

    loadWishlistCount();
  }, [isAuthenticated, refreshWishlistTrigger]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.getCategories();
        // Handle different response structures
        let categoriesData: Category[] = [];
        if (Array.isArray(response)) {
          categoriesData = response;
        } else if (response && typeof response === 'object') {
          const responseObj = response as unknown as Record<string, unknown>;
          if ('categories' in responseObj && Array.isArray(responseObj.categories)) {
            categoriesData = responseObj.categories as Category[];
          } else if ('data' in responseObj && Array.isArray(responseObj.data)) {
            categoriesData = responseObj.data as Category[];
          }
        }
        setCategories(categoriesData.slice(0, 8)); // Show only first 8 categories
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const translations = {
    en: {
      search: "Search products...",
      categories: "Categories",
      tops: "Tops",
      bottoms: "Bottoms", 
      accessories: "Accessories",
      kimono: "Kimono",
      yukata: "Yukata",
      hakama: "Hakama",
      sale: "Sale",
      account: "Account",
      cart: "Cart",
      profile: "Profile",
      orders: "Orders",
      addresses: "Addresses",
      payment: "Payment",
      notifications: "Notifications",
      settings: "Settings",
      logout: "Logout",
      login: "Login",
      register: "Register",
      guest: "Guest",
      wishlist: "Wishlist",
      about: "About",
      contact: "Contact"
    },
    vi: {
      search: "Tìm kiếm sản phẩm...",
      categories: "Danh mục",
      tops: "Áo",
      bottoms: "Quần",
      accessories: "Phụ kiện",
      kimono: "Kimono",
      yukata: "Yukata", 
      hakama: "Hakama",
      sale: "Khuyến mãi",
      account: "Tài khoản",
      cart: "Giỏ hàng",
      profile: "Hồ sơ",
      orders: "Đơn hàng",
      addresses: "Địa chỉ",
      payment: "Thanh toán",
      notifications: "Thông báo",
      settings: "Cài đặt",
      logout: "Đăng xuất",
      login: "Đăng nhập",
      register: "Đăng ký",
      guest: "Khách",
      wishlist: "Danh sách yêu thích",
      about: "Giới thiệu",
      contact: "Liên hệ"
    },
    ja: {
      search: "商品を検索...",
      categories: "カテゴリ",
      tops: "トップス",
      bottoms: "ボトムス",
      accessories: "アクセサリー",
      kimono: "着物",
      yukata: "浴衣",
      hakama: "袴",
      sale: "セール",
      account: "アカウント", 
      cart: "カート",
      profile: "プロフィール",
      orders: "注文",
      addresses: "住所",
      payment: "支払い",
      notifications: "通知",
      settings: "設定",
      logout: "ログアウト",
      login: "ログイン",
      register: "登録",
      guest: "ゲスト",
      wishlist: "ほしい物リスト",
      about: "会社概要",
      contact: "お問い合わせ"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Helper function to get category name based on language
  const getCategoryName = (category: Category) => {
    switch (language) {
      case 'vi': return category.nameEn || category.name; // Use English name for Vietnamese
      case 'ja': return category.nameJa || category.name;
      default: return category.nameEn || category.name;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-6 lg:px-8 xl:px-12">
        {/* Logo - Better spacing */}
        <div className="flex items-center min-w-0 flex-shrink-0">
          <Link to="/" className="flex items-center space-x-3 min-w-0 flex-shrink-0">
            <div className="flex-shrink-0">
              <img 
                key={`logo-light-${settings?.logoUrl || 'default'}`}
                src={settings?.logoUrl || "/koshino_logo_dark.png"} 
                alt={websiteName} 
                className="h-8 w-auto max-w-[120px] object-contain dark:hidden"
                style={{ imageRendering: 'auto' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/koshino_logo_dark.png";
                }}
              />
              <img 
                key={`logo-dark-${settings?.logoUrl || 'default'}`}
                src={settings?.logoUrl || "/koshino_logo.png"} 
                alt={websiteName} 
                className="h-8 w-auto max-w-[120px] object-contain hidden dark:block"
                style={{ imageRendering: 'auto' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/koshino_logo.png";
                }}
              />
            </div>
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors duration-500 whitespace-nowrap overflow-hidden text-ellipsis">
              {websiteName}
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation - Better spacing */}
        <nav className="hidden lg:flex items-center space-x-6 flex-1 justify-center max-w-[480px] mx-8">
          <Link to="/products">
            <Button variant="ghost" className="font-medium text-base hover:text-primary transition-colors duration-300 px-3 py-2">
              {language === 'vi' ? 'Sản Phẩm' : language === 'ja' ? '商品' : 'Products'}
            </Button>
          </Link>
          <div className="relative group">
            <Button variant="ghost" className="font-medium text-base hover:text-primary transition-colors duration-300 px-3 py-2">
              {t.categories}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            
            {/* Hover Dropdown - Synced with UI/UX design system */}
            <div className="absolute top-full left-0 w-64 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform translate-y-2 group-hover:translate-y-0 z-50 backdrop-blur-sm">
              <div className="p-2">
                {/* Header with separator */}
                <div className="px-3 py-2 mb-2">
                  <h3 className="text-sm font-semibold text-popover-foreground mb-2">
                    Shop by Category
                  </h3>
                  <div className="h-px bg-border/50"></div>
                </div>
                
                {/* Category List */}
                <div className="space-y-0.5">
                  {categories.map((category) => (
                    <Link 
                      key={category._id} 
                      to={`/category/${category.slug}`} 
                      className="block px-3 py-2 text-sm text-popover-foreground/90 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors duration-200 font-normal"
                    >
                      {getCategoryName(category)}
                    </Link>
                  ))}
                </div>
                
                {/* Footer with separator and View All */}
                <div className="mt-2 pt-2">
                  <div className="h-px bg-border/50 mb-2"></div>
                  <Link 
                    to="/categories" 
                    className="block px-3 py-2 text-sm font-semibold text-primary hover:bg-accent hover:text-accent-foreground rounded-md transition-colors duration-200"
                  >
                    View All Categories
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <Link to="/sale">
            <Button variant="ghost" className="font-medium text-base hover:text-primary transition-colors duration-300 px-4 py-2">{t.sale}</Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" className="font-medium text-base hover:text-primary transition-colors duration-300 px-4 py-2">{t.about}</Button>
          </Link>
        </nav>

        {/* Search - Better positioning */}
        <div className="hidden lg:flex flex-1 max-w-[360px] mx-6">
          <AutocompleteSearch
            onSearch={onSearch}
            placeholder={t.search}
            showHistory={true}
            showSuggestions={true}
          />
        </div>

        {/* Right section - Better spacing */}
        <div className="flex items-center space-x-4 lg:space-x-5 min-w-[220px] lg:min-w-[240px] justify-end">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-primary/10 transition-colors duration-300">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('vi')}>
                Tiếng Việt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('ja')}>
                日本語
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <div className="h-10 w-10 flex items-center justify-center">
            <ThemeToggle />
          </div>

          {/* Wishlist */}
          <Link to="/wishlist">
            <Button variant="ghost" size="icon" className="hidden lg:flex relative h-10 w-10 hover:bg-primary/10 transition-colors duration-300">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {wishlistCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Compare */}
          <Link to="/compare">
            <Button variant="ghost" size="icon" className="hidden lg:flex h-10 w-10 hover:bg-primary/10 transition-colors duration-300">
              <GitCompare className="h-5 w-5" />
            </Button>
          </Link>

          {/* Account */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex h-10 w-10 hover:bg-primary/10 transition-colors duration-300">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex items-center">
                      <Avatar className="mr-2">
                        <AvatarFallback>{getUserInitials(user?.name || '')}</AvatarFallback>
                      </Avatar>
                      {user?.name}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Package className="mr-2 h-4 w-4" />
                    {t.profile}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                    <Heart className="mr-2 h-4 w-4" />
                    {t.wishlist}
                    {wishlistCount > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {wishlistCount}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?section=orders')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t.orders}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/order-tracking')}>
                    <Package className="mr-2 h-4 w-4" />
                    Order Tracking
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?section=addresses')}>
                    <MapPin className="mr-2 h-4 w-4" />
                    {t.addresses}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?section=payment')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t.payment}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?section=notifications')}>
                    <Bell className="mr-2 h-4 w-4" />
                    {t.notifications}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile?section=settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t.settings}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t.logout}
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>{t.guest}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/login')}>
                    <LogIn className="mr-2 h-4 w-4" />
                    {t.login}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/register')}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t.register}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Link to="/cart">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative h-10 w-10 hover:bg-primary/10 transition-colors duration-300"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center font-medium z-0 shadow-lg"
                  title={`${cartCount} items in cart`}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-10 w-10 hover:bg-primary/10 transition-colors duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile/Tablet Navigation Bar */}
      <div className="lg:hidden border-t bg-background/95 backdrop-blur">
        <div className="container px-4 lg:px-6 py-4">
          <nav className="flex items-center justify-between space-x-2">
            <Link to="/products">
              <Button variant="ghost" size="sm" className="text-sm hover:text-primary transition-colors px-3">
                {language === 'vi' ? 'Sản Phẩm' : language === 'ja' ? '商品' : 'Products'}
              </Button>
            </Link>
            <Link to="/categories">
              <Button variant="ghost" size="sm" className="text-sm hover:text-primary transition-colors px-3">
                {t.categories}
              </Button>
            </Link>
            <Link to="/sale">
              <Button variant="ghost" size="sm" className="text-sm hover:text-primary transition-colors px-3">{t.sale}</Button>
            </Link>
            <Link to="/wishlist" className="md:hidden">
              <Button variant="ghost" size="sm" className="relative text-sm hover:text-primary transition-colors px-3">
                <Heart className="h-4 w-4 mr-1" />
                {wishlistCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Link to="/compare" className="md:hidden">
              <Button variant="ghost" size="sm" className="text-sm hover:text-primary transition-colors px-3">
                <GitCompare className="h-4 w-4 mr-1" />
              </Button>
            </Link>
          </nav>
          
          {/* Mobile Search */}
          <div className="mt-4">
            <AutocompleteSearch
              onSearch={onSearch}
              placeholder={t.search}
              showHistory={true}
              showSuggestions={true}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      <EnhancedMobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        cartItemsCount={cartCount}
        wishlistCount={wishlistCount}
        onSearch={onSearch}
      />
    </header>
  );
};

export default Header;