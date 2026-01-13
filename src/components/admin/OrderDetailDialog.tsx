import { useState } from "react";
import { 
  X,
  Package,
  User,
  MapPin,
  Phone,
  CreditCard,
  Truck,
  Calendar,
  FileText,
  Download,
  Printer,
  Mail,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Trash2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Order } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

interface OrderDetailDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => Promise<void>;
  onPrint: (order: Order) => void;
  onSendEmail: (order: Order) => void;
  onEdit?: (order: Order) => void;
  onDelete?: (orderId: string) => Promise<void>;
  mode?: 'view' | 'edit';
}

export default function OrderDetailDialog({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onPrint,
  onSendEmail,
  onEdit,
  onDelete,
  mode = 'view'
}: OrderDetailDialogProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(order?.status || '');
  const [isDeleting, setIsDeleting] = useState(false);

  const translations = {
    en: {
      title: 'Order Details',
      orderNumber: 'Order Number',
      orderDate: 'Order Date',
      status: 'Status',
      paymentStatus: 'Payment Status',
      customerInfo: 'Customer Information',
      shippingAddress: 'Shipping Address',
      billingAddress: 'Billing Address',
      orderItems: 'Order Items',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      total: 'Total',
      updateStatus: 'Update Status',
      printOrder: 'Print Order',
      sendEmail: 'Send Email',
      downloadInvoice: 'Download Invoice',
      close: 'Close',
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      completed: 'Completed',
      cancelled: 'Cancelled',
      paid: 'Paid',
      unpaid: 'Unpaid',
      failed: 'Payment Failed',
      quantity: 'Qty',
      price: 'Price',
      itemTotal: 'Item Total',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      country: 'Country',
      paymentMethod: 'Payment Method',
      trackingNumber: 'Tracking Number',
      notes: 'Notes',
      noNotes: 'No notes available'
    },
    vi: {
      title: 'Chi tiết đơn hàng',
      orderNumber: 'Mã đơn hàng',
      orderDate: 'Ngày đặt',
      status: 'Trạng thái',
      paymentStatus: 'Trạng thái thanh toán',
      customerInfo: 'Thông tin khách hàng',
      shippingAddress: 'Địa chỉ giao hàng',
      billingAddress: 'Địa chỉ thanh toán',
      orderItems: 'Sản phẩm đặt hàng',
      subtotal: 'Tạm tính',
      shipping: 'Phí vận chuyển',
      tax: 'Thuế',
      total: 'Tổng cộng',
      updateStatus: 'Cập nhật trạng thái',
      printOrder: 'In đơn hàng',
      sendEmail: 'Gửi email',
      downloadInvoice: 'Tải hóa đơn',
      close: 'Đóng',
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đã gửi hàng',
      delivered: 'Đã giao hàng',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      paid: 'Đã thanh toán',
      unpaid: 'Chưa thanh toán',
      failed: 'Thanh toán thất bại',
      quantity: 'SL',
      price: 'Giá',
      itemTotal: 'Thành tiền',
      phone: 'Điện thoại',
      email: 'Email',
      address: 'Địa chỉ',
      city: 'Thành phố',
      state: 'Tỉnh/Thành',
      zipCode: 'Mã bưu điện',
      country: 'Quốc gia',
      paymentMethod: 'Phương thức thanh toán',
      trackingNumber: 'Mã theo dõi',
      notes: 'Ghi chú',
      noNotes: 'Không có ghi chú'
    },
    ja: {
      title: '注文詳細',
      orderNumber: '注文番号',
      orderDate: '注文日',
      status: 'ステータス',
      paymentStatus: '支払いステータス',
      customerInfo: '顧客情報',
      shippingAddress: '配送先住所',
      billingAddress: '請求先住所',
      orderItems: '注文商品',
      subtotal: '小計',
      shipping: '配送料',
      tax: '税金',
      total: '合計',
      updateStatus: 'ステータス更新',
      printOrder: '注文を印刷',
      sendEmail: 'メール送信',
      downloadInvoice: '請求書をダウンロード',
      close: '閉じる',
      pending: '保留中',
      processing: '処理中',
      shipped: '発送済み',
      delivered: '配達済み',
      completed: '完了',
      cancelled: 'キャンセル',
      paid: '支払い済み',
      unpaid: '未払い',
      failed: '支払い失敗',
      quantity: '数量',
      price: '価格',
      itemTotal: '小計',
      phone: '電話番号',
      email: 'メール',
      address: '住所',
      city: '市区町村',
      state: '都道府県',
      zipCode: '郵便番号',
      country: '国',
      paymentMethod: '支払い方法',
      trackingNumber: '追跡番号',
      notes: '備考',
      noNotes: '備考なし'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: t.pending, variant: "secondary" as const, icon: Clock },
      processing: { label: t.processing, variant: "default" as const, icon: Package },
      shipped: { label: t.shipped, variant: "default" as const, icon: Truck },
      delivered: { label: t.delivered, variant: "default" as const, icon: CheckCircle },
      completed: { label: t.completed, variant: "default" as const, icon: CheckCircle },
      cancelled: { label: t.cancelled, variant: "destructive" as const, icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: t.paid, variant: "default" as const },
      unpaid: { label: t.unpaid, variant: "secondary" as const },
      failed: { label: t.failed, variant: "destructive" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrencyForDisplay = (amount: number) => {
    return formatCurrency(amount, language);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'vi' ? 'vi-VN' : language === 'ja' ? 'ja-JP' : 'en-US'
    );
  };

  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.status) return;
    
    try {
      setIsUpdating(true);
      await onUpdateStatus(order._id, newStatus);
      toast({
        title: 'Status updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error updating status',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    if (order) {
      onPrint(order);
    }
  };

  const handleSendEmail = () => {
    if (order) {
      onSendEmail(order);
    }
  };

  const handleEdit = () => {
    if (order && onEdit) {
      onEdit(order);
    }
  };

  const handleDelete = async () => {
    if (!order || !onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await onDelete(order._id);
        toast({
          title: 'Order deleted successfully',
        });
        onClose();
      } catch (error) {
        toast({
          title: 'Failed to delete order',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="h-6 w-6" />
              {t.title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                {t.printOrder}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSendEmail}>
                <Mail className="h-4 w-4 mr-2" />
                {t.sendEmail}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t.downloadInvoice}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Order Header - Improved Layout */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-primary">{order.orderNumber}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{t.orderDate}: {formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="text-center sm:text-right">
                    <p className="text-sm text-muted-foreground mb-1">{t.status}</p>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-sm text-muted-foreground mb-1">{t.paymentStatus}</p>
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{t.updateStatus}</p>
                  <div className="flex items-center gap-3">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder={t.updateStatus} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t.pending}</SelectItem>
                        <SelectItem value="processing">{t.processing}</SelectItem>
                        <SelectItem value="shipped">{t.shipped}</SelectItem>
                        <SelectItem value="delivered">{t.delivered}</SelectItem>
                        <SelectItem value="completed">{t.completed}</SelectItem>
                        <SelectItem value="cancelled">{t.cancelled}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleUpdateStatus} 
                      disabled={isUpdating || newStatus === order.status || order.status === 'cancelled'}
                      size="sm"
                      className="min-w-[120px]"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        t.updateStatus
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer & Shipping Info - Better Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Customer Information */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  {t.customerInfo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">{order.userId?.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{order.userId?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{order.userId?.phone || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  {t.shippingAddress}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">{order.shippingAddress?.name}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{order.shippingAddress?.address}</p>
                    <p className="font-medium">
                      {order.shippingAddress?.city}, {order.shippingAddress?.district}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items - Enhanced Product Display */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                {t.orderItems} ({order.items.length} {order.items.length === 1 ? 'item' : 'items'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex flex-col lg:flex-row gap-6 p-6 border-2 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/20 transition-all duration-200">
                    {/* Product Image */}
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-muted rounded-lg overflow-hidden border-2 border-border flex-shrink-0">
                      {item.productId?.images && item.productId.images.length > 0 ? (
                        <img
                          src={item.productId.images[0]}
                          alt={item.productId.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-xl font-semibold text-foreground">
                          {item.productId?.name || item.name || 'Product Name'}
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {item.size && (
                            <Badge variant="outline" className="px-3 py-1">
                              {language === 'vi' ? 'Kích thước' : language === 'ja' ? 'サイズ' : 'Size'}: {item.size}
                            </Badge>
                          )}
                          {item.color && (
                            <Badge variant="outline" className="px-3 py-1">
                              {language === 'vi' ? 'Màu sắc' : language === 'ja' ? '色' : 'Color'}: {item.color}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Product Specifications */}
                      {item.productId && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          {item.productId.nameEn && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-muted-foreground">
                                {language === 'vi' ? 'Tên tiếng Anh' : language === 'ja' ? '英語名' : 'English Name'}:
                              </span>
                              <span>{item.productId.nameEn}</span>
                            </div>
                          )}
                          {item.productId.nameJa && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-muted-foreground">
                                {language === 'vi' ? 'Tên tiếng Nhật' : language === 'ja' ? '日本語名' : 'Japanese Name'}:
                              </span>
                              <span>{item.productId.nameJa}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Price & Quantity */}
                    <div className="flex flex-col items-end gap-4 text-right">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {language === 'vi' ? 'Số lượng' : language === 'ja' ? '数量' : 'Quantity'}
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {item.quantity}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          {language === 'vi' ? 'Đơn giá' : language === 'ja' ? '単価' : 'Unit Price'}
                        </div>
                        <div className="text-lg font-semibold">
                          {formatCurrencyForDisplay(item.price)}
                        </div>
                      </div>
                      
                      <div className="space-y-2 pt-2 border-t">
                        <div className="text-sm text-muted-foreground">
                          {language === 'vi' ? 'Thành tiền' : language === 'ja' ? '小計' : 'Item Total'}
                        </div>
                        <div className="text-xl font-bold text-primary">
                          {formatCurrencyForDisplay(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary - Enhanced Financial Display */}
          <Card className="border-2 bg-gradient-to-r from-muted/20 to-muted/10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                {t.orderNumber}: {order.orderNumber}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">{t.subtotal}</span>
                      <span className="font-medium">{formatCurrencyForDisplay(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">{t.shipping}</span>
                      <span className="font-medium">{formatCurrencyForDisplay(0)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">{t.tax}</span>
                      <span className="font-medium">{formatCurrencyForDisplay(0)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">{t.paymentMethod}</span>
                      <span className="font-medium">{order.paymentMethod || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">{t.trackingNumber}</span>
                      <span className="font-medium">N/A</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Order Date</span>
                      <span className="font-medium">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between items-center py-4 bg-primary/10 rounded-lg px-4">
                  <span className="text-xl font-semibold">{t.total}</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrencyForDisplay(order.totalAmount)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          {order.notes && (
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  {t.notes}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm leading-relaxed">{order.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 