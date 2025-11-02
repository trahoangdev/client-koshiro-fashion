import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Lock, 
  Eye, 
  EyeOff,
  Save,
  Trash2,
  AlertTriangle,
  Check,
  Mail
} from "lucide-react";

interface AccountSettings {
  language: string;
  currency: string;
  timezone: string;
  twoFactorAuth: boolean;
  emailNotifications: boolean;
  marketingEmails: boolean;
}

const ProfileSettings = () => {
  const [settings, setSettings] = useState<AccountSettings>({
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    twoFactorAuth: false,
    emailNotifications: true,
    marketingEmails: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const { language, t: tCommon } = useLanguage();
  const { toast } = useToast();

  const translations = {
    en: {
      title: "Account Settings",
      subtitle: "Manage your account preferences and security settings",
      preferences: "Preferences",
      language: "Language",
      currency: "Currency",
      timezone: "Timezone",
      security: "Security",
      changePassword: "Change Password",
      twoFactorAuth: "Two-Factor Authentication",
      twoFactorAuthDesc: "Add an extra layer of security to your account",
      currentPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      savePassword: "Save Password",
      saveSettings: "Save Settings",
      settingsSaved: "Settings saved successfully",
      passwordChanged: "Password changed successfully",
      deleteAccount: "Delete Account",
      deleteAccountDesc: "Permanently delete your account and all associated data",
      deleteAccountWarning: "This action cannot be undone. All your data will be permanently deleted.",
      confirmDelete: "Confirm Delete",
      cancel: "Cancel",
      emailNotifications: "Email Notifications",
      marketingEmails: "Marketing Emails",
      marketingEmailsDesc: "Receive promotional emails and newsletters"
    },
    vi: {
      title: "Cài Đặt Tài Khoản",
      subtitle: "Quản lý tùy chọn tài khoản và cài đặt bảo mật",
      preferences: "Tùy Chọn",
      language: "Ngôn Ngữ",
      currency: "Tiền Tệ",
      timezone: "Múi Giờ",
      security: "Bảo Mật",
      changePassword: "Đổi Mật Khẩu",
      twoFactorAuth: "Xác Thực Hai Yếu Tố",
      twoFactorAuthDesc: "Thêm lớp bảo mật bổ sung cho tài khoản của bạn",
      currentPassword: "Mật Khẩu Hiện Tại",
      newPassword: "Mật Khẩu Mới",
      confirmPassword: "Xác Nhận Mật Khẩu Mới",
      savePassword: "Lưu Mật Khẩu",
      saveSettings: "Lưu Cài Đặt",
      settingsSaved: "Đã lưu cài đặt thành công",
      passwordChanged: "Đã đổi mật khẩu thành công",
      deleteAccount: "Xóa Tài Khoản",
      deleteAccountDesc: "Xóa vĩnh viễn tài khoản và tất cả dữ liệu liên quan",
      deleteAccountWarning: "Hành động này không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.",
      confirmDelete: "Xác Nhận Xóa",
      cancel: "Hủy",
      emailNotifications: "Thông Báo Email",
      marketingEmails: "Email Marketing",
      marketingEmailsDesc: "Nhận email quảng cáo và bản tin"
    },
    ja: {
      title: "アカウント設定",
      subtitle: "アカウントの設定とセキュリティ設定を管理",
      preferences: "設定",
      language: "言語",
      currency: "通貨",
      timezone: "タイムゾーン",
      security: "セキュリティ",
      changePassword: "パスワード変更",
      twoFactorAuth: "二要素認証",
      twoFactorAuthDesc: "アカウントにセキュリティの追加レイヤーを追加",
      currentPassword: "現在のパスワード",
      newPassword: "新しいパスワード",
      confirmPassword: "新しいパスワードの確認",
      savePassword: "パスワードを保存",
      saveSettings: "設定を保存",
      settingsSaved: "設定が正常に保存されました",
      passwordChanged: "パスワードが正常に変更されました",
      deleteAccount: "アカウント削除",
      deleteAccountDesc: "アカウントと関連するすべてのデータを永続的に削除",
      deleteAccountWarning: "この操作は元に戻せません。すべてのデータが永続的に削除されます。",
      confirmDelete: "削除を確認",
      cancel: "キャンセル",
      emailNotifications: "メール通知",
      marketingEmails: "マーケティングメール",
      marketingEmailsDesc: "プロモーション用メールとニュースレターを受け取る"
    }
  };

  const tl = translations[language as keyof typeof translations] || translations.en;

  const handleSettingChange = (key: keyof AccountSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    toast({
      title: tCommon('success'),
      description: tl.settingsSaved,
    });
  };

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: tCommon('error'),
        description: tCommon('required'),
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: tCommon('error'),
        description: tCommon('passwordMismatch'),
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: tCommon('error'),
        description: tCommon('passwordTooShort'),
        variant: "destructive",
      });
      return;
    }

    toast({
      title: tCommon('success'),
      description: tl.passwordChanged,
    });

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleDeleteAccount = () => {
    if (confirm(tl.deleteAccountWarning)) {
      toast({
        title: tCommon('success'),
        description: tCommon('deleteSuccess'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{tl.title}</h2>
        <p className="text-muted-foreground text-lg font-medium">{tl.subtitle}</p>
      </div>

      {/* Preferences */}
      <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20">
          <CardTitle className="flex items-center text-xl font-bold">
            <Settings className="h-5 w-5 mr-2 text-primary" />
            {tl.preferences}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="language">{tl.language}</Label>
              <select
                id="language"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full p-2 border-2 border-input rounded-lg focus:border-primary transition-all font-medium"
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
                <option value="ja">日本語</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="currency">{tl.currency}</Label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                className="w-full p-2 border-2 border-input rounded-lg focus:border-primary transition-all font-medium"
              >
                <option value="USD">USD ($)</option>
                <option value="VND">VND (₫)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="timezone">{tl.timezone}</Label>
              <select
                id="timezone"
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                className="w-full p-2 border-2 border-input rounded-lg focus:border-primary transition-all font-medium"
              >
                <option value="UTC">UTC</option>
                <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20">
          <CardTitle className="flex items-center text-xl font-bold">
            <Lock className="h-5 w-5 mr-2 text-primary" />
            {tl.security}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 rounded-lg border-2 bg-muted/30 hover:bg-muted/50 transition-all">
            <div>
              <h3 className="font-medium">{tl.twoFactorAuth}</h3>
              <p className="text-sm text-muted-foreground">{tl.twoFactorAuthDesc}</p>
            </div>
            <Switch
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
            />
          </div>

          <Separator />

          {/* Change Password */}
          <div className="space-y-4">
            <h3 className="font-medium">{tl.changePassword}</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">{tl.currentPassword}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="rounded-lg border-2 focus:border-primary transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="newPassword">{tl.newPassword}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="rounded-lg border-2 focus:border-primary transition-all"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="font-semibold">{tl.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="rounded-lg border-2 focus:border-primary transition-all"
                />
              </div>
              
              <Button onClick={handlePasswordChange} className="rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                <Check className="h-4 w-4 mr-2" />
                {tl.savePassword}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border-2 bg-muted/30 hover:bg-muted/50 transition-all">
            <div>
              <h3 className="font-medium">{tl.emailNotifications}</h3>
              <p className="text-sm text-muted-foreground">Receive important account notifications</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-lg border-2 bg-muted/30 hover:bg-muted/50 transition-all">
            <div>
              <h3 className="font-medium">{tl.marketingEmails}</h3>
              <p className="text-sm text-muted-foreground">{tl.marketingEmailsDesc}</p>
            </div>
            <Switch
              checked={settings.marketingEmails}
              onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
          <Save className="h-4 w-4 mr-2" />
          {tl.saveSettings}
        </Button>
      </div>

      {/* Danger Zone */}
      <Card className="rounded-xl border-2 border-red-200 shadow-lg bg-background/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-red-100/50 via-red-50/30 to-transparent border-b-2 border-red-200">
          <CardTitle className="flex items-center text-red-600 text-xl font-bold">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-red-600">{tl.deleteAccount}</h3>
              <p className="text-sm text-muted-foreground">{tl.deleteAccountDesc}</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              className="flex items-center rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {tl.deleteAccount}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings; 