import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Menu,
  Search,
  Home,
  ShoppingBag,
  Heart,
  User,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  ChevronRight,
  ShoppingCart,
  Package,
  CreditCard,
  MapPin,
  Bell,
  GitCompare,
  Globe,
  Star,
  Percent,
  Phone,
  Info,
  ChevronDown,
  Sparkles,
  Gift,
  Shield,
  Truck,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { logger } from '@/lib/logger';

interface EnhancedMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  cartItemsCount: number;
  wishlistCount: number;
  onSearch: (query: string) => void;
}

const EnhancedMobileMenu: React.FC<EnhancedMobileMenuProps> = ({
  isOpen,
  onClose,
  cartItemsCount,
  wishlistCount,
  onSearch
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const response = await api.getCategories();
        const categoriesArray = Array.isArray(response) ? response : response.categories || [];
        setCategories(categoriesArray.slice(0, 6)); // Limit to 6 categories for mobile
      } catch (error) {
        logger.error('Failed to load categories', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Close menu on escape key and manage body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift

      // Add menu-open class to body for additional styling if needed
      document.body.classList.add('mobile-menu-open');
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('mobile-menu-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isOpen, onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
      setSearchQuery('');
    }
  };

  const handleLinkClick = () => {
    onClose();
    setActiveSection(null);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  // Translations moved to global LanguageContext
  // Flags for UI rendering


  if (!isOpen) {
    return null;
  }

  return createPortal(
    <>
      {/* Enhanced Backdrop with stronger blur effect */}
      <div
        className="mobile-menu-backdrop fixed inset-0 bg-black/80 dark:bg-black/90 backdrop-blur-md lg:hidden z-[999]"
        onClick={onClose}
        style={{
          animation: 'fadeIn 300ms ease-out',
          opacity: 1
        }}
      />

      {/* Enhanced Menu with improved animations and darker background */}
      <div
        className="mobile-menu-panel fixed top-0 right-0 h-[100dvh] w-full max-w-[340px] bg-gradient-to-br from-background via-background to-stone-50/50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950/95 backdrop-blur-xl border-l border-stone-200/60 dark:border-stone-700/60 shadow-2xl lg:hidden overflow-hidden z-[1000]"
        style={{
          transform: 'translateX(0)',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Enhanced Header with gradient */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200/60 dark:border-stone-700/60 bg-gradient-to-r from-stone-50 via-primary/10 to-stone-50 dark:from-stone-800 dark:via-primary/10 dark:to-stone-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20">
              <Menu className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {t('menu')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 rounded-xl hover:scale-110 relative"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full overflow-hidden">
          {/* Enhanced Search with focus effects */}
          <div className="p-4 border-b border-stone-200/60 dark:border-stone-700/60 flex-shrink-0 bg-gradient-to-r from-stone-50/50 to-transparent dark:from-stone-800/50">
            <form onSubmit={handleSearch}>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-all duration-300 group-focus-within:text-primary group-focus-within:scale-110 z-10" />
                <Input
                  type="search"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={cn(
                    "pl-10 pr-4 py-2 text-sm rounded-xl border-2 transition-all duration-300 bg-white dark:bg-stone-800 border-stone-200/60 dark:border-stone-700/60",
                    searchFocused
                      ? "border-primary shadow-lg shadow-primary/20 scale-[1.02] focus:border-primary"
                      : "hover:border-primary/50 hover:scale-[1.01]"
                  )}
                />
                {searchQuery && (
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:scale-110 shadow-md p-0"
                  >
                    <Zap className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Enhanced User Section with improved animations */}
          {isAuthenticated ? (
            <div className="p-4 border-b border-stone-200/60 dark:border-stone-700/60 flex-shrink-0">
              <div className="flex items-center space-x-3 mb-4 p-3 bg-gradient-to-br from-white via-white to-stone-50/50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900/50 rounded-xl border border-stone-200/60 dark:border-stone-700/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <Avatar className="h-14 w-14 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300 rounded-xl">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-bold rounded-xl">
                    {getUserInitials(user?.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate text-foreground">{user?.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-3 w-3 text-yellow-500 mr-1 animate-pulse" />
                    <span className="text-xs text-muted-foreground">{t('premiumMember')}</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Quick Stats with hover effects */}
              <div className="grid grid-cols-2 gap-4">
                <Link to="/cart" onClick={handleLinkClick}>
                  <div className="group flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-white via-white to-stone-50/50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900/50 rounded-xl hover:shadow-lg transition-all duration-300 border border-stone-200/60 dark:border-stone-700/60 hover:scale-105 hover:border-primary/50">
                    <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-all duration-300 group-hover:scale-110">
                      <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t('cart')}</span>
                    {cartItemsCount > 0 && (
                      <Badge variant="destructive" className="h-6 w-6 text-xs p-0 flex items-center justify-center rounded-full animate-pulse group-hover:scale-110 transition-transform duration-300">
                        {cartItemsCount > 99 ? '99+' : cartItemsCount}
                      </Badge>
                    )}
                  </div>
                </Link>
                <Link to="/wishlist" onClick={handleLinkClick}>
                  <div className="group flex flex-col items-center space-y-2 p-4 bg-gradient-to-br from-white via-white to-stone-50/50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900/50 rounded-xl hover:shadow-lg transition-all duration-300 border border-stone-200/60 dark:border-stone-700/60 hover:scale-105 hover:border-primary/50">
                    <div className="p-2 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-all duration-300 group-hover:scale-110">
                      <Heart className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{t('wishlist')}</span>
                    {wishlistCount > 0 && (
                      <Badge variant="secondary" className="h-6 w-6 text-xs p-0 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform duration-300">
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </Badge>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-stone-200/60 dark:border-stone-700/60 space-y-3 flex-shrink-0">
              <div className="text-center mb-4">
                <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl w-14 h-14 mx-auto mb-2 flex items-center justify-center border border-primary/20">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-0.5 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {t('welcomeKoshiro')}
                </h3>
                <p className="text-xs text-muted-foreground">{t('signInAccess')}</p>
              </div>
              <Link to="/login" onClick={handleLinkClick}>
                <Button className="w-full justify-center h-10 text-sm font-semibold rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  {t('Signin')}
                </Button>
              </Link>
              <Link to="/register" onClick={handleLinkClick}>
                <Button variant="outline" className="w-full justify-center h-10 text-sm font-semibold rounded-lg border-2 border-stone-200/60 dark:border-stone-700/60 hover:bg-primary/5 hover:border-primary transition-all duration-300 hover:scale-105" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('Signup')}
                </Button>
              </Link>
            </div>
          )}

          {/* Enhanced Navigation - Scrollable Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden mobile-menu-scroll">
            <div className="p-4 space-y-3 pb-8">
              {/* Main Navigation with enhanced animations */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {t('mainMenu')}
                </h4>

                <Link to="/" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-primary/20">
                    <div className="p-1.5 bg-green-500/10 rounded-lg mr-3 group-hover:bg-green-500/20 transition-all duration-300 group-hover:scale-110 border border-green-500/20">
                      <Home className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    {t('home')}
                  </Button>
                </Link>

                {/* Enhanced Categories with improved animations */}
                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-primary/20"
                    onClick={() => setActiveSection(activeSection === 'categories' ? null : 'categories')}
                  >
                    <div className="flex items-center">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg mr-3 group-hover:bg-blue-500/20 transition-all duration-300 group-hover:scale-110 border border-blue-500/20">
                        <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      {t('categories')}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-all duration-300 group-hover:scale-110",
                        activeSection === 'categories' && "rotate-180"
                      )}
                    />
                  </Button>

                  {/* Enhanced Categories Submenu */}
                  <div className={cn(
                    "overflow-hidden transition-all duration-500 ease-out",
                    activeSection === 'categories' ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
                  )}>
                    <div className="ml-4 space-y-1 p-2 bg-gradient-to-br from-white via-white to-stone-50/50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900/50 rounded-xl border border-stone-200/60 dark:border-stone-700/60 backdrop-blur-sm">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <>
                          {categories.map((category, index) => (
                            <Link key={category._id} to={`/category/${category.slug}`} onClick={handleLinkClick}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-xs h-9 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:scale-[1.02]"
                                style={{ animationDelay: `${index * 50}ms` }}
                              >
                                <div className="w-1.5 h-1.5 bg-primary/50 rounded-full mr-2 animate-pulse"></div>
                                {category.name}
                              </Button>
                            </Link>
                          ))}
                          <Link to="/categories" onClick={handleLinkClick}>
                            <Button variant="ghost" className="w-full justify-start text-xs h-9 rounded-lg hover:bg-primary/10 font-medium text-primary transition-all duration-300 hover:scale-[1.02]">
                              <ChevronRight className="h-3 w-3 mr-2" />
                              {t('viewAll')}
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Link to="/sale" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-between h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-primary/20">
                    <div className="flex items-center">
                      <div className="p-1.5 bg-red-500/10 rounded-lg mr-3 group-hover:bg-red-500/20 transition-all duration-300 group-hover:scale-110 border border-red-500/20">
                        <Percent className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      {t('sale')}
                    </div>
                    <Badge variant="destructive" className="animate-pulse font-semibold h-5 px-1.5 text-[10px] group-hover:scale-110 transition-transform duration-300 rounded-full">
                      {language === 'vi' ? 'NÓNG' : language === 'ja' ? 'ホット' : 'HOT'}
                    </Badge>
                  </Button>
                </Link>

                <Link to="/about" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-primary/20">
                    <div className="p-1.5 bg-purple-500/10 rounded-lg mr-3 group-hover:bg-purple-500/20 transition-all duration-300 group-hover:scale-110 border border-purple-500/20">
                      <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    {t('about')}
                  </Button>
                </Link>

                <Link to="/contact" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-primary/20">
                    <div className="p-1.5 bg-orange-500/10 rounded-lg mr-3 group-hover:bg-orange-500/20 transition-all duration-300 group-hover:scale-110 border border-orange-500/20">
                      <Phone className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    {t('contact')}
                  </Button>
                </Link>
              </div>

              <Separator className="my-4" />

              {/* Enhanced Quick Actions Section */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {t('quickActions')}
                </h4>

                <div className="grid grid-cols-2 gap-2">
                  <Link to="/reviews" onClick={handleLinkClick}>
                    <div className="group flex flex-col items-center space-y-1.5 p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-xl hover:shadow-lg transition-all duration-300 border border-yellow-200 dark:border-yellow-800 hover:scale-105 hover:bg-gradient-to-br hover:from-yellow-100 hover:to-yellow-200 dark:hover:from-yellow-900 dark:hover:to-yellow-800">
                      <div className="p-1.5 bg-yellow-500/10 rounded-full group-hover:bg-yellow-500/20 transition-all duration-300 group-hover:scale-110">
                        <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <span className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">{t('reviews')}</span>
                    </div>
                  </Link>

                  <Link to="/order-tracking" onClick={handleLinkClick}>
                    <div className="group flex flex-col items-center space-y-1.5 p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl hover:shadow-lg transition-all duration-300 border border-green-200 dark:border-green-800 hover:scale-105 hover:bg-gradient-to-br hover:from-green-100 hover:to-green-200 dark:hover:from-green-900 dark:hover:to-green-800">
                      <div className="p-1.5 bg-green-500/10 rounded-full group-hover:bg-green-500/20 transition-all duration-300 group-hover:scale-110">
                        <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-xs font-semibold text-green-900 dark:text-green-100">{t('trackOrder')}</span>
                    </div>
                  </Link>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Enhanced User Menu (if authenticated) */}
              {isAuthenticated && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                    {t('account')}
                  </h4>

                  <Link to="/profile" onClick={handleLinkClick}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-primary/20">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg mr-3 group-hover:bg-blue-500/20 transition-all duration-300 group-hover:scale-110 border border-blue-500/20">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      {t('profile')}
                    </Button>
                  </Link>

                  <Link to="/profile/orders" onClick={handleLinkClick}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-primary/20">
                      <div className="p-1.5 bg-green-500/10 rounded-lg mr-3 group-hover:bg-green-500/20 transition-all duration-300 group-hover:scale-110 border border-green-500/20">
                        <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      {t('orders')}
                    </Button>
                  </Link>

                  <Link to="/profile/addresses" onClick={handleLinkClick}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-primary/20">
                      <div className="p-1.5 bg-purple-500/10 rounded-lg mr-3 group-hover:bg-purple-500/20 transition-all duration-300 group-hover:scale-110 border border-purple-500/20">
                        <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      {t('addresses')}
                    </Button>
                  </Link>

                  <Link to="/profile/payment" onClick={handleLinkClick}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-primary/20">
                      <div className="p-1.5 bg-yellow-500/10 rounded-lg mr-3 group-hover:bg-yellow-500/20 transition-all duration-300 group-hover:scale-110 border border-yellow-500/20">
                        <CreditCard className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      {t('payment')}
                    </Button>
                  </Link>

                  <Link to="/compare" onClick={handleLinkClick}>
                    <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-primary/20">
                      <div className="p-1.5 bg-indigo-500/10 rounded-lg mr-3 group-hover:bg-indigo-500/20 transition-all duration-300 group-hover:scale-110 border border-indigo-500/20">
                        <GitCompare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      {t('compare')}
                    </Button>
                  </Link>

                  <Separator className="my-3" />

                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 text-sm font-medium rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-destructive/20"
                    onClick={handleLogout}
                  >
                    <div className="p-1.5 bg-red-500/10 rounded-lg mr-3 group-hover:bg-red-500/20 transition-all duration-300 group-hover:scale-110 border border-red-500/20">
                      <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    {t('signOut')}
                  </Button>
                </div>
              )}

              {isAuthenticated && <Separator className="my-4" />}

              {/* Enhanced Help & Support Section */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {t('helpSupport')}
                </h4>

                <Link to="/size-guide" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02]">
                    <div className="p-1.5 bg-cyan-500/10 rounded-lg mr-3 group-hover:bg-cyan-500/20 transition-all duration-300 group-hover:scale-110">
                      <Settings className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    {t('sizeGuide')}
                  </Button>
                </Link>

                <Link to="/faq" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02]">
                    <div className="p-1.5 bg-teal-500/10 rounded-lg mr-3 group-hover:bg-teal-500/20 transition-all duration-300 group-hover:scale-110">
                      <Info className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    {t('faq')}
                  </Button>
                </Link>

                <Link to="/shipping-info" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02]">
                    <div className="p-1.5 bg-slate-500/10 rounded-lg mr-3 group-hover:bg-slate-500/20 transition-all duration-300 group-hover:scale-110">
                      <Truck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    {t('shippingInfo')}
                  </Button>
                </Link>

                <Link to="/return-policy" onClick={handleLinkClick}>
                  <Button variant="ghost" className="w-full justify-start h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02]">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg mr-3 group-hover:bg-amber-500/20 transition-all duration-300 group-hover:scale-110">
                      <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    {t('returnPolicy')}
                  </Button>
                </Link>
              </div>

              <Separator className="my-4" />

              {/* Enhanced Language Selector */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {t('settings')}
                </h4>

                <div>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-12 text-sm font-medium rounded-xl hover:bg-primary/10 transition-all duration-300 group hover:scale-[1.02] border border-transparent hover:border-primary/20"
                    onClick={() => setActiveSection(activeSection === 'language' ? null : 'language')}
                  >
                    <div className="flex items-center">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg mr-3 group-hover:bg-emerald-500/20 transition-all duration-300 group-hover:scale-110 border border-emerald-500/20">
                        <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      {t('language')}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-gradient-to-br from-white via-white to-stone-50/50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900/50 rounded-full border border-stone-200/60 dark:border-stone-700/60 backdrop-blur-sm">
                        <span className="text-base">
                          {languages.find(l => l.code === language)?.flag}
                        </span>
                        <span className="text-[10px] font-medium">
                          {languages.find(l => l.code === language)?.code?.toUpperCase()}
                        </span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-all duration-300 group-hover:scale-110",
                          activeSection === 'language' && "rotate-180"
                        )}
                      />
                    </div>
                  </Button>

                  {/* Enhanced Language Options */}
                  <div className={cn(
                    "overflow-hidden transition-all duration-500 ease-out",
                    activeSection === 'language' ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0"
                  )}>
                    <div className="ml-4 space-y-1 p-2 bg-gradient-to-br from-white via-white to-stone-50/50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900/50 rounded-xl border border-stone-200/60 dark:border-stone-700/60 backdrop-blur-sm">
                      {languages.map((lang, index) => (
                        <Button
                          key={lang.code}
                          variant={language === lang.code ? "secondary" : "ghost"}
                          className="w-full justify-start text-xs h-10 rounded-lg transition-all duration-300 hover:scale-[1.02]"
                          onClick={() => {
                            setLanguage(lang.code as 'vi' | 'en' | 'ja');
                            setActiveSection(null);
                          }}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <span className="text-base mr-3">{lang.flag}</span>
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{lang.name}</span>
                            <span className="text-[10px] text-muted-foreground">{lang.code.toUpperCase()}</span>
                          </div>
                          {language === lang.code && (
                            <div className="ml-auto w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Enhanced Promotional Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {t('specialOffers')}
                </h4>

                {/* Enhanced Promo Card */}
                <div className="mx-1 p-3 bg-gradient-to-br from-white via-white to-stone-50/50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900/50 rounded-xl border border-stone-200/60 dark:border-stone-700/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                      <Gift className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-foreground">{t('firstOrderDiscount')}</h5>
                      <p className="text-[10px] text-muted-foreground">{t('firstOrderDescription')}</p>
                    </div>
                  </div>
                  <Link to="/sale" onClick={handleLinkClick}>
                    <Button size="sm" className="w-full h-8 text-xs font-semibold rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:scale-105 shadow-md">
                      {t('shopNow')}
                    </Button>
                  </Link>
                </div>

                {/* Enhanced Newsletter Signup */}
                <div className="mx-1 p-3 bg-gradient-to-br from-white via-white to-stone-50/50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-900/50 rounded-xl border border-stone-200/60 dark:border-stone-700/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-1.5 bg-secondary/50 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
                      <Bell className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-foreground">{t('stayUpdated')}</h5>
                      <p className="text-[10px] text-muted-foreground">{t('newsletterDescription')}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs font-semibold rounded-lg border-2 border-stone-200/60 dark:border-stone-700/60 hover:bg-primary/5 hover:border-primary transition-all duration-300 hover:scale-105">
                    {t('subscribeNewsletter')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Footer with improved styling */}
          <div className="p-4 pb-10 border-t border-stone-200/60 dark:border-stone-700/60 bg-gradient-to-r from-stone-50/80 via-stone-100/60 to-stone-50/80 dark:from-stone-900/80 dark:via-stone-800/60 dark:to-stone-900/80 flex-shrink-0 backdrop-blur-xl">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <img
                  src="/koshino_logo_dark.png"
                  alt="KOSHIRO"
                  className="h-6 w-auto dark:hidden micro-scale"
                />
                <img
                  src="/koshino_logo.png"
                  alt="KOSHIRO"
                  className="h-6 w-auto hidden dark:block micro-scale"
                />
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  KOSHIRO
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground space-y-1">
                <p className="font-medium">© 2024 Koshiro Fashion</p>
                <p className="flex items-center justify-center space-x-1">
                  <span>{t('madeWithLove')}</span>
                  <span className="text-red-500 animate-pulse float-animation">❤️</span>
                  <span>{t('inJapan')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default EnhancedMobileMenu;

