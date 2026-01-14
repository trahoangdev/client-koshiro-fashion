import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { api, Order } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";

const ProfileOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const { toast } = useToast();
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const response = await api.getUserOrders();
        // Handle different response structures
        let ordersData: Order[] = [];
        if (Array.isArray(response)) {
          ordersData = response;
        } else if (response && typeof response === 'object') {
          // Check if it's a pagination response
          if ('data' in response && Array.isArray(response.data)) {
            ordersData = response.data;
          } else if ('orders' in response && Array.isArray(response.orders)) {
            ordersData = response.orders;
          }
        }
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to load orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again.",
          variant: "destructive"
        });
        setOrders([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Truck className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProductImage = (item: any) => {
    if (!item?.productId) return '/placeholder.svg';
    const product = item.productId;

    // Check for Cloudinary images (runtime check even if type doesn't show it)
    if (product.cloudinaryImages && product.cloudinaryImages.length > 0 && product.cloudinaryImages[0].secureUrl) {
      return product.cloudinaryImages[0].secureUrl;
    }

    // Check for legacy images
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }

    return '/placeholder.svg';
  };

  const translations = {
    en: {
      title: "Order History",
      subtitle: "Track your orders and their status",
      noOrders: "No orders yet",
      noOrdersDesc: "Start shopping to see your order history here",
      startShopping: "Start Shopping",
      orderNumber: "Order #",
      orderDate: "Order Date",
      total: "Total",
      status: "Status",
      items: "items",
      viewDetails: "View Details",
      shippingAddress: "Shipping Address",
      paymentMethod: "Payment Method",
      paymentStatus: "Payment Status"
    },
    vi: {
      title: "Lịch Sử Đơn Hàng",
      subtitle: "Theo dõi đơn hàng và trạng thái của chúng",
      noOrders: "Chưa có đơn hàng nào",
      noOrdersDesc: "Bắt đầu mua sắm để xem lịch sử đơn hàng ở đây",
      startShopping: "Bắt Đầu Mua Sắm",
      orderNumber: "Đơn Hàng #",
      orderDate: "Ngày Đặt",
      total: "Tổng Tiền",
      status: "Trạng Thái",
      items: "sản phẩm",
      viewDetails: "Xem Chi Tiết",
      shippingAddress: "Địa Chỉ Giao Hàng",
      paymentMethod: "Phương Thức Thanh Toán",
      paymentStatus: "Trạng Thái Thanh Toán"
    },
    ja: {
      title: "注文履歴",
      subtitle: "注文とその状況を追跡",
      noOrders: "注文はまだありません",
      noOrdersDesc: "ショッピングを始めて、ここで注文履歴を確認してください",
      startShopping: "ショッピングを始める",
      orderNumber: "注文番号 #",
      orderDate: "注文日",
      total: "合計",
      status: "状況",
      items: "商品",
      viewDetails: "詳細を見る",
      shippingAddress: "配送先住所",
      paymentMethod: "支払い方法",
      paymentStatus: "支払い状況"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleCancelOrder = async (orderId: string) => {
    try {
      // Show loading state
      const order = orders.find(o => o._id === orderId);
      if (!order) {
        toast({
          title: language === 'vi' ? 'Lỗi' : language === 'ja' ? 'エラー' : 'Error',
          description: language === 'vi' ? 'Không tìm thấy đơn hàng.' : language === 'ja' ? '注文が見つかりません。' : 'Order not found.',
          variant: 'destructive'
        });
        return;
      }

      // Check if order can be cancelled
      if (order.status === 'completed' || order.status === 'cancelled') {
        toast({
          title: language === 'vi' ? 'Không thể hủy' : language === 'ja' ? 'キャンセルできません' : 'Cannot Cancel',
          description: language === 'vi'
            ? `Đơn hàng ${order.status === 'completed' ? 'đã hoàn thành' : 'đã bị hủy'} không thể hủy bỏ.`
            : language === 'ja'
              ? `注文は${order.status === 'completed' ? '完了済み' : 'キャンセル済み'}のため、キャンセルできません。`
              : `Order cannot be cancelled as it is ${order.status === 'completed' ? 'completed' : 'already cancelled'}.`,
          variant: 'destructive'
        });
        return;
      }

      // Call API to cancel order
      const response = await api.cancelOrder(orderId);

      // Update local state
      setOrders(prev => prev.map(o =>
        o._id === orderId
          ? { ...o, status: 'cancelled' as const }
          : o
      ));

      // Show success message
      toast({
        title: language === 'vi' ? 'Thành công!' : language === 'ja' ? '成功！' : 'Success!',
        description: language === 'vi'
          ? `Đơn hàng ${order.orderNumber} đã được hủy thành công.`
          : language === 'ja'
            ? `注文${order.orderNumber}は正常にキャンセルされました。`
            : `Order ${order.orderNumber} has been cancelled successfully.`,
        variant: 'default'
      });

      // Close dialog
      closeCancelDialog();

    } catch (error) {
      console.error('Error cancelling order:', error);

      // Show error message
      toast({
        title: language === 'vi' ? 'Lỗi hủy đơn hàng' : language === 'ja' ? '注文キャンセルエラー' : 'Order Cancellation Error',
        description: language === 'vi'
          ? 'Không thể hủy đơn hàng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.'
          : language === 'ja'
            ? '注文をキャンセルできませんでした。後でもう一度お試しいただくか、サポートにお問い合わせください。'
            : 'Failed to cancel order. Please try again later or contact support.',
        variant: 'destructive'
      });
    }
  };

  const openCancelDialog = (orderId: string) => {
    setOrderToCancel(orderId);
  };

  const closeCancelDialog = () => {
    setOrderToCancel(null);
  };

  const canCancelOrder = (order: Order) => {
    // Orders can only be cancelled if they are pending or processing
    return order.status === 'pending' || order.status === 'processing';
  };

  const getCancelButtonText = (order: Order) => {
    if (order.status === 'pending') {
      return language === 'vi' ? 'Hủy đơn hàng' : language === 'ja' ? '注文をキャンセル' : 'Cancel Order';
    }
    if (order.status === 'processing') {
      return language === 'vi' ? 'Hủy đơn hàng (Đang xử lý)' : language === 'ja' ? '注文をキャンセル（処理中）' : 'Cancel Order (Processing)';
    }
    return '';
  };

  const getStatusDescription = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return language === 'vi'
          ? 'Đơn hàng đang chờ xử lý - Có thể hủy bỏ'
          : language === 'ja'
            ? '注文は処理待ちです - キャンセル可能'
            : 'Order is pending - Can be cancelled';
      case 'processing':
        return language === 'vi'
          ? 'Đơn hàng đang được xử lý - Có thể hủy bỏ'
          : language === 'ja'
            ? '注文は処理中です - キャンセル可能'
            : 'Order is being processed - Can be cancelled';
      case 'completed':
        return language === 'vi'
          ? 'Đơn hàng đã hoàn thành - Không thể hủy bỏ'
          : language === 'ja'
            ? '注文完了 - キャンセル不可'
            : 'Order completed - Cannot be cancelled';
      case 'cancelled':
        return language === 'vi'
          ? 'Đơn hàng đã bị hủy bỏ'
          : language === 'ja'
            ? '注文はキャンセルされました'
            : 'Order has been cancelled';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="rounded-xl border-2 shadow-lg bg-background/95 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{t.noOrders}</h2>
          <p className="text-muted-foreground mb-8 font-medium text-lg">{t.noOrdersDesc}</p>
          <Link to="/">
            <Button size="lg" className="rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
              {t.startShopping}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t.title}</h2>
        <p className="text-muted-foreground text-lg font-medium">{t.subtitle}</p>
      </div>

      <div className="space-y-4">
        {Array.isArray(orders) && orders.length > 0 ? (
          orders.map((order) => (
            <Card key={order._id} className="overflow-hidden rounded-xl border-2 shadow-lg hover:shadow-xl transition-all bg-background/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b-2 border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className="font-semibold">
                        {t.orderNumber}{order.orderNumber}
                      </span>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} rounded-lg border-2 font-semibold px-3 py-1`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{t.orderDate}</p>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <img
                        src={getProductImage(item)}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 shadow-md"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.size} {item.color} {language === 'vi' ? 'Số lượng' : language === 'ja' ? '数量' : 'Quantity'}: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(item.price * item.quantity, language)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {t.shippingAddress}
                    </p>
                    <div className="text-sm">
                      <p>{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.district}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {t.paymentMethod}
                    </p>
                    <p className="text-sm">{order.paymentMethod}</p>

                    <p className="text-sm font-medium text-muted-foreground mb-1 mt-2">
                      {t.paymentStatus}
                    </p>
                    <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'} className="rounded-lg border-2 font-semibold">
                      {order.paymentStatus}
                    </Badge>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">{t.total}</p>
                    <p className="text-2xl font-bold">{formatCurrency(order.totalAmount, language)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} {t.items}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  {canCancelOrder(order) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openCancelDialog(order._id)}
                      className="rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {getCancelButtonText(order)}
                    </Button>
                  )}

                  {/* Show status message for completed/cancelled orders */}
                  {order.status === 'completed' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                        {language === 'vi' ? 'Đơn hàng đã hoàn thành' : language === 'ja' ? '注文完了' : 'Order Completed'}
                      </span>
                    </div>
                  )}

                  {order.status === 'cancelled' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                        {language === 'vi' ? 'Đơn hàng đã bị hủy' : language === 'ja' ? '注文キャンセル済み' : 'Order Cancelled'}
                      </span>
                    </div>
                  )}

                  {/* Show status description for pending/processing orders */}
                  {(order.status === 'pending' || order.status === 'processing') && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        {getStatusDescription(order)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t.noOrders}</h3>
            <p className="text-muted-foreground">{t.noOrdersDesc}</p>
          </div>
        )}
      </div>
      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog open={!!orderToCancel} onOpenChange={closeCancelDialog}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              {language === 'vi' ? 'Xác nhận hủy đơn hàng' : language === 'ja' ? '注文キャンセルの確認' : 'Confirm Order Cancellation'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {(() => {
                const order = orders.find(o => o._id === orderToCancel);
                if (!order) return '';

                return (
                  <div className="space-y-4 mt-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold mb-2">
                        {language === 'vi' ? 'Thông tin đơn hàng:' : language === 'ja' ? '注文情報:' : 'Order Information:'}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {language === 'vi' ? 'Mã đơn hàng:' : language === 'ja' ? '注文番号:' : 'Order Number:'}
                          </span>
                          <span className="font-medium">{order.orderNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {language === 'vi' ? 'Tổng tiền:' : language === 'ja' ? '合計金額:' : 'Total Amount:'}
                          </span>
                          <span className="font-medium">{formatCurrency(order.totalAmount, language)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {language === 'vi' ? 'Số sản phẩm:' : language === 'ja' ? '商品数:' : 'Items:'}
                          </span>
                          <span className="font-medium">{order.items.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          <p className="font-medium mb-1">
                            {language === 'vi' ? 'Lưu ý quan trọng:' : language === 'ja' ? '重要な注意事項:' : 'Important Notice:'}
                          </p>
                          <p>
                            {language === 'vi'
                              ? 'Hành động này không thể hoàn tác. Đơn hàng sẽ được cập nhật trạng thái thành "Đã hủy" và có thể ảnh hưởng đến quyền lợi của bạn.'
                              : language === 'ja'
                                ? 'この操作は元に戻せません。注文のステータスが「キャンセル済み」に更新され、お客様の権利に影響する可能性があります。'
                                : 'This action cannot be undone. The order status will be updated to "Cancelled" and may affect your benefits.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="px-6">
              {language === 'vi' ? 'Không, giữ nguyên' : language === 'ja' ? 'いいえ、そのまま' : 'No, keep it'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (orderToCancel) {
                  handleCancelOrder(orderToCancel);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-6"
            >
              {language === 'vi' ? 'Có, hủy đơn hàng' : language === 'ja' ? 'はい、キャンセルします' : 'Yes, cancel order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileOrders;