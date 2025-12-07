import { useState, useEffect } from "react";
import { Search, ShoppingBag, Menu, X, User, Globe, Heart, LogOut, Settings, Package, CreditCard, MapPin, Bell, LogIn, UserPlus, GitCompare, ChevronDown } from "lucide-react";
import EnhancedMobileMenu from "./EnhancedMobileMenu";
import AutocompleteSearch from "./AutocompleteSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api, Product, Category } from "@/lib/api";
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
import { useAuth } from "@/contexts";

interface HeaderProps {
  cartItemsCount: number;
  onSearch: (query: string) => void;
  refreshWishlistTrigger?: number; // Add this to trigger wishlist count refresh
}

const Header = ({ cartItemsCount, onSearch, refreshWishlistTrigger }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const { language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

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
        <div className="flex items-center min-w-[140px] lg:min-w-[160px]">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/koshino_logo_dark.png" 
              alt="KOSHIRO" 
              className="h-8 w-auto dark:hidden"
            />
            <img 
              src="/koshino_logo.png" 
              alt="KOSHIRO" 
              className="h-8 w-auto hidden dark:block"
            />
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight cursor-pointer hover:text-primary transition-colors duration-500">
              KOSHIRO
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
            
            {/* Hover Dropdown */}
            <div className="absolute top-full left-0 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-out transform translate-y-2 group-hover:translate-y-0 z-50">
              <div className="p-2">
                <div className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 mb-2">
                  Shop by Category
                </div>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <Link 
                      key={category._id} 
                      to={`/category/${category.slug}`} 
                      className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
                    >
                      {getCategoryName(category)}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                  <Link 
                    to="/categories" 
                    className="block px-3 py-2 text-sm font-medium text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
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
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItemsCount}
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
        cartItemsCount={cartItemsCount}
        wishlistCount={wishlistCount}
        onSearch={onSearch}
      />
    </header>
  );
};

export default Header;