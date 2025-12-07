import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth, useSettings } from "@/contexts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";
import { 
  Settings, 
  Lock, 
  Eye, 
  EyeOff,
  Save,
  Trash2,
  AlertTriangle,
  Check,
  Mail,
  Loader2
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
  const { settings: systemSettings } = useSettings();
  const passwordMinLength = systemSettings?.passwordMinLength || 8;
  
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
  const [passwordErrors, setPasswordErrors] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const { language, t: tCommon, setLanguage } = useLanguage();
  const { toast } = useToast();
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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

  // Load settings from API
  useEffect(() => {
    const loadSettings = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const response = await api.getProfile();
        if (response && response.user) {
          const user = response.user;
          setSettings(prev => ({
            ...prev,
            language: user.preferences?.language || prev.language,
            currency: user.preferences?.currency || prev.currency,
            emailNotifications: user.preferences?.emailNotifications ?? prev.emailNotifications,
            marketingEmails: user.preferences?.marketingEmails ?? prev.marketingEmails,
            // Note: timezone and twoFactorAuth are not stored in backend, only in local state
          }));
        }
      } catch (error) {
        logger.error('Error loading settings', error);
        toast({
          title: tCommon('error'),
          description: language === 'vi' ? 'Không thể tải cài đặt' : 
                       language === 'ja' ? '設定を読み込めませんでした' : 
                       'Could not load settings',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [isAuthenticated, toast, tCommon, language]);

  const handleSettingChange = (key: keyof AccountSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsSaving(true);
      await api.updateProfile({
        preferences: {
          language: settings.language,
          currency: settings.currency,
          emailNotifications: settings.emailNotifications,
          marketingEmails: settings.marketingEmails,
        }
      });

      // Update language context if language changed
      if (settings.language !== language) {
        setLanguage(settings.language as 'en' | 'vi' | 'ja');
      }

      toast({
        title: tCommon('success'),
        description: tl.settingsSaved,
      });
    } catch (error) {
      logger.error('Error saving settings', error);
      toast({
        title: tCommon('error'),
        description: language === 'vi' ? 'Không thể lưu cài đặt' : 
                     language === 'ja' ? '設定を保存できませんでした' : 
                     'Could not save settings',
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!isAuthenticated) return;
    
    // Validate all fields are filled
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: tCommon('error'),
        description: language === 'vi' ? 'Vui lòng điền đầy đủ thông tin' : 
                     language === 'ja' ? 'すべての情報を入力してください' : 
                     'Please fill in all fields',
        variant: "destructive",
      });
      return;
    }

    // Validate new password length
    if (passwordData.newPassword.length < passwordMinLength) {
      setPasswordErrors({
        newPassword: language === 'vi' ? `Mật khẩu phải có ít nhất ${passwordMinLength} ký tự` : 
                    language === 'ja' ? `パスワードは少なくとも${passwordMinLength}文字である必要があります` : 
                    `Password must be at least ${passwordMinLength} characters`,
        confirmPassword: passwordErrors.confirmPassword
      });
      toast({
        title: tCommon('error'),
        description: language === 'vi' ? `Mật khẩu mới phải có ít nhất ${passwordMinLength} ký tự` : 
                     language === 'ja' ? `新しいパスワードは少なくとも${passwordMinLength}文字である必要があります` : 
                     `New password must be at least ${passwordMinLength} characters`,
        variant: "destructive",
      });
      return;
    }

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordErrors({
        newPassword: "",
        confirmPassword: language === 'vi' ? 'Mật khẩu xác nhận không khớp' : 
                       language === 'ja' ? '確認パスワードが一致しません' : 
                       'Passwords do not match'
      });
      toast({
        title: tCommon('error'),
        description: language === 'vi' ? 'Mật khẩu xác nhận không khớp' : 
                     language === 'ja' ? '確認パスワードが一致しません' : 
                     'Passwords do not match',
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      toast({
        title: tCommon('success'),
        description: tl.passwordChanged,
      });

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordErrors({
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error: any) {
      logger.error('Error changing password', error);
      toast({
        title: tCommon('error'),
        description: error?.message || (language === 'vi' ? 'Không thể đổi mật khẩu' : 
                                       language === 'ja' ? 'パスワードを変更できませんでした' : 
                                       'Could not change password'),
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isAuthenticated) return;
    
    if (!confirm(tl.deleteAccountWarning)) {
      return;
    }

    if (!deletePassword) {
      toast({
        title: tCommon('error'),
        description: language === 'vi' ? 'Vui lòng nhập mật khẩu để xác nhận' : 
                     language === 'ja' ? '確認のためパスワードを入力してください' : 
                     'Please enter password to confirm',
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeletingAccount(true);
      await api.deleteAccount(deletePassword);
      
      toast({
        title: tCommon('success'),
        description: tl.deleteAccountDesc,
      });

      // Logout and redirect to home
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    } catch (error: any) {
      logger.error('Error deleting account', error);
      toast({
        title: tCommon('error'),
        description: error?.message || (language === 'vi' ? 'Không thể xóa tài khoản' : 
                                       language === 'ja' ? 'アカウントを削除できませんでした' : 
                                       'Could not delete account'),
        variant: "destructive",
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setPasswordData({...passwordData, newPassword: newValue, confirmPassword: ""});
                    // Clear confirm password when new password changes
                    // Validate new password
                    if (newValue && newValue.length < passwordMinLength) {
                      setPasswordErrors({
                        newPassword: language === 'vi' ? `Mật khẩu phải có ít nhất ${passwordMinLength} ký tự` : 
                                    language === 'ja' ? `パスワードは少なくとも${passwordMinLength}文字である必要があります` : 
                                    `Password must be at least ${passwordMinLength} characters`,
                        confirmPassword: ""
                      });
                    } else {
                      setPasswordErrors({
                        newPassword: "",
                        confirmPassword: ""
                      });
                    }
                  }}
                  className={`rounded-lg border-2 focus:border-primary transition-all ${
                    passwordErrors.newPassword ? 'border-red-500' : ''
                  }`}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="confirmPassword" className="font-semibold">{tl.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    const confirmValue = e.target.value;
                    setPasswordData({...passwordData, confirmPassword: confirmValue});
                    // Validate confirm password
                    if (!passwordData.newPassword || passwordData.newPassword.length < passwordMinLength) {
                      setPasswordErrors(prev => ({
                        ...prev,
                        confirmPassword: language === 'vi' ? 'Vui lòng nhập mật khẩu mới hợp lệ trước' : 
                                      language === 'ja' ? 'まず有効な新しいパスワードを入力してください' : 
                                      'Please enter a valid new password first'
                      }));
                    } else if (confirmValue && confirmValue !== passwordData.newPassword) {
                      setPasswordErrors(prev => ({
                        ...prev,
                        confirmPassword: language === 'vi' ? 'Mật khẩu xác nhận không khớp' : 
                                      language === 'ja' ? '確認パスワードが一致しません' : 
                                      'Passwords do not match'
                      }));
                    } else {
                      setPasswordErrors(prev => ({
                        ...prev,
                        confirmPassword: ""
                      }));
                    }
                  }}
                  disabled={!passwordData.newPassword || passwordData.newPassword.length < passwordMinLength}
                  className={`rounded-lg border-2 focus:border-primary transition-all ${
                    passwordErrors.confirmPassword ? 'border-red-500' : ''
                  } ${!passwordData.newPassword || passwordData.newPassword.length < passwordMinLength ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder={
                    !passwordData.newPassword || passwordData.newPassword.length < passwordMinLength
                      ? (language === 'vi' ? 'Nhập mật khẩu mới trước' : 
                         language === 'ja' ? 'まず新しいパスワードを入力してください' : 
                         'Enter new password first')
                      : (language === 'vi' ? 'Xác nhận mật khẩu mới' : 
                         language === 'ja' ? '新しいパスワードを確認' : 
                         'Confirm new password')
                  }
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                )}
                {!passwordData.newPassword || passwordData.newPassword.length < passwordMinLength ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'vi' ? `Vui lòng nhập mật khẩu mới hợp lệ (ít nhất ${passwordMinLength} ký tự) trước khi xác nhận` : 
                     language === 'ja' ? `確認する前に、有効な新しいパスワード（${passwordMinLength}文字以上）を入力してください` : 
                     `Please enter a valid new password (at least ${passwordMinLength} characters) before confirming`}
                  </p>
                ) : null}
              </div>
              
              <Button 
                onClick={handlePasswordChange} 
                disabled={
                  isChangingPassword || 
                  !passwordData.currentPassword || 
                  !passwordData.newPassword || 
                  !passwordData.confirmPassword ||
                  passwordData.newPassword.length < passwordMinLength ||
                  passwordData.newPassword !== passwordData.confirmPassword ||
                  !!passwordErrors.newPassword ||
                  !!passwordErrors.confirmPassword
                }
                className="rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === 'vi' ? 'Đang xử lý...' : language === 'ja' ? '処理中...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {tl.savePassword}
                  </>
                )}
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
        <CardContent className="p-6 space-y-4">
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
      <div className="flex justify-end py-4">
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
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
              {tl.saveSettings}
            </>
          )}
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
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="font-medium text-red-600 mb-2">{tl.deleteAccount}</h3>
            <p className="text-sm text-muted-foreground">{tl.deleteAccountDesc}</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deletePassword" className="text-red-600 font-semibold">
                {language === 'vi' ? 'Mật khẩu để xác nhận' : 
                 language === 'ja' ? '確認用パスワード' : 
                 'Password to confirm'}
              </Label>
              <Input
                id="deletePassword"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder={language === 'vi' ? 'Nhập mật khẩu của bạn' : 
                             language === 'ja' ? 'パスワードを入力' : 
                             'Enter your password'}
                className="rounded-lg border-2 border-red-200 focus:border-red-400 transition-all"
              />
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount || !deletePassword}
              className="flex items-center rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'vi' ? 'Đang xóa...' : language === 'ja' ? '削除中...' : 'Deleting...'}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {tl.deleteAccount}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings; 