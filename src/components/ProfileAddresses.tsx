import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, Address as ApiAddress } from "@/lib/api";
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Home,
  Building,
  Check,
  Loader2
} from "lucide-react";

// Use API Address interface and extend with display properties
interface Address extends ApiAddress {
  displayType?: 'home' | 'work' | 'other';
}

const ProfileAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Vietnam",
    type: 'shipping' as 'shipping' | 'billing',
    displayType: 'home' as 'home' | 'work' | 'other'
  });
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const translations = {
    en: {
      title: "Shipping Addresses",
      subtitle: "Manage your delivery addresses",
      addAddress: "Add New Address",
      editAddress: "Edit Address",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      setDefault: "Set as Default",
      default: "Default",
      name: "Full Name",
      phone: "Phone Number",
      address: "Address",
      city: "City",
      state: "State/Province",
      zipCode: "Zip Code",
      country: "Country",
      type: "Address Type",
      shipping: "Shipping",
      billing: "Billing",
      home: "Home",
      work: "Work",
      other: "Other",
      noAddresses: "No addresses saved yet",
      noAddressesDesc: "Add your first shipping address to get started",
      addressAdded: "Address added successfully",
      addressUpdated: "Address updated successfully",
      addressDeleted: "Address deleted successfully",
      defaultSet: "Default address updated"
    },
    vi: {
      title: "Địa Chỉ Giao Hàng",
      subtitle: "Quản lý địa chỉ giao hàng của bạn",
      addAddress: "Thêm Địa Chỉ Mới",
      editAddress: "Chỉnh Sửa Địa Chỉ",
      save: "Lưu",
      cancel: "Hủy",
      delete: "Xóa",
      setDefault: "Đặt Làm Mặc Định",
      default: "Mặc Định",
      name: "Họ Tên",
      phone: "Số Điện Thoại",
      address: "Địa Chỉ",
      city: "Thành Phố",
      state: "Tỉnh/Thành",
      zipCode: "Mã Bưu Điện",
      country: "Quốc Gia",
      type: "Loại Địa Chỉ",
      shipping: "Giao Hàng",
      billing: "Thanh Toán",
      home: "Nhà",
      work: "Công Ty",
      other: "Khác",
      noAddresses: "Chưa có địa chỉ nào được lưu",
      noAddressesDesc: "Thêm địa chỉ giao hàng đầu tiên để bắt đầu",
      addressAdded: "Đã thêm địa chỉ thành công",
      addressUpdated: "Đã cập nhật địa chỉ thành công",
      addressDeleted: "Đã xóa địa chỉ thành công",
      defaultSet: "Đã cập nhật địa chỉ mặc định"
    },
    ja: {
      title: "配送先住所",
      subtitle: "配送先住所を管理",
      addAddress: "新しい住所を追加",
      editAddress: "住所を編集",
      save: "保存",
      cancel: "キャンセル",
      delete: "削除",
      setDefault: "デフォルトに設定",
      default: "デフォルト",
      name: "氏名",
      phone: "電話番号",
      address: "住所",
      city: "市区町村",
      state: "都道府県",
      zipCode: "郵便番号",
      country: "国",
      type: "住所タイプ",
      shipping: "配送",
      billing: "請求",
      home: "自宅",
      work: "会社",
      other: "その他",
      noAddresses: "保存された住所はありません",
      noAddressesDesc: "最初の配送先住所を追加して開始してください",
      addressAdded: "住所が正常に追加されました",
      addressUpdated: "住所が正常に更新されました",
      addressDeleted: "住所が正常に削除されました",
      defaultSet: "デフォルト住所が更新されました"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Load addresses from API
  useEffect(() => {
    const loadAddresses = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.getUserAddresses();
        // Map API addresses to component format
        const mappedAddresses = response.addresses.map(addr => ({
          ...addr,
          displayType: addr.type === 'shipping' ? 'home' as const : 'work' as const
        }));
        setAddresses(mappedAddresses);
      } catch (error) {
        console.error('Error loading addresses:', error);
        toast({
          title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
          description: language === 'vi' ? 'Không thể tải địa chỉ' : 
                      language === 'ja' ? '住所を読み込めませんでした' : 
                      'Failed to load addresses',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAddresses();
  }, [isAuthenticated, toast, language]);

  const getTypeIcon = (displayType?: string) => {
    switch (displayType) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'work':
        return <Building className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Vietnam",
      type: 'shipping',
      displayType: 'home'
    });
  };

  const handleEdit = (address: Address) => {
    setEditingId(address._id);
    setIsAdding(false);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      type: address.type,
      displayType: address.displayType || 'home'
    });
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Vui lòng điền đầy đủ thông tin' :
                    language === 'ja' ? 'すべての情報を入力してください' :
                    'Please fill in all required fields',
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const addressData = {
        type: formData.type,
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        isDefault: addresses.length === 0
      };

      if (editingId) {
        // Update existing address
        const response = await api.updateAddress(editingId, addressData);
        setAddresses(prev => prev.map(addr => 
          addr._id === editingId 
            ? { ...response.address, displayType: formData.displayType }
            : addr
        ));
        toast({
          title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
          description: t.addressUpdated,
        });
      } else {
        // Add new address
        const response = await api.addAddress(addressData);
        setAddresses(prev => [...prev, { 
          ...response.address, 
          displayType: formData.displayType 
        }]);
        toast({
          title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
          description: t.addressAdded,
        });
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Vietnam",
        type: 'shipping',
        displayType: 'home'
      });
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể lưu địa chỉ' :
                    language === 'ja' ? '住所を保存できませんでした' :
                    'Failed to save address',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Vietnam",
      type: 'shipping',
      displayType: 'home'
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAddress(id);
      setAddresses(prev => prev.filter(addr => addr._id !== id));
      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: t.addressDeleted,
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể xóa địa chỉ' :
                    language === 'ja' ? '住所を削除できませんでした' :
                    'Failed to delete address',
        variant: "destructive",
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.setDefaultAddress(id);
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr._id === id
      })));
      toast({
        title: language === 'vi' ? 'Thành công' : language === 'ja' ? '成功' : 'Success',
        description: t.defaultSet,
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
        description: language === 'vi' ? 'Không thể đặt địa chỉ mặc định' :
                    language === 'ja' ? 'デフォルト住所を設定できませんでした' :
                    'Failed to set default address',
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
            <p className="text-muted-foreground">{t.subtitle}</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            {t.addAddress}
          </Button>
        </div>
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t.title}</h2>
          <p className="text-muted-foreground text-lg font-medium">{t.subtitle}</p>
        </div>
        <Button onClick={handleAdd} disabled={saving} className="rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-4 w-4 mr-2" />
          {t.addAddress}
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {editingId ? t.editAddress : t.addAddress}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="font-semibold">{t.name}</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                  className="rounded-lg border-2 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="font-semibold">{t.phone}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  className="rounded-lg border-2 focus:border-primary transition-all"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address" className="font-semibold">{t.address}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
                className="rounded-lg border-2 focus:border-primary transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" className="font-semibold">{t.city}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                  className="rounded-lg border-2 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="state" className="font-semibold">{t.state}</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  required
                  className="rounded-lg border-2 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="zipCode" className="font-semibold">{t.zipCode}</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                  required
                  className="rounded-lg border-2 focus:border-primary transition-all"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country" className="font-semibold">{t.country}</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  required
                  className="rounded-lg border-2 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="type" className="font-semibold">{t.type}</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as 'shipping' | 'billing'})}
                  className="w-full p-2 border-2 border-input rounded-lg focus:border-primary transition-all"
                >
                  <option value="shipping">{t.shipping}</option>
                  <option value="billing">{t.billing}</option>
                </select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="displayType" className="font-semibold">Display Type</Label>
              <select
                id="displayType"
                value={formData.displayType}
                onChange={(e) => setFormData({...formData, displayType: e.target.value as 'home' | 'work' | 'other'})}
                className="w-full p-2 border-2 border-input rounded-lg focus:border-primary transition-all font-medium"
              >
                <option value="home">{t.home}</option>
                <option value="work">{t.work}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCancel} disabled={saving} className="rounded-xl font-semibold border-2">
                {t.cancel}
              </Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {t.save}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">{t.noAddresses}</h3>
            <p className="text-muted-foreground mb-8 font-medium text-lg">{t.noAddressesDesc}</p>
            <Button onClick={handleAdd} className="rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
              <Plus className="h-4 w-4 mr-2" />
              {t.addAddress}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address._id} className="relative rounded-xl border-2 shadow-lg hover:shadow-xl transition-all bg-background/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 border-2 border-primary/20">
                      {getTypeIcon(address.displayType)}
                    </div>
                    <span className="font-bold text-lg">{address.fullName}</span>
                    {address.isDefault && (
                      <Badge variant="default" className="text-xs rounded-lg border-2 font-semibold">
                        {t.default}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs rounded-lg border-2 font-semibold">
                      {address.type === 'shipping' ? t.shipping : t.billing}
                    </Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(address)}
                      className="rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(address._id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{address.phone}</p>
                  <p>{address.address}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  <p className="text-muted-foreground">{address.country}</p>
                </div>
                
                {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 rounded-lg font-semibold border-2"
                      onClick={() => handleSetDefault(address._id)}
                    >
                      {t.setDefault}
                    </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileAddresses; 