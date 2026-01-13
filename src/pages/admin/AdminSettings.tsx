import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  Loader2,
  Bell,
  Globe,
  Shield,
  Database,

  Mail,
  CreditCard,
  Truck,
  FileText,
  Users,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  Copy,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail as MailIcon,
  Building,
  User,
  Key,
  Server,
  HardDrive,
  Activity,
  Zap,
  Wifi,
  WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, isAdminUser } from "@/contexts";
import AdminLayout from "@/components/admin/AdminLayout";
import { api } from "@/lib/api";

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    timezone: string;
    currency: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    stockNotifications: boolean;
    customerNotifications: boolean;
    adminNotifications: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    maxLoginAttempts: number;
    enableCaptcha: boolean;
  };
  payment: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
    cashOnDelivery: boolean;
    bankTransfer: boolean;
  };
  shipping: {
    freeShippingThreshold: number;
    defaultShippingCost: number;
    enableTracking: boolean;
    shippingZones: Array<{ name: string; cost: number }>;
  };

}



export default function AdminSettings() {
  const { toast } = useToast();
  const { t: tFn } = useLanguage();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: "KOSHIRO",
      siteDescription: "Authentic Japanese fashion and accessories",
      contactEmail: "contact@koshiro.com",
      contactPhone: "+84 123 456 789",
      address: "123 Fashion Street, Ho Chi Minh City, Vietnam",
      timezone: "Asia/Ho_Chi_Minh",
      currency: "VND",
      language: "vi"
    },
    notifications: {
      emailNotifications: true,
      orderNotifications: true,
      stockNotifications: true,
      customerNotifications: true,
      adminNotifications: true
    },
    security: {
      sessionTimeout: 30,
      passwordMinLength: 8,
      requireTwoFactor: false,
      maxLoginAttempts: 5,
      enableCaptcha: true
    },
    payment: {
      stripeEnabled: true,
      paypalEnabled: true,
      cashOnDelivery: true,
      bankTransfer: true
    },
    shipping: {
      freeShippingThreshold: 1000000,
      defaultShippingCost: 50000,
      enableTracking: true,
      shippingZones: [
        { name: "Ho Chi Minh City", cost: 30000 },
        { name: "Hanoi", cost: 50000 },
        { name: "Other Cities", cost: 80000 }
      ]
    },

  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !isAdminUser(user)) {
        navigate("/admin/login");
      }
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    loadSettings();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.getSettings();

      // Map API response to SystemSettings format
      if (response) {
        setSettings({
          general: {
            siteName: response.websiteName || 'KOSHIRO',
            siteDescription: response.websiteDescription || 'Authentic Japanese fashion and accessories',
            contactEmail: response.contactEmail || 'contact@koshiro.com',
            contactPhone: response.contactPhone || '+84 123 456 789',
            address: response.address || '123 Fashion Street, Ho Chi Minh City, Vietnam',
            timezone: response.timezone || 'Asia/Ho_Chi_Minh',
            currency: response.currency || 'VND',
            language: response.language || 'vi'
          },
          notifications: {
            emailNotifications: response.emailNotifications ?? true,
            orderNotifications: response.orderNotifications ?? true,
            stockNotifications: response.stockNotifications ?? true,
            customerNotifications: response.customerNotifications ?? true,
            adminNotifications: response.adminNotifications ?? true
          },
          security: {
            sessionTimeout: response.sessionTimeout || 30,
            passwordMinLength: response.passwordMinLength || 8,
            requireTwoFactor: response.requireTwoFactor || false,
            maxLoginAttempts: response.maxLoginAttempts || 5,
            enableCaptcha: response.enableCaptcha ?? true
          },
          payment: {
            stripeEnabled: response.stripeEnabled || false,
            paypalEnabled: response.paypalEnabled || false,
            cashOnDelivery: response.cashOnDelivery ?? true,
            bankTransfer: response.bankTransfer ?? true
          },
          shipping: {
            freeShippingThreshold: response.freeShippingThreshold || 1000000,
            defaultShippingCost: response.defaultShippingCost || 50000,
            enableTracking: response.enableTracking ?? true,
            shippingZones: response.shippingZones && response.shippingZones.length > 0
              ? response.shippingZones
              : [
                { name: 'Ho Chi Minh City', cost: 30000 },
                { name: 'Hanoi', cost: 50000 },
                { name: 'Other Cities', cost: 80000 }
              ]
          },

        });
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể tải cài đặt' : language === 'ja' ? '設定を読み込めませんでした' : 'Could not load settings',
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      // Convert SystemSettings format to API Settings format
      const settingsToSave = {
        // General Settings
        websiteName: settings.general.siteName,
        websiteDescription: settings.general.siteDescription,
        contactEmail: settings.general.contactEmail,
        contactPhone: settings.general.contactPhone,
        address: settings.general.address,
        timezone: settings.general.timezone,
        currency: settings.general.currency,
        language: settings.general.language,

        // Notification Settings
        emailNotifications: settings.notifications.emailNotifications,
        orderNotifications: settings.notifications.orderNotifications,
        stockNotifications: settings.notifications.stockNotifications,
        customerNotifications: settings.notifications.customerNotifications,
        adminNotifications: settings.notifications.adminNotifications,

        // Security Settings
        sessionTimeout: settings.security.sessionTimeout,
        passwordMinLength: settings.security.passwordMinLength,
        requireTwoFactor: settings.security.requireTwoFactor,
        maxLoginAttempts: settings.security.maxLoginAttempts,
        enableCaptcha: settings.security.enableCaptcha,

        // Payment Settings
        stripeEnabled: settings.payment.stripeEnabled,
        paypalEnabled: settings.payment.paypalEnabled,
        cashOnDelivery: settings.payment.cashOnDelivery,
        bankTransfer: settings.payment.bankTransfer,

        // Shipping Settings
        freeShippingThreshold: settings.shipping.freeShippingThreshold,
        defaultShippingCost: settings.shipping.defaultShippingCost,
        enableTracking: settings.shipping.enableTracking,
        shippingZones: settings.shipping.shippingZones,


      };

      // Type assertion needed because settingsToSave is a partial update
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedSettings = await api.updateSettings(settingsToSave as any);

      // Reload settings to ensure sync with server
      if (updatedSettings) {
        setSettings({
          general: {
            siteName: updatedSettings.websiteName || settings.general.siteName,
            siteDescription: updatedSettings.websiteDescription || settings.general.siteDescription,
            contactEmail: updatedSettings.contactEmail || settings.general.contactEmail,
            contactPhone: updatedSettings.contactPhone || settings.general.contactPhone,
            address: updatedSettings.address || settings.general.address,
            timezone: updatedSettings.timezone || settings.general.timezone,
            currency: updatedSettings.currency || settings.general.currency,
            language: updatedSettings.language || settings.general.language
          },
          notifications: {
            emailNotifications: updatedSettings.emailNotifications ?? settings.notifications.emailNotifications,
            orderNotifications: updatedSettings.orderNotifications ?? settings.notifications.orderNotifications,
            stockNotifications: updatedSettings.stockNotifications ?? settings.notifications.stockNotifications,
            customerNotifications: updatedSettings.customerNotifications ?? settings.notifications.customerNotifications,
            adminNotifications: updatedSettings.adminNotifications ?? settings.notifications.adminNotifications
          },
          security: {
            sessionTimeout: updatedSettings.sessionTimeout ?? settings.security.sessionTimeout,
            passwordMinLength: updatedSettings.passwordMinLength ?? settings.security.passwordMinLength,
            requireTwoFactor: updatedSettings.requireTwoFactor ?? settings.security.requireTwoFactor,
            maxLoginAttempts: updatedSettings.maxLoginAttempts ?? settings.security.maxLoginAttempts,
            enableCaptcha: updatedSettings.enableCaptcha ?? settings.security.enableCaptcha
          },
          payment: {
            stripeEnabled: updatedSettings.stripeEnabled ?? settings.payment.stripeEnabled,
            paypalEnabled: updatedSettings.paypalEnabled ?? settings.payment.paypalEnabled,
            cashOnDelivery: updatedSettings.cashOnDelivery ?? settings.payment.cashOnDelivery,
            bankTransfer: updatedSettings.bankTransfer ?? settings.payment.bankTransfer
          },
          shipping: {
            freeShippingThreshold: updatedSettings.freeShippingThreshold ?? settings.shipping.freeShippingThreshold,
            defaultShippingCost: updatedSettings.defaultShippingCost ?? settings.shipping.defaultShippingCost,
            enableTracking: updatedSettings.enableTracking ?? settings.shipping.enableTracking,
            shippingZones: updatedSettings.shippingZones && updatedSettings.shippingZones.length > 0
              ? updatedSettings.shippingZones
              : settings.shipping.shippingZones
          }
        });
      }

      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: language === 'vi' ? 'Cài đặt đã được lưu thành công' : language === 'ja' ? '設定が正常に保存されました' : 'Settings saved successfully',
      });

      // Trigger settings refresh in SettingsProvider
      window.dispatchEvent(new CustomEvent('settingsUpdated'));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể lưu cài đặt' : language === 'ja' ? '設定を保存できませんでした' : 'Could not save settings',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm(tl.reset)) {
      loadSettings();
      toast({
        title: tFn('success'),
        description: tFn('updateSuccess'),
      });
    }
  };

  const translations = {
    en: {
      title: "System Settings",
      subtitle: "Manage your store configuration and preferences",
      general: "General",
      notifications: "Notifications",
      security: "Security",
      payment: "Payment",
      shipping: "Shipping",

      save: "Save Changes",
      reset: "Reset to Default",
      loading: "Loading settings...",
      siteName: "Site Name",
      siteDescription: "Site Description",
      contactEmail: "Contact Email",
      contactPhone: "Contact Phone",
      address: "Address",
      timezone: "Timezone",
      currency: "Currency",
      language: "Language",
      emailNotifications: "Email Notifications",
      orderNotifications: "Order Notifications",
      stockNotifications: "Stock Notifications",
      customerNotifications: "Customer Notifications",
      adminNotifications: "Admin Notifications",
      sessionTimeout: "Session Timeout (minutes)",
      passwordMinLength: "Minimum Password Length",
      requireTwoFactor: "Require Two-Factor Authentication",
      maxLoginAttempts: "Maximum Login Attempts",
      enableCaptcha: "Enable CAPTCHA",
      stripeEnabled: "Enable Stripe",
      paypalEnabled: "Enable PayPal",
      cashOnDelivery: "Cash on Delivery",
      bankTransfer: "Bank Transfer",
      freeShippingThreshold: "Free Shipping Threshold",
      defaultShippingCost: "Default Shipping Cost",
      enableTracking: "Enable Order Tracking",
      shippingZones: "Shipping Zones",

      systemStatus: "System Status",
      databaseStatus: "Database Status",
      serverStatus: "Server Status",
      uptime: "Uptime",
      version: "Version",
      lastBackup: "Last Backup",
      nextBackup: "Next Backup",
      backupNow: "Backup Now",
      restoreBackup: "Restore Backup",
      exportSettings: "Export Settings",
      importSettings: "Import Settings"
    },
    vi: {
      title: "Cài Đặt Hệ Thống",
      subtitle: "Quản lý cấu hình và tùy chọn cửa hàng",
      general: "Tổng Quan",
      notifications: "Thông Báo",
      security: "Bảo Mật",
      payment: "Thanh Toán",
      shipping: "Vận Chuyển",

      save: "Lưu Thay Đổi",
      reset: "Đặt Lại Mặc Định",
      loading: "Đang tải cài đặt...",
      siteName: "Tên Website",
      siteDescription: "Mô Tả Website",
      contactEmail: "Email Liên Hệ",
      contactPhone: "Số Điện Thoại",
      address: "Địa Chỉ",
      timezone: "Múi Giờ",
      currency: "Tiền Tệ",
      language: "Ngôn Ngữ",
      emailNotifications: "Thông Báo Email",
      orderNotifications: "Thông Báo Đơn Hàng",
      stockNotifications: "Thông Báo Tồn Kho",
      customerNotifications: "Thông Báo Khách Hàng",
      adminNotifications: "Thông Báo Admin",
      sessionTimeout: "Thời Gian Phiên (phút)",
      passwordMinLength: "Độ Dài Mật Khẩu Tối Thiểu",
      requireTwoFactor: "Yêu Cầu Xác Thực 2 Yếu Tố",
      maxLoginAttempts: "Số Lần Đăng Nhập Tối Đa",
      enableCaptcha: "Bật CAPTCHA",
      stripeEnabled: "Bật Stripe",
      paypalEnabled: "Bật PayPal",
      cashOnDelivery: "Tiền Mặt Khi Nhận Hàng",
      bankTransfer: "Chuyển Khoản Ngân Hàng",
      freeShippingThreshold: "Ngưỡng Miễn Phí Vận Chuyển",
      defaultShippingCost: "Phí Vận Chuyển Mặc Định",
      enableTracking: "Bật Theo Dõi Đơn Hàng",
      shippingZones: "Khu Vực Vận Chuyển",

      systemStatus: "Trạng Thái Hệ Thống",
      databaseStatus: "Trạng Thái Cơ Sở Dữ Liệu",
      serverStatus: "Trạng Thái Máy Chủ",
      uptime: "Thời Gian Hoạt Động",
      version: "Phiên Bản",
      lastBackup: "Sao Lưu Cuối",
      nextBackup: "Sao Lưu Tiếp Theo",
      backupNow: "Sao Lưu Ngay",
      restoreBackup: "Khôi Phục Sao Lưu",
      exportSettings: "Xuất Cài Đặt",
      importSettings: "Nhập Cài Đặt"
    },
    ja: {
      title: "システム設定",
      subtitle: "ストアの設定とプリファレンスを管理",
      general: "一般",
      notifications: "通知",
      security: "セキュリティ",
      payment: "決済",
      shipping: "配送",

      save: "変更を保存",
      reset: "デフォルトにリセット",
      loading: "設定を読み込み中...",
      siteName: "サイト名",
      siteDescription: "サイト説明",
      contactEmail: "連絡先メール",
      contactPhone: "連絡先電話番号",
      address: "住所",
      timezone: "タイムゾーン",
      currency: "通貨",
      language: "言語",
      emailNotifications: "メール通知",
      orderNotifications: "注文通知",
      stockNotifications: "在庫通知",
      customerNotifications: "顧客通知",
      adminNotifications: "管理者通知",
      sessionTimeout: "セッションタイムアウト（分）",
      passwordMinLength: "最小パスワード長",
      requireTwoFactor: "二要素認証を要求",
      maxLoginAttempts: "最大ログイン試行回数",
      enableCaptcha: "CAPTCHAを有効化",
      stripeEnabled: "Stripeを有効化",
      paypalEnabled: "PayPalを有効化",
      cashOnDelivery: "代金引換",
      bankTransfer: "銀行振込",
      freeShippingThreshold: "送料無料のしきい値",
      defaultShippingCost: "デフォルト送料",
      enableTracking: "注文追跡を有効化",
      shippingZones: "配送地域",

      systemStatus: "システムステータス",
      databaseStatus: "データベースステータス",
      serverStatus: "サーバーステータス",
      uptime: "稼働時間",
      version: "バージョン",
      lastBackup: "最後のバックアップ",
      nextBackup: "次のバックアップ",
      backupNow: "今すぐバックアップ",
      restoreBackup: "バックアップを復元",
      exportSettings: "設定をエクスポート",
      importSettings: "設定をインポート"
    }
  };

  const tl = translations[language as keyof typeof translations] || translations.en;

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">{tl.loading}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Don't render if not authenticated or not admin
  if (!isAuthenticated || !isAdminUser(user)) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tl.title}</h1>
            <p className="text-muted-foreground">{tl.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleResetSettings}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {tl.reset}
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {tl.save}
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{tl.systemStatus}</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{tl.databaseStatus}</CardTitle>
              <Database className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Connected</div>
              <p className="text-xs text-muted-foreground">MongoDB Atlas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{tl.serverStatus}</CardTitle>
              <Server className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Running</div>
              <p className="text-xs text-muted-foreground">Port 3000</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{tl.uptime}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {tl.general}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {tl.notifications}
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {tl.security}
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {tl.payment}
            </TabsTrigger>
            <TabsTrigger value="shipping" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              {tl.shipping}
            </TabsTrigger>

          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Site Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">{tl.siteName}</Label>
                    <Input
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, siteName: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">{tl.siteDescription}</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.general.siteDescription}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, siteDescription: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">{tl.contactEmail}</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, contactEmail: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">{tl.contactPhone}</Label>
                    <Input
                      id="contactPhone"
                      value={settings.general.contactPhone}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, contactPhone: e.target.value }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location & Regional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">{tl.address}</Label>
                    <Textarea
                      id="address"
                      value={settings.general.address}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, address: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">{tl.timezone}</Label>
                    <Select
                      value={settings.general.timezone}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, timezone: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">{tl.currency}</Label>
                    <Select
                      value={settings.general.currency}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, currency: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VND">VND (₫)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">{tl.language}</Label>
                    <Select
                      value={settings.general.language}
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        general: { ...prev.general, language: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vi">Tiếng Việt</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{tl.emailNotifications}</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, emailNotifications: checked }
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{tl.orderNotifications}</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new orders
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.orderNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, orderNotifications: checked }
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{tl.stockNotifications}</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about low stock items
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.stockNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, stockNotifications: checked }
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{tl.customerNotifications}</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about customer activities
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.customerNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, customerNotifications: checked }
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{tl.adminNotifications}</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about system events
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.adminNotifications}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, adminNotifications: checked }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">{tl.sessionTimeout}</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">{tl.passwordMinLength}</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, passwordMinLength: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">{tl.maxLoginAttempts}</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, maxLoginAttempts: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{tl.requireTwoFactor}</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.requireTwoFactor}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, requireTwoFactor: checked }
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{tl.enableCaptcha}</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable CAPTCHA on login forms
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.enableCaptcha}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        security: { ...prev.security, enableCaptcha: checked }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Stripe</Label>
                      <p className="text-sm text-muted-foreground">
                        Accept credit card payments via Stripe
                      </p>
                    </div>
                    <Switch
                      checked={settings.payment.stripeEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        payment: { ...prev.payment, stripeEnabled: checked }
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>PayPal</Label>
                      <p className="text-sm text-muted-foreground">
                        Accept payments via PayPal
                      </p>
                    </div>
                    <Switch
                      checked={settings.payment.paypalEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        payment: { ...prev.payment, paypalEnabled: checked }
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{tl.cashOnDelivery}</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow cash payment on delivery
                      </p>
                    </div>
                    <Switch
                      checked={settings.payment.cashOnDelivery}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        payment: { ...prev.payment, cashOnDelivery: checked }
                      }))}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{tl.bankTransfer}</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow bank transfer payments
                      </p>
                    </div>
                    <Switch
                      checked={settings.payment.bankTransfer}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        payment: { ...prev.payment, bankTransfer: checked }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="freeShippingThreshold">{tl.freeShippingThreshold}</Label>
                    <Input
                      id="freeShippingThreshold"
                      type="number"
                      value={settings.shipping.freeShippingThreshold}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        shipping: { ...prev.shipping, freeShippingThreshold: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultShippingCost">{tl.defaultShippingCost}</Label>
                    <Input
                      id="defaultShippingCost"
                      type="number"
                      value={settings.shipping.defaultShippingCost}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        shipping: { ...prev.shipping, defaultShippingCost: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{tl.enableTracking}</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable order tracking for customers
                      </p>
                    </div>
                    <Switch
                      checked={settings.shipping.enableTracking}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        shipping: { ...prev.shipping, enableTracking: checked }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {tl.shippingZones}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings.shipping.shippingZones.map((zone, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={zone.name}
                        onChange={(e) => {
                          const newZones = [...settings.shipping.shippingZones];
                          newZones[index].name = e.target.value;
                          setSettings(prev => ({
                            ...prev,
                            shipping: { ...prev.shipping, shippingZones: newZones }
                          }));
                        }}
                        placeholder="Zone name"
                      />
                      <Input
                        type="number"
                        value={zone.cost}
                        onChange={(e) => {
                          const newZones = [...settings.shipping.shippingZones];
                          newZones[index].cost = parseInt(e.target.value);
                          setSettings(prev => ({
                            ...prev,
                            shipping: { ...prev.shipping, shippingZones: newZones }
                          }));
                        }}
                        placeholder="Cost"
                        className="w-24"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newZones = settings.shipping.shippingZones.filter((_, i) => i !== index);
                          setSettings(prev => ({
                            ...prev,
                            shipping: { ...prev.shipping, shippingZones: newZones }
                          }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newZones = [...settings.shipping.shippingZones, { name: "", cost: 0 }];
                      setSettings(prev => ({
                        ...prev,
                        shipping: { ...prev.shipping, shippingZones: newZones }
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Zone
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


        </Tabs>
      </div>
    </AdminLayout>
  );
} 