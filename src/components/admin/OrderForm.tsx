import { useState, useEffect } from "react";
import { 
  Save,
  X,
  Loader2,
  Package,
  User,
  MapPin,
  CreditCard,
  Plus,
  Minus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Order, Product, User as UserType } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

interface OrderFormData {
  userId: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
  };
  paymentMethod: string;
  notes?: string;
  trackingNumber?: string;
}

interface OrderFormProps {
  initialData?: Partial<Order>;
  users: UserType[];
  products: Product[];
  onSubmit: (data: OrderFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

export default function OrderForm({
  initialData,
  users,
  products,
  onSubmit,
  onCancel,
  isSubmitting,
  mode
}: OrderFormProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  
  // Helper function to get product name based on language
  const getProductName = (product: any) => {
    if (!product) return 'Unknown Product';
    switch (language) {
      case 'vi': return product.name;
      case 'ja': return product.nameJa || product.name;
      default: return product.nameEn || product.name;
    }
  };
  
  const [formData, setFormData] = useState<OrderFormData>({
    userId: typeof initialData?.userId === 'string' ? initialData.userId : initialData?.userId?._id || '',
    status: initialData?.status || 'pending',
    paymentStatus: initialData?.paymentStatus || 'pending',
    items: initialData?.items?.map(item => ({
      productId: typeof item.productId === 'string' ? item.productId : item.productId._id,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      color: item.color
    })) || [],
    shippingAddress: {
      name: initialData?.shippingAddress?.name || '',
      phone: initialData?.shippingAddress?.phone || '',
      address: initialData?.shippingAddress?.address || '',
      city: initialData?.shippingAddress?.city || '',
      district: initialData?.shippingAddress?.district || ''
    },
    paymentMethod: initialData?.paymentMethod || '',
    notes: initialData?.notes || '',
    trackingNumber: (initialData as any)?.trackingNumber || ''
  });

  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const translations = {
    en: {
      title: mode === 'create' ? 'Create New Order' : 'Edit Order',
      customer: 'Customer',
      selectCustomer: 'Select Customer',
      status: 'Status',
      paymentStatus: 'Payment Status',
      items: 'Order Items',
      addItem: 'Add Item',
      product: 'Product',
      quantity: 'Quantity',
      price: 'Price',
      size: 'Size',
      color: 'Color',
      remove: 'Remove',
      shippingAddress: 'Shipping Address',
      name: 'Name',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      district: 'District',
      paymentMethod: 'Payment Method',
      notes: 'Notes',
      trackingNumber: 'Tracking Number',
      subtotal: 'Subtotal',
      total: 'Total',
      save: 'Save Order',
      cancel: 'Cancel',
      loading: 'Saving...',
      error: 'Error',
      success: 'Order saved successfully'
    },
    vi: {
      title: mode === 'create' ? 'Tạo Đơn Hàng Mới' : 'Chỉnh Sửa Đơn Hàng',
      customer: 'Khách hàng',
      selectCustomer: 'Chọn khách hàng',
      status: 'Trạng thái',
      paymentStatus: 'Trạng thái thanh toán',
      items: 'Sản phẩm đặt hàng',
      addItem: 'Thêm sản phẩm',
      product: 'Sản phẩm',
      quantity: 'Số lượng',
      price: 'Giá',
      size: 'Kích thước',
      color: 'Màu sắc',
      remove: 'Xóa',
      shippingAddress: 'Địa chỉ giao hàng',
      name: 'Tên',
      phone: 'Số điện thoại',
      address: 'Địa chỉ',
      city: 'Thành phố',
      district: 'Quận/Huyện',
      paymentMethod: 'Phương thức thanh toán',
      notes: 'Ghi chú',
      trackingNumber: 'Mã theo dõi',
      subtotal: 'Tạm tính',
      total: 'Tổng cộng',
      save: 'Lưu đơn hàng',
      cancel: 'Hủy',
      loading: 'Đang lưu...',
      error: 'Lỗi',
      success: 'Đơn hàng đã được lưu thành công'
    },
    ja: {
      title: mode === 'create' ? '新しい注文を作成' : '注文を編集',
      customer: '顧客',
      selectCustomer: '顧客を選択',
      status: 'ステータス',
      paymentStatus: '支払い状況',
      items: '注文商品',
      addItem: '商品を追加',
      product: '商品',
      quantity: '数量',
      price: '価格',
      size: 'サイズ',
      color: '色',
      remove: '削除',
      shippingAddress: '配送先住所',
      name: '名前',
      phone: '電話番号',
      address: '住所',
      city: '市区町村',
      district: '都道府県',
      paymentMethod: '支払い方法',
      notes: 'メモ',
      trackingNumber: '追跡番号',
      subtotal: '小計',
      total: '合計',
      save: '注文を保存',
      cancel: 'キャンセル',
      loading: '保存中...',
      error: 'エラー',
      success: '注文が正常に保存されました'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('OrderForm - Submitting form data:', formData);
    
    // Validation
    if (!formData.userId) {
      console.log('OrderForm - Validation failed: No customer selected');
      toast({
        title: t.error,
        description: 'Please select a customer',
        variant: 'destructive',
      });
      return;
    }

    if (formData.items.length === 0) {
      console.log('OrderForm - Validation failed: No items');
      toast({
        title: t.error,
        description: 'Please add at least one item to the order',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.shippingAddress.name || !formData.shippingAddress.phone || 
        !formData.shippingAddress.address || !formData.shippingAddress.city || 
        !formData.shippingAddress.district) {
      console.log('OrderForm - Validation failed: Incomplete shipping address');
      toast({
        title: t.error,
        description: 'Please fill in all shipping address fields',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.paymentMethod) {
      console.log('OrderForm - Validation failed: No payment method');
      toast({
        title: t.error,
        description: 'Please specify a payment method',
        variant: 'destructive',
      });
      return;
    }

    console.log('OrderForm - Validation passed, calling onSubmit');
    try {
      await onSubmit(formData);
      console.log('OrderForm - Submit successful');
      toast({
        title: t.success,
      });
    } catch (error) {
      console.error('OrderForm - Submit error:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const addItem = () => {
    console.log('OrderForm - addItem called:', { selectedProduct, selectedQuantity, selectedSize, selectedColor });
    
    if (!selectedProduct || selectedQuantity <= 0) {
      console.log('OrderForm - addItem validation failed:', { selectedProduct, selectedQuantity });
      return;
    }
    
    const product = products.find(p => p._id === selectedProduct);
    if (!product) {
      console.log('OrderForm - addItem: Product not found:', selectedProduct);
      return;
    }

    const newItem = {
      productId: selectedProduct,
      quantity: selectedQuantity,
      price: product.price,
      size: selectedSize || undefined,
      color: selectedColor || undefined
    };

    console.log('OrderForm - addItem: Adding new item:', newItem);

    setFormData(prev => {
      const updated = {
        ...prev,
        items: [...prev.items, newItem]
      };
      console.log('OrderForm - addItem: Updated formData:', updated);
      return updated;
    });

    // Reset form
    setSelectedProduct('');
    setSelectedQuantity(1);
    setSelectedSize('');
    setSelectedColor('');
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity } : item
      )
    }));
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = 0; // You can add shipping calculation logic here
  const total = subtotal + shipping;

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
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">{t.customer}</Label>
              <Select
                value={formData.userId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, userId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectCustomer} />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">{t.status}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentStatus">{t.paymentStatus}</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value: 'pending' | 'paid' | 'failed') => 
                    setFormData(prev => ({ ...prev, paymentStatus: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">{t.paymentMethod}</Label>
              <Input
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                placeholder="Credit Card, PayPal, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackingNumber">{t.trackingNumber}</Label>
              <Input
                id="trackingNumber"
                value={formData.trackingNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                placeholder="Tracking number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t.notes}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Order notes..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t.shippingAddress}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shippingName">{t.name}</Label>
              <Input
                id="shippingName"
                value={formData.shippingAddress.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  shippingAddress: { ...prev.shippingAddress, name: e.target.value }
                }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingPhone">{t.phone}</Label>
              <Input
                id="shippingPhone"
                value={formData.shippingAddress.phone}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  shippingAddress: { ...prev.shippingAddress, phone: e.target.value }
                }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress">{t.address}</Label>
              <Textarea
                id="shippingAddress"
                value={formData.shippingAddress.address}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  shippingAddress: { ...prev.shippingAddress, address: e.target.value }
                }))}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shippingCity">{t.city}</Label>
                <Input
                  id="shippingCity"
                  value={formData.shippingAddress.city}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                  }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shippingDistrict">{t.district}</Label>
                <Input
                  id="shippingDistrict"
                  value={formData.shippingAddress.district}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    shippingAddress: { ...prev.shippingAddress, district: e.target.value }
                  }))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t.items}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Item Form */}
          <div className="grid grid-cols-6 gap-4 items-end">
            <div className="space-y-2">
              <Label>{t.product}</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product._id} value={product._id}>
                      {getProductName(product)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.quantity}</Label>
              <Input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.size}</Label>
              <Input
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                placeholder="Size"
              />
            </div>

            <div className="space-y-2">
              <Label>{t.color}</Label>
              <Input
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                placeholder="Color"
              />
            </div>

            <div className="space-y-2">
              <Label>{t.price}</Label>
              <div className="relative">
                <Input
                  type="text"
                  value={selectedProduct ? formatCurrency(products.find(p => p._id === selectedProduct)?.price || 0, language) : ''}
                  disabled
                  className="pr-8"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  {language === 'vi' ? 'VND' : language === 'ja' ? 'JPY' : 'USD'}
                </div>
              </div>
            </div>

            <Button type="button" onClick={addItem} disabled={!selectedProduct}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addItem}
            </Button>
          </div>

          <Separator />

          {/* Items List */}
          <div className="space-y-2">
            {formData.items.map((item, index) => {
              const product = products.find(p => p._id === item.productId);
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{getProductName(product)}</div>
                    <div className="text-sm text-muted-foreground">
                      {t.quantity}: {item.quantity} | {t.price}: {formatCurrency(item.price, language)}
                      {item.size && ` | ${t.size}: ${item.size}`}
                      {item.color && ` | ${t.color}: ${item.color}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(item.price * item.quantity, language)}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.price, language)}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t.subtotal}:</span>
                <span>{formatCurrency(subtotal, language)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{formatCurrency(shipping, language)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>{t.total}:</span>
                <span>{formatCurrency(total, language)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
} 