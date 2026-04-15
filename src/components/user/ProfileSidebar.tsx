import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api, Order, Product, User as UserType } from "@/lib/api";
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut,
  Calendar
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface ProfileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  refreshTrigger?: number; // Add this to trigger refresh from parent
}

const ProfileSidebar = ({ activeSection, onSectionChange, refreshTrigger }: ProfileSidebarProps) => {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load real data for counts
  const loadCounts = useCallback(async () => {
    // Only load counts if user is authenticated
    if (!isAuthenticated) {
      setOrdersCount(0);
      setWishlistCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load orders count
      try {
        const ordersResponse = await api.getUserOrders();
        let ordersData: Order[] = [];
        if (Array.isArray(ordersResponse)) {
          ordersData = ordersResponse;
        } else if (ordersResponse && typeof ordersResponse === 'object') {
          const responseObj = ordersResponse as unknown as Record<string, unknown>;
          if ('data' in responseObj && Array.isArray(responseObj.data)) {
            ordersData = responseObj.data as Order[];
          } else if ('orders' in responseObj && Array.isArray(responseObj.orders)) {
            ordersData = responseObj.orders as Order[];
          }
        }
        setOrdersCount(ordersData.length);
      } catch (error) {
        console.error('Failed to load orders count:', error);
        setOrdersCount(0);
      }

      // Load wishlist count
      try {
        const wishlistResponse = await api.getWishlist();
        let wishlistData: Product[] = [];
        if (Array.isArray(wishlistResponse)) {
          wishlistData = wishlistResponse;
        } else if (wishlistResponse && typeof wishlistResponse === 'object') {
          const responseObj = wishlistResponse as unknown as Record<string, unknown>;
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
    } catch (error) {
      console.error('Failed to load counts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCounts();
  }, [refreshTrigger, isAuthenticated, loadCounts]); // Re-run when refreshTrigger or authentication changes

  const translations = {
    en: {
      profile: "Profile",
      orders: "My Orders",
      wishlist: "Wishlist",
      addresses: "Addresses",
      payment: "Payment Methods",
      notifications: "Notifications",
      settings: "Account Settings",
      logout: "Logout",
      memberSince: "Member since",
      ordersCount: "orders",
      wishlistCount: "items",
      totalSpent: "Total Spent"
    },
    vi: {
      profile: "Hồ Sơ",
      orders: "Đơn Hàng Của Tôi",
      wishlist: "Danh Sách Yêu Thích",
      addresses: "Địa Chỉ",
      payment: "Phương Thức Thanh Toán",
      notifications: "Thông Báo",
      settings: "Cài Đặt Tài Khoản",
      logout: "Đăng Xuất",
      memberSince: "Thành viên từ",
      ordersCount: "đơn hàng",
      wishlistCount: "sản phẩm",
      totalSpent: "Tổng Chi Tiêu"
    },
    ja: {
      profile: "プロフィール",
      orders: "注文履歴",
      wishlist: "お気に入りリスト",
      addresses: "住所",
      payment: "支払い方法",
      notifications: "通知",
      settings: "アカウント設定",
      logout: "ログアウト",
      memberSince: "メンバー登録日",
      ordersCount: "注文",
      wishlistCount: "商品",
      totalSpent: "総支出額"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const menuItems = [
    {
      id: "profile",
      label: t.profile,
      icon: User
    },
    {
      id: "orders",
      label: t.orders,
      icon: Package,
      badge: isLoading ? "..." : ordersCount.toString()
    },
    {
      id: "addresses",
      label: t.addresses,
      icon: MapPin
    },
    {
      id: "payment",
      label: t.payment,
      icon: CreditCard
    },
    {
      id: "notifications",
      label: t.notifications,
      icon: Bell
    },
    {
      id: "settings",
      label: t.settings,
      icon: Settings
    }
  ];

  const handleLogout = () => {
    // Handle logout logic here
    console.log("Logout clicked");
  };

  return (
    <Card className="w-full lg:w-80 rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm sticky top-8 h-fit">
      {/* User Info */}
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-full flex items-center justify-center border-2 border-primary/20 shadow-lg">
            <div className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate mb-1">{user?.name || 'User'}</h3>
            <p className="text-sm text-muted-foreground truncate font-medium mb-2">{user?.email || 'email@example.com'}</p>
            <Badge 
              variant={user?.role === 'admin' ? 'default' : 'secondary'} 
              className="text-xs rounded-lg border-2 font-semibold"
            >
              {user?.role === 'admin' ? 'Admin' : 'Customer'}
            </Badge>
          </div>
        </div>
        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground font-medium">
            {t.memberSince} {(user as unknown as UserType)?.createdAt ? new Date((user as unknown as UserType).createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
          </p>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center font-semibold">
              <Package className="h-4 w-4 mr-1.5 text-primary" />
              {isLoading ? "..." : ordersCount} {t.ordersCount}
            </span>
            <span className="flex items-center font-semibold">
              <Heart className="h-4 w-4 mr-1.5 text-red-500" />
              {isLoading ? "..." : wishlistCount} {t.wishlistCount}
            </span>
          </div>
          <div className="text-xs font-bold text-primary">
            {t.totalSpent}: {formatCurrency(((user as unknown as UserType)?.totalSpent || 0), language)}
          </div>
        </div>
      </CardHeader>

      {/* Navigation Menu */}
      <CardContent className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-12 rounded-lg transition-all font-semibold ${
                  isActive 
                    ? 'shadow-lg hover:shadow-xl' 
                    : 'hover:bg-primary/10 hover:text-primary'
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge !== "0" && item.badge !== "..." && (
                  <Badge 
                    variant={isActive ? "secondary" : "secondary"} 
                    className="ml-2 rounded-lg border-2 font-semibold"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pt-4 mt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start h-12 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 transition-all font-semibold"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            {t.logout}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSidebar; 