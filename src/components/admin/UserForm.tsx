import { useState } from "react";
import { 
  Save,
  X,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { User as UserType } from "@/lib/api";

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'customer' | 'admin';
  status: 'active' | 'inactive' | 'blocked';
  addresses: Array<{
    type: 'shipping' | 'billing';
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    language: string;
    currency: string;
  };
}

interface UserFormProps {
  initialData?: Partial<UserType>;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

export default function UserForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  mode
}: UserFormProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    status: 'active',
    addresses: [],
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      language: 'en',
      currency: 'USD'
    },
    ...initialData
  });

  const translations = {
    en: {
      title: mode === 'create' ? 'Create New User' : 'Edit User',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      role: 'Role',
      status: 'Status',
      customer: 'Customer',
      admin: 'Administrator',
      active: 'Active',
      inactive: 'Inactive',
      blocked: 'Blocked',
      addresses: 'Addresses',
      addAddress: 'Add Address',
      shipping: 'Shipping Address',
      billing: 'Billing Address',
      fullName: 'Full Name',
      address: 'Address',
      city: 'City',
      state: 'State/Province',
      zipCode: 'ZIP/Postal Code',
      country: 'Country',
      isDefault: 'Default Address',
      preferences: 'Preferences',
      emailNotifications: 'Email Notifications',
      smsNotifications: 'SMS Notifications',
      marketingEmails: 'Marketing Emails',
      language: 'Language',
      currency: 'Currency',
      save: 'Save User',
      cancel: 'Cancel',
      loading: 'Saving...',
      error: 'Error',
      success: 'User saved successfully',
      passwordMismatch: 'Passwords do not match',
      passwordRequired: 'Password is required for new users'
    },
    vi: {
      title: mode === 'create' ? 'Tạo Người Dùng Mới' : 'Chỉnh Sửa Người Dùng',
      name: 'Họ và Tên',
      email: 'Địa Chỉ Email',
      phone: 'Số Điện Thoại',
      password: 'Mật Khẩu',
      confirmPassword: 'Xác Nhận Mật Khẩu',
      role: 'Vai Trò',
      status: 'Trạng Thái',
      customer: 'Khách Hàng',
      admin: 'Quản Trị Viên',
      active: 'Hoạt Động',
      inactive: 'Không Hoạt Động',
      blocked: 'Bị Chặn',
      addresses: 'Địa Chỉ',
      addAddress: 'Thêm Địa Chỉ',
      shipping: 'Địa Chỉ Giao Hàng',
      billing: 'Địa Chỉ Thanh Toán',
      fullName: 'Họ và Tên',
      address: 'Địa Chỉ',
      city: 'Thành Phố',
      state: 'Tỉnh/Thành',
      zipCode: 'Mã Bưu Điện',
      country: 'Quốc Gia',
      isDefault: 'Địa Chỉ Mặc Định',
      preferences: 'Tùy Chọn',
      emailNotifications: 'Thông Báo Email',
      smsNotifications: 'Thông Báo SMS',
      marketingEmails: 'Email Marketing',
      language: 'Ngôn Ngữ',
      currency: 'Tiền Tệ',
      save: 'Lưu Người Dùng',
      cancel: 'Hủy',
      loading: 'Đang lưu...',
      error: 'Lỗi',
      success: 'Người dùng đã được lưu thành công',
      passwordMismatch: 'Mật khẩu không khớp',
      passwordRequired: 'Mật khẩu là bắt buộc cho người dùng mới'
    },
    ja: {
      title: mode === 'create' ? '新しいユーザーを作成' : 'ユーザーを編集',
      name: '氏名',
      email: 'メールアドレス',
      phone: '電話番号',
      password: 'パスワード',
      confirmPassword: 'パスワード確認',
      role: '役割',
      status: 'ステータス',
      customer: '顧客',
      admin: '管理者',
      active: 'アクティブ',
      inactive: '非アクティブ',
      blocked: 'ブロック済み',
      addresses: '住所',
      addAddress: '住所を追加',
      shipping: '配送先住所',
      billing: '請求先住所',
      fullName: '氏名',
      address: '住所',
      city: '市区町村',
      state: '都道府県',
      zipCode: '郵便番号',
      country: '国',
      isDefault: 'デフォルト住所',
      preferences: '設定',
      emailNotifications: 'メール通知',
      smsNotifications: 'SMS通知',
      marketingEmails: 'マーケティングメール',
      language: '言語',
      currency: '通貨',
      save: 'ユーザーを保存',
      cancel: 'キャンセル',
      loading: '保存中...',
      error: 'エラー',
      success: 'ユーザーが正常に保存されました',
      passwordMismatch: 'パスワードが一致しません',
      passwordRequired: '新しいユーザーにはパスワードが必要です'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password for new users
    if (mode === 'create' && !formData.password) {
      toast({
        title: t.error,
        description: t.passwordRequired,
        variant: 'destructive',
      });
      return;
    }

    try {
      await onSubmit(formData);
      toast({
        title: t.success,
      });
    } catch (error) {
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        type: 'shipping',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: false
      }]
    }));
  };

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const updateAddress = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => 
        i === index ? { ...addr, [field]: value } : addr
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            {t.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t.save}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            {mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">{t.role}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'customer' | 'admin') => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">{t.customer}</SelectItem>
                    <SelectItem value="admin">{t.admin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t.status}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive' | 'blocked') => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t.active}</SelectItem>
                    <SelectItem value="inactive">{t.inactive}</SelectItem>
                    <SelectItem value="blocked">{t.blocked}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t.preferences}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.emailNotifications}</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications</p>
                </div>
                <Switch
                  checked={formData.preferences.emailNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, emailNotifications: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.smsNotifications}</Label>
                  <p className="text-sm text-muted-foreground">Receive SMS notifications</p>
                </div>
                <Switch
                  checked={formData.preferences.smsNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, smsNotifications: checked }
                  }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t.marketingEmails}</Label>
                  <p className="text-sm text-muted-foreground">Receive marketing emails</p>
                </div>
                <Switch
                  checked={formData.preferences.marketingEmails}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, marketingEmails: checked }
                  }))}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">{t.language}</Label>
                <Select
                  value={formData.preferences.language}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, language: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">{t.currency}</Label>
                <Select
                  value={formData.preferences.currency}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    preferences: { ...prev.preferences, currency: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="VND">VND (₫)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Addresses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t.addresses}
            </CardTitle>
            <Button type="button" variant="outline" onClick={addAddress}>
              {t.addAddress}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.addresses.map((address, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {address.type === 'shipping' ? t.shipping : t.billing}
                </h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAddress(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.fullName}</Label>
                  <Input
                    value={address.fullName}
                    onChange={(e) => updateAddress(index, 'fullName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.phone}</Label>
                  <Input
                    value={address.phone}
                    onChange={(e) => updateAddress(index, 'phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.address}</Label>
                <Textarea
                  value={address.address}
                  onChange={(e) => updateAddress(index, 'address', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>{t.city}</Label>
                  <Input
                    value={address.city}
                    onChange={(e) => updateAddress(index, 'city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.state}</Label>
                  <Input
                    value={address.state}
                    onChange={(e) => updateAddress(index, 'state', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.zipCode}</Label>
                  <Input
                    value={address.zipCode}
                    onChange={(e) => updateAddress(index, 'zipCode', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.country}</Label>
                  <Input
                    value={address.country}
                    onChange={(e) => updateAddress(index, 'country', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={address.isDefault}
                  onCheckedChange={(checked) => updateAddress(index, 'isDefault', checked)}
                />
                <Label>{t.isDefault}</Label>
              </div>
            </div>
          ))}

          {formData.addresses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No addresses added yet</p>
              <Button type="button" variant="outline" onClick={addAddress} className="mt-2">
                {t.addAddress}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  );
} 