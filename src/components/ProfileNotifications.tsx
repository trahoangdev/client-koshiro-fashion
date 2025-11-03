import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";
import { Loader2 } from "lucide-react";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  ShoppingBag,
  Tag,
  Star,
  Save
} from "lucide-react";

interface NotificationSettings {
  email: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletters: boolean;
    productRecommendations: boolean;
  };
  push: {
    orderUpdates: boolean;
    promotions: boolean;
    backInStock: boolean;
    priceDrops: boolean;
  };
  sms: {
    orderUpdates: boolean;
    promotions: boolean;
  };
}

const ProfileNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      orderUpdates: true,
      promotions: true,
      newsletters: false,
      productRecommendations: true
    },
    push: {
      orderUpdates: true,
      promotions: false,
      backInStock: true,
      priceDrops: true
    },
    sms: {
      orderUpdates: false,
      promotions: false
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { language, t: tCommon } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated, refreshUser } = useAuth();

  const translations = {
    en: {
      title: "Notification Settings",
      subtitle: "Choose how you want to be notified about your orders and updates",
      email: "Email Notifications",
      push: "Push Notifications",
      sms: "SMS Notifications",
      orderUpdates: "Order Updates",
      orderUpdatesDesc: "Get notified about order status changes, shipping updates, and delivery confirmations",
      promotions: "Promotions & Offers",
      promotionsDesc: "Receive notifications about sales, discounts, and special offers",
      newsletters: "Newsletters",
      newslettersDesc: "Stay updated with our latest news, fashion trends, and brand stories",
      productRecommendations: "Product Recommendations",
      productRecommendationsDesc: "Get personalized product suggestions based on your preferences",
      backInStock: "Back in Stock Alerts",
      backInStockDesc: "Be notified when items in your wishlist come back in stock",
      priceDrops: "Price Drop Alerts",
      priceDropsDesc: "Get notified when items in your wishlist go on sale",
      save: "Save Settings",
      settingsSaved: "Notification settings saved successfully",
      enableAll: "Enable All",
      disableAll: "Disable All"
    },
    vi: {
      title: "Cài Đặt Thông Báo",
      subtitle: "Chọn cách bạn muốn được thông báo về đơn hàng và cập nhật",
      email: "Thông Báo Email",
      push: "Thông Báo Push",
      sms: "Thông Báo SMS",
      orderUpdates: "Cập Nhật Đơn Hàng",
      orderUpdatesDesc: "Nhận thông báo về thay đổi trạng thái đơn hàng, cập nhật vận chuyển và xác nhận giao hàng",
      promotions: "Khuyến Mãi & Ưu Đãi",
      promotionsDesc: "Nhận thông báo về giảm giá, khuyến mãi và ưu đãi đặc biệt",
      newsletters: "Bản Tin",
      newslettersDesc: "Cập nhật tin tức mới nhất, xu hướng thời trang và câu chuyện thương hiệu",
      productRecommendations: "Gợi Ý Sản Phẩm",
      productRecommendationsDesc: "Nhận gợi ý sản phẩm cá nhân hóa dựa trên sở thích của bạn",
      backInStock: "Thông Báo Có Hàng",
      backInStockDesc: "Được thông báo khi sản phẩm trong wishlist có hàng trở lại",
      priceDrops: "Thông Báo Giảm Giá",
      priceDropsDesc: "Được thông báo khi sản phẩm trong wishlist giảm giá",
      save: "Lưu Cài Đặt",
      settingsSaved: "Đã lưu cài đặt thông báo thành công",
      enableAll: "Bật Tất Cả",
      disableAll: "Tắt Tất Cả"
    },
    ja: {
      title: "通知設定",
      subtitle: "注文とアップデートについてどのように通知を受け取りたいかを選択",
      email: "メール通知",
      push: "プッシュ通知",
      sms: "SMS通知",
      orderUpdates: "注文更新",
      orderUpdatesDesc: "注文状況の変更、配送更新、配達確認について通知を受け取る",
      promotions: "プロモーション＆オファー",
      promotionsDesc: "セール、割引、特別オファーについて通知を受け取る",
      newsletters: "ニュースレター",
      newslettersDesc: "最新ニュース、ファッショントレンド、ブランドストーリーについて更新を受け取る",
      productRecommendations: "商品レコメンデーション",
      productRecommendationsDesc: "お好みに基づいたパーソナライズされた商品提案を受け取る",
      backInStock: "在庫復旧アラート",
      backInStockDesc: "お気に入りリストの商品が在庫復旧した際に通知を受け取る",
      priceDrops: "価格下落アラート",
      priceDropsDesc: "お気に入りリストの商品がセールになった際に通知を受け取る",
      save: "設定を保存",
      settingsSaved: "通知設定が正常に保存されました",
      enableAll: "すべて有効",
      disableAll: "すべて無効"
    }
  };

  const tl = translations[language as keyof typeof translations] || translations.en;

  // Load notification preferences from API
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const response = await api.getProfile();
        
        if (response && response.user && response.user.preferences?.notificationPreferences) {
          const prefs = response.user.preferences.notificationPreferences;
          setSettings({
            email: {
              orderUpdates: prefs.email?.orderUpdates ?? true,
              promotions: prefs.email?.promotions ?? true,
              newsletters: prefs.email?.newsletters ?? false,
              productRecommendations: prefs.email?.productRecommendations ?? true
            },
            push: {
              orderUpdates: prefs.push?.orderUpdates ?? true,
              promotions: prefs.push?.promotions ?? false,
              backInStock: prefs.push?.backInStock ?? true,
              priceDrops: prefs.push?.priceDrops ?? true
            },
            sms: {
              orderUpdates: prefs.sms?.orderUpdates ?? false,
              promotions: prefs.sms?.promotions ?? false
            }
          });
        }
      } catch (error) {
        logger.error('Error loading notification preferences', error);
        toast({
          title: tCommon('error'),
          description: language === 'vi' ? 'Không thể tải cài đặt thông báo' : 
                       language === 'ja' ? '通知設定を読み込めませんでした' : 
                       'Could not load notification settings',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNotificationPreferences();
  }, [isAuthenticated, toast, tCommon, language]);

  const handleToggle = (category: keyof NotificationSettings, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]]
      }
    }));
  };

  const handleSave = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsSaving(true);
      
      await api.updateProfile({
        preferences: {
          notificationPreferences: {
            email: {
              orderUpdates: settings.email.orderUpdates,
              promotions: settings.email.promotions,
              newsletters: settings.email.newsletters,
              productRecommendations: settings.email.productRecommendations
            },
            push: {
              orderUpdates: settings.push.orderUpdates,
              promotions: settings.push.promotions,
              backInStock: settings.push.backInStock,
              priceDrops: settings.push.priceDrops
            },
            sms: {
              orderUpdates: settings.sms.orderUpdates,
              promotions: settings.sms.promotions
            }
          }
        }
      });
      
      // Refresh user data to get latest preferences
      if (refreshUser) {
        refreshUser();
      }
      
      toast({
        title: tCommon('success'),
        description: tl.settingsSaved,
      });
    } catch (error) {
      logger.error('Error saving notification preferences', error);
      toast({
        title: tCommon('error'),
        description: language === 'vi' ? 'Không thể lưu cài đặt thông báo' : 
                     language === 'ja' ? '通知設定を保存できませんでした' : 
                     'Could not save notification settings',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableAll = () => {
    setSettings({
      email: {
        orderUpdates: true,
        promotions: true,
        newsletters: true,
        productRecommendations: true
      },
      push: {
        orderUpdates: true,
        promotions: true,
        backInStock: true,
        priceDrops: true
      },
      sms: {
        orderUpdates: true,
        promotions: true
      }
    });
  };

  const handleDisableAll = () => {
    setSettings({
      email: {
        orderUpdates: false,
        promotions: false,
        newsletters: false,
        productRecommendations: false
      },
      push: {
        orderUpdates: false,
        promotions: false,
        backInStock: false,
        priceDrops: false
      },
      sms: {
        orderUpdates: false,
        promotions: false
      }
    });
  };

  const NotificationItem = ({ 
    icon, 
    title, 
    description, 
    checked, 
    onToggle 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    checked: boolean;
    onToggle: () => void;
  }) => (
    <div className="flex items-start space-x-3 p-4 rounded-lg border-2 bg-muted/30 hover:bg-muted/50 transition-all">
      <div className="flex-shrink-0 mt-1">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <Label htmlFor={title} className="text-sm font-medium">
            {title}
          </Label>
          <Switch
            id={title}
            checked={checked}
            onCheckedChange={onToggle}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            {language === 'vi' ? 'Đang tải cài đặt thông báo...' : 
             language === 'ja' ? '通知設定を読み込み中...' : 
             'Loading notification settings...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{tl.title}</h2>
          <p className="text-muted-foreground text-lg font-medium">{tl.subtitle}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleEnableAll} className="rounded-lg font-semibold border-2" disabled={isSaving}>
            {tl.enableAll}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDisableAll} className="rounded-lg font-semibold border-2" disabled={isSaving}>
            {tl.disableAll}
          </Button>
        </div>
      </div>

      {/* Email Notifications */}
      <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20">
          <CardTitle className="flex items-center text-xl font-bold">
            <Mail className="h-5 w-5 mr-2 text-primary" />
            {tl.email}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <NotificationItem
            icon={<ShoppingBag className="h-4 w-4" />}
            title={tl.orderUpdates}
            description={tl.orderUpdatesDesc}
            checked={settings.email.orderUpdates}
            onToggle={() => handleToggle('email', 'orderUpdates')}
          />
          
          <NotificationItem
            icon={<Tag className="h-4 w-4" />}
            title={tl.promotions}
            description={tl.promotionsDesc}
            checked={settings.email.promotions}
            onToggle={() => handleToggle('email', 'promotions')}
          />
          
          <NotificationItem
            icon={<Bell className="h-4 w-4" />}
            title={tl.newsletters}
            description={tl.newslettersDesc}
            checked={settings.email.newsletters}
            onToggle={() => handleToggle('email', 'newsletters')}
          />
          
          <NotificationItem
            icon={<Star className="h-4 w-4" />}
            title={tl.productRecommendations}
            description={tl.productRecommendationsDesc}
            checked={settings.email.productRecommendations}
            onToggle={() => handleToggle('email', 'productRecommendations')}
          />
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20">
          <CardTitle className="flex items-center text-xl font-bold">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            {tl.push}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <NotificationItem
            icon={<ShoppingBag className="h-4 w-4" />}
            title={tl.orderUpdates}
            description={tl.orderUpdatesDesc}
            checked={settings.push.orderUpdates}
            onToggle={() => handleToggle('push', 'orderUpdates')}
          />
          
          <NotificationItem
            icon={<Tag className="h-4 w-4" />}
            title={tl.promotions}
            description={tl.promotionsDesc}
            checked={settings.push.promotions}
            onToggle={() => handleToggle('push', 'promotions')}
          />
          
          <NotificationItem
            icon={<ShoppingBag className="h-4 w-4" />}
            title={tl.backInStock}
            description={tl.backInStockDesc}
            checked={settings.push.backInStock}
            onToggle={() => handleToggle('push', 'backInStock')}
          />
          
          <NotificationItem
            icon={<Tag className="h-4 w-4" />}
            title={tl.priceDrops}
            description={tl.priceDropsDesc}
            checked={settings.push.priceDrops}
            onToggle={() => handleToggle('push', 'priceDrops')}
          />
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20">
          <CardTitle className="flex items-center text-xl font-bold">
            <Smartphone className="h-5 w-5 mr-2 text-primary" />
            {tl.sms}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <NotificationItem
            icon={<ShoppingBag className="h-4 w-4" />}
            title={tl.orderUpdates}
            description={tl.orderUpdatesDesc}
            checked={settings.sms.orderUpdates}
            onToggle={() => handleToggle('sms', 'orderUpdates')}
          />
          
          <NotificationItem
            icon={<Tag className="h-4 w-4" />}
            title={tl.promotions}
            description={tl.promotionsDesc}
            checked={settings.sms.promotions}
            onToggle={() => handleToggle('sms', 'promotions')}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isLoading}
          className="rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {language === 'vi' ? 'Đang lưu...' : language === 'ja' ? '保存中...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {tl.save}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileNotifications; 